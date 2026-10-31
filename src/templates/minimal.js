// ==============================================================================
// TEMPLATE 1: MINIMAL PORTFOLIO
// Swiss typography, monochrome high-contrast, generous whitespace, clean layout.
// ==============================================================================
import { escapeHtml, sanitizeUrl, sanitizeColor, renderSafeMarkdown } from './sanitizer.js';
import { renderHead, renderNav, renderContactForm, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderMinimal(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const posts = siteData.posts || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const skills = content.skills || [];
  const projects = content.projects || [];
  const experience = content.experience || [];
  const education = content.education || [];
  const social = content.social || {};
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#111827');
  const fontPair = FONT_PAIRS[site.theme_config?.fontPair] || FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #ffffff;
      --text: #111827;
      --muted: #6b7280;
      --border: #e5e7eb;
      --card-bg: #fafafa;
      --accent: ${primaryColor};
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.6; font-size: 16px; -webkit-font-smoothing: antialiased; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
    
    /* Header & Nav */
    .site-header { border-bottom: 1px solid var(--border); position: sticky; top: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); z-index: 100; }
    .nav-container { max-width: 900px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-heading); font-weight: 700; font-size: 20px; letter-spacing: -0.02em; }
    .nav-menu { display: flex; gap: 24px; }
    .nav-link { font-size: 14px; font-weight: 500; color: var(--muted); transition: color 0.2s; }
    .nav-link:hover, .nav-link.active { color: var(--text); }
    .nav-toggle { display: none; background: none; border: none; font-size: 20px; cursor: pointer; }

    /* Hero */
    .hero-section { padding: 80px 0 60px; border-bottom: 1px solid var(--border); }
    .hero-headline { font-family: var(--font-heading); font-size: clamp(36px, 5vw, 54px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 16px; }
    .hero-tagline { font-size: 20px; color: var(--muted); margin-bottom: 24px; max-width: 680px; }
    .hero-bio { font-size: 17px; color: var(--text); max-width: 650px; margin-bottom: 32px; line-height: 1.7; }
    .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 4px; transition: all 0.2s; }
    .btn-primary { background: var(--text); color: var(--bg); }
    .btn-primary:hover { background: var(--accent); color: #fff; }
    .btn-secondary { border: 1px solid var(--border); color: var(--text); }
    .btn-secondary:hover { background: var(--card-bg); }

    /* Sections */
    .section { padding: 60px 0; border-bottom: 1px solid var(--border); }
    .section-title { font-family: var(--font-heading); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 32px; }
    
    /* Projects Grid */
    .projects-list { display: flex; flex-direction: column; gap: 32px; }
    .project-card { padding: 24px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 6px; transition: border-color 0.2s; }
    .project-card:hover { border-color: var(--text); }
    .project-title { font-family: var(--font-heading); font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    .project-desc { color: var(--muted); font-size: 15px; margin-bottom: 16px; }
    .project-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .tag { font-size: 12px; background: #fff; border: 1px solid var(--border); padding: 4px 10px; border-radius: 4px; font-weight: 500; }
    .project-links { display: flex; gap: 16px; font-size: 13px; font-weight: 600; }
    .project-links a { text-decoration: underline; text-underline-offset: 4px; }

    /* Experience & Education list */
    .timeline-list { display: flex; flex-direction: column; gap: 24px; }
    .timeline-item { display: grid; grid-template-columns: 180px 1fr; gap: 24px; }
    .timeline-meta { font-size: 14px; color: var(--muted); font-weight: 500; }
    .timeline-role { font-weight: 700; font-size: 16px; margin-bottom: 4px; }
    .timeline-company { color: var(--muted); font-size: 14px; margin-bottom: 8px; }

    /* Skills */
    .skills-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-pill { padding: 8px 16px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 4px; font-size: 14px; font-weight: 500; }

    /* Contact Form styling */
    .contact-card { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .form-group input, .form-group textarea { width: 100%; padding: 10px 14px; font-size: 14px; border: 1px solid var(--border); border-radius: 4px; font-family: inherit; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--text); }
    .submit-btn { width: 100%; padding: 12px; background: var(--text); color: var(--bg); border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
    .form-status { margin-top: 12px; font-size: 13px; font-weight: 500; }
    .form-status.success { color: #15803d; }
    .form-status.error { color: #b91c1c; }

    /* Footer */
    .site-footer { padding: 40px 0; font-size: 13px; color: var(--muted); }
    .footer-container { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }

    @media (max-width: 768px) {
      .nav-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: #fff; padding: 20px; border-bottom: 1px solid var(--border); }
      .nav-menu.open { display: flex; }
      .nav-toggle { display: block; }
      .timeline-item { grid-template-columns: 1fr; gap: 6px; }
      .contact-card { grid-template-columns: 1fr; gap: 24px; }
    }
  </style>
</head>
<body>
  ${renderNav(site, pages, currentPath)}
  <main class="container">
    <section class="hero-section" id="hero">
      <h1 class="hero-headline">${escapeHtml(hero.headline || site.title)}</h1>
      ${hero.tagline ? `<p class="hero-tagline">${escapeHtml(hero.tagline)}</p>` : ''}
      ${hero.bio ? `<p class="hero-bio">${escapeHtml(hero.bio)}</p>` : ''}
      <div class="hero-actions">
        ${hero.primaryCta?.text ? `<a href="${sanitizeUrl(hero.primaryCta.url || '#projects')}" class="btn btn-primary">${escapeHtml(hero.primaryCta.text)}</a>` : '<a href="#projects" class="btn btn-primary">Selected Works</a>'}
        ${hero.secondaryCta?.text ? `<a href="${sanitizeUrl(hero.secondaryCta.url || '#contact')}" class="btn btn-secondary">${escapeHtml(hero.secondaryCta.text)}</a>` : '<a href="#contact" class="btn btn-secondary">Get In Touch</a>'}
      </div>
    </section>

    ${about.body ? `
    <section class="section" id="about">
      <h2 class="section-title">About</h2>
      <div class="prose">${renderSafeMarkdown(about.body)}</div>
    </section>
    ` : ''}

    ${skills.length > 0 ? `
    <section class="section" id="skills">
      <h2 class="section-title">Skills & Proficiencies</h2>
      <div class="skills-grid">
        ${skills.map(s => `<div class="skill-pill">${escapeHtml(typeof s === 'string' ? s : s.name)}</div>`).join('')}
      </div>
    </section>
    ` : ''}

    ${projects.length > 0 ? `
    <section class="section" id="projects">
      <h2 class="section-title">Selected Works</h2>
      <div class="projects-list">
        ${projects.map(p => `
          <div class="project-card">
            <h3 class="project-title">${escapeHtml(p.title)}</h3>
            <p class="project-desc">${escapeHtml(p.description || '')}</p>
            ${Array.isArray(p.tags) && p.tags.length > 0 ? `
              <div class="project-tags">
                ${p.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}
            <div class="project-links">
              ${p.liveUrl ? `<a href="${sanitizeUrl(p.liveUrl)}" target="_blank" rel="noopener">Visit Project &rarr;</a>` : ''}
              ${p.githubUrl ? `<a href="${sanitizeUrl(p.githubUrl)}" target="_blank" rel="noopener">Source Code</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${experience.length > 0 ? `
    <section class="section" id="experience">
      <h2 class="section-title">Experience</h2>
      <div class="timeline-list">
        ${experience.map(e => `
          <div class="timeline-item">
            <div class="timeline-meta">${escapeHtml(e.period || '')}</div>
            <div class="timeline-body">
              <div class="timeline-role">${escapeHtml(e.role || '')}</div>
              <div class="timeline-company">${escapeHtml(e.company || '')}</div>
              <p class="timeline-desc">${escapeHtml(e.description || '')}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${education.length > 0 ? `
    <section class="section" id="education">
      <h2 class="section-title">Education</h2>
      <div class="timeline-list">
        ${education.map(ed => `
          <div class="timeline-item">
            <div class="timeline-meta">${escapeHtml(ed.year || '')}</div>
            <div class="timeline-body">
              <div class="timeline-role">${escapeHtml(ed.degree || '')}</div>
              <div class="timeline-company">${escapeHtml(ed.institution || '')}</div>
              ${ed.details ? `<p class="timeline-desc">${escapeHtml(ed.details)}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <section class="section" id="contact">
      <h2 class="section-title">Contact</h2>
      ${renderContactForm(site)}
    </section>
  </main>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
