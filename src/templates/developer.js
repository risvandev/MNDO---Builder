// ==============================================================================
// TEMPLATE 2: DEVELOPER PORTFOLIO
// Dark terminal aesthetic, monospace accents, tech stack pills, repo-style cards.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown } from './sanitizer.js';
import { renderHead, renderNav, renderContactForm, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderDeveloper(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const skills = content.skills || [];
  const projects = content.projects || [];
  const experience = content.experience || [];
  const social = content.social || {};
  const primaryColor = site.theme_config?.primaryColor || '#10b981'; // Emerald
  const fontPair = FONT_PAIRS['jetbrains-inter'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f2937;
      --text: #f3f4f6;
      --muted: #9ca3af;
      --accent: ${primaryColor};
      --font-mono: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.6; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
    
    /* Nav */
    .site-header { border-bottom: 1px solid var(--card-border); background: rgba(9, 13, 22, 0.85); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 960px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-mono); font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
    .brand-prompt { color: var(--accent); }
    .nav-menu { display: flex; gap: 20px; }
    .nav-link { font-family: var(--font-mono); font-size: 13px; color: var(--muted); }
    .nav-link:hover, .nav-link.active { color: var(--accent); }
    .nav-toggle { display: none; background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; }

    /* Terminal Hero */
    .hero-terminal { margin-top: 48px; background: #0f172a; border: 1px solid var(--card-border); border-radius: 10px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .terminal-bar { background: #1e293b; padding: 10px 16px; display: flex; align-items: center; gap: 8px; }
    .t-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    .t-red { background: #ef4444; } .t-yellow { background: #f59e0b; } .t-green { background: #10b981; }
    .terminal-title { margin-left: 12px; font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
    .terminal-body { padding: 32px 28px; }
    .t-command { font-family: var(--font-mono); font-size: 14px; color: var(--muted); margin-bottom: 12px; }
    .t-prompt { color: var(--accent); font-weight: 700; }
    .hero-name { font-family: var(--font-mono); font-size: clamp(28px, 4vw, 42px); font-weight: 800; color: #fff; margin-bottom: 8px; }
    .hero-tag { font-family: var(--font-mono); color: var(--accent); font-size: 18px; margin-bottom: 20px; }
    .hero-bio { font-size: 16px; color: #d1d5db; max-width: 680px; margin-bottom: 28px; line-height: 1.7; }
    .hero-links { display: flex; gap: 16px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 6px; }
    .btn-primary { background: var(--accent); color: #000; text-decoration: none; }
    .btn-primary:hover { opacity: 0.9; text-decoration: none; }
    .btn-outline { border: 1px solid var(--card-border); color: var(--text); }
    .btn-outline:hover { background: #1e293b; text-decoration: none; }

    /* Sections */
    .section { padding: 56px 0; }
    .section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; border-bottom: 1px solid var(--card-border); padding-bottom: 12px; }
    .section-prompt { font-family: var(--font-mono); color: var(--accent); font-weight: 700; }
    .section-title { font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: #fff; }

    /* Tech Stack Pills */
    .skills-container { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-card { background: var(--card-bg); border: 1px solid var(--card-border); padding: 8px 14px; border-radius: 6px; font-family: var(--font-mono); font-size: 13px; display: flex; align-items: center; gap: 8px; }
    .lang-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }

    /* Projects Grid */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .project-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s, border-color 0.2s; }
    .project-card:hover { transform: translateY(-3px); border-color: var(--accent); }
    .p-title { font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .p-desc { font-size: 14px; color: var(--muted); margin-bottom: 16px; flex-grow: 1; }
    .p-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
    .p-tag { font-family: var(--font-mono); font-size: 11px; background: #1e293b; color: #94a3b8; padding: 2px 8px; border-radius: 4px; }
    .p-links { display: flex; gap: 14px; font-family: var(--font-mono); font-size: 12px; }

    /* Timeline */
    .exp-list { display: flex; flex-direction: column; gap: 20px; }
    .exp-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 20px; }
    .exp-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; flex-wrap: wrap; }
    .exp-role { font-family: var(--font-mono); font-weight: 700; color: #fff; font-size: 15px; }
    .exp-period { font-family: var(--font-mono); font-size: 12px; color: var(--accent); }
    .exp-company { color: var(--muted); font-size: 13px; margin-bottom: 10px; }
    .exp-desc { font-size: 14px; color: #d1d5db; }

    /* Contact Form */
    .contact-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-family: var(--font-mono); font-size: 12px; color: var(--muted); margin-bottom: 6px; }
    .form-group input, .form-group textarea { width: 100%; background: #0b0f19; border: 1px solid var(--card-border); border-radius: 6px; padding: 10px 14px; color: #fff; font-family: var(--font-mono); font-size: 13px; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); }
    .submit-btn { background: var(--accent); color: #000; font-family: var(--font-mono); font-weight: 700; font-size: 13px; padding: 12px; border: none; border-radius: 6px; cursor: pointer; width: 100%; }
    .form-status { margin-top: 12px; font-family: var(--font-mono); font-size: 12px; }
    .form-status.success { color: #10b981; }
    .form-status.error { color: #ef4444; }

    /* Footer */
    .site-footer { border-top: 1px solid var(--card-border); padding: 40px 0; font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
    .footer-container { max-width: 960px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }

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
    <div class="hero-terminal">
      <div class="terminal-bar">
        <span class="t-dot t-red"></span>
        <span class="t-dot t-yellow"></span>
        <span class="t-dot t-green"></span>
        <span class="terminal-title">${escapeHtml(site.subdomain_slug)}.mndo.online &mdash; bash</span>
      </div>
      <div class="terminal-body">
        <div class="t-command"><span class="t-prompt">➜ ~</span> cat introduction.json</div>
        <h1 class="hero-name">${escapeHtml(hero.headline || site.title)}</h1>
        <div class="hero-tag">${escapeHtml(hero.tagline || 'Software Engineer')}</div>
        <p class="hero-bio">${escapeHtml(hero.bio || site.description || '')}</p>
        <div class="hero-links">
          ${hero.primaryCta?.text ? `<a href="${sanitizeUrl(hero.primaryCta.url || '#projects')}" class="btn btn-primary">${escapeHtml(hero.primaryCta.text)}</a>` : '<a href="#projects" class="btn btn-primary">~/view-projects</a>'}
          ${social.github ? `<a href="${sanitizeUrl(social.github)}" target="_blank" rel="noopener" class="btn btn-outline">GitHub</a>` : ''}
          ${social.linkedin ? `<a href="${sanitizeUrl(social.linkedin)}" target="_blank" rel="noopener" class="btn btn-outline">LinkedIn</a>` : ''}
          <a href="#contact" class="btn btn-outline">~/contact-me</a>
        </div>
      </div>
    </div>

    ${about.body ? `
    <section class="section" id="about">
      <div class="section-head">
        <span class="section-prompt">01.</span>
        <h2 class="section-title">About Me</h2>
      </div>
      <div class="prose">${renderSafeMarkdown(about.body)}</div>
    </section>
    ` : ''}

    ${skills.length > 0 ? `
    <section class="section" id="skills">
      <div class="section-head">
        <span class="section-prompt">02.</span>
        <h2 class="section-title">Tech Stack & Languages</h2>
      </div>
      <div class="skills-container">
        ${skills.map(s => `
          <div class="skill-card">
            <span class="lang-dot"></span>
            <span>${escapeHtml(typeof s === 'string' ? s : s.name)}</span>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${projects.length > 0 ? `
    <section class="section" id="projects">
      <div class="section-head">
        <span class="section-prompt">03.</span>
        <h2 class="section-title">Repositories & Projects</h2>
      </div>
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
              <div class="p-links">
                ${p.liveUrl ? `<a href="${sanitizeUrl(p.liveUrl)}" target="_blank" rel="noopener">⚡ Live Demo</a>` : ''}
                ${p.githubUrl ? `<a href="${sanitizeUrl(p.githubUrl)}" target="_blank" rel="noopener">📂 Source</a>` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${experience.length > 0 ? `
    <section class="section" id="experience">
      <div class="section-head">
        <span class="section-prompt">04.</span>
        <h2 class="section-title">Experience & Roles</h2>
      </div>
      <div class="exp-list">
        ${experience.map(e => `
          <div class="exp-card">
            <div class="exp-top">
              <span class="exp-role">${escapeHtml(e.role || '')} @ ${escapeHtml(e.company || '')}</span>
              <span class="exp-period">${escapeHtml(e.period || '')}</span>
            </div>
            <p class="exp-desc">${escapeHtml(e.description || '')}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <section class="section" id="contact">
      <div class="section-head">
        <span class="section-prompt">05.</span>
        <h2 class="section-title">Ping / Contact</h2>
      </div>
      ${renderContactForm(site)}
    </section>
  </main>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
