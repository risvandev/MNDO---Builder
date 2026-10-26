// ==============================================================================
// TEMPLATE 5: CREATIVE PORTFOLIO
// Visual project grids, bold expressive typography, galleries & artistic showcase.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown } from './sanitizer.js';
import { renderHead, renderNav, renderContactForm, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderCreative(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const projects = content.projects || [];
  const gallery = content.gallery || [];
  const skills = content.skills || [];
  const social = content.social || {};
  const primaryColor = site.theme_config?.primaryColor || '#ec4899'; // Vibrant Pink / Magenta
  const fontPair = FONT_PAIRS['syne-inter'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #0c0a09;
      --card-bg: #1c1917;
      --border: #292524;
      --text: #f5f5f4;
      --muted: #a8a29e;
      --accent: ${primaryColor};
      --font-display: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.6; }
    a { color: var(--accent); text-decoration: none; }
    .container { max-width: 1040px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .site-header { border-bottom: 1px solid var(--border); background: rgba(12, 10, 9, 0.9); backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 1040px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
    .nav-menu { display: flex; gap: 24px; }
    .nav-link { font-size: 14px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .nav-link:hover, .nav-link.active { color: var(--accent); }
    .nav-toggle { display: none; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; }

    /* Hero */
    .hero-section { padding: 90px 0 60px; text-align: center; }
    .hero-eyebrow { font-family: var(--font-display); font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: var(--accent); margin-bottom: 20px; }
    .hero-title { font-family: var(--font-display); font-size: clamp(40px, 7vw, 72px); font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; color: #fff; margin-bottom: 24px; max-width: 880px; margin-left: auto; margin-right: auto; }
    .hero-tag { font-size: 20px; color: var(--muted); margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; }
    .hero-actions { display: flex; gap: 16px; justify-content: center; }
    .btn { display: inline-flex; align-items: center; padding: 14px 32px; font-weight: 700; font-size: 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; transition: transform 0.2s; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { transform: scale(1.05); }
    .btn-outline { border: 1px solid var(--border); color: #fff; }
    .btn-outline:hover { background: var(--card-bg); }

    /* Sections */
    .section { padding: 64px 0; }
    .section-title { font-family: var(--font-display); font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 36px; text-transform: uppercase; letter-spacing: -0.02em; }

    /* Visual Project Showcase (Masonry / Cards) */
    .showcase-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
    .showcase-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: transform 0.3s, border-color 0.3s; }
    .showcase-card:hover { transform: translateY(-6px); border-color: var(--accent); }
    .showcase-img { width: 100%; height: 220px; object-fit: cover; background: #292524; display: block; }
    .showcase-content { padding: 24px; }
    .showcase-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .showcase-desc { font-size: 14px; color: var(--muted); margin-bottom: 16px; }
    .showcase-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .showcase-tag { font-size: 12px; background: rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 9999px; color: #d6d3d1; }
    .showcase-link { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); }

    /* Gallery */
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .gallery-item { border-radius: 12px; overflow: hidden; aspect-ratio: 1; border: 1px solid var(--border); }
    .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .gallery-item:hover img { transform: scale(1.05); }

    /* Skills Pill Cloud */
    .skills-cloud { display: flex; flex-wrap: wrap; gap: 12px; }
    .skill-badge { font-family: var(--font-display); font-size: 15px; font-weight: 700; padding: 10px 20px; border-radius: 9999px; background: var(--card-bg); border: 1px solid var(--border); }

    /* Contact */
    .contact-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--muted); }
    .form-group input, .form-group textarea { width: 100%; background: #0c0a09; border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: #fff; font-family: inherit; font-size: 14px; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); }
    .submit-btn { background: var(--accent); color: #fff; font-family: var(--font-display); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px; border: none; border-radius: 8px; cursor: pointer; width: 100%; }

    /* Footer */
    .site-footer { border-top: 1px solid var(--border); padding: 40px 0; font-size: 13px; color: var(--muted); }
    .footer-container { max-width: 1040px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }

    @media (max-width: 768px) {
      .contact-card { grid-template-columns: 1fr; }
      .nav-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); padding: 20px; border-bottom: 1px solid var(--border); }
      .nav-menu.open { display: flex; }
      .nav-toggle { display: block; }
    }
  </style>
</head>
<body>
  ${renderNav(site, pages, currentPath)}
  <main class="container">
    <section class="hero-section" id="hero">
      <div class="hero-eyebrow">Creative Direction & Design</div>
      <h1 class="hero-title">${escapeHtml(hero.headline || site.title)}</h1>
      <p class="hero-tag">${escapeHtml(hero.tagline || hero.bio || site.description || '')}</p>
      <div class="hero-actions">
        ${hero.primaryCta?.text ? `<a href="${sanitizeUrl(hero.primaryCta.url || '#projects')}" class="btn btn-primary">${escapeHtml(hero.primaryCta.text)}</a>` : '<a href="#projects" class="btn btn-primary">Explore Works</a>'}
        <a href="#contact" class="btn btn-outline">Let's Talk</a>
      </div>
    </section>

    ${about.body ? `
    <section class="section" id="about">
      <h2 class="section-title">The Creative Vision</h2>
      <div class="prose">${renderSafeMarkdown(about.body)}</div>
    </section>
    ` : ''}

    ${projects.length > 0 ? `
    <section class="section" id="projects">
      <h2 class="section-title">Selected Projects</h2>
      <div class="showcase-grid">
        ${projects.map(p => `
          <div class="showcase-card">
            ${p.imageUrl ? `<img src="${sanitizeUrl(p.imageUrl)}" alt="${escapeHtml(p.title)}" class="showcase-img">` : '<div class="showcase-img" style="display:flex;align-items:center;justify-content:center;color:#78716c;font-size:14px;">Showcase Project</div>'}
            <div class="showcase-content">
              <h3 class="showcase-title">${escapeHtml(p.title)}</h3>
              <p class="showcase-desc">${escapeHtml(p.description || '')}</p>
              ${Array.isArray(p.tags) && p.tags.length > 0 ? `
                <div class="showcase-tags">
                  ${p.tags.map(t => `<span class="showcase-tag">${escapeHtml(t)}</span>`).join('')}
                </div>
              ` : ''}
              ${p.liveUrl ? `<a href="${sanitizeUrl(p.liveUrl)}" target="_blank" rel="noopener" class="showcase-link">View Project &rarr;</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${gallery.length > 0 ? `
    <section class="section" id="gallery">
      <h2 class="section-title">Visual Gallery</h2>
      <div class="gallery-grid">
        ${gallery.map(g => `
          <div class="gallery-item">
            <img src="${sanitizeUrl(g.imageUrl)}" alt="${escapeHtml(g.caption || 'Artwork')}" loading="lazy">
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${skills.length > 0 ? `
    <section class="section" id="skills">
      <h2 class="section-title">Disciplines & Tools</h2>
      <div class="skills-cloud">
        ${skills.map(s => `<div class="skill-badge">${escapeHtml(typeof s === 'string' ? s : s.name)}</div>`).join('')}
      </div>
    </section>
    ` : ''}

    <section class="section" id="contact">
      <h2 class="section-title">Start a Project</h2>
      ${renderContactForm(site)}
    </section>
  </main>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
