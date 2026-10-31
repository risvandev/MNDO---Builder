// ==============================================================================
// TEMPLATE 17: STAFF ENGINEER SPLIT-SCREEN (BRITTANY CHIANG V4 INSPIRED)
// The iconic, award-winning 2-column split portfolio for engineers and tech leads.
// Sticky navigation with active scroll tracking, project cards, and tech stack pills.
// ==============================================================================
import { escapeHtml, sanitizeUrl } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderSplitEngineer(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const experience = content.experience || [];
  const projects = content.projects || [];
  const skills = content.skills || [];
  const primaryColor = site.theme_config?.primaryColor || '#64ffda'; // Iconic cyan/teal
  const fontPair = FONT_PAIRS['jetbrains-inter'] || FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${hero.headline || site.title} - Staff Engineer Portfolio`, site.description, currentPath)}
  <style>
    :root {
      --bg: #0a192f;
      --card-bg: rgba(17, 34, 64, 0.7);
      --card-hover: rgba(23, 42, 69, 0.9);
      --text: #8892b0;
      --heading: #ccd6f6;
      --bright: #e6f1ff;
      --muted: #8892b0;
      --border: rgba(100, 255, 218, 0.1);
      --border-hover: rgba(100, 255, 218, 0.35);
      --accent: ${primaryColor};
      --accent-soft: rgba(100, 255, 218, 0.1);
      --font-mono: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.65;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--bright); text-decoration: none; transition: color 0.15s ease; }
    a:hover { color: var(--accent); }

    /* Layout Split */
    .split-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 40px;
      display: flex;
      justify-content: space-between;
      gap: 60px;
      min-height: 100vh;
    }

    /* Left Sticky Column */
    .split-left {
      width: 44%;
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 96px 0;
    }
    .hero-intro { font-family: var(--font-mono); font-size: 14px; color: var(--accent); margin-bottom: 12px; }
    .hero-name { font-size: 46px; font-weight: 800; color: var(--heading); letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 12px; }
    .hero-title { font-size: 20px; font-weight: 600; color: var(--heading); margin-bottom: 16px; }
    .hero-bio { font-size: 15px; color: var(--muted); line-height: 1.6; max-width: 360px; margin-bottom: 40px; }

    /* Nav Links Tracker */
    .side-nav { display: flex; flex-direction: column; gap: 16px; }
    .nav-indicator {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      transition: all 0.2s ease;
    }
    .nav-indicator::before {
      content: '';
      display: block;
      width: 28px;
      height: 1px;
      background: var(--muted);
      transition: all 0.2s ease;
    }
    .nav-indicator:hover, .nav-indicator.active {
      color: var(--bright);
    }
    .nav-indicator:hover::before, .nav-indicator.active::before {
      width: 56px;
      background: var(--accent);
    }

    /* Social / Contact in Sidebar */
    .side-social { display: flex; gap: 20px; font-size: 14px; font-family: var(--font-mono); }
    .side-social a { color: var(--muted); }
    .side-social a:hover { color: var(--accent); }

    /* Right Scrolling Content Column */
    .split-right {
      width: 52%;
      padding: 96px 0;
      display: flex;
      flex-direction: column;
      gap: 96px;
    }
    .section-title {
      font-size: 14px;
      font-family: var(--font-mono);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--bright);
      margin-bottom: 28px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    /* About Section */
    .about-prose p { margin-bottom: 16px; font-size: 15px; line-height: 1.75; }

    /* Experience Items */
    .exp-list { display: flex; flex-direction: column; gap: 24px; }
    .exp-card {
      padding: 24px;
      border-radius: 8px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      transition: all 0.2s ease;
    }
    .exp-card:hover {
      background: var(--card-hover);
      border-color: var(--border-hover);
      transform: translateY(-2px);
    }
    .exp-date { font-family: var(--font-mono); font-size: 12px; color: var(--accent); margin-bottom: 6px; }
    .exp-role { font-size: 17px; font-weight: 700; color: var(--heading); margin-bottom: 4px; }
    .exp-company { font-size: 14px; color: var(--bright); margin-bottom: 10px; }
    .exp-desc { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 14px; }

    /* Project Cards */
    .project-list { display: flex; flex-direction: column; gap: 24px; }
    .project-card {
      padding: 24px;
      border-radius: 8px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      transition: all 0.2s ease;
    }
    .project-card:hover {
      background: var(--card-hover);
      border-color: var(--border-hover);
      transform: translateY(-2px);
    }
    .project-title { font-size: 18px; font-weight: 700; color: var(--heading); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
    .project-desc { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
    .project-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tech-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid var(--border);
    }

    /* Skills Cloud */
    .skills-cloud { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-badge {
      font-family: var(--font-mono);
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 4px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--bright);
    }

    @media (max-width: 900px) {
      .split-container { flex-direction: column; padding: 0 24px; }
      .split-left { width: 100%; position: static; height: auto; padding: 60px 0 32px; }
      .side-nav { display: none; }
      .split-right { width: 100%; padding: 0 0 60px; gap: 60px; }
      .hero-name { font-size: 36px; }
    }
  </style>
</head>
<body>
  <div class="split-container">
    <!-- Left Sticky Profile Column -->
    <aside class="split-left">
      <div>
        <div class="hero-intro">Hi, my name is</div>
        <h1 class="hero-name">${escapeHtml(hero.headline || site.title)}</h1>
        <div class="hero-title">${escapeHtml(hero.tagline || 'Staff Software Engineer')}</div>
        <p class="hero-bio">${escapeHtml(hero.bio || site.description || 'I build scalable distributed systems and high-velocity web products.')}</p>

        <nav class="side-nav">
          <a href="#about" class="nav-indicator active">About</a>
          <a href="#experience" class="nav-indicator">Experience</a>
          <a href="#projects" class="nav-indicator">Projects</a>
          <a href="#skills" class="nav-indicator">Skills</a>
        </nav>
      </div>

      <div class="side-social">
        <a href="mailto:${site.seo_config?.contactEmail || 'contact@example.com'}">Email</a> &bull;
        <a href="#projects">Works</a> &bull;
        <a href="/feed.xml">RSS</a>
      </div>
    </aside>

    <!-- Right Scrollable Content Column -->
    <main class="split-right">
      <!-- About -->
      <section id="about">
        <h2 class="section-title">About</h2>
        <div class="about-prose">
          <p>${escapeHtml(about.body || hero.bio || 'I have spent years crafting modern digital infrastructure and reliable web architecture. Focused on high throughput, zero-runtime overhead, and thoughtful engineering.')}</p>
          <p>When not optimizing distributed queries or shipping web applications, I mentor engineers and contribute to open source ecosystems.</p>
        </div>
      </section>

      <!-- Experience -->
      <section id="experience">
        <h2 class="section-title">Experience</h2>
        <div class="exp-list">
          ${experience.length > 0 ? experience.map(exp => `
            <div class="exp-card">
              <div class="exp-date">${escapeHtml(exp.period || exp.year || '2022 - Present')}</div>
              <div class="exp-role">${escapeHtml(exp.role || exp.title || 'Staff Engineer')}</div>
              <div class="exp-company">${escapeHtml(exp.company || 'Tech Co.')}</div>
              <p class="exp-desc">${escapeHtml(exp.description || 'Led platform architecture and distributed deployment pipelines.')}</p>
            </div>
          `).join('') : `
            <div class="exp-card">
              <div class="exp-date">2023 - Present</div>
              <div class="exp-role">Principal Platform Architect</div>
              <div class="exp-company">Global Cloud Labs</div>
              <p class="exp-desc">Directing edge runtime acceleration, microsecond cache layers, and distributed database synchronization across global nodes.</p>
            </div>
            <div class="exp-card">
              <div class="exp-date">2020 - 2023</div>
              <div class="exp-role">Senior Full-Stack Engineer</div>
              <div class="exp-company">EdgeScale Technologies</div>
              <p class="exp-desc">Spearheaded static website publishing engine reducing cold-start latency by 90% and serving 50M+ monthly requests.</p>
            </div>
          `}
        </div>
      </section>

      <!-- Projects -->
      <section id="projects">
        <h2 class="section-title">Selected Projects</h2>
        <div class="project-list">
          ${projects.length > 0 ? projects.map(proj => `
            <div class="project-card">
              <div class="project-title">
                <span>${escapeHtml(proj.title)}</span>
                ${proj.liveUrl ? `<a href="${sanitizeUrl(proj.liveUrl)}" target="_blank" rel="noopener noreferrer">&rarr;</a>` : ''}
              </div>
              <p class="project-desc">${escapeHtml(proj.description || '')}</p>
              ${proj.tags && proj.tags.length > 0 ? `
                <div class="project-tags">
                  ${proj.tags.map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('') : `
            <div class="project-card">
              <div class="project-title">
                <span>Edge KV Distributed Cache</span>
                <a href="#" target="_blank">&rarr;</a>
              </div>
              <p class="project-desc">A sub-millisecond in-memory cache sync layer for edge cloud runtimes with zero client overhead.</p>
              <div class="project-tags">
                <span class="tech-pill">Cloudflare Workers</span>
                <span class="tech-pill">Rust</span>
                <span class="tech-pill">WebAssembly</span>
              </div>
            </div>
            <div class="project-card">
              <div class="project-title">
                <span>MNDO Zero-Runtime Engine</span>
                <a href="#" target="_blank">&rarr;</a>
              </div>
              <p class="project-desc">Static web builder generating pure semantic HTML with instant CDN routing and 100/100 Lighthouse scores.</p>
              <div class="project-tags">
                <span class="tech-pill">JavaScript</span>
                <span class="tech-pill">Supabase</span>
                <span class="tech-pill">Static Site</span>
              </div>
            </div>
          `}
        </div>
      </section>

      <!-- Skills -->
      <section id="skills">
        <h2 class="section-title">Skills &amp; Technologies</h2>
        <div class="skills-cloud">
          ${skills.length > 0 ? skills.map(s => `
            <span class="skill-badge">${escapeHtml(s.name || s)}</span>
          `).join('') : `
            <span class="skill-badge">TypeScript</span>
            <span class="skill-badge">JavaScript (ESNext)</span>
            <span class="skill-badge">Cloudflare Workers</span>
            <span class="skill-badge">PostgreSQL</span>
            <span class="skill-badge">Distributed Systems</span>
            <span class="skill-badge">Performance Tuning</span>
            <span class="skill-badge">Git &amp; CI/CD</span>
            <span class="skill-badge">HTML5 / CSS3</span>
          `}
        </div>
      </section>
    </main>
  </div>
  ${renderClientScript()}
</body>
</html>`;
}
