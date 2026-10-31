// ==============================================================================
// TEMPLATE 19: OPEN SOURCE MAINTAINER & TOOLMAKER (EVAN YOU & SINDRE SORHUS INSPIRED)
// Crafted for open source developers, library authors, CLI creators, and toolmakers.
// Repository cards with stars/forks, install command banner, and sponsorship CTA.
// ==============================================================================
import { escapeHtml, sanitizeUrl, sanitizeColor } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderOssMaintainer(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const projects = content.projects || [];
  const skills = content.skills || [];
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#8b5cf6'); // Violet open-source
  const fontPair = FONT_PAIRS['jetbrains-inter'] || FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${hero.headline || site.title} - Open Source Toolmaker`, site.description, currentPath)}
  <style>
    :root {
      --bg: #0f1117;
      --card-bg: #161822;
      --text: #9ca3af;
      --heading: #f3f4f6;
      --muted: #6b7280;
      --border: #232736;
      --border-hover: #374151;
      --accent: ${primaryColor};
      --accent-soft: rgba(139, 92, 246, 0.12);
      --font-mono: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.65;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 860px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .oss-nav {
      padding: 24px 0;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 56px;
    }
    .brand-id { font-family: var(--font-mono); font-weight: 700; font-size: 16px; color: var(--heading); }
    .nav-actions { display: flex; gap: 16px; align-items: center; }
    .sponsor-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #db2777;
      color: #ffffff !important;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      transition: opacity 0.15s;
    }
    .sponsor-btn:hover { opacity: 0.9; text-decoration: none; }

    /* Hero */
    .hero-section { margin-bottom: 56px; }
    .hero-avatar { width: 72px; height: 72px; border-radius: 50%; border: 2px solid var(--border); margin-bottom: 20px; object-fit: cover; }
    .hero-name { font-size: clamp(32px, 5vw, 44px); font-weight: 800; color: var(--heading); margin-bottom: 8px; letter-spacing: -0.02em; }
    .hero-role { font-family: var(--font-mono); font-size: 15px; color: var(--accent); margin-bottom: 16px; }
    .hero-bio { font-size: 16px; color: var(--text); line-height: 1.7; max-width: 680px; margin-bottom: 24px; }

    /* Install Banner */
    .install-banner {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #090a0f;
      border: 1px solid var(--border);
      padding: 10px 18px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--heading);
      margin-bottom: 48px;
    }
    .install-copy { color: var(--muted); cursor: pointer; }
    .install-copy:hover { color: var(--heading); }

    /* Section */
    .section-wrap { margin-bottom: 56px; }
    .section-title {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Repo Cards Grid */
    .repo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .repo-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.15s ease;
    }
    .repo-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
    .repo-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .repo-name { font-family: var(--font-mono); font-size: 15px; font-weight: 700; color: var(--heading); }
    .repo-desc { font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 16px; flex: 1; }
    .repo-meta { display: flex; gap: 14px; font-family: var(--font-mono); font-size: 12px; color: var(--muted); align-items: center; }
    .repo-lang { display: inline-flex; align-items: center; gap: 5px; }
    .repo-lang-dot { width: 8px; height: 8px; border-radius: 50%; background: #3178c6; }

    /* Tooling Pills */
    .tool-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
    .tool-pill {
      font-family: var(--font-mono);
      font-size: 12px;
      padding: 5px 12px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--heading);
    }

    /* Footer */
    .oss-footer {
      border-top: 1px solid var(--border);
      padding: 40px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--muted);
      font-family: var(--font-mono);
    }

    @media (max-width: 640px) {
      .repo-grid { grid-template-columns: 1fr; }
      .oss-footer { flex-direction: column; gap: 12px; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <nav class="oss-nav">
      <div class="brand-id">${escapeHtml(site.title)}</div>
      <div class="nav-actions">
        <a href="#repos" style="color:var(--muted); font-size:13px; font-family:var(--font-mono);">Repositories</a>
        <a href="https://github.com/sponsors" target="_blank" rel="noopener noreferrer" class="sponsor-btn">&hearts; Sponsor</a>
      </div>
    </nav>

    <header class="hero-section">
      ${hero.avatarUrl ? `<img src="${sanitizeUrl(hero.avatarUrl)}" alt="${escapeHtml(hero.headline || site.title)}" class="hero-avatar">` : ''}
      <h1 class="hero-name">${escapeHtml(hero.headline || site.title)}</h1>
      <div class="hero-role">&gt; ${escapeHtml(hero.tagline || 'Open Source Maintainer & Toolmaker')}</div>
      <p class="hero-bio">${escapeHtml(hero.bio || site.description || 'Creating developer tooling, lightweight runtimes, and open standards for modern web engineering.')}</p>

      <div class="install-banner">
        <span style="color:#10b981;">$</span>
        <span>npx mndo-create my-site</span>
        <span class="install-copy" onclick="navigator.clipboard.writeText('npx mndo-create my-site'); alert('Copied install command!');" title="Copy command">&boxbox;</span>
      </div>
    </header>

    ${projects.length > 0 ? `
    <!-- Open Source Repositories -->
    <section class="section-wrap" id="repos">
      <div class="section-title">Pinned Packages &amp; Repositories</div>
      <div class="repo-grid">
        ${projects.map(proj => `
          <div class="repo-card">
            <div>
              <div class="repo-header">
                <span class="repo-name">
                  ${proj.liveUrl ? `<a href="${sanitizeUrl(proj.liveUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(proj.title)}</a>` : escapeHtml(proj.title)}
                </span>
                <span style="font-size:11px; font-family:var(--font-mono); color:var(--muted);">Public</span>
              </div>
              <p class="repo-desc">${escapeHtml(proj.description || '')}</p>
            </div>
            <div class="repo-meta">
              <span class="repo-lang"><span class="repo-lang-dot"></span> Open Source</span>
              ${proj.tags && proj.tags.length ? `<span>${escapeHtml(proj.tags[0])}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${skills.length > 0 ? `
    <!-- Open Source Ecosystem -->
    <section class="section-wrap">
      <div class="section-title">Ecosystem &amp; Tech Stack</div>
      <div class="tool-cloud">
        ${skills.map(s => `
          <span class="tool-pill">${escapeHtml(s.name || s)}</span>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <footer class="oss-footer">
      <div>&copy; ${new Date().getFullYear()} ${escapeHtml(site.title)} &bull; Free &amp; Open Source.</div>
      <div>
        <a href="mailto:${site.seo_config?.contactEmail || 'contact@example.com'}">hello@developer.dev</a>
      </div>
    </footer>
  </div>
  ${renderClientScript()}
</body>
</html>`;
}
