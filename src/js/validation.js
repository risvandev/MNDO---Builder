// ==============================================================================
// MNDO BUILDER - VALIDATION & SUBDOMAIN RULES
// ==============================================================================
import { RESERVED_SUBDOMAINS } from '../../worker/src/hostname.js';
import { getClient, getMockState } from './supabase.js';

/**
 * Validate a candidate subdomain format.
 * Rules:
 * - 3 to 32 characters
 * - Lowercase alphanumeric and hyphens
 * - Cannot start or end with a hyphen
 * - Cannot have consecutive hyphens (--)
 * - Cannot be in the reserved platform names list
 * 
 * @param {string} slug
 * @returns {{ valid: boolean, error?: string, normalized: string }}
 */
export function validateSubdomainSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Subdomain is required.', normalized: '' };
  }

  const normalized = slug.trim().toLowerCase();

  if (normalized.length < 3) {
    return { valid: false, error: 'Subdomain must be at least 3 characters long.', normalized };
  }

  if (normalized.length > 32) {
    return { valid: false, error: 'Subdomain cannot exceed 32 characters.', normalized };
  }

  if (!/^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$/.test(normalized)) {
    return { valid: false, error: 'Only lowercase letters, numbers, and hyphens (not at ends).', normalized };
  }

  if (normalized.includes('--')) {
    return { valid: false, error: 'Consecutive hyphens are not allowed.', normalized };
  }

  if (RESERVED_SUBDOMAINS.has(normalized)) {
    return { valid: false, error: 'This name is reserved by the platform.', normalized };
  }

  return { valid: true, normalized };
}

/**
 * Check if a subdomain slug is available in PostgreSQL (via Supabase RPC) or local store.
 * 
 * @param {string} slug
 * @param {string} currentSiteId - Ignore availability check if owned by current site
 * @returns {Promise<{ available: boolean, reason?: string, slug: string }>}
 */
export async function checkSubdomainAvailability(slug, currentSiteId = null) {
  const validation = validateSubdomainSlug(slug);
  if (!validation.valid) {
    return { available: false, reason: validation.error, slug: validation.normalized };
  }

  const supabase = getClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('check_subdomain_availability', {
        p_slug: validation.normalized
      });

      if (error) {
        // Fallback query if RPC isn't deployed yet
        const { data: existing } = await supabase
          .from('sites')
          .select('id')
          .eq('subdomain_slug', validation.normalized)
          .maybeSingle();

        if (existing && existing.id !== currentSiteId) {
          return { available: false, reason: 'This subdomain is already taken.', slug: validation.normalized };
        }
        return { available: true, slug: validation.normalized };
      }

      return data;
    } catch (err) {
      console.warn('Subdomain check error:', err);
    }
  }

  // Local storage check
  const state = getMockState();
  if (state) {
    const conflict = state.sites?.find(s => s.subdomain_slug === validation.normalized && s.id !== currentSiteId);
    if (conflict) {
      return { available: false, reason: 'This subdomain is already claimed.', slug: validation.normalized };
    }
  }

  return { available: true, slug: validation.normalized };
}

/**
 * Normalize and deduplicate a blog post slug.
 * Ensures lowercase, hyphenated, no leading/trailing hyphens, safe length, and unique within site.
 * 
 * @param {string} rawSlug
 * @param {Array} existingPosts
 * @param {string|null} currentPostId
 * @returns {string}
 */
export function normalizeSlug(rawSlug, existingPosts = [], currentPostId = null) {
  if (!rawSlug || typeof rawSlug !== 'string') {
    rawSlug = 'post';
  }

  let cleaned = rawSlug
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')     // replace invalid runs with hyphen
    .replace(/^-+|-+$/g, '')         // trim hyphens
    .slice(0, 48);

  if (!cleaned) {
    cleaned = 'post';
  }

  // Deduplicate against existing posts in this site
  const otherSlugs = new Set(
    (existingPosts || [])
      .filter(p => {
        if (!currentPostId) return true;
        if (typeof p === 'object' && p !== null) return p.id !== currentPostId;
        return p !== currentPostId;
      })
      .map(p => (typeof p === 'string' ? p : p?.slug || '').toLowerCase())
  );

  let candidate = cleaned;
  let counter = 2;
  while (otherSlugs.has(candidate)) {
    candidate = `${cleaned}-${counter}`;
    counter++;
  }

  return candidate;
}

