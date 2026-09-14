const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const defineModels = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { convertPPTToPDF } = require('../utils/pdfConverter');
const {
  isSupabaseConfigured,
  uploadToSupabase,
  deleteFromSupabase,
  getPublicUrl,
  getMimeType
} = require('../config/supabase');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage configuration (temporary local disk storage before Supabase upload or static serving fallback)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now();
    cb(null, `${cleanBaseName}_${uniqueSuffix}${ext}`);
  }
});

// File filter for .ppt, .pptx, and .pdf files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.ppt' || ext === '.pptx' || ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only .ppt, .pptx, and .pdf files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

/**
 * GET /api/ppt
 * Returns available: true and pdfUrl if PDF presentation exists, otherwise available: false
 */
router.get('/', async (req, res) => {
  try {
    const { PPT } = defineModels();
    const records = await PPT.findAll({ order: [['id', 'DESC']] });

    const availablePresentations = [];

    for (const record of records) {
      const pdfFileName = record.pdfFilePath;
      if (pdfFileName) {
        const isRemote = pdfFileName.startsWith('http://') || pdfFileName.startsWith('https://') || isSupabaseConfigured();
        const fullPdfPath = path.join(uploadsDir, pdfFileName);
        
        // If file is on Supabase (isRemote) or exists on local disk
        if (isRemote || fs.existsSync(fullPdfPath)) {
          const pdfUrl = getPublicUrl(record.pdfFilePath);
          const originalUrl = getPublicUrl(record.originalFilePath);

          availablePresentations.push({
            id: record.id,
            presentationName: record.presentationName,
            originalFilePath: record.originalFilePath,
            pdfFilePath: record.pdfFilePath,
            pdfUrl,
            originalUrl,
            version: record.version,
            uploadedBy: record.uploadedBy,
            uploadedAt: record.uploadedAt
          });
        }
      }
    }

    if (availablePresentations.length === 0) {
      return res.json({
        available: false,
        message: 'No PPT available'
      });
    }

    const activePPT = availablePresentations[0];

    return res.json({
      available: true,
      pdfUrl: activePPT.pdfUrl,
      presentationName: activePPT.presentationName,
      version: activePPT.version,
      uploadedBy: activePPT.uploadedBy,
      uploadedAt: activePPT.uploadedAt,
      ppt: activePPT,
      presentations: availablePresentations
    });
  } catch (err) {
    console.error('Get PPT API error:', err);
    return res.status(500).json({ available: false, message: 'Server error retrieving presentation.' });
  }
});

/**
 * POST /api/ppt/upload (Admin only)
 * Receives PPT/PPTX/PDF -> Bypasses LibreOffice for native PDF -> Stores in Supabase or Local Disk
 */
