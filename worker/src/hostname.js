// ==============================================================================
// CLOUDFLARE WORKER - HOSTNAME PARSER & SUBDOMAIN VALIDATOR
// ==============================================================================

export const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'admin', 'administrator', 'builder', 'app', 'dashboard',
  'portal', 'cdn', 'static', 'assets', 'mail', 'email', 'smtp', 'imap',
  'pop', 'mx', 'ns', 'ns1', 'ns2', 'dns', 'direct', 'ftp', 'cpanel',
  'whm', 'webmail', 'autodiscover', 'autoconfig', 'login', 'signin',
  'signup', 'auth', 'oauth', 'account', 'user', 'users', 'profile',
  'billing', 'shop', 'store', 'pay', 'payment', 'checkout', 'support',
  'help', 'faq', 'docs', 'status', 'health', 'ping', 'metrics', 'monitor',
  'abuse', 'security', 'root', 'host', 'server', 'dev', 'development',
  'staging', 'test', 'testing', 'demo', 'preview', 'beta', 'alpha',
  'mndo', 'internal', 'gateway', 'proxy', 'edge', 'worker'
]);

/**
 * Extract and validate candidate subdomain from request hostname.
 * Examples:
 * - "risvan.mndo.online" -> { valid: true, slug: "risvan" }
 * - "mndo.online" (apex) -> { valid: false, reason: "apex_domain" }
 * - "www.mndo.online" -> { valid: false, reason: "reserved_subdomain" }
 * - "risvan.pages.dev" (testing) -> { valid: true, slug: "risvan" }
 * - "localhost:8787" -> { valid: true, slug: "risvan" (in local test mode) }
 * 
 * @param {string} hostname
 * @param {string} platformDomain
 * @returns {{ valid: boolean, slug?: string, reason?: string, isApex?: boolean }}
 */
export function parseSubdomain(hostname, platformDomain = 'mndo.online') {
  if (!hostname || typeof hostname !== 'string') {
    return { valid: false, reason: 'missing_hostname' };
  }

  const host = hostname.toLowerCase().split(':')[0].trim();

  // 1. Apex Domain Check (Existing website must not be served a user portfolio!)
  if (host === platformDomain || host === `www.${platformDomain}`) {
    return { valid: false, isApex: true, reason: 'apex_domain' };
  }

  // 2. Localhost testing mode support (e.g. risvan.localhost or ?slug=risvan)
  let candidate = null;
  if (host.endsWith(`.${platformDomain}`)) {
    candidate = host.slice(0, -(platformDomain.length + 1));
  } else if (host.endsWith('.pages.dev')) {
    candidate = host.split('.')[0];
  } else if (host.endsWith('.localhost')) {
    candidate = host.split('.')[0];
  } else if (host === '127.0.0.1' || host === 'localhost') {
    candidate = 'risvan'; // Default for local worker development testing
  }

  if (!candidate) {
    return { valid: false, reason: 'unrecognized_domain' };
  }

  // Multi-level subdomains: only single-level subdomains allowed (e.g. risvan.mndo.online)
  if (candidate.includes('.')) {
    return { valid: false, reason: 'multi_level_subdomain' };
  }

  // 3. Format validation: 3-32 chars, lowercase alphanumeric, internal hyphens, no consecutive hyphens
  if (candidate.length < 3 || candidate.length > 32) {
    return { valid: false, reason: 'invalid_length' };
  }

  if (!/^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$/.test(candidate)) {
    return { valid: false, reason: 'invalid_characters' };
  }

  if (candidate.includes('--')) {
    return { valid: false, reason: 'consecutive_hyphens' };
  }

  // 4. Reserved check
  if (RESERVED_SUBDOMAINS.has(candidate)) {
    return { valid: false, reason: 'reserved_subdomain' };
  }

  return { valid: true, slug: candidate };
}
