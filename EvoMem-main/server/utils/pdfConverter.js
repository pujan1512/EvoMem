const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { parsePPTX } = require('./pptParser');

/**
 * Converts a PowerPoint file (.ppt / .pptx) to PDF using LibreOffice headless command line.
 * Provides a fallback PDF generator if LibreOffice is not installed.
 */
async function convertPPTToPDF(pptFilePath, outputDir) {
  const ext = path.extname(pptFilePath);
  const baseName = path.basename(pptFilePath, ext);
  const targetPdfFileName = `${baseName}.pdf`;
  const targetPdfPath = path.join(outputDir, targetPdfFileName);

  // 1. Try finding LibreOffice executable
  const possiblePaths = [
    'soffice',
    'libreoffice',
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe'
  ];

  for (const cmdPath of possiblePaths) {
    try {
      const success = await tryLibreOfficeConvert(cmdPath, pptFilePath, outputDir);
      if (success && fs.existsSync(targetPdfPath)) {
        console.log(`[LibreOffice] Successfully converted ${path.basename(pptFilePath)} to PDF using ${cmdPath}`);
        return targetPdfFileName;
      }
    } catch (e) {
      // Continue to next command path
    }
  }

  console.warn(`[LibreOffice] LibreOffice binary not found or conversion failed. Generating fallback PDF presentation for ${path.basename(pptFilePath)}.`);
  
  // 2. Fallback: Parse slides and build a PDF
  await generateFallbackPDF(pptFilePath, targetPdfPath);
  return targetPdfFileName;
}

function tryLibreOfficeConvert(cmdPath, pptFilePath, outputDir) {
  return new Promise((resolve) => {
    // Escape quotes around paths
    const command = `"${cmdPath}" --headless --convert-to pdf --outdir "${outputDir}" "${pptFilePath}"`;
    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Fallback PDF generator creating a styled PDF document from parsed PowerPoint slides
 */
async function generateFallbackPDF(pptFilePath, targetPdfPath) {
  try {
    let slides = [];
    if (path.extname(pptFilePath).toLowerCase() === '.pptx') {
      slides = await parsePPTX(pptFilePath);
    }

    if (!slides || slides.length === 0) {
      slides = [
        {
          slideNumber: 1,
          title: path.basename(pptFilePath, path.extname(pptFilePath)),
          subtitle: 'EkagraAI Presentation Deck',
          bullets: ['UCS503 Software Engineering Course Project', 'Uploaded Presentation Deck'],
          paragraphs: ['PowerPoint presentation document.']
        }
      ];
    }

    // Build raw PDF bytes fallback using PDF syntax
    const pdfContent = buildSimplePDF(slides);
    fs.writeFileSync(targetPdfPath, pdfContent);
    console.log(`[PDF Generator] Fallback PDF created at ${targetPdfPath}`);
  } catch (err) {
    console.error('Fallback PDF generation error:', err);
    // Write minimal valid PDF byte stream
    const minimalPdf = `%PDF-1.4\n1 0 obj<>/Type/Page/Parent 2 0 R/Contents 3 0 R>>endobj\n2 0 obj<>/Count 1/Kids[1 0 R]>>endobj\n3 0 obj<>/Length 45>>stream\nBT /F1 12 Tf 100 700 TD (Presentation PDF) ET\nendstream\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000074 00000 n\n0000000120 00000 n\ntrailer<>/Root 2 0 R>>\nstartxref\n214\n%%EOF`;
    fs.writeFileSync(targetPdfPath, Buffer.from(minimalPdf));
  }
}

/**
 * Constructs a multi-page PDF stream from slides data
 */
function buildSimplePDF(slides) {
  let pdfText = `%PDF-1.4\n`;
  const objects = [];
  
  // Font object
  objects.push(`4 0 obj\n<>/Subtype/Type1/BaseFont/Helvetica>>\nendobj\n`);

  const pageObjectIds = [];
  const contentObjectIds = [];

  slides.forEach((slide, idx) => {
    const pageObjId = 5 + idx * 2;
    const contentObjId = 6 + idx * 2;
    pageObjectIds.push(pageObjId);
    contentObjectIds.push(contentObjId);

    const titleText = sanitizePDFText(slide.title || `Slide ${idx + 1}`);
    const subtitleText = sanitizePDFText(slide.subtitle || '');
    const bullets = (slide.bullets || []).map((b) => sanitizePDFText(`- ${b}`));
    const paragraphs = (slide.paragraphs || []).map((p) => sanitizePDFText(p));

    let streamLines = [];
    streamLines.push(`BT`);
    streamLines.push(`/F1 22 Tf 40 540 TD (${titleText}) Tj`);
    if (subtitleText) {
      streamLines.push(`/F1 12 Tf 0 -25 TD (${subtitleText}) Tj`);
    }
    
    streamLines.push(`/F1 14 Tf 0 -35 TD (Key Points:) Tj`);
    bullets.forEach((bullet) => {
      streamLines.push(`0 -20 TD (${bullet}) Tj`);
    });

    paragraphs.forEach((para) => {
      streamLines.push(`0 -22 TD (${para}) Tj`);
    });

    streamLines.push(`ET`);

    const streamData = streamLines.join('\n');
    const contentObj = `${contentObjId} 0 obj\n<>/Length ${Buffer.byteLength(streamData)}>>\nstream\n${streamData}\nendstream\nendobj\n`;
    objects.push(contentObj);
  });

  slides.forEach((slide, idx) => {
    const pageObjId = 5 + idx * 2;
    const contentObjId = 6 + idx * 2;
    const pageObj = `${pageObjId} 0 obj\n<>/Type/Page/Parent 2 0 R/Resources<>/Font<>>>/Contents ${contentObjId} 0 R>>\nendobj\n`;
    objects.push(pageObj);
  });

  const pagesCatalog = `2 0 obj\n<>/Count ${slides.length}/Kids[${pageObjectIds.map(id => `${id} 0 R`).join(' ')}]>>\nendobj\n`;
  const rootCatalog = `1 0 obj\n<>/Type/Catalog/Pages 2 0 R>>\nendobj\n`;

  pdfText += rootCatalog + pagesCatalog + objects.join('');
  pdfText += `xref\n0 ${5 + slides.length * 2}\n0000000000 65535 f\n`;
  pdfText += `trailer\n<>/Root 1 0 R>>\nstartxref\n500\n%%EOF`;

  return Buffer.from(pdfText);
}

function sanitizePDFText(str) {
  return String(str || '')
    .replace(/[()\\]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ');
}

module.exports = { convertPPTToPDF };
