// ==============================================================================
// MNDO BUILDER - DEDICATED CUSTOM PAGE RENDERER
// Renders individual multi-page routes (/about, /projects, /services, etc.)
// with the active site's branding, navigation, typography, and page body.
// ==============================================================================
import { escapeHtml, sanitizeColor, renderSafeMarkdown } from './sanitizer.js';
import { renderHead, renderNav, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderCustomPage(siteData, page, currentPath = '/') {
  const site = siteData.site || {};
  const pages = siteData.pages || [];
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#111827');
  const fontPair = FONT_PAIRS[site.theme_config?.fontPair] || FONT_PAIRS['inter-outfit'];
  const pageTitle = page.title || 'Page';
  const pageContent = page.content || page.body_markdown || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${pageTitle} - ${site.title}`, null, currentPath)}
  <style>
    :root {
      --bg: #ffffff;
      --text: #1f2937;
      --heading: #111827;
      --muted: #6b7280;
      --border: #e5e7eb;
      --card-bg: #f9fafb;
      --accent: ${primaryColor};
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.7;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .page-main-wrap { flex: 1; padding: 60px 0 80px; }
    .container { max-width: 820px; margin: 0 auto; padding: 0 24px; }
    
    /* Header & Navigation Styles */
    .site-header { border-bottom: 1px solid var(--border); position: sticky; top: 0; background: rgba(255,255,255,0.96); backdrop-filter: blur(10px); z-index: 100; }
    .nav-container { max-width: 900px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-heading); font-weight: 700; font-size: 19px; color: var(--heading); }
    .nav-menu { display: flex; gap: 24px; align-items: center; }
    .nav-link { font-size: 14.5px; font-weight: 500; color: var(--muted); transition: color 0.15s; }
    .nav-link:hover, .nav-link.active { color: var(--heading); }
    .nav-toggle { display: none; background: none; border: none; font-size: 20px; cursor: pointer; }

    /* Page Content Styling */
    .page-header { margin-bottom: 40px; border-bottom: 1px solid var(--border); padding-bottom: 24px; }
    .page-title {
      font-family: var(--font-heading);
      font-size: clamp(32px, 4vw, 44px);
      font-weight: 800;
      color: var(--heading);
      letter-spacing: -0.025em;
      line-height: 1.15;
      margin-bottom: 8px;
    }
    .page-path-meta { font-size: 13px; font-family: monospace; color: var(--muted); }
    
    /* Prose Markdown Formatting */
    .prose { font-size: 16.5px; line-height: 1.8; color: var(--text); }
    .prose h1, .prose h2, .prose h3 { font-family: var(--font-heading); color: var(--heading); margin: 32px 0 16px; letter-spacing: -0.02em; }
    .prose h1 { font-size: 28px; }
    .prose h2 { font-size: 22px; }
    .prose h3 { font-size: 18px; }
    .prose p { margin-bottom: 20px; }
    .prose ul, .prose ol { margin: 0 0 20px 24px; }
    .prose li { margin-bottom: 8px; }
    .prose blockquote {
      border-left: 3px solid var(--accent);
      padding: 12px 20px;
      margin: 24px 0;
      background: var(--card-bg);
      font-style: italic;
      color: var(--heading);
    }
    .prose pre.code-block {
      background: #111827;
      color: #f3f4f6;
      padding: 16px 20px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 14px;
      margin: 24px 0;
    }
    .prose code.inline-code {
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      color: var(--heading);
    }
    .page-empty-state {
      padding: 48px 24px;
      text-align: center;
      background: var(--card-bg);
      border: 1px dashed var(--border);
      border-radius: 12px;
      color: var(--muted);
      font-size: 15px;
    }

    /* Footer */
    .site-footer { border-top: 1px solid var(--border); padding: 36px 0; font-size: 13px; color: var(--muted); margin-top: auto; }
    .footer-container { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }

    @media (max-width: 768px) {
      .nav-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: #fff; padding: 20px; border-bottom: 1px solid var(--border); }
      .nav-menu.open { display: flex; }
      .nav-toggle { display: block; }
    }
  </style>
</head>
<body>
  ${renderNav(site, pages, currentPath)}
  <div class="page-main-wrap">
    <main class="container custom-page">
      <div class="page-header">
        <h1 class="page-title">${escapeHtml(pageTitle)}</h1>
        <div class="page-path-meta">${escapeHtml(page.path || currentPath)}</div>
      </div>
      <article class="page-body">
        ${pageContent.trim() ? `
          <div class="prose">
            ${renderSafeMarkdown(pageContent)}
          </div>
        ` : `
          <div class="page-empty-state">
            <p><strong>This page has no content yet.</strong></p>
            <p style="margin-top:8px; font-size:13.5px;">Add markdown or text to this page inside the MNDO Studio Pages tab.</p>
          </div>
        `}
      </article>
    </main>
  </div>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
