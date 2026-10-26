// ==============================================================================
// MNDO BUILDER - VALIDATION & SUBDOMAIN RULES
// ==============================================================================
import { RESERVED_SUBDOMAINS } from '../../worker/src/hostname.js';
import { getClient } from './supabase.js';

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
  const raw = localStorage.getItem('mndo_mock_state_v1');
  if (raw) {
    const state = JSON.parse(raw);
    const conflict = state.sites?.find(s => s.subdomain_slug === validation.normalized && s.id !== currentSiteId);
    if (conflict) {
      return { available: false, reason: 'This subdomain is already claimed.', slug: validation.normalized };
    }
  }

  return { available: true, slug: validation.normalized };
}
