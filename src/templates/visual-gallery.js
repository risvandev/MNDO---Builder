// ==============================================================================
// TEMPLATE 15: VISUAL SHOWCASE & GALLERY (CARGO & VSCO INSPIRED)
// Designed for visual creators, photographers, UI/UX designers, and visual architects.
// ==============================================================================
import { escapeHtml, sanitizeUrl } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderVisualGallery(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const pages = siteData.pages || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const projects = content.projects || [];
  const primaryColor = site.theme_config?.primaryColor || '#0a0a0a';
  const fontPair = FONT_PAIRS['syne-inter'] || FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #0d0d0d;
      --card-bg: #161616;
      --text: #eaeaea;
      --heading: #ffffff;
      --muted: #888888;
      --border: #222222;
      --accent: ${primaryColor};
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.6;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

    /* Header */
    .gallery-header {
      padding: 40px 0 32px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid var(--border);
    }
    .brand-title { font-family: var(--font-heading); font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: var(--heading); }
    .gallery-nav { display: flex; gap: 24px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .gallery-nav a:hover { color: #ffffff; }

    /* Intro Statement */
    .gallery-intro {
      padding: 72px 0 56px;
      max-width: 840px;
    }
    .intro-headline {
      font-family: var(--font-heading);
      font-size: clamp(32px, 5vw, 56px);
      font-weight: 800;
      color: var(--heading);
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 20px;
    }
    .intro-bio { font-size: 18px; color: var(--muted); line-height: 1.6; }

    /* Gallery Grid */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 36px;
      padding-bottom: 80px;
    }
    .gallery-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .gallery-card:hover { transform: translateY(-4px); border-color: #444; }
    .gallery-image-wrap {
      width: 100%;
      height: 280px;
      background: #1f1f1f;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .gallery-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .gallery-card:hover .gallery-image-wrap img { transform: scale(1.03); }
    
    .gallery-info { padding: 24px; display: flex; flex-direction: column; flex: 1; }
    .gallery-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .gallery-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--muted); }
    .gallery-card-title { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--heading); margin-bottom: 8px; }
    .gallery-card-desc { font-size: 14px; color: var(--muted); line-height: 1.5; margin-bottom: 16px; flex: 1; }
    .gallery-card-link { font-size: 13px; font-weight: 600; color: #ffffff; display: inline-flex; align-items: center; gap: 6px; }

    /* Footer */
    .gallery-footer {
      border-top: 1px solid var(--border);
      padding: 48px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--muted);
    }

    @media (max-width: 640px) {
      .gallery-grid { grid-template-columns: 1fr; }
      .gallery-header { flex-direction: column; gap: 16px; }
      .gallery-footer { flex-direction: column; gap: 16px; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="gallery-header">
      <div class="brand-title">${escapeHtml(site.title)}</div>
      <nav class="gallery-nav">
        <a href="#works">Works</a>
        <a href="#about">About</a>
        <a href="mailto:${site.seo_config?.contactEmail || 'hello@example.com'}">Contact</a>
      </nav>
    </header>

    <section class="gallery-intro" id="about">
      <h1 class="intro-headline">${escapeHtml(hero.headline || site.title)}</h1>
      <p class="intro-bio">${escapeHtml(hero.bio || site.description || 'Curating visual spaces, interfaces, and architecture.')}</p>
    </section>

    <section id="works">
      <div class="gallery-grid">
        ${projects.length > 0 ? projects.map(p => `
          <div class="gallery-card">
            <div class="gallery-image-wrap">
              ${p.imageUrl ? `<img src="${sanitizeUrl(p.imageUrl)}" alt="${escapeHtml(p.title)}">` : `
                <div style="color:var(--muted); font-size:12px; font-family:monospace; text-transform:uppercase; letter-spacing:1px;">Visual Project</div>
              `}
            </div>
            <div class="gallery-info">
              ${p.tags && p.tags.length > 0 ? `
                <div class="gallery-tags">
                  ${p.tags.map(t => `<span class="gallery-tag">${escapeHtml(t)}</span>`).join(' &bull; ')}
                </div>
              ` : ''}
              <h2 class="gallery-card-title">${escapeHtml(p.title)}</h2>
              <p class="gallery-card-desc">${escapeHtml(p.description || '')}</p>
              ${p.liveUrl ? `
                <a href="${sanitizeUrl(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="gallery-card-link">
                  View Project &rarr;
                </a>
              ` : ''}
            </div>
          </div>
        `).join('') : `
          <div class="gallery-card">
            <div class="gallery-image-wrap">
              <div style="color:var(--muted); font-size:12px; font-family:monospace; text-transform:uppercase; letter-spacing:1px;">Selected Work</div>
            </div>
            <div class="gallery-info">
              <div class="gallery-tags"><span class="gallery-tag">Identity</span> &bull; <span class="gallery-tag">Design</span></div>
              <h2 class="gallery-card-title">Editorial Identity 2026</h2>
              <p class="gallery-card-desc">Spatial layout and typographic direction for contemporary print and digital surfaces.</p>
            </div>
          </div>
          <div class="gallery-card">
            <div class="gallery-image-wrap">
              <div style="color:var(--muted); font-size:12px; font-family:monospace; text-transform:uppercase; letter-spacing:1px;">Visual Architecture</div>
            </div>
            <div class="gallery-info">
              <div class="gallery-tags"><span class="gallery-tag">Architecture</span> &bull; <span class="gallery-tag">3D</span></div>
              <h2 class="gallery-card-title">Monolithic Concrete Forms</h2>
              <p class="gallery-card-desc">Explorations into tactile brutalist structures, concrete textures, and natural lighting.</p>
            </div>
          </div>
        `}
      </div>
    </section>

    <footer class="gallery-footer">
      <div>&copy; ${new Date().getFullYear()} ${escapeHtml(site.title)}. All rights reserved.</div>
      <div>Designed with clarity &amp; restraint.</div>
    </footer>
  </div>
  ${renderClientScript()}
</body>
</html>`;
}