/**
 * Reserved internal paths that custom pages cannot claim.
 */
export const RESERVED_PAGE_PATHS = new Set([
  '/',
  '/blog',
  '/dashboard',
  '/editor',
  '/preview',
  '/templates',
  '/settings',
  '/auth',
  '/api',
  '/admin',
  '/login',
  '/logout',
  '/register',
  '/signin',
  '/signup',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/manifest.webmanifest',
  '/feed.xml'
]);

/**
 * Validate and normalize a custom page URL path.
 * 
 * @param {string} rawPath
 * @param {Array} existingPages
 * @param {string|null} currentPageId
 * @returns {{ valid: boolean, error?: string, path: string, normalized: string }}
 */
export function validatePagePath(rawPath, existingPages = [], currentPageId = null) {
  if (!rawPath || typeof rawPath !== 'string') {
    return { valid: false, error: 'Path is required (e.g. /about).', path: '', normalized: '' };
  }

  let trimmed = rawPath.trim().toLowerCase();
  if (!trimmed.startsWith('/')) {
    trimmed = '/' + trimmed;
  }

  // Remove trailing slash if longer than 1 character
  if (trimmed.length > 1 && trimmed.endsWith('/')) {
    trimmed = trimmed.replace(/\/+$/, '');
  }

  if (trimmed === '/') {
    return { valid: false, error: 'The root path "/" is reserved for your homepage.', path: '/', normalized: '/' };
  }

  if (trimmed.includes('//')) {
    return { valid: false, error: 'Path cannot contain consecutive slashes.', path: trimmed, normalized: trimmed };
  }

  if (trimmed.includes('?') || trimmed.includes('#') || trimmed.includes('\\') || /\s/.test(trimmed)) {
    return { valid: false, error: 'Path cannot contain spaces, query parameters, or hash fragments.', path: trimmed, normalized: trimmed };
  }

  if (!/^\/[a-z0-9]+([a-z0-9\-_/]*[a-z0-9])?$/.test(trimmed)) {
    return { valid: false, error: 'Path must only contain lowercase letters, numbers, hyphens, and slashes.', path: trimmed, normalized: trimmed };
  }

  if (RESERVED_PAGE_PATHS.has(trimmed) || trimmed.startsWith('/blog/')) {
    return { valid: false, error: `Path "${trimmed}" is reserved by the template system.`, path: trimmed, normalized: trimmed };
  }

  // Check collision with other pages in this site
  const duplicate = (existingPages || []).find(p => {
    const existingPath = typeof p === 'string' ? p : p?.path;
    const existingId = typeof p === 'object' && p !== null ? p.id : null;
    if (currentPageId && existingId && existingId === currentPageId) return false;
    if (currentPageId && typeof p === 'string' && currentPageId === p) return false;
    return (existingPath || '').toLowerCase() === trimmed;
  });

  if (duplicate) {
    return { valid: false, error: `A page with path "${trimmed}" already exists.`, path: trimmed, normalized: trimmed };
  }

  return { valid: true, path: trimmed, normalized: trimmed };
}

/**
 * Validate brand color string format.
 * @param {string} hex
 * @returns {{ valid: boolean, normalized: string|null, error: string|null }}
 */
export function validatePrimaryColor(hex) {
  if (!hex || typeof hex !== 'string') {
    return { valid: false, normalized: null, error: 'Color is required.' };
  }
  let trimmed = hex.trim();
  if (!trimmed.startsWith('#')) {
    trimmed = '#' + trimmed;
  }
  const valid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed);
  return {
    valid,
    normalized: valid ? trimmed.toLowerCase() : null,
    error: valid ? null : 'Invalid color format. Please use a valid hex color code (e.g. #2563eb).'
  };
}


