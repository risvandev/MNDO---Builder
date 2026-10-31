// ==============================================================================
// TEMPLATE 18: DESIGN ENGINEER & PRODUCT CRAFT (LINEAR & RAUNO FREIBERG INSPIRED)
// Crafted for UI/UX engineers, design system leads, and frontend craftspeople.
// Clean editorial typography, dark/light contrast, and case study impact metrics.
// ==============================================================================
import { escapeHtml, sanitizeUrl } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderDesignEngineer(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const projects = content.projects || [];
  const experience = content.experience || [];
  const skills = content.skills || [];
  const primaryColor = site.theme_config?.primaryColor || '#6366f1';
  const fontPair = FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${hero.headline || site.title} - Design Engineer & Craft`, site.description, currentPath)}
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #121215;
      --text: #a1a1aa;
      --heading: #fafafa;
      --muted: #71717a;
      --border: #27272a;
      --border-focus: #3f3f46;
      --accent: ${primaryColor};
      --accent-glow: rgba(99, 102, 241, 0.15);
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.65;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--heading); text-decoration: none; transition: color 0.15s ease; }
    a:hover { color: var(--accent); }
    .container { max-width: 800px; margin: 0 auto; padding: 0 24px; }

    /* Header Nav */
    .site-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(9, 9, 11, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 18px 0;
      margin-bottom: 64px;
    }
    .nav-inner { display: flex; justify-content: space-between; align-items: center; }
    .nav-brand { font-family: var(--font-heading); font-size: 16px; font-weight: 700; color: var(--heading); }
    .nav-links { display: flex; gap: 20px; font-size: 13px; font-weight: 500; }
    .nav-links a { color: var(--muted); }
    .nav-links a:hover { color: var(--heading); }

    /* Status Pill */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      font-size: 12px;
      font-weight: 500;
      color: var(--muted);
      margin-bottom: 24px;
    }
    .status-beacon {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    /* Hero */
    .hero-section { margin-bottom: 72px; }
    .hero-name { font-family: var(--font-heading); font-size: clamp(34px, 5vw, 48px); font-weight: 800; color: var(--heading); letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 16px; }
    .hero-tagline { font-size: 19px; color: var(--heading); font-weight: 500; margin-bottom: 16px; line-height: 1.4; }
    .hero-prose { font-size: 16px; color: var(--muted); line-height: 1.7; max-width: 660px; }

    /* Section Headers */
    .section-wrap { margin-bottom: 68px; }
    .section-head { font-family: var(--font-heading); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 24px; }

    /* Projects / Case Studies */
    .case-studies { display: flex; flex-direction: column; gap: 20px; }
    .case-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 24px;
      transition: all 0.2s ease;
    }
    .case-card:hover { border-color: var(--border-focus); transform: translateY(-2px); }
    .case-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .case-title { font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--heading); }
    .case-metric { font-size: 12px; font-weight: 600; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px; }
    .case-desc { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
    .case-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .case-tag { font-size: 11px; background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border); padding: 3px 9px; border-radius: 4px; color: var(--muted); }

    /* Experience Grid */
    .exp-grid { display: flex; flex-direction: column; gap: 16px; }
    .exp-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }
    .exp-title { font-weight: 600; color: var(--heading); }
    .exp-company { font-size: 13px; color: var(--muted); margin-left: 8px; }
    .exp-time { font-size: 13px; color: var(--muted); font-family: monospace; }

    /* Stack Matrix */
    .stack-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
    .stack-item {
      font-size: 13px;
      padding: 6px 14px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--heading);
    }

    /* Footer */
    .footer-wrap {
      border-top: 1px solid var(--border);
      padding: 48px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--muted);
    }
    
    @media (max-width: 600px) {
      .case-top { flex-direction: column; gap: 6px; }
      .exp-row { flex-direction: column; gap: 4px; }
      .footer-wrap { flex-direction: column; gap: 16px; text-align: center; }
    }
  </style>
</head>
<body>
  <nav class="site-nav">
    <div class="container nav-inner">
      <div class="nav-brand">${escapeHtml(site.title)}</div>
      <div class="nav-links">
        <a href="#projects">Work</a>
        <a href="#about">About</a>
        <a href="mailto:${site.seo_config?.contactEmail || 'contact@example.com'}">Contact</a>
      </div>
    </div>
  </nav>

  <main class="container">
    <section class="hero-section">
      <div class="status-pill">
        <span class="status-beacon"></span>
        <span>Available for select product craft &amp; advisory</span>
      </div>
      <h1 class="hero-name">${escapeHtml(hero.headline || site.title)}</h1>
      <div class="hero-tagline">${escapeHtml(hero.tagline || 'Design Engineer &amp; Frontend Architect')}</div>
      <p class="hero-prose">${escapeHtml(hero.bio || site.description || 'Designing polished digital tools with obsessive attention to typography, micro-interactions, and performance.')}</p>
    </section>

    <!-- Selected Case Studies -->
    <section class="section-wrap" id="projects">
      <div class="section-head">Selected Work &amp; Case Studies</div>
      <div class="case-studies">
        ${projects.length > 0 ? projects.map(proj => `
          <div class="case-card">
            <div class="case-top">
              <div class="case-title">
                ${proj.liveUrl ? `<a href="${sanitizeUrl(proj.liveUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(proj.title)} &rarr;</a>` : escapeHtml(proj.title)}
              </div>
              <span class="case-metric">Shipped</span>
            </div>
            <p class="case-desc">${escapeHtml(proj.description || '')}</p>
            ${proj.tags && proj.tags.length > 0 ? `
              <div class="case-tags">
                ${proj.tags.map(t => `<span class="case-tag">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('') : `
          <div class="case-card">
            <div class="case-top">
              <div class="case-title">
                <a href="#">Design System &amp; Component Core &rarr;</a>
              </div>
              <span class="case-metric">+180% Dev Velocity</span>
            </div>
            <p class="case-desc">Engineered accessible UI component primitives with micro-spring animations, keyboard navigation, and theme tokens.</p>
            <div class="case-tags">
              <span class="case-tag">Design Systems</span>
              <span class="case-tag">TypeScript</span>
              <span class="case-tag">Accessibility</span>
            </div>
          </div>
          <div class="case-card">
            <div class="case-top">
              <div class="case-title">
                <a href="#">High-Throughput Analytics Dashboard &rarr;</a>
              </div>
              <span class="case-metric">0ms Frame Drop</span>
            </div>
            <p class="case-desc">Rebuilt real-time data visualizer using WebGL canvas shaders and virtualization for streaming millions of telemetry points.</p>
            <div class="case-tags">
              <span class="case-tag">Data Visualization</span>
              <span class="case-tag">Canvas</span>
              <span class="case-tag">Performance</span>
            </div>
          </div>
        `}
      </div>
    </section>

    <!-- Career Trajectory -->
    <section class="section-wrap" id="experience">
      <div class="section-head">Career Trajectory</div>
      <div class="exp-grid">
        ${experience.length > 0 ? experience.map(exp => `
          <div class="exp-row">
            <div>
              <span class="exp-title">${escapeHtml(exp.role || exp.title || 'Design Engineer')}</span>
              <span class="exp-company">&bull; ${escapeHtml(exp.company || '')}</span>
            </div>
            <span class="exp-time">${escapeHtml(exp.period || exp.year || '')}</span>
          </div>
        `).join('') : `
          <div class="exp-row">
            <div>
              <span class="exp-title">Lead Design Engineer</span>
              <span class="exp-company">&bull; Linear Labs</span>
            </div>
            <span class="exp-time">2023 - Present</span>
          </div>
          <div class="exp-row">
            <div>
              <span class="exp-title">Frontend Architect</span>
              <span class="exp-company">&bull; Studio Craft</span>
            </div>
            <span class="exp-time">2021 - 2023</span>
          </div>
        `}
      </div>
    </section>

    <!-- Stack Matrix -->
    <section class="section-wrap">
      <div class="section-head">Craft &amp; Tooling Stack</div>
      <div class="stack-cloud">
        ${skills.length > 0 ? skills.map(s => `
          <span class="stack-item">${escapeHtml(s.name || s)}</span>
        `).join('') : `
          <span class="stack-item">Design Systems</span>
          <span class="stack-item">Figma to Code</span>
          <span class="stack-item">Interaction Design</span>
          <span class="stack-item">TypeScript</span>
          <span class="stack-item">Tailored Vanilla CSS</span>
          <span class="stack-item">WebGL Shaders</span>
          <span class="stack-item">Web Performance</span>
        `}
      </div>
    </section>

    <footer class="footer-wrap">
      <div>&copy; ${new Date().getFullYear()} ${escapeHtml(site.title)}. Built with craft &amp; restraint.</div>
      <div>
        <a href="mailto:${site.seo_config?.contactEmail || 'contact@example.com'}">Initiate Conversation &rarr;</a>
      </div>
    </footer>
  </main>
  ${renderClientScript()}
</body>
</html>`;
}
