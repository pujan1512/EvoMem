const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'filestorage';

let supabaseClient = null;

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  }
  return supabaseClient;
}

/**
 * Uploads a file buffer or stream to Supabase Storage bucket
 * @param {Buffer} fileBuffer - File contents
 * @param {string} fileName - Destination filename in bucket
 * @param {string} contentType - MIME type
 * @returns {Promise<{ path: string, publicUrl: string }>}
 */
async function uploadToSupabase(fileBuffer, fileName, contentType = 'application/octet-stream') {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured. SUPABASE_URL and SUPABASE_KEY are required.');
  }

  // Ensure bucket exists or handle upload directly
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error(`[Supabase Storage] Upload error for ${fileName}:`, error.message);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  const publicUrl = publicUrlData ? publicUrlData.publicUrl : '';
  console.log(`[Supabase Storage] Successfully uploaded ${fileName} to bucket '${BUCKET_NAME}'. Public URL: ${publicUrl}`);

  return {
    path: data.path,
    publicUrl
  };
}

/**
 * Deletes file(s) from Supabase Storage bucket
 * @param {string|string[]} fileNames - File name or array of file names
 */
async function deleteFromSupabase(fileNames) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const names = Array.isArray(fileNames) ? fileNames : [fileNames];
  const validNames = names.filter(Boolean).map(n => {
    // If n is a full URL, extract the object path after bucket name
    if (n.startsWith('http')) {
      const parts = n.split(`${BUCKET_NAME}/`);
      return parts.length > 1 ? parts[1] : path.basename(n);
    }
    return n;
  });

  if (validNames.length === 0) return;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(validNames);

  if (error) {
    console.warn(`[Supabase Storage] Delete error:`, error.message);
  } else {
    console.log(`[Supabase Storage] Deleted files from '${BUCKET_NAME}':`, validNames);
  }
}

/**
 * Gets the public URL for a file in Supabase Storage bucket
 * @param {string} fileName 
 * @returns {string}
 */
function getPublicUrl(fileName) {
  if (!fileName) return '';
  if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
    return fileName;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return `/uploads/${fileName}`;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return data ? data.publicUrl : `/uploads/${fileName}`;
}

/**
 * Gets appropriate Content-Type header based on file extension
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case '.ppt':
      return 'application/vnd.ms-powerpoint';
    default:
      return 'application/octet-stream';
  }
}

module.exports = {
  isSupabaseConfigured,
  getSupabaseClient,
  uploadToSupabase,
  deleteFromSupabase,
  getPublicUrl,
  getMimeType,
  BUCKET_NAME
};
