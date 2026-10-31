// ==============================================================================
// TEMPLATE 13: INTERACTIVE CV & RESUME (READ.CV & SWISS MINIMALIST INSPIRED)
// Designed for engineers, tech leads, and researchers.
// Features warm paper aesthetic, location clock, verified skills matrix,
// continuous vertical chronology, and clean print-to-PDF stylesheet.
// ==============================================================================
import { escapeHtml, sanitizeUrl, sanitizeColor } from './sanitizer.js';
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
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#0f172a');
  const fontPair = FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${hero.headline || site.title} - Curriculum Vitae`, site.description, currentPath)}
  <style>
    :root {
      --bg: #f4f3ef;
      --paper: #faf9f6;
      --text: #27272a;
      --heading: #18181b;
      --muted: #71717a;
      --border: #e4e4e7;
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
      padding: 40px 16px 80px;
    }
    a { color: var(--heading); text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }

    /* The Read.cv Sheet Container */
    .sheet {
      max-width: 820px;
      margin: 0 auto;
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 56px 64px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
    }

    /* Header Profile */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--border);
      gap: 24px;
    }
    .cv-name {
      font-family: var(--font-heading);
      font-size: 34px;
      font-weight: 800;
      color: var(--heading);
      letter-spacing: -0.025em;
      line-height: 1.1;
      margin-bottom: 6px;
    }
    .cv-title { font-size: 18px; font-weight: 600; color: #4f46e5; margin-bottom: 12px; }
    .cv-bio { font-size: 14.5px; color: var(--muted); line-height: 1.6; max-width: 520px; margin-bottom: 16px; }
    
    .status-row {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 12.5px;
      color: var(--muted);
      flex-wrap: wrap;
    }
    .location-pill { display: inline-flex; align-items: center; gap: 4px; font-weight: 500; }
    .status-avail {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
      font-size: 11.5px;
    }

    /* Top Action Buttons */
    .action-group { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .btn-print {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      background: var(--heading);
      color: #ffffff;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity 0.15s ease;
    }
    .btn-print:hover { opacity: 0.9; text-decoration: none; color: #fff; }

    /* Section Styling */
    .section-wrap { margin-bottom: 36px; }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      margin-bottom: 20px;
    }

    /* Continuous Chronology Timeline */
    .timeline { display: flex; flex-direction: column; gap: 24px; position: relative; }
    .timeline::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 10px;
      bottom: 10px;
      width: 1px;
      background: var(--border);
    }
    .timeline-node {
      position: relative;
      padding-left: 28px;
    }
    .timeline-node::before {
      content: '';
      position: absolute;
      left: 2px;
      top: 6px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--heading);
      border: 2px solid var(--paper);
    }
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .timeline-role { font-weight: 700; font-size: 16px; color: var(--heading); }
    .timeline-company { font-size: 14.5px; color: var(--text); font-weight: 500; }
    .timeline-dates { font-size: 13px; font-family: monospace; color: var(--muted); }
    .timeline-desc { font-size: 14px; color: var(--text); line-height: 1.6; margin-top: 4px; }

    /* Skills Matrix */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
    }
    .skill-cat-title { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .skill-tag-cloud { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag {
      font-size: 12px;
      padding: 3px 9px;
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--heading);
      font-weight: 500;
    }

    /* Print Stylesheet (Pixel-Perfect 1-2 Page PDF) */
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .action-group { display: none !important; }
      .timeline::before { background: #ccc; }
      .timeline-node::before { background: #000; }
      a { text-decoration: none; color: #000; }
    }

    @media (max-width: 768px) {
      .sheet { padding: 32px 20px; }
      .header-bar { flex-direction: column; align-items: flex-start; }
      .action-group { width: 100%; align-items: flex-start; }
      .btn-print { width: 100%; justify-content: center; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <!-- Header -->
    <header class="header-bar">
      <div>
        <h1 class="cv-name">${escapeHtml(hero.headline || site.title)}</h1>
        <div class="cv-title">${escapeHtml(hero.tagline || 'Principal Platform Architect & Staff Engineer')}</div>
        <p class="cv-bio">${escapeHtml(hero.bio || site.description || 'Specializing in distributed edge runtimes, zero-runtime static architecture, and high-velocity web engineering.')}</p>
        
        <div class="status-row">
          <span class="location-pill">📍 San Francisco, CA</span>
          <span>&bull;</span>
          <span class="status-avail">● Available for Advisory</span>
          <span>&bull;</span>
          <a href="mailto:${site.seo_config?.contactEmail || 'cv@example.com'}">${site.seo_config?.contactEmail || 'cv@example.com'}</a>
        </div>
      </div>

      <div class="action-group">
        <button class="btn-print" onclick="window.print()">
          <span>🖨️</span> Print / PDF
        </button>
      </div>
    </header>

    ${experience.length > 0 ? `
    <!-- Experience Chronology -->
    <section class="section-wrap">
      <div class="section-title">Professional Experience</div>
      <div class="timeline">
        ${experience.map(exp => `
          <div class="timeline-node">
            <div class="timeline-header">
              <div>
                <span class="timeline-role">${escapeHtml(exp.role || exp.title || 'Staff Engineer')}</span>
                <span style="color:var(--muted);">&middot;</span>
                <span class="timeline-company">${escapeHtml(exp.company || 'Tech Co.')}</span>
              </div>
              <span class="timeline-dates">${escapeHtml(exp.period || exp.year || '2022 — Present')}</span>
            </div>
            <p class="timeline-desc">${escapeHtml(exp.description || '')}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Core Skills Matrix -->
    <section class="section-wrap">
      <div class="section-title">Technical Competencies</div>
      <div class="skills-grid">
        <div>
          <div class="skill-cat-title">Systems &amp; Edge</div>
          <div class="skill-tag-cloud">
            <span class="skill-tag">Cloudflare Workers</span>
            <span class="skill-tag">Edge KV</span>
            <span class="skill-tag">WebAssembly</span>
            <span class="skill-tag">Distributed Systems</span>
          </div>
        </div>
        <div>
          <div class="skill-cat-title">Languages</div>
          <div class="skill-tag-cloud">
            <span class="skill-tag">TypeScript</span>
            <span class="skill-tag">Rust</span>
            <span class="skill-tag">JavaScript (ESNext)</span>
            <span class="skill-tag">SQL</span>
          </div>
        </div>
        <div>
          <div class="skill-cat-title">Architecture</div>
          <div class="skill-tag-cloud">
            <span class="skill-tag">Zero-Runtime</span>
            <span class="skill-tag">Performance Tuning</span>
            <span class="skill-tag">Design Systems</span>
            <span class="skill-tag">Accessibility (a11y)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Education & Credentials -->
    <section class="section-wrap" style="margin-bottom:0;">
      <div class="section-title">Education &amp; Credentials</div>
      <div class="timeline">
        ${education.length > 0 ? education.map(edu => `
          <div class="timeline-node">
            <div class="timeline-header">
              <span class="timeline-role">${escapeHtml(edu.degree || 'B.S. in Computer Science')}</span>
              <span class="timeline-dates">${escapeHtml(edu.year || '2017 — 2021')}</span>
            </div>
            <div class="timeline-company">${escapeHtml(edu.institution || 'University')}</div>
            <p class="timeline-desc">${escapeHtml(edu.details || '')}</p>
          </div>
        `).join('') : `
          <div class="timeline-node">
            <div class="timeline-header">
              <span class="timeline-role">B.S. in Computer Science &amp; Systems Architecture</span>
              <span class="timeline-dates">2017 — 2021</span>
            </div>
            <div class="timeline-company">Institute of Technology &middot; Magna Cum Laude</div>
            <p class="timeline-desc">Specialization in distributed computing, networking protocols, and systems performance.</p>
          </div>
        `}
      </div>
    </section>
  </div>

  ${renderClientScript()}
</body>
</html>`;
}
