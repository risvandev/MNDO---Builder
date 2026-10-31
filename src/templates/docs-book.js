// ==============================================================================
// TEMPLATE 11: TECHNICAL DOCS & KNOWLEDGE BASE (HUGO BLOX DOCS INSPIRED)
// Designed for technical documentation, handbooks, API guides, and knowledge bases.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown, sanitizeColor } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderDocsBook(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const pages = siteData.pages || [];
  const posts = siteData.posts || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#0284c7');
  const fontPair = FONT_PAIRS['jetbrains-inter'] || FONT_PAIRS['inter-outfit'];

  // Normalize path
  const normalizedPath = (currentPath || '/').split('?')[0].replace(/\/+$/, '') || '/';

  // Build the list of documents:
  // If user has created custom pages, use them. Otherwise, generate standard handbook sections.
  const docsList = pages.length > 0
    ? pages.filter(p => p.is_published !== false).map(p => ({
        id: p.id,
        path: p.path,
        title: p.title,
        description: p.description || '',
        content: p.content || (p.body_markdown ? renderSafeMarkdown(p.body_markdown) : '')
      }))
    : [
        {
          id: 'welcome',
          path: '/',
          title: 'Introduction & Overview',
          description: 'Getting started with the project and understanding core concepts.',
          content: `
            <h2>Welcome</h2>
            <p>${escapeHtml(hero.bio || site.description || 'Welcome to our comprehensive documentation and knowledge base.')}</p>
            <blockquote><strong>Key Principle:</strong> Fast, clean, accessible documentation without unnecessary complexity.</blockquote>
            <h3>Quick Start</h3>
            <p>Follow the guides in the sidebar to configure, deploy, and customize your setup. Every module is isolated and documented with clear examples.</p>
            <pre class="code-block"><code class="language-bash"># Clone and install dependencies
git clone https://github.com/example/project.git
cd project &amp;&amp; npm install
npm run start</code></pre>
          `
        },
        {
          id: 'installation',
          path: '/installation',
          title: 'Installation & Setup',
          description: 'System prerequisites, environment variables, and configuration.',
          content: `
            <h2>Installation &amp; Setup</h2>
            <p>Ensure you have the required runtime environment before proceeding with installation.</p>
            <h3>Prerequisites</h3>
            <ul>
              <li>Node.js 18.0 or newer</li>
              <li>Modern web browser (Chromium, Firefox, Safari)</li>
              <li>Git 2.30+</li>
            </ul>
            <pre class="code-block"><code class="language-bash"># Verify your installation
node -v
npm -v</code></pre>
          `
        },
        {
          id: 'architecture',
          path: '/architecture',
          title: 'Architecture & Design',
          description: 'Deep dive into data flows, edge routing, and storage schemas.',
          content: `
            <h2>Architecture &amp; Design</h2>
            <p>The platform is designed around edge computing principles with instant CDN caching and lightweight client rendering.</p>
            <blockquote>All requests are resolved at Cloudflare Edge within 15 milliseconds.</blockquote>
            <h3>Core Modules</h3>
            <ul>
              <li><strong>Edge Router:</strong> Subdomain dispatching and URL rewriting.</li>
              <li><strong>Static Generator:</strong> Zero-runtime HTML generation.</li>
              <li><strong>Secure Sandbox:</strong> Isolated previews with strict frame controls.</li>
            </ul>
          `
        },
        {
          id: 'faq',
          path: '/faq',
          title: 'Frequently Asked Questions',
          description: 'Common troubleshooting steps, gotchas, and tips.',
          content: `
            <h2>Frequently Asked Questions</h2>
            <h3>How do custom subdomains work?</h3>
            <p>Every project automatically receives a free subdomain under the platform domain with instant SSL certificates provisioned automatically.</p>
            <h3>Can I export my documentation?</h3>
            <p>Yes, all markdown files and standalone HTML files can be exported anytime.</p>
          `
        }
      ];

  // Find active doc
  let activeIdx = docsList.findIndex(d => d.path === normalizedPath);
  if (activeIdx === -1) {
    activeIdx = 0;
  }
  const activeDoc = docsList[activeIdx];
  const prevDoc = activeIdx > 0 ? docsList[activeIdx - 1] : null;
  const nextDoc = activeIdx < docsList.length - 1 ? docsList[activeIdx + 1] : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, activeDoc.title, activeDoc.description || site.description, currentPath)}
  <style>
    :root {
      --bg: #ffffff;
      --sidebar-bg: #f8fafc;
      --text: #1e293b;
      --heading: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --accent: ${primaryColor};
      --accent-soft: rgba(2, 132, 199, 0.08);
      --font-mono: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.7; font-size: 16px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Sticky Docs Header */
    .docs-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      justify-content: space-between;
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .site-brand { font-family: var(--font-mono); font-weight: 700; font-size: 16px; color: var(--heading); display: flex; align-items: center; gap: 8px; }
    .site-brand:hover { text-decoration: none; }
    .badge-docs { font-size: 11px; background: var(--accent-soft); color: var(--accent); padding: 2px 8px; border-radius: 4px; font-weight: 600; font-family: var(--font-mono); }

    /* Search Box */
    .search-wrap { position: relative; width: 260px; }
    .search-input {
      width: 100%;
      background: #f1f5f9;
      border: 1px solid transparent;
      padding: 6px 12px 6px 32px;
      border-radius: 6px;
      font-size: 13px;
      color: var(--text);
      outline: none;
      transition: all 0.15s ease;
    }
    .search-input:focus { background: #ffffff; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
    .search-icon { position: absolute; left: 10px; top: 8px; font-size: 12px; color: var(--muted); }

    /* Layout: Sidebar + Main Content */
    .docs-layout { display: flex; min-height: calc(100vh - 60px); }

    /* Sidebar Navigation */
    .docs-sidebar {
      width: 280px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      padding: 24px 16px;
      flex-shrink: 0;
      position: sticky;
      top: 60px;
      height: calc(100vh - 60px);
      overflow-y: auto;
    }
    .sidebar-section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin-bottom: 12px;
      padding-left: 10px;
    }
    .doc-nav-list { list-style: none; display: flex; flex-direction: column; gap: 3px; }
    .doc-nav-link {
      display: block;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      color: var(--muted);
      font-weight: 500;
      transition: all 0.12s ease;
    }
    .doc-nav-link:hover { color: var(--heading); background: rgba(0, 0, 0, 0.04); text-decoration: none; }
    .doc-nav-link.active {
      color: var(--accent);
      background: var(--accent-soft);
      font-weight: 600;
    }

    /* Main Doc Article */
    .docs-main {
      flex: 1;
      max-width: 860px;
      padding: 40px 48px 80px;
      margin: 0 auto;
    }
    .breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 16px; display: flex; gap: 6px; align-items: center; }
    .breadcrumb a { color: var(--muted); }
    .breadcrumb a:hover { color: var(--heading); }
    .doc-title { font-size: 36px; font-weight: 800; color: var(--heading); margin-bottom: 12px; line-height: 1.25; }
    .doc-desc { font-size: 18px; color: var(--muted); line-height: 1.6; margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 24px; }

    /* Prose Styling */
    .prose h2 { font-size: 24px; font-weight: 700; color: var(--heading); margin: 36px 0 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    .prose h3 { font-size: 19px; font-weight: 600; color: var(--heading); margin: 28px 0 12px; }
    .prose p { margin-bottom: 20px; }
    .prose ul, .prose ol { margin: 0 0 20px 24px; }
    .prose li { margin-bottom: 6px; }
    .prose blockquote {
      border-left: 3px solid var(--accent);
      background: var(--accent-soft);
      padding: 12px 18px;
      margin: 24px 0;
      border-radius: 0 6px 6px 0;
      color: var(--text);
    }
    .code-block {
      background: #0f172a;
      color: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.6;
      position: relative;
    }
    .code-block code { font-family: inherit; color: inherit; }
    .inline-code {
      font-family: var(--font-mono);
      font-size: 13px;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Prev / Next Pagination */
    .doc-pagination {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 56px;
      padding-top: 28px;
      border-top: 1px solid var(--border);
    }
    .pagination-card {
      padding: 16px 20px;
      border: 1px solid var(--border);
      border-radius: 8px;
      transition: all 0.15s ease;
    }
    .pagination-card:hover { border-color: var(--accent); text-decoration: none; }
    .pagination-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
    .pagination-title { font-size: 15px; font-weight: 600; color: var(--heading); }

    /* Mobile toggle */
    .mobile-menu-btn { display: none; background: none; border: 1px solid var(--border); padding: 6px 10px; border-radius: 6px; font-size: 14px; cursor: pointer; }

    @media (max-width: 860px) {
      .mobile-menu-btn { display: block; }
      .search-wrap { display: none; }
      .docs-sidebar {
        position: fixed;
        left: -280px;
        transition: left 0.2s ease;
        z-index: 200;
        box-shadow: 4px 0 24px rgba(0,0,0,0.1);
      }
      .docs-sidebar.open { left: 0; }
      .docs-main { padding: 24px 20px 60px; }
    }
  </style>
</head>
<body>
  <header class="docs-header">
    <div class="header-left">
      <button class="mobile-menu-btn" id="btnToggleMenu" aria-label="Toggle Navigation">&equiv; Menu</button>
      <a href="/" class="site-brand">
        ${site.theme_config?.logoUrl ? `<img src="${sanitizeUrl(site.theme_config.logoUrl)}" alt="${escapeHtml(site.title)}" style="height:24px;">` : ''}
        <span>${escapeHtml(site.title || 'Documentation')}</span>
        <span class="badge-docs">DOCS</span>
      </a>
    </div>

    <div class="search-wrap">
      <span class="search-icon">&telrec;</span>
      <input type="text" class="search-input" id="docSearchInput" placeholder="Filter topics...">
    </div>
  </header>

  <div class="docs-layout">
    <aside class="docs-sidebar" id="docsSidebar">
      <div class="sidebar-section-title">Documentation</div>
      <ul class="doc-nav-list" id="docNavList">
        ${docsList.map(doc => `
          <li>
            <a href="${doc.path}" class="doc-nav-link ${doc.path === activeDoc.path ? 'active' : ''}" data-title="${escapeHtml(doc.title.toLowerCase())}">
              ${escapeHtml(doc.title)}
            </a>
          </li>
        `).join('')}
      </ul>
    </aside>

    <main class="docs-main">
      <nav class="breadcrumb">
        <a href="/">Docs</a>
        <span>/</span>
        <span>${escapeHtml(activeDoc.title)}</span>
      </nav>

      <h1 class="doc-title">${escapeHtml(activeDoc.title)}</h1>
      ${activeDoc.description ? `<p class="doc-desc">${escapeHtml(activeDoc.description)}</p>` : ''}

      <div class="prose">
        ${typeof activeDoc.content === 'string' ? activeDoc.content : ''}
      </div>

      <div class="doc-pagination">
        ${prevDoc ? `
          <a href="${prevDoc.path}" class="pagination-card" style="text-align:left;">
            <div class="pagination-label">&larr; Previous</div>
            <div class="pagination-title">${escapeHtml(prevDoc.title)}</div>
          </a>
        ` : '<div></div>'}

        ${nextDoc ? `
          <a href="${nextDoc.path}" class="pagination-card" style="text-align:right;">
            <div class="pagination-label">Next &rarr;</div>
            <div class="pagination-title">${escapeHtml(nextDoc.title)}</div>
          </a>
        ` : '<div></div>'}
      </div>
    </main>
  </div>

  <script>
    // Live filter search for docs
    var searchInput = document.getElementById('docSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        var query = e.target.value.toLowerCase().trim();
        var links = document.querySelectorAll('#docNavList .doc-nav-link');
        links.forEach(function(link) {
          var title = link.getAttribute('data-title') || '';
          if (!query || title.indexOf(query) !== -1) {
            link.parentElement.style.display = '';
          } else {
            link.parentElement.style.display = 'none';
          }
        });
      });
    }

    // Mobile sidebar toggle
    var toggleBtn = document.getElementById('btnToggleMenu');
    var sidebar = document.getElementById('docsSidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });
    }
  </script>
  ${renderClientScript()}
</body>
</html>`;
}
