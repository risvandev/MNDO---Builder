// ==============================================================================
// MNDO BUILDER - AUTOMATIC SEO & TECHNICAL RESOURCE GENERATORS
// ==============================================================================
import { escapeHtml, sanitizeColor } from './sanitizer.js';

const DOMAIN_SUFFIX = 'mndo.online';

/**
 * Get canonical base URL for a site.
 * @param {object} site
 * @returns {string}
 */
export function getBaseUrl(site) {
  const slug = site?.subdomain_slug || 'mywebsite';
  return `https://${slug}.${DOMAIN_SUFFIX}`;
}

/**
 * Generate robots.txt
 * Handles optional "Discourage search engine indexing" setting.
 * @param {object} site
 * @returns {string}
 */
export function renderRobotsTxt(site) {
  const baseUrl = getBaseUrl(site);
  const discourage = Boolean(site?.seo_config?.discourageSearch);

  if (discourage) {
    return [
      '# Robots.txt for ' + baseUrl,
      'User-agent: *',
      'Disallow: /',
      '',
      '# LLM crawlers',
      'User-agent: GPTBot',
      'Disallow: /',
      'User-agent: ClaudeBot',
      'Disallow: /',
      'User-agent: Google-Extended',
      'Disallow: /',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`
    ].join('\n');
  }

  return [
    '# Robots.txt for ' + baseUrl,
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`
  ].join('\n');
}

/**
 * Generate sitemap.xml
 * @param {object} site
 * @param {Array} pages
 * @param {Array} posts
 * @returns {string}
 */
export function renderSitemapXml(site, pages = [], posts = []) {
  const baseUrl = getBaseUrl(site);
  const now = new Date().toISOString().split('T')[0];

  const items = [
    `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`
  ];

  // Additional published pages
  if (Array.isArray(pages)) {
    for (const page of pages) {
      if (page.is_published !== false && page.path && page.path !== '/') {
        items.push(
          `  <url>\n    <loc>${baseUrl}${page.path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
        );
      }
    }
  }

  // Published blog posts
  if (Array.isArray(posts)) {
    for (const post of posts) {
      if (post.status === 'published' && post.slug) {
        const postDate = post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : now;
        items.push(
          `  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${postDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
        );
      }
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    items.join('\n'),
    '</urlset>'
  ].join('\n');
}

/**
 * Generate llms.txt (Machine-readable markdown guide for AI/LLMs)
 * Strictly derived from user saved content.
 * @param {object} site
 * @param {Array} pages
 * @param {Array} posts
 * @returns {string}
 */
export function renderLlmsTxt(site, pages = [], posts = []) {
  const baseUrl = getBaseUrl(site);
  const title = site?.title || 'Personal Website';
  const desc = site?.description || site?.content?.hero?.tagline || 'Portfolio and personal website.';
  const author = site?.content?.hero?.headline || site?.title || 'Author';

  const lines = [
    `# ${title}`,
    '',
    `> ${desc}`,
    '',
    `Canonical URL: ${baseUrl}`,
    `Author: ${author}`,
    `Site Type: ${site?.site_type || 'Portfolio'}`,
    ''
  ];

  if (site?.content?.about?.body) {
    lines.push('## About');
    lines.push(site.content.about.body);
    lines.push('');
  }

  if (Array.isArray(site?.content?.skills) && site.content.skills.length > 0) {
    lines.push('## Core Skills & Technologies');
    const skillList = site.content.skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
    lines.push(skillList.join(', '));
    lines.push('');
  }

  if (Array.isArray(site?.content?.projects) && site.content.projects.length > 0) {
    lines.push('## Featured Projects');
    for (const p of site.content.projects) {
      lines.push(`- **${p.title || 'Project'}**: ${p.description || ''} ${p.liveUrl ? `([Live](${p.liveUrl}))` : ''}`);
    }
    lines.push('');
  }

  lines.push('## Site Index');
  lines.push(`- [Home](${baseUrl}/): Main overview and portfolio`);

  if (Array.isArray(pages)) {
    for (const page of pages) {
      if (page.is_published !== false && page.path && page.path !== '/') {
        lines.push(`- [${page.title || page.path}](${baseUrl}${page.path}): ${page.title || 'Page'}`);
      }
    }
  }

  if (Array.isArray(posts) && posts.length > 0) {
    lines.push('');
    lines.push('## Articles & Blog Posts');
    for (const post of posts) {
      if (post.status === 'published' && post.slug) {
        lines.push(`- [${post.title}](${baseUrl}/blog/${post.slug}): ${post.excerpt || 'Article'}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate manifest.webmanifest (PWA / browser bookmark manifest)
 * @param {object} site
 * @returns {string}
 */
export function renderManifest(site) {
  const theme = sanitizeColor(site?.theme_config?.primaryColor, '#2563eb');
  return JSON.stringify({
    name: site?.title || 'Personal Website',
    short_name: site?.subdomain_slug || 'Site',
    description: site?.description || '',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: theme,
    icons: [
      {
        src: site?.theme_config?.faviconUrl || '/favicon.ico',
        sizes: '192x192',
        type: 'image/png'
      }
    ]
  }, null, 2);
}

/**
 * Generate RSS 2.0 Feed (feed.xml) for blogs
 * @param {object} site
 * @param {Array} posts
 * @returns {string}
 */
export function renderFeedXml(site, posts = []) {
  const baseUrl = getBaseUrl(site);
  const now = new Date().toUTCString();

  const items = [];
  if (Array.isArray(posts)) {
    for (const post of posts) {
      if (post.status === 'published' && post.slug) {
        const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : now;
        items.push(`    <item>
      <title>${escapeHtml(post.title)}</title>
      <link>${baseUrl}/blog/${escapeHtml(post.slug)}</link>
      <guid>${baseUrl}/blog/${escapeHtml(post.slug)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeHtml(post.excerpt || '')}</description>
    </item>`);
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(site?.title || 'Personal Blog')}</title>
    <link>${baseUrl}</link>
    <description>${escapeHtml(site?.description || 'Articles and updates')}</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;
}

/**
 * Generate high quality, responsive 404 Not Found page
 * @param {object} site
 * @returns {string}
 */
export function render404(site) {
  const title = site?.title || 'Page Not Found';
  const primaryColor = sanitizeColor(site?.theme_config?.primaryColor, '#2563eb');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found | ${escapeHtml(title)}</title>
  <meta name="robots" content="noindex, follow">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0b0f19; color: #f3f4f6; text-align: center; padding: 24px; }
    .card { max-width: 480px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 48px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .badge { display: inline-block; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${primaryColor}; background: rgba(37, 99, 235, 0.12); padding: 6px 14px; border-radius: 9999px; margin-bottom: 20px; }
    h1 { font-size: 32px; font-weight: 800; margin-bottom: 12px; }
    p { font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
    a.btn { display: inline-flex; align-items: center; justify-content: center; background: ${primaryColor}; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 10px; transition: transform 0.2s, opacity 0.2s; }
    a.btn:hover { transform: translateY(-2px); opacity: 0.95; }
    .sub { margin-top: 32px; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Error 404</span>
    <h1>Page Not Found</h1>
    <p>The page you requested could not be found, or has been moved or unpublished.</p>
    <a href="/" class="btn">Return to Homepage</a>
  </div>
</body>
</html>`;
}
