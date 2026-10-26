// ==============================================================================
// CLOUDFLARE WORKER - SECURITY HEADERS & POLICY
// ==============================================================================

/**
 * Apply hardened HTTP response security headers.
 * @param {Response} response
 * @param {string} contentType
 * @returns {Response}
 */
export function applySecurityHeaders(response, contentType = 'text/html; charset=UTF-8') {
  const headers = new Headers(response.headers);

  // Content Type
  headers.set('Content-Type', contentType);

  // Hardened Content Security Policy
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' https: data: blob:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );

  // Standard protection headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
