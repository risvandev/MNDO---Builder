// ==============================================================================
// TEMPLATE 4: PROFESSIONAL PROFILE
// Executive career history, polished introduction, impact metrics, resume download.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown, sanitizeColor } from './sanitizer.js';
import { renderHead, renderNav, renderContactForm, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderProfessional(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const experience = content.experience || [];
  const education = content.education || [];
  const skills = content.skills || [];
  const projects = content.projects || [];
  const testimonials = content.testimonials || [];
  const resume = content.resume || {};
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#0f766e'); // Teal / Slate
  const fontPair = FONT_PAIRS['playfair-plus'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #0f172a;
      --heading: #020617;
      --muted: #64748b;
      --border: #e2e8f0;
      --accent: ${primaryColor};
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.6; }
    a { color: var(--accent); text-decoration: none; }
    .container { max-width: 980px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .site-header { background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .nav-container { max-width: 980px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--heading); }
    .nav-menu { display: flex; gap: 24px; align-items: center; }
    .nav-link { font-size: 14px; font-weight: 600; color: var(--muted); }
    .nav-link:hover, .nav-link.active { color: var(--accent); }
    .nav-toggle { display: none; background: none; border: none; font-size: 22px; cursor: pointer; }

    /* Hero */
    .hero-section { padding: 64px 0 48px; display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center; }
    .hero-badge { display: inline-block; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); background: rgba(15, 118, 110, 0.1); padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
    .hero-title { font-family: var(--font-heading); font-size: clamp(34px, 4.5vw, 48px); font-weight: 800; color: var(--heading); line-height: 1.2; margin-bottom: 12px; }
    .hero-tag { font-size: 20px; color: var(--muted); margin-bottom: 20px; font-weight: 500; }
    .hero-bio { font-size: 17px; color: var(--text); line-height: 1.7; margin-bottom: 28px; max-width: 620px; }
    .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
    .hero-avatar { width: 180px; height: 180px; border-radius: 16px; object-fit: cover; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .btn { display: inline-flex; align-items: center; padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 6px; transition: all 0.2s; }
    .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25); }
    .btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }
    .btn-secondary { border: 1px solid var(--border); color: var(--text); background: #fff; }
    .btn-secondary:hover { background: #f1f5f9; }

    /* Sections */
    .section { padding: 56px 0; }
    .section-header { margin-bottom: 36px; }
    .section-subtitle { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 6px; }
    .section-title { font-family: var(--font-heading); font-size: 28px; font-weight: 700; color: var(--heading); }

    /* Experience Timeline */
    .exp-timeline { display: flex; flex-direction: column; gap: 24px; position: relative; }
    .exp-item { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); transition: border-color 0.2s; }
    .exp-item:hover { border-color: var(--accent); }
    .exp-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; flex-wrap: wrap; }
    .exp-role { font-size: 18px; font-weight: 700; color: var(--heading); }
    .exp-period { font-size: 13px; font-weight: 600; color: var(--accent); }
    .exp-company { font-size: 15px; color: var(--muted); margin-bottom: 12px; font-weight: 500; }
    .exp-desc { font-size: 15px; color: var(--text); line-height: 1.6; }

    /* Skills Grid */
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .skill-card { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 16px; font-weight: 600; color: var(--heading); font-size: 15px; }

    /* Featured Projects */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .project-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
    .p-title { font-size: 18px; font-weight: 700; color: var(--heading); margin-bottom: 8px; }
    .p-desc { font-size: 14px; color: var(--muted); margin-bottom: 16px; flex-grow: 1; }
    .p-link { font-size: 13px; font-weight: 600; color: var(--accent); }

    /* Testimonials */
    .test-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .test-card { background: #fff; border: 1px solid var(--border); border-radius: 10px; padding: 24px; font-style: italic; }
    .test-quote { font-size: 15px; color: var(--text); margin-bottom: 16px; }
    .test-author { font-style: normal; font-weight: 700; color: var(--heading); font-size: 14px; }
    .test-role { font-size: 12px; color: var(--muted); }

    /* Contact Card */
    .contact-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .form-group input, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid var(--border); border-radius: 6px; font-family: inherit; font-size: 14px; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); }
    .submit-btn { background: var(--accent); color: #fff; font-weight: 600; padding: 12px; border: none; border-radius: 6px; cursor: pointer; width: 100%; }

    /* Footer */
    .site-footer { background: #fff; border-top: 1px solid var(--border); padding: 40px 0; font-size: 13px; color: var(--muted); }
    .footer-container { max-width: 980px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }

    @media (max-width: 768px) {
      .hero-section { grid-template-columns: 1fr; }
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
    <section class="hero-section" id="hero">
      <div>
        <span class="hero-badge">Professional Portfolio</span>
        <h1 class="hero-title">${escapeHtml(hero.headline || site.title)}</h1>
        <div class="hero-tag">${escapeHtml(hero.tagline || 'Strategic Leader & Consultant')}</div>
        <p class="hero-bio">${escapeHtml(hero.bio || site.description || '')}</p>
        <div class="hero-actions">
          ${resume.url ? `<a href="${sanitizeUrl(resume.url)}" target="_blank" rel="noopener" class="btn btn-primary">📄 Download Executive Resume</a>` : ''}
          ${hero.primaryCta?.text ? `<a href="${sanitizeUrl(hero.primaryCta.url || '#experience')}" class="btn btn-secondary">${escapeHtml(hero.primaryCta.text)}</a>` : '<a href="#experience" class="btn btn-secondary">Career History</a>'}
          <a href="#contact" class="btn btn-secondary">Contact</a>
        </div>
      </div>
      ${hero.avatarUrl ? `<img src="${sanitizeUrl(hero.avatarUrl)}" alt="${escapeHtml(hero.headline || 'Profile')}" class="hero-avatar">` : ''}
    </section>

    ${about.body ? `
    <section class="section" id="about">
      <div class="section-header">
        <div class="section-subtitle">Overview</div>
        <h2 class="section-title">Executive Biography</h2>
      </div>
      <div class="prose">${renderSafeMarkdown(about.body)}</div>
    </section>
    ` : ''}

    ${experience.length > 0 ? `
    <section class="section" id="experience">
      <div class="section-header">
        <div class="section-subtitle">Trajectory</div>
        <h2 class="section-title">Career Experience & Leadership</h2>
      </div>
      <div class="exp-timeline">
        ${experience.map(e => `
          <div class="exp-item">
            <div class="exp-top">
              <span class="exp-role">${escapeHtml(e.role || '')}</span>
              <span class="exp-period">${escapeHtml(e.period || '')}</span>
            </div>
            <div class="exp-company">${escapeHtml(e.company || '')}</div>
            <p class="exp-desc">${escapeHtml(e.description || '')}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${skills.length > 0 ? `
    <section class="section" id="skills">
      <div class="section-header">
        <div class="section-subtitle">Core Competencies</div>
        <h2 class="section-title">Areas of Expertise</h2>
      </div>
      <div class="skills-grid">
        ${skills.map(s => `<div class="skill-card">${escapeHtml(typeof s === 'string' ? s : s.name)}</div>`).join('')}
      </div>
    </section>
    ` : ''}

    ${projects.length > 0 ? `
    <section class="section" id="projects">
      <div class="section-header">
        <div class="section-subtitle">Portfolio</div>
        <h2 class="section-title">Key Initiatives & Case Studies</h2>
      </div>
      <div class="projects-grid">
        ${projects.map(p => `
          <div class="project-card">
            <div>
              <h3 class="p-title">${escapeHtml(p.title)}</h3>
              <p class="p-desc">${escapeHtml(p.description || '')}</p>
            </div>
            ${p.liveUrl ? `<a href="${sanitizeUrl(p.liveUrl)}" target="_blank" rel="noopener" class="p-link">View Case Study &rarr;</a>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${testimonials.length > 0 ? `
    <section class="section" id="testimonials">
      <div class="section-header">
        <div class="section-subtitle">Endorsements</div>
        <h2 class="section-title">What Colleagues Say</h2>
      </div>
      <div class="test-grid">
        ${testimonials.map(t => `
          <div class="test-card">
            <p class="test-quote">&ldquo;${escapeHtml(t.quote || '')}&rdquo;</p>
            <div class="test-author">${escapeHtml(t.name || '')}</div>
            <div class="test-role">${escapeHtml(t.role || '')} &bull; ${escapeHtml(t.company || '')}</div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <section class="section" id="contact">
      <div class="section-header">
        <div class="section-subtitle">Get In Touch</div>
        <h2 class="section-title">Inquiries & Executive Consultation</h2>
      </div>
      ${renderContactForm(site)}
    </section>
  </main>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
