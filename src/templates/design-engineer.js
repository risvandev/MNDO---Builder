// ==============================================================================
// TEMPLATE 18: DESIGN ENGINEER & PRODUCT CRAFT (LINEAR & RAUNO FREIBERG BENTO)
// OLED dark mode, 12-column Bento Grid, pulsating status beacon, micro-borders,
// case study metrics, tactile typography, and craft engineering manifesto.
// ==============================================================================
import { escapeHtml, sanitizeUrl, sanitizeColor } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderDesignEngineer(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const projects = content.projects || [];
  const experience = content.experience || [];
  const skills = content.skills || [];
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#6366f1');
  const fontPair = FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${hero.headline || site.title} - Design Engineer & Craft`, site.description, currentPath)}
  <style>
    :root {
      --bg: #050505;
      --card-bg: #0c0c0e;
      --card-hover: #121216;
      --text: #a1a1aa;
      --heading: #ededed;
      --bright: #ffffff;
      --muted: #71717a;
      --border: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(255, 255, 255, 0.2);
      --accent: ${primaryColor};
      --accent-glow: rgba(99, 102, 241, 0.2);
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
      overflow-x: hidden;
    }
    a { color: var(--heading); text-decoration: none; transition: all 0.15s ease; }
    a:hover { color: var(--bright); }
    .container { max-width: 1040px; margin: 0 auto; padding: 0 24px; }

    /* Sticky Nav */
    .site-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(5, 5, 5, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 16px 0;
      margin-bottom: 48px;
    }
    .nav-inner { display: flex; justify-content: space-between; align-items: center; }
    .nav-brand {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 700;
      color: var(--heading);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-pip { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
    .nav-links { display: flex; gap: 24px; font-size: 13px; font-weight: 500; }
    .nav-links a { color: var(--muted); }
    .nav-links a:hover { color: var(--heading); }

    /* BENTO GRID ARCHITECTURE (Signature Linear / Rauno Layout) */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 16px;
      margin-bottom: 64px;
    }
    .bento-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .bento-card:hover {
      border-color: var(--border-hover);
      background: var(--card-hover);
      transform: translateY(-2px);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
    }
    .col-span-8 { grid-column: span 8; }
    .col-span-4 { grid-column: span 4; }
    .col-span-6 { grid-column: span 6; }
    .col-span-12 { grid-column: span 12; }

    /* Card 1: Hero Identity */
    .hero-eyebrow {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .hero-name {
      font-family: var(--font-heading);
      font-size: clamp(32px, 4vw, 44px);
      font-weight: 800;
      color: var(--bright);
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 14px;
    }
    .hero-tagline {
      font-size: 18px;
      font-weight: 500;
      color: var(--heading);
      line-height: 1.45;
      margin-bottom: 16px;
    }
    .hero-bio { font-size: 15px; color: var(--muted); line-height: 1.65; max-width: 580px; }
    .hero-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
      font-size: 12.5px;
      color: var(--muted);
      font-family: monospace;
    }

    /* Card 2: Status Beacon Card */
    .beacon-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .beacon-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 12px #10b981;
      animation: pulseBeacon 2s infinite ease-in-out;
    }
    @keyframes pulseBeacon {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .beacon-title { font-size: 14px; font-weight: 600; color: #10b981; }
    .beacon-desc { font-size: 13.5px; color: var(--muted); line-height: 1.5; margin-bottom: 20px; }
    .btn-contact {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background: #ffffff;
      color: #000000;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      transition: opacity 0.15s ease;
    }
    .btn-contact:hover { opacity: 0.9; color: #000; }

    /* Metric Cards */
    .metric-num {
      font-family: var(--font-heading);
      font-size: 38px;
      font-weight: 800;
      color: var(--bright);
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 6px;
    }
    .metric-tag { font-size: 12.5px; font-weight: 600; color: var(--heading); margin-bottom: 4px; }
    .metric-sub { font-size: 12px; color: var(--muted); line-height: 1.4; }

    /* Case Studies (Linear Style) */
    .case-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(99, 102, 241, 0.12);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.25);
      margin-bottom: 12px;
    }
    .case-title {
      font-family: var(--font-heading);
      font-size: 19px;
      font-weight: 700;
      color: var(--bright);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .case-title a { color: var(--bright); display: inline-flex; align-items: center; gap: 6px; }
    .case-title a:hover { color: var(--accent); }
    .case-arrow { display: inline-block; transition: transform 0.2s ease; }
    .bento-card:hover .case-arrow { transform: translate(3px, -3px); color: var(--accent); }
    .case-desc { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
    .case-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .case-tag {
      font-size: 11px;
      font-family: monospace;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      color: var(--text);
    }

    /* Manifesto Section */
    .manifesto-title { font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--bright); margin-bottom: 10px; }
    .manifesto-body { font-size: 14.5px; color: var(--text); line-height: 1.7; }
    .manifesto-body p { margin-bottom: 10px; }
    .manifesto-body strong { color: var(--bright); }

    /* Stack Matrix */
    .stack-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .stack-chip {
      font-size: 11.5px;
      padding: 5px 12px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      color: var(--heading);
      font-weight: 500;
    }

    /* Experience Chronology */
    .exp-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 14px 0;
      border-bottom: 1px solid var(--border);
    }
    .exp-row:last-child { border-bottom: none; }
    .exp-left { display: flex; align-items: baseline; gap: 8px; }
    .exp-role-title { font-weight: 600; color: var(--bright); font-size: 14.5px; }
    .exp-co { font-size: 13.5px; color: var(--muted); }
    .exp-date-pill { font-size: 12px; font-family: monospace; color: var(--accent); }

    /* Footer */
    .site-footer {
      padding: 36px 0 60px;
      border-top: 1px solid var(--border);
      font-size: 12.5px;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media (max-width: 860px) {
      .col-span-8, .col-span-4, .col-span-6 { grid-column: span 12; }
      .bento-grid { gap: 12px; }
      .site-footer { flex-direction: column; gap: 12px; text-align: center; }
    }
  </style>
</head>
<body>
  <!-- Nav -->
  <header class="site-nav">
    <div class="container nav-inner">
      <div class="nav-brand">
        <span class="brand-pip"></span>
        <span>${escapeHtml(hero.headline || site.title)}</span>
      </div>
      <nav class="nav-links">
        <a href="#work">Work</a>
        <a href="#craft">Craft</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <!-- 12-Column Linear Bento Grid -->
    <div class="bento-grid">
      <!-- Card 1: Main Identity (8 cols) -->
      <div class="bento-card col-span-8">
        <div>
          <div class="hero-eyebrow">Design Engineer &middot; Product Craft</div>
          <h1 class="hero-name">${escapeHtml(hero.headline || site.title)}</h1>
          <div class="hero-tagline">${escapeHtml(hero.tagline || 'Designing tactile web interfaces, zero-runtime compilers, and distributed edge systems.')}</div>
          <p class="hero-bio">${escapeHtml(hero.bio || site.description || 'Focusing on the intersection of typography, high-velocity frontend architecture, and sub-10ms CDN delivery.')}</p>
        </div>
        <div class="hero-meta">
          <span>📍 San Francisco, CA</span>
          <span>&bull;</span>
          <span>⚡ 0.04s Load Speed</span>
          <span>&bull;</span>
          <span>🎨 60 FPS Shaders</span>
        </div>
      </div>

      <!-- Card 2: Status & Availability (4 cols) -->
      <div class="bento-card col-span-4" id="contact">
        <div>
          <div class="beacon-wrapper status-pill">
            <span class="beacon-dot"></span>
            <span class="beacon-title">Available for Q1 Craft</span>
          </div>
          <p class="beacon-desc">Advising seed-to-Series B founders on design systems, web performance, and zero-runtime architecture.</p>
        </div>
        <a href="mailto:${site.seo_config?.contactEmail || 'craft@example.com'}" class="btn-contact">
          <span>✉️</span> Get in Touch &rarr;
        </a>
      </div>

      <!-- Card 3: Metric 1 (4 cols) -->
      <div class="bento-card col-span-4">
        <div>
          <div class="metric-num">&lt; 10ms</div>
          <div class="metric-tag">Global Response Latency</div>
          <p class="metric-sub">Pure static HTML compilation deployed directly to 300+ edge nodes without React hydration.</p>
        </div>
      </div>

      <!-- Card 4: Metric 2 (4 cols) -->
      <div class="bento-card col-span-4">
        <div>
          <div class="metric-num">60 FPS</div>
          <div class="metric-tag">Tactile Interaction Performance</div>
          <p class="metric-sub">Hardware-accelerated CSS transforms and smooth micro-interactions tuned for zero battery drain.</p>
        </div>
      </div>

      <!-- Card 5: Metric 3 (4 cols) -->
      <div class="bento-card col-span-4">
        <div>
          <div class="metric-num">100/100</div>
          <div class="metric-tag">Lighthouse Quality Score</div>
          <p class="metric-sub">Perfect marks across Accessibility, Performance, SEO, and Best Practices on every view.</p>
        </div>
      </div>

      <!-- Card 6: Featured Case Studies Bento (12 cols) -->
      <div class="bento-card col-span-12 case-studies" id="work">
        <div style="margin-bottom: 20px;">
          <div class="hero-eyebrow">Case Studies &middot; High Impact</div>
          <h2 class="case-title" style="font-size: 22px;">Selected Work &amp; Case Studies</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="case-badge">Case Study &middot; +340% Throughput</div>
              <h3 class="case-title" style="font-size: 18px; margin-top: 6px;">
                <a href="https://github.com/example/edge-mesh" target="_blank">
                  <span>High-Velocity Edge Mesh</span>
                  <span class="case-arrow">&nearr;</span>
                </a>
              </h3>
              <p class="case-desc">A microsecond edge routing architecture serving 50M+ requests with distributed caching and zero runtime bundle overhead.</p>
            </div>
            <div class="case-tags" style="margin-top: 14px;">
              <span class="case-tag">Cloudflare Workers</span>
              <span class="case-tag">Rust</span>
              <span class="case-tag">Edge KV</span>
              <span class="case-tag">WebAssembly</span>
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="case-badge">Design System &middot; 0KB Runtime</div>
              <h3 class="case-title" style="font-size: 18px; margin-top: 6px;">
                <a href="https://github.com/example/zero-runtime" target="_blank">
                  <span>Zero-Runtime Design System</span>
                  <span class="case-arrow">&nearr;</span>
                </a>
              </h3>
              <p class="case-desc">Semantic HTML compiler and CSS token system replacing bulky component frameworks with zero client JS requirements.</p>
            </div>
            <div class="case-tags" style="margin-top: 14px;">
              <span class="case-tag">HTML5 / CSS</span>
              <span class="case-tag">Design Tokens</span>
              <span class="case-tag">Typography</span>
              <span class="case-tag">Accessibility</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 8: Craft Manifesto (8 cols) -->
      <div class="bento-card col-span-8" id="craft">
        <div>
          <div class="manifesto-title">Engineering Manifesto: On Simplicity and Speed</div>
          <div class="manifesto-body">
            <p>The modern web has become weighed down by multi-megabyte JavaScript bundles, hydration flickers, and unneeded complexity. <strong>True product craft is subtractive.</strong></p>
            <p>When you strip away framework runtime tax and deliver raw, semantic HTML paired with refined typography and micro-interactions, websites load instantly and feel remarkably alive.</p>
          </div>
        </div>
      </div>

      <!-- Card 9: Stack Matrix (4 cols) -->
      <div class="bento-card col-span-4">
        <div>
          <div class="hero-eyebrow">Tooling &amp; Stack</div>
          <div class="stack-grid">
            ${skills.length > 0 ? skills.map(s => `<span class="stack-chip">${escapeHtml(s.name || s)}</span>`).join('') : `
              <span class="stack-chip">TypeScript</span>
              <span class="stack-chip">CSS Tokens</span>
              <span class="stack-chip">Cloudflare Workers</span>
              <span class="stack-chip">PostgreSQL</span>
              <span class="stack-chip">WebAssembly</span>
              <span class="stack-chip">Design Systems</span>
            `}
          </div>
        </div>
      </div>

      ${experience.length > 0 ? `
      <!-- Card 10: Experience Chronology (12 cols) -->
      <div class="bento-card col-span-12" id="experience">
        <div class="hero-eyebrow" style="margin-bottom:16px;">Career Trajectory</div>
        <div>
          ${experience.map(exp => `
            <div class="exp-row">
              <div class="exp-left">
                <span class="exp-role-title">${escapeHtml(exp.role || exp.title || 'Design Engineer')}</span>
                <span style="color:var(--muted);">&middot;</span>
                <span class="exp-co">${escapeHtml(exp.company || 'Modern Studio')}</span>
              </div>
              <span class="exp-date-pill">${escapeHtml(exp.period || exp.year || '2022 — Present')}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  </main>

  <footer class="site-footer container">
    <div>&copy; ${new Date().getFullYear()} ${escapeHtml(hero.headline || site.title)}. Built with zero runtime JavaScript.</div>
    <div>Designed with tactile micro-interactions and high-contrast OLED dark mode.</div>
  </footer>

  ${renderClientScript()}
</body>
</html>`;
}
