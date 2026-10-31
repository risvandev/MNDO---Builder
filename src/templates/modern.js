// ==============================================================================
// TEMPLATE 6: MODERN PORTFOLIO
// Tech-forward glassmorphism, subtle accent glow, responsive card grid.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown, sanitizeColor } from './sanitizer.js';
import { renderHead, renderNav, renderContactForm, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderModern(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const skills = content.skills || [];
  const projects = content.projects || [];
  const experience = content.experience || [];
  const education = content.education || [];
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#6366f1'); // Indigo
  const fontPair = FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: rgba(17, 24, 39, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --text: #f3f4f6;
      --muted: #94a3b8;
      --accent: ${primaryColor};
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.6; background-image: radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.08) 0px, transparent 50%); min-height: 100vh; }
    a { color: var(--accent); text-decoration: none; }
    .container { max-width: 980px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .site-header { border-bottom: 1px solid var(--card-border); background: rgba(11, 15, 25, 0.8); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 980px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: #fff; }
    .nav-menu { display: flex; gap: 24px; }
    .nav-link { font-size: 14px; font-weight: 500; color: var(--muted); transition: color 0.2s; }
    .nav-link:hover, .nav-link.active { color: #fff; }
    .nav-toggle { display: none; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; }

    /* Hero */
    .hero-section { padding: 80px 0 60px; text-align: center; }
    .hero-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.25); color: #c7d2fe; padding: 6px 16px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
    .hero-title { font-family: var(--font-heading); font-size: clamp(38px, 6vw, 60px); font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 20px; letter-spacing: -0.02em; }
    .hero-tag { font-size: 20px; color: var(--muted); margin-bottom: 32px; max-width: 680px; margin-left: auto; margin-right: auto; }
    .hero-actions { display: flex; gap: 16px; justify-content: center; }
    .btn { display: inline-flex; align-items: center; padding: 12px 28px; font-size: 14px; font-weight: 600; border-radius: 10px; transition: all 0.2s; }
    .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35); }
    .btn-primary:hover { transform: translateY(-2px); opacity: 0.95; }
    .btn-outline { border: 1px solid var(--card-border); color: #fff; background: rgba(255,255,255,0.03); backdrop-filter: blur(8px); }
    .btn-outline:hover { background: rgba(255,255,255,0.08); }

    /* Sections */
    .section { padding: 56px 0; }
    .section-title { font-family: var(--font-heading); font-size: 26px; font-weight: 700; color: #fff; margin-bottom: 32px; }

    /* Glass Cards */
    .glass-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 28px; backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.25); }

    /* Skills Grid */
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; }
    .skill-card { background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 10px; padding: 14px; text-align: center; font-size: 14px; font-weight: 600; color: #e2e8f0; transition: border-color 0.2s; }
    .skill-card:hover { border-color: var(--accent); }

    /* Projects Grid */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .project-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s, border-color 0.2s; }
    .project-card:hover { transform: translateY(-4px); border-color: var(--accent); }
    .p-title { font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .p-desc { font-size: 14px; color: var(--muted); margin-bottom: 16px; flex-grow: 1; }
    .p-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
    .p-tag { font-size: 12px; background: rgba(99, 102, 241, 0.1); color: #c7d2fe; padding: 3px 10px; border-radius: 9999px; }
    .p-link { font-size: 13px; font-weight: 600; color: var(--accent); }

    /* Timeline */
    .exp-list { display: flex; flex-direction: column; gap: 16px; }
    .exp-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 20px; }
    .exp-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; flex-wrap: wrap; }
    .exp-role { font-weight: 700; color: #fff; font-size: 16px; }
    .exp-period { font-size: 13px; color: var(--accent); font-weight: 600; }
    .exp-company { font-size: 14px; color: var(--muted); margin-bottom: 8px; }

    /* Contact Card */
    .contact-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 36px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--muted); }
    .form-group input, .form-group textarea { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--card-border); border-radius: 8px; padding: 12px; color: #fff; font-family: inherit; font-size: 14px; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); }
    .submit-btn { background: var(--accent); color: #fff; font-weight: 700; padding: 12px; border: none; border-radius: 8px; cursor: pointer; width: 100%; }

    /* Footer */
    .site-footer { border-top: 1px solid var(--card-border); padding: 40px 0; font-size: 13px; color: var(--muted); }
    .footer-container { max-width: 980px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }

    @media (max-width: 768px) {
      .contact-card { grid-template-columns: 1fr; }
      .nav-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); padding: 20px; border-bottom: 1px solid var(--card-border); }
      .nav-menu.open { display: flex; }
      .nav-toggle { display: block; }
    }
  </style>
</head>
<body>
  ${renderNav(site, pages, currentPath)}
  <main class="container">
    <section class="hero-section" id="hero">
      <div class="hero-pill">✨ Available for new opportunities</div>
      <h1 class="hero-title">${escapeHtml(hero.headline || site.title)}</h1>
      <p class="hero-tag">${escapeHtml(hero.tagline || hero.bio || site.description || '')}</p>
      <div class="hero-actions">
        ${hero.primaryCta?.text ? `<a href="${sanitizeUrl(hero.primaryCta.url || '#projects')}" class="btn btn-primary">${escapeHtml(hero.primaryCta.text)}</a>` : '<a href="#projects" class="btn btn-primary">View Projects</a>'}
        <a href="#contact" class="btn btn-outline">Connect</a>
      </div>
    </section>

    ${about.body ? `
    <section class="section" id="about">
      <h2 class="section-title">About Me</h2>
      <div class="glass-card prose">${renderSafeMarkdown(about.body)}</div>
    </section>
    ` : ''}

    ${skills.length > 0 ? `
    <section class="section" id="skills">
      <h2 class="section-title">Technical Expertise</h2>
      <div class="skills-grid">
        ${skills.map(s => `<div class="skill-card">${escapeHtml(typeof s === 'string' ? s : s.name)}</div>`).join('')}
      </div>
    </section>
    ` : ''}

    ${projects.length > 0 ? `
    <section class="section" id="projects">
      <h2 class="section-title">Featured Work</h2>
      <div class="projects-grid">
        ${projects.map(p => `
          <div class="project-card">
            <div>
              <h3 class="p-title">${escapeHtml(p.title)}</h3>
              <p class="p-desc">${escapeHtml(p.description || '')}</p>
            </div>
            <div>
              ${Array.isArray(p.tags) && p.tags.length > 0 ? `
                <div class="p-tags">
                  ${p.tags.map(t => `<span class="p-tag">${escapeHtml(t)}</span>`).join('')}
                </div>
              ` : ''}
              ${p.liveUrl ? `<a href="${sanitizeUrl(p.liveUrl)}" target="_blank" rel="noopener" class="p-link">Open Project &rarr;</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${experience.length > 0 ? `
    <section class="section" id="experience">
      <h2 class="section-title">Experience Timeline</h2>
      <div class="exp-list">
        ${experience.map(e => `
          <div class="exp-card">
            <div class="exp-top">
              <span class="exp-role">${escapeHtml(e.role || '')} @ ${escapeHtml(e.company || '')}</span>
              <span class="exp-period">${escapeHtml(e.period || '')}</span>
            </div>
            <p style="color:var(--muted); font-size:14px;">${escapeHtml(e.description || '')}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <section class="section" id="contact">
      <h2 class="section-title">Get In Touch</h2>
      ${renderContactForm(site)}
    </section>
  </main>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
