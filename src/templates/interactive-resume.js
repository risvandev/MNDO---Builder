// ==============================================================================
// TEMPLATE 13: INTERACTIVE CV & RESUME (READ.CV & JSONRESUME INSPIRED)
// Designed for career professionals, engineers, and consultants. Print-ready to PDF.
// ==============================================================================
import { escapeHtml, sanitizeUrl } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderInteractiveResume(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const skills = content.skills || [];
  const experience = content.experience || [];
  const education = content.education || [];
  const projects = content.projects || [];
  const primaryColor = site.theme_config?.primaryColor || '#0f172a';
  const fontPair = FONT_PAIRS[site.theme_config?.fontPair] || FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${hero.headline || site.title} - Curriculum Vitae`, site.description, currentPath)}
  <style>
    :root {
      --bg: #f8fafc;
      --paper: #ffffff;
      --text: #1e293b;
      --heading: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
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
      padding: 40px 20px 80px;
    }
    .cv-sheet {
      max-width: 820px;
      margin: 0 auto;
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
      padding: 48px 56px;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Header Bar */
    .cv-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
      padding-bottom: 28px;
      border-bottom: 2px solid var(--border);
      gap: 24px;
    }
    .cv-name { font-family: var(--font-heading); font-size: 32px; font-weight: 800; color: var(--heading); letter-spacing: -0.02em; margin-bottom: 4px; }
    .cv-headline { font-size: 17px; font-weight: 600; color: var(--accent); margin-bottom: 8px; }
    .cv-bio { font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 520px; }
    
    .print-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--heading);
      color: #ffffff;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.15s;
    }
    .print-btn:hover { opacity: 0.9; text-decoration: none; color: #fff; }

    /* Sections */
    .cv-section { margin-bottom: 32px; }
    .cv-section-title {
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-bottom: 16px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border);
    }

    /* Experience Items */
    .timeline-item { margin-bottom: 20px; }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .item-role { font-weight: 700; font-size: 16px; color: var(--heading); }
    .item-period { font-size: 13px; color: var(--muted); font-family: monospace; }
    .item-company { font-weight: 600; font-size: 14px; color: var(--accent); margin-bottom: 6px; }
    .item-desc { font-size: 14px; color: var(--text); line-height: 1.6; }

    /* Skills Badges */
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      color: var(--text);
    }

    /* Projects Grid */
    .cv-project-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .cv-project-card {
      padding: 14px 16px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    .cv-project-title { font-weight: 700; font-size: 14px; color: var(--heading); margin-bottom: 4px; }
    .cv-project-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

    /* Print Stylesheet */
    @media print {
      body { background: #ffffff !important; padding: 0 !important; font-size: 13px !important; }
      .cv-sheet { box-shadow: none !important; border: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
      .print-btn { display: none !important; }
      .cv-section { page-break-inside: avoid; margin-bottom: 20px !important; }
    }

    @media (max-width: 680px) {
      .cv-sheet { padding: 28px 20px; }
      .cv-top-bar { flex-direction: column; }
      .cv-project-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="cv-sheet">
    <div class="cv-top-bar">
      <div>
        <h1 class="cv-name">${escapeHtml(hero.headline || site.title)}</h1>
        <div class="cv-headline">${escapeHtml(hero.tagline || 'Professional Curriculum Vitae')}</div>
        <p class="cv-bio">${escapeHtml(hero.bio || about.body || site.description || '')}</p>
      </div>
      <button class="print-btn" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        Print / PDF
      </button>
    </div>

    <!-- Experience -->
    ${experience.length > 0 ? `
      <section class="cv-section">
        <h2 class="cv-section-title">Professional Experience</h2>
        ${experience.map(exp => `
          <div class="timeline-item">
            <div class="item-header">
              <span class="item-role">${escapeHtml(exp.role || exp.title || 'Role')}</span>
              <span class="item-period">${escapeHtml(exp.period || exp.year || '')}</span>
            </div>
            <div class="item-company">${escapeHtml(exp.company || '')}</div>
            <p class="item-desc">${escapeHtml(exp.description || '')}</p>
          </div>
        `).join('')}
      </section>
    ` : ''}

    <!-- Key Projects -->
    ${projects.length > 0 ? `
      <section class="cv-section">
        <h2 class="cv-section-title">Selected Projects</h2>
        <div class="cv-project-grid">
          ${projects.map(proj => `
            <div class="cv-project-card">
              <div class="cv-project-title">
                ${proj.liveUrl ? `<a href="${sanitizeUrl(proj.liveUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(proj.title)} &rarr;</a>` : escapeHtml(proj.title)}
              </div>
              <p class="cv-project-desc">${escapeHtml(proj.description || '')}</p>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Education -->
    ${education.length > 0 ? `
      <section class="cv-section">
        <h2 class="cv-section-title">Education &amp; Credentials</h2>
        ${education.map(edu => `
          <div class="timeline-item">
            <div class="item-header">
              <span class="item-role">${escapeHtml(edu.degree || 'Degree')}</span>
              <span class="item-period">${escapeHtml(edu.year || '')}</span>
            </div>
            <div class="item-company">${escapeHtml(edu.institution || '')}</div>
          </div>
        `).join('')}
      </section>
    ` : ''}

    <!-- Skills -->
    ${skills.length > 0 ? `
      <section class="cv-section">
        <h2 class="cv-section-title">Skills &amp; Expertise</h2>
        <div class="skills-wrap">
          ${skills.map(s => `<span class="skill-tag">${escapeHtml(s.name || s)}</span>`).join('')}
        </div>
      </section>
    ` : ''}
  </div>
  ${renderClientScript()}
</body>
</html>`;
}