const handleUpload = async (req, res) => {
  upload.single('pptFile')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a .ppt, .pptx, or .pdf file to upload.' });
    }

    const { presentationName, version } = req.body;
    const name = presentationName || req.file.originalname.replace(/\.[^/.]+$/, "");
    const v = version || 'V1';
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
      const { PPT } = defineModels();
      const originalFilename = req.file.filename;
      let pdfFilename = '';

      if (ext === '.pdf') {
        console.log(`[Upload] Received direct PDF ${originalFilename}. Bypassing LibreOffice conversion.`);
        pdfFilename = originalFilename;
      } else {
        console.log(`[Upload] Received PowerPoint ${originalFilename}. Starting LibreOffice PDF conversion...`);
        pdfFilename = await convertPPTToPDF(req.file.path, uploadsDir);
      }

      const originalLocalPath = req.file.path;
      const pdfLocalPath = path.join(uploadsDir, pdfFilename);

      let finalOriginalPath = originalFilename;
      let finalPdfPath = pdfFilename;

      // Upload to Supabase Storage if configured
      if (isSupabaseConfigured()) {
        console.log('[Upload] Supabase Storage is configured. Uploading presentation files to Supabase bucket...');
        
        // 1. Upload original file
        if (fs.existsSync(originalLocalPath)) {
          const originalBuffer = fs.readFileSync(originalLocalPath);
          const originalResult = await uploadToSupabase(
            originalBuffer,
            originalFilename,
            getMimeType(originalFilename)
          );
          finalOriginalPath = originalResult.publicUrl || originalFilename;
        }

        // 2. Upload converted PDF file
        if (fs.existsSync(pdfLocalPath)) {
          const pdfBuffer = fs.readFileSync(pdfLocalPath);
          const pdfResult = await uploadToSupabase(
            pdfBuffer,
            pdfFilename,
            getMimeType(pdfFilename)
          );
          finalPdfPath = pdfResult.publicUrl || pdfFilename;
        }

        // Clean up temporary local files
        try {
          if (fs.existsSync(originalLocalPath)) fs.unlinkSync(originalLocalPath);
          if (fs.existsSync(pdfLocalPath) && pdfLocalPath !== originalLocalPath) {
            fs.unlinkSync(pdfLocalPath);
          }
        } catch (cleanupErr) {
          console.warn('[Upload] Temp file cleanup warning:', cleanupErr.message);
        }
      } else {
        console.log('[Upload] Supabase Storage not configured. Falling back to local disk storage in server/uploads/.');
      }

      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const uploadedAtStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
      const uploaderName = req.user ? req.user.name : 'Admin';

      const newPPT = await PPT.create({
        presentationName: name,
        originalFilePath: finalOriginalPath,
        pdfFilePath: finalPdfPath,
        fileSize: req.file.size,
        version: v,
        uploadedBy: uploaderName,
        uploadedAt: uploadedAtStr
      });

      const pdfUrl = getPublicUrl(newPPT.pdfFilePath);

      return res.status(201).json({
        success: true,
        message: ext === '.pdf' 
          ? 'PDF presentation uploaded successfully!' 
          : 'PowerPoint presentation uploaded & converted to PDF successfully!',
        ppt: {
          id: newPPT.id,
          presentationName: newPPT.presentationName,
          originalFilePath: newPPT.originalFilePath,
          pdfFilePath: newPPT.pdfFilePath,
          pdfUrl,
          version: newPPT.version,
          uploadedBy: newPPT.uploadedBy,
          uploadedAt: newPPT.uploadedAt
        }
      });
    } catch (conversionErr) {
      console.error('Presentation upload error:', conversionErr);
      return res.status(500).json({ success: false, message: 'Failed processing presentation file.' });
    }
  });
};

router.post('/upload', requireAdmin, handleUpload);
router.post('/', requireAdmin, handleUpload);

/**
 * DELETE /api/ppt (Admin only)
 */
router.delete('/', requireAdmin, async (req, res) => {
  try {
    const { PPT } = defineModels();
    const records = await PPT.findAll();

    for (const record of records) {
      // Delete from Supabase if configured
      if (isSupabaseConfigured() || record.pdfFilePath.startsWith('http')) {
        await deleteFromSupabase([record.originalFilePath, record.pdfFilePath]);
      }

      // Delete local files if they exist
      const originalPath = path.join(uploadsDir, path.basename(record.originalFilePath));
      const pdfPath = path.join(uploadsDir, path.basename(record.pdfFilePath));

      if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
      if (fs.existsSync(pdfPath) && pdfPath !== originalPath) {
        fs.unlinkSync(pdfPath);
      }
    }

    await PPT.destroy({ where: {} });
    return res.json({ success: true, message: 'All presentations deleted from database & storage.' });
  } catch (err) {
    console.error('Delete PPT error:', err);
    return res.status(500).json({ success: false, message: 'Failed deleting presentation records.' });
  }
});

/**
 * DELETE /api/ppt/:id (Admin only)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { PPT } = defineModels();
    const record = await PPT.findByPk(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Presentation record not found.' });
    }

    // Delete from Supabase if configured
    if (isSupabaseConfigured() || record.pdfFilePath.startsWith('http')) {
      await deleteFromSupabase([record.originalFilePath, record.pdfFilePath]);
    }

    // Delete local file if exists
    const originalPath = path.join(uploadsDir, path.basename(record.originalFilePath));
    const pdfPath = path.join(uploadsDir, path.basename(record.pdfFilePath));

    if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
    if (fs.existsSync(pdfPath) && pdfPath !== originalPath) {
      fs.unlinkSync(pdfPath);
    }

    await record.destroy();
    return res.json({ success: true, message: 'Presentation deleted successfully.' });
  } catch (err) {
    console.error('Delete PPT ID error:', err);
    return res.status(500).json({ success: false, message: 'Failed deleting presentation.' });
  }
});

module.exports = { router };
