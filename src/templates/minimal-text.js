// ==============================================================================
// TEMPLATE 12: ULTRA-MINIMALIST TXT & ESSAYIST (BEAR BLOG & MATAROA INSPIRED)
// Designed for pure writing, essayists, and thinkers. Sub-5KB, instant 0.05s load time.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown, sanitizeColor } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderMinimalText(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const pages = siteData.pages || [];
  const posts = siteData.posts || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#171717');
  const fontPair = FONT_PAIRS['merriweather-roboto'] || FONT_PAIRS['inter-outfit'];

  const postMatch = (currentPath || '/').match(/^\/blog\/([a-z0-9-]+)\/?$/i);
  let activePost = null;

  if (postMatch) {
    const slug = postMatch[1];
    activePost = posts.find(p => p.slug === slug);
  }

  // -------------------------------------------------------------
  // POST / ESSAY READER VIEW
  // -------------------------------------------------------------
  if (activePost) {
    const pubDate = activePost.published_at
      ? new Date(activePost.published_at).toISOString().split('T')[0]
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, activePost.title, activePost.excerpt, currentPath)}
  <style>
    :root {
      --bg: #ffffff;
      --text: #1a1a1a;
      --muted: #666666;
      --line: #e0e0e0;
      --accent: ${primaryColor};
      --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #141414;
        --text: #e6e6e6;
        --muted: #8c8c8c;
        --line: #2b2b2b;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.75;
      font-size: 17px;
      padding: 32px 20px 80px;
    }
    .wrapper { max-width: 650px; margin: 0 auto; }
    a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
    a:hover { opacity: 0.8; }
    
    header { margin-bottom: 40px; padding-bottom: 16px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: baseline; }
    .site-title { font-weight: 700; font-size: 18px; text-decoration: none; color: var(--text); }
    .nav-links a { margin-left: 14px; font-size: 14px; color: var(--muted); text-decoration: none; }
    .nav-links a:hover { text-decoration: underline; color: var(--text); }

    .post-header { margin-bottom: 28px; }
    .post-title { font-size: 32px; font-weight: 800; line-height: 1.25; margin-bottom: 8px; }
    .post-date { font-size: 14px; color: var(--muted); font-family: monospace; }

    .prose { margin-top: 24px; }
    .prose p { margin-bottom: 20px; }
    .prose h1, .prose h2, .prose h3 { margin: 32px 0 12px; line-height: 1.3; }
    .prose blockquote { border-left: 2px solid var(--text); padding-left: 16px; margin: 24px 0; font-style: italic; color: var(--muted); }
    .prose ul, .prose ol { margin: 0 0 20px 24px; }
    .prose li { margin-bottom: 6px; }
    .prose code { font-family: monospace; font-size: 14px; background: rgba(127,127,127,0.12); padding: 2px 5px; border-radius: 3px; }
    .prose pre { background: rgba(127,127,127,0.08); padding: 16px; border-radius: 6px; overflow-x: auto; margin: 20px 0; }
    .prose pre code { background: none; padding: 0; }

    footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--line); font-size: 13px; color: var(--muted); display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <a href="/" class="site-title">&larr; ${escapeHtml(site.title)}</a>
      <div class="nav-links">
        <a href="/">Index</a>
        <a href="/feed.xml">RSS</a>
      </div>
    </header>

    <article>
      <div class="post-header">
        <h1 class="post-title">${escapeHtml(activePost.title)}</h1>
        <div class="post-date">${pubDate}</div>
      </div>
      <div class="prose">
        ${renderSafeMarkdown(activePost.body_markdown)}
      </div>
    </article>

    <footer>
      <span>&copy; ${new Date().getFullYear()} ${escapeHtml(site.title)}</span>
      <a href="/">Back to all writings &rarr;</a>
    </footer>
  </div>
  ${renderClientScript()}
</body>
</html>`;
  }

  // -------------------------------------------------------------
  // HOMEPAGE / ESSAYS INDEX VIEW
  // -------------------------------------------------------------
  const publishedPosts = posts.filter(p => p.status === 'published');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #ffffff;
      --text: #1a1a1a;
      --muted: #666666;
      --line: #e0e0e0;
      --accent: ${primaryColor};
      --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #141414;
        --text: #e6e6e6;
        --muted: #8c8c8c;
        --line: #2b2b2b;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.75;
      font-size: 17px;
      padding: 40px 20px 80px;
    }
    .wrapper { max-width: 650px; margin: 0 auto; }
    a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
    a:hover { opacity: 0.8; }

    header { margin-bottom: 36px; padding-bottom: 20px; border-bottom: 1px solid var(--line); }
    .site-title { font-size: 24px; font-weight: 800; text-decoration: none; color: var(--text); display: block; margin-bottom: 8px; }
    .site-tagline { font-size: 16px; color: var(--muted); line-height: 1.5; }

    .bio-section { margin-bottom: 40px; }
    .bio-text { font-size: 17px; line-height: 1.7; color: var(--text); }

    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 16px; }

    .post-list { list-style: none; margin-bottom: 48px; }
    .post-item { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; border-bottom: 1px dashed var(--line); }
    .post-item-link { font-weight: 600; text-decoration: none; color: var(--text); }
    .post-item-link:hover { text-decoration: underline; color: var(--accent); }
    .post-item-date { font-size: 13px; color: var(--muted); font-family: monospace; white-space: nowrap; margin-left: 16px; }

    footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--line); font-size: 13px; color: var(--muted); display: flex; justify-content: space-between; align-items: center; }
    footer a { color: var(--muted); }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <a href="/" class="site-title">${escapeHtml(site.title)}</a>
      <div class="site-tagline">${escapeHtml(hero.tagline || site.description || 'Essays, thoughts, and writings.')}</div>
    </header>

    ${hero.bio ? `
      <section class="bio-section">
        <p class="bio-text">${escapeHtml(hero.bio)}</p>
      </section>
    ` : ''}

    <section>
      <div class="section-title">Writings &amp; Essays</div>
      ${publishedPosts.length > 0 ? `
        <ul class="post-list">
          ${publishedPosts.map(p => {
            const dateStr = p.published_at ? new Date(p.published_at).toISOString().split('T')[0] : '';
            return `
              <li class="post-item">
                <a href="/blog/${p.slug}" class="post-item-link">${escapeHtml(p.title)}</a>
                <span class="post-item-date">${dateStr}</span>
              </li>
            `;
          }).join('')}
        </ul>
      ` : `
        <p style="color:var(--muted); font-style:italic; margin-bottom:32px;">No published writings yet.</p>
      `}
    </section>

    <footer>
      <span>&copy; ${new Date().getFullYear()} ${escapeHtml(site.title)}</span>
      <div>
        <a href="/feed.xml">RSS Feed</a> &bull;
        <a href="/sitemap.xml">Sitemap</a>
      </div>
    </footer>
  </div>
  ${renderClientScript()}
</body>
</html>`;
}
