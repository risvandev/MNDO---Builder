// ==============================================================================
// MNDO BUILDER - FILE UPLOADS & QUOTA ENFORCEMENT
// ==============================================================================
import { CONFIG } from './config.js';
import { getClient, getCurrentUser } from './supabase.js';

/**
 * Validate a file before uploading.
 * @param {File} file
 * @param {'image'|'pdf'|'logo'} purpose
 * @param {number} currentTotalBytes
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUploadFile(file, purpose = 'image', currentTotalBytes = 0) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // 1. Account total storage limit check
  if (currentTotalBytes + file.size > CONFIG.LIMITS.MAX_STORAGE_BYTES) {
    return {
      valid: false,
      error: `Account storage quota exceeded (${(CONFIG.LIMITS.MAX_STORAGE_BYTES / 1024 / 1024).toFixed(0)} MB). Please delete unused files to free up space.`
    };
  }

  // 2. MIME type & size check by purpose
  if (purpose === 'image') {
    if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only JPG, PNG, and WebP images are supported.' };
    }
    if (file.size > CONFIG.LIMITS.MAX_IMAGE_BYTES) {
      return { valid: false, error: 'Images cannot exceed 2 MB in size.' };
    }
  } else if (purpose === 'pdf') {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF documents are allowed for Resumes / CVs.' };
    }
    if (file.size > CONFIG.LIMITS.MAX_PDF_BYTES) {
      return { valid: false, error: 'PDF documents cannot exceed 5 MB in size.' };
    }
  } else if (purpose === 'logo' || purpose === 'favicon') {
    if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type) && file.type !== 'image/x-icon') {
      return { valid: false, error: 'Supported logo formats: PNG, JPG, WebP, ICO.' };
    }
    if (file.size > CONFIG.LIMITS.MAX_LOGO_BYTES) {
      return { valid: false, error: 'Logo / favicon cannot exceed 512 KB in size.' };
    }
  }

  // 3. Strict security: Disallow SVGs, HTML, Executables
  const name = file.name.toLowerCase();
  if (name.endsWith('.svg') || name.endsWith('.html') || name.endsWith('.js') || name.endsWith('.exe')) {
    return { valid: false, error: 'Unsupported or prohibited file extension for security reasons.' };
  }

  return { valid: true };
}

/**
 * Upload a file to Supabase Storage or demo storage.
 * @param {File} file
 * @param {string} siteId
 * @param {'image'|'pdf'|'logo'} purpose
 * @param {number} currentTotalBytes
 * @returns {Promise<{ publicUrl: string, storagePath: string, size: number }>}
 */
export async function uploadAsset(file, siteId, purpose = 'image', currentTotalBytes = 0) {
  const check = validateUploadFile(file, purpose, currentTotalBytes);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const supabase = getClient();
  const user = await getCurrentUser();

  if (supabase && user) {
    // Generate clean safe object key
    const ext = file.name.split('.').pop().toLowerCase();
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storagePath = `${user.id}/${siteId}/${cleanName}`;

    const { data: uploadData, error: upErr } = await supabase.storage
      .from('site-assets')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (upErr) throw upErr;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('site-assets')
      .getPublicUrl(storagePath);

    // Record asset row in site_assets table
    await supabase.from('site_assets').insert({
      site_id: siteId,
      owner_id: user.id,
      storage_path: storagePath,
      filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      asset_purpose: purpose
    });

    return { publicUrl, storagePath, size: file.size };
  }

  // Demo fallback mode (Data URL)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        publicUrl: reader.result,
        storagePath: `demo/${file.name}`,
        size: file.size
      });
    };
    reader.onerror = () => reject(new Error('Failed reading file.'));
    reader.readAsDataURL(file);
  });
}
