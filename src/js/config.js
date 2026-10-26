// ==============================================================================
// MNDO BUILDER - CONFIGURATION & CONSTANTS
// ==============================================================================

export const CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  PLATFORM_DOMAIN: import.meta.env.VITE_PLATFORM_DOMAIN || 'mndo.online',
  TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY || '',
  
  // Free-tier Quota limits
  LIMITS: {
    MAX_SITES_PER_ACCOUNT: 3,
    MAX_STORAGE_BYTES: 20 * 1024 * 1024, // 20 MB
    MAX_IMAGE_BYTES: 2 * 1024 * 1024,    // 2 MB
    MAX_PDF_BYTES: 5 * 1024 * 1024,      // 5 MB
    MAX_LOGO_BYTES: 512 * 1024           // 512 KB
  },

  // Allowed MIME types
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOC_TYPES: ['application/pdf']
};

/**
 * Check if real Supabase backend credentials are configured in environment.
 * @returns {boolean}
 */
export function isBackendConfigured() {
  return Boolean(
    CONFIG.SUPABASE_URL && 
    CONFIG.SUPABASE_ANON_KEY && 
    !CONFIG.SUPABASE_URL.includes('your-project-id') &&
    !CONFIG.SUPABASE_ANON_KEY.includes('your-anon-key')
  );
}
