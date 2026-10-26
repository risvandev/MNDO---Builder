// ==============================================================================
// MNDO BUILDER - PUBLISHING & UNPUBLISHING CONTROLLER
// ==============================================================================
import { getClient, getCurrentUser } from './supabase.js';
import { isUserVerified } from './auth.js';
import { validateSubdomainSlug, checkSubdomainAvailability } from './validation.js';
import { CONFIG } from './config.js';

/**
 * Publish or republish a website to its unique subdomain.
 * 
 * @param {string} siteId
 * @param {string} subdomainSlug
 * @returns {Promise<{ success: boolean, publishedUrl: string, subdomain: string }>}
 */
export async function publishSite(siteId, subdomainSlug) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Please sign in to publish your website.');
  }

  // 1. Check user verification status
  const verified = await isUserVerified(user);
  if (!verified) {
    throw new Error('Email verification required: Please verify your email address before publishing.');
  }

  // 2. Format & availability validation
  const validation = validateSubdomainSlug(subdomainSlug);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const avail = await checkSubdomainAvailability(validation.normalized, siteId);
  if (!avail.available) {
    throw new Error(avail.reason || 'This subdomain is not available.');
  }

  const supabase = getClient();
  if (supabase) {
    const { data, error } = await supabase.rpc('publish_site', {
      p_site_id: siteId,
      p_new_slug: validation.normalized
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      subdomain: data.subdomain || validation.normalized,
      publishedUrl: data.published_url || `https://${validation.normalized}.${CONFIG.PLATFORM_DOMAIN}`
    };
  }

  // Demo fallback mode
  const raw = localStorage.getItem('mndo_mock_state_v1');
  const state = raw ? JSON.parse(raw) : {};
  const site = state.sites?.find(s => s.id === siteId);
  if (site) {
    site.status = 'published';
    site.subdomain_slug = validation.normalized;
    site.published_revision = (site.published_revision || 0) + 1;
    site.published_at = new Date().toISOString();
    site.updated_at = new Date().toISOString();
    localStorage.setItem('mndo_mock_state_v1', JSON.stringify(state));
  }

  return {
    success: true,
    subdomain: validation.normalized,
    publishedUrl: `https://${validation.normalized}.${CONFIG.PLATFORM_DOMAIN}`
  };
}

/**
 * Unpublish a website immediately (reverts to draft state).
 * 
 * @param {string} siteId
 * @returns {Promise<{ success: boolean }>}
 */
export async function unpublishSite(siteId) {
  const supabase = getClient();
  if (supabase) {
    const { data, error } = await supabase.rpc('unpublish_site', {
      p_site_id: siteId
    });
    if (error) throw error;
    return { success: true };
  }

  // Demo fallback mode
  const raw = localStorage.getItem('mndo_mock_state_v1');
  const state = raw ? JSON.parse(raw) : {};
  const site = state.sites?.find(s => s.id === siteId);
  if (site) {
    site.status = 'unpublished';
    site.updated_at = new Date().toISOString();
    localStorage.setItem('mndo_mock_state_v1', JSON.stringify(state));
  }
  return { success: true };
}
