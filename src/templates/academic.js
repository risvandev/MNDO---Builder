// ==============================================================================
// TEMPLATE 3: STUDENT / ACADEMIC
// Serif editorial typography, publications, research interests, credentials & CV.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown } from './sanitizer.js';
import { renderHead, renderNav, renderContactForm, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderAcademic(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const education = content.education || [];
  const skills = content.skills || []; // Research interests / topics
  const projects = content.projects || []; // Publications & research projects
  const experience = content.experience || []; // Teaching / research assistantships
  const certs = content.certifications || [];
  const resume = content.resume || {};
  const primaryColor = site.theme_config?.primaryColor || '#1e3a8a'; // Deep academic navy
  const fontPair = FONT_PAIRS['merriweather-roboto'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #fdfdfc;
      --card-bg: #ffffff;
      --text: #1f2937;
      --heading: #111827;
      --muted: #4b5563;
      --border: #e2e8f0;
      --accent: ${primaryColor};
      --font-serif: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.7; font-size: 16px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 860px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .site-header { border-bottom: 2px solid var(--border); background: #fff; position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 860px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--heading); }
    .nav-menu { display: flex; gap: 24px; }
    .nav-link { font-size: 14px; font-weight: 500; color: var(--muted); }
    .nav-link:hover, .nav-link.active { color: var(--accent); font-weight: 600; }
    .nav-toggle { display: none; background: none; border: none; font-size: 22px; cursor: pointer; }

    /* Hero */
    .academic-hero { padding: 60px 0 40px; display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; border-bottom: 1px solid var(--border); }
    .hero-name { font-family: var(--font-serif); font-size: clamp(32px, 5vw, 44px); font-weight: 700; color: var(--heading); line-height: 1.2; margin-bottom: 8px; }
    .hero-affiliation { font-size: 18px; color: var(--muted); font-style: italic; margin-bottom: 16px; }
    .hero-bio { font-size: 16px; color: var(--text); margin-bottom: 24px; }
    .hero-avatar { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; border: 3px solid var(--border); }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 4px; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { opacity: 0.95; text-decoration: none; }
    .btn-outline { border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: #f1f5f9; text-decoration: none; }

    /* Sections */
    .section { padding: 48px 0; border-bottom: 1px solid var(--border); }
    .section-title { font-family: var(--font-serif); font-size: 24px; font-weight: 700; color: var(--heading); margin-bottom: 24px; border-left: 4px solid var(--accent); padding-left: 12px; }

    /* Research Interests Pills */
    .interests-list { display: flex; flex-wrap: wrap; gap: 10px; }
    .interest-pill { background: #e0e7ff; color: #1e3a8a; padding: 6px 14px; border-radius: 9999px; font-size: 14px; font-weight: 500; }

    /* Education & Experience Chronology */
    .edu-list { display: flex; flex-direction: column; gap: 20px; }
    .edu-card { padding: 16px 20px; background: var(--card-bg); border-left: 2px solid var(--accent); }
    .edu-degree { font-family: var(--font-serif); font-size: 17px; font-weight: 700; color: var(--heading); }
    .edu-meta { font-size: 14px; color: var(--muted); margin-bottom: 6px; }
    .edu-details { font-size: 15px; color: var(--text); }

    /* Publications / Research Projects */
    .pub-list { display: flex; flex-direction: column; gap: 20px; }
    .pub-item { padding: 16px; background: #fff; border: 1px solid var(--border); border-radius: 6px; }
    .pub-title { font-family: var(--font-serif); font-size: 17px; font-weight: 700; color: var(--heading); margin-bottom: 4px; }
    .pub-desc { font-size: 14px; color: var(--muted); margin-bottom: 10px; }
    .pub-links { display: flex; gap: 16px; font-size: 13px; font-weight: 600; }

    /* Contact */
    .contact-card { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px; font-family: inherit; font-size: 14px; }
    .submit-btn { background: var(--accent); color: #fff; padding: 12px; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; width: 100%; }

    /* Footer */
    .site-footer { padding: 36px 0; font-size: 13px; color: var(--muted); background: #f8fafc; border-top: 1px solid var(--border); }
    .footer-container { max-width: 860px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }

    @media (max-width: 768px) {
      .academic-hero { grid-template-columns: 1fr; text-align: left; }
      .contact-card { grid-template-columns: 1fr; }
      .nav-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: #fff; padding: 20px; border-bottom: 1px solid var(--border); }
      .nav-menu.open { display: flex; }
      .nav-toggle { display: block; }
    }
  </style>
</head>
<body>
  ${renderNav(site, pages, currentPath)}
  <main class="container">
    <section class="academic-hero" id="hero">
      <div>
        <h1 class="hero-name">${escapeHtml(hero.headline || site.title)}</h1>
        <div class="hero-affiliation">${escapeHtml(hero.tagline || 'Researcher & Graduate Student')}</div>
        <p class="hero-bio">${escapeHtml(hero.bio || site.description || '')}</p>
        <div class="hero-actions">
          ${resume.url ? `<a href="${sanitizeUrl(resume.url)}" target="_blank" rel="noopener" class="btn btn-primary">📄 Download CV (PDF)</a>` : ''}
          ${hero.primaryCta?.text ? `<a href="${sanitizeUrl(hero.primaryCta.url || '#projects')}" class="btn btn-outline">${escapeHtml(hero.primaryCta.text)}</a>` : '<a href="#projects" class="btn btn-outline">Publications</a>'}
          <a href="#contact" class="btn btn-outline">Contact</a>
        </div>
      </div>
      ${hero.avatarUrl ? `<img src="${sanitizeUrl(hero.avatarUrl)}" alt="${escapeHtml(hero.headline || 'Profile')}" class="hero-avatar">` : ''}
    </section>

    ${about.body ? `
    <section class="section" id="about">
      <h2 class="section-title">Biography & Research Statement</h2>
      <div class="prose">${renderSafeMarkdown(about.body)}</div>
    </section>
    ` : ''}

    ${skills.length > 0 ? `
    <section class="section" id="interests">
      <h2 class="section-title">Research Interests & Focus Areas</h2>
      <div class="interests-list">
        ${skills.map(s => `<span class="interest-pill">${escapeHtml(typeof s === 'string' ? s : s.name)}</span>`).join('')}
      </div>
    </section>
    ` : ''}

    ${education.length > 0 ? `
    <section class="section" id="education">
      <h2 class="section-title">Academic Background & Education</h2>
      <div class="edu-list">
        ${education.map(ed => `
          <div class="edu-card">
            <div class="edu-degree">${escapeHtml(ed.degree || '')}</div>
            <div class="edu-meta">${escapeHtml(ed.institution || '')} &bull; ${escapeHtml(ed.year || '')}</div>
            ${ed.details ? `<div class="edu-details">${escapeHtml(ed.details)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${projects.length > 0 ? `
    <section class="section" id="projects">
      <h2 class="section-title">Publications & Working Papers</h2>
      <div class="pub-list">
        ${projects.map(p => `
          <div class="pub-item">
            <div class="pub-title">${escapeHtml(p.title)}</div>
            <p class="pub-desc">${escapeHtml(p.description || '')}</p>
            <div class="pub-links">
              ${p.liveUrl ? `<a href="${sanitizeUrl(p.liveUrl)}" target="_blank" rel="noopener">Read Paper &rarr;</a>` : ''}
              ${p.githubUrl ? `<a href="${sanitizeUrl(p.githubUrl)}" target="_blank" rel="noopener">Code / Dataset</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${experience.length > 0 ? `
    <section class="section" id="experience">
      <h2 class="section-title">Appointments & Teaching Experience</h2>
      <div class="edu-list">
        ${experience.map(e => `
          <div class="edu-card">
            <div class="edu-degree">${escapeHtml(e.role || '')}</div>
            <div class="edu-meta">${escapeHtml(e.company || '')} &bull; ${escapeHtml(e.period || '')}</div>
            <div class="edu-details">${escapeHtml(e.description || '')}</div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <section class="section" id="contact">
      <h2 class="section-title">Academic Inquiries & Collaboration</h2>
      ${renderContactForm(site)}
    </section>
  </main>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
