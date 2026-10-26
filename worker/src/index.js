// ==============================================================================
// CLOUDFLARE WORKER - MNDO BUILDER WILDCARD PUBLISHED RENDERER
// Routes *.mndo.online requests to published HTML websites
// ==============================================================================
import { parseSubdomain } from './hostname.js';
import { applySecurityHeaders } from './security.js';
import { fetchPublishedSite } from './public-site.js';
import { handleContactSubmission } from './contact-forms.js';
import { renderSite } from '../../src/templates/index.js';

export default {
  /**
   * Cloudflare Worker Fetch Entrypoint
   * @param {Request} request
   * @param {object} env
   * @param {object} ctx
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const platformDomain = env.PLATFORM_DOMAIN || 'mndo.online';

    // 1. Hostname parsing & apex protection
    const subResult = parseSubdomain(url.hostname, platformDomain);

    // Apex domain protection: The existing website at mndo.online must remain functional
    if (subResult.isApex) {
      return new Response(
        'MNDO Builder: Subdomain routing gateway active. Apex domain is reserved for existing site.',
        { status: 200, headers: { 'Content-Type': 'text/plain' } }
      );
    }

    if (!subResult.valid) {
      if (subResult.reason === 'reserved_subdomain') {
        return new Response(
          'Reserved Hostname: This address is reserved for platform infrastructure.',
          { status: 403, headers: { 'Content-Type': 'text/plain' } }
        );
      }
      return new Response(
        'Invalid or unrecognized subdomain.',
        { status: 404, headers: { 'Content-Type': 'text/plain' } }
      );
    }

    const slug = subResult.slug;

    // 2. Handle Contact Form Submissions: POST /api/contact
    if (url.pathname === '/api/contact') {
      return handleContactSubmission(request, env);
    }

    // 3. Fetch published site data from Supabase (read-only public RPC)
    const siteResult = await fetchPublishedSite(slug, env);

    // Check for historical slug redirect
    if (siteResult.redirect && siteResult.target_url) {
      return Response.redirect(siteResult.target_url, 301);
    }

    // If site not found or not currently published
    if (!siteResult.found || !siteResult.siteData) {
      const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Not Found | MNDO</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0b0f19; color: #f3f4f6; text-align: center; padding: 24px; }
    .card { max-width: 480px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 48px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    h1 { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
    p { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
    .slug-badge { font-family: monospace; background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 6px; color: #38bdf8; }
    a.btn { display: inline-flex; align-items: center; justify-content: center; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Website Not Found</h1>
    <p>The website at <span class="slug-badge">${slug}.${platformDomain}</span> does not exist or has been unpublished by its owner.</p>
    <a href="https://${platformDomain}" class="btn">Create Your Own Website on MNDO</a>
  </div>
</body>
</html>`;
      return applySecurityHeaders(new Response(notFoundHtml, { status: 404 }), 'text/html; charset=UTF-8');
    }

    // 4. Render requested path using the shared template engine
    const renderResult = renderSite(siteResult.siteData, url.pathname);

    // Map content-type
    const mimeTypes = {
      html: 'text/html; charset=UTF-8',
      text: 'text/plain; charset=UTF-8',
      xml: 'application/xml; charset=UTF-8',
      json: 'application/manifest+json; charset=UTF-8'
    };
    const contentType = mimeTypes[renderResult.type] || 'text/html; charset=UTF-8';

    // Edge cache settings: cache published responses at the edge for 5 mins, revalidate in background
    const response = new Response(renderResult.body, {
      status: renderResult.status,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
      }
    });

    return applySecurityHeaders(response, contentType);
  }
};
