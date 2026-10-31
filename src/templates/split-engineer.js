// ==============================================================================
// TEMPLATE 17: STAFF ENGINEER SPLIT-SCREEN (BRITTANY CHIANG V4 INSPIRED)
// The iconic, award-winning 2-column split portfolio for staff engineers and tech leads.
// Features cursor spotlight radial glow, group card hover dimming, and active scroll spy.
// ==============================================================================
import { escapeHtml, sanitizeUrl, sanitizeColor } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderSplitEngineer(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const experience = content.experience || [];
  const projects = content.projects || [];
  const skills = content.skills || [];
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#64ffda'); // Iconic cyan/teal
  const fontPair = FONT_PAIRS['jetbrains-inter'] || FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${hero.headline || site.title} - Staff Platform Architect`, site.description, currentPath)}
  <style>
    :root {
      --bg: #0a192f;
      --card-bg: rgba(17, 34, 64, 0.65);
      --card-hover: rgba(23, 42, 69, 0.95);
      --text: #8892b0;
      --heading: #ccd6f6;
      --bright: #e6f1ff;
      --muted: #8892b0;
      --border: rgba(100, 255, 218, 0.08);
      --border-hover: rgba(100, 255, 218, 0.3);
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
      position: relative;
      overflow-x: hidden;
    }
    a { color: var(--bright); text-decoration: none; transition: color 0.15s ease; }
    a:hover { color: var(--accent); }

    /* Cursor Spotlight Radial Glow */
    #cursorSpotlight {
      pointer-events: none;
      position: fixed;
      inset: 0;
      z-index: 2;
      transition: background 0.05s ease;
      background: radial-gradient(600px at 50% 50%, rgba(29, 78, 216, 0.15), transparent 80%);
    }

    /* Layout Split */
    .split-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 48px;
      display: flex;
      justify-content: space-between;
      gap: 64px;
      min-height: 100vh;
      position: relative;
      z-index: 5;
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
    .hero-intro { font-family: var(--font-mono); font-size: 14px; color: var(--accent); margin-bottom: 12px; letter-spacing: 0.05em; }
    .hero-name { font-size: 48px; font-weight: 800; color: var(--heading); letter-spacing: -0.025em; line-height: 1.1; margin-bottom: 12px; }
    .hero-title { font-size: 20px; font-weight: 600; color: var(--heading); margin-bottom: 16px; }
    .hero-bio { font-size: 15px; color: var(--muted); line-height: 1.65; max-width: 380px; margin-bottom: 40px; }

    /* Nav Links Tracker */
    .side-nav { display: flex; flex-direction: column; gap: 18px; }
    .nav-indicator {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      font-family: var(--font-mono);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--muted);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .nav-indicator::before {
      content: '';
      display: block;
      width: 32px;
      height: 1px;
      background: var(--muted);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .nav-indicator:hover, .nav-indicator.active {
      color: var(--bright);
    }
    .nav-indicator:hover::before, .nav-indicator.active::before {
      width: 64px;
      background: var(--accent);
    }

    /* Social / Contact in Sidebar */
    .side-social { display: flex; align-items: center; gap: 20px; font-size: 13px; font-family: var(--font-mono); color: var(--muted); }
    .side-social a { color: var(--muted); display: inline-flex; align-items: center; gap: 6px; }
    .side-social a:hover { color: var(--accent); }

    /* Right Scrolling Content Column */
    .split-right {
      width: 52%;
      padding: 96px 0;
      display: flex;
      flex-direction: column;
      gap: 104px;
    }
    .section-title {
      font-size: 14px;
      font-family: var(--font-mono);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--bright);
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    /* About Section */
    .about-prose p { margin-bottom: 18px; font-size: 15.5px; line-height: 1.75; color: var(--text); }
    .about-prose p strong { color: var(--bright); }

    /* Group Hover Dimming Effect (Signature Brittany Chiang interaction) */
    .group-list { display: flex; flex-direction: column; gap: 24px; }
    .group-list:hover .exp-card,
    .group-list:hover .project-card {
      opacity: 0.45;
    }
    .group-list:hover .exp-card:hover,
    .group-list:hover .project-card:hover {
      opacity: 1;
      transform: translateY(-2px);
      border-color: var(--border-hover);
      background: var(--card-hover);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }

    /* Experience Card */
    .exp-card {
      padding: 24px;
      border-radius: 8px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: grid;
      grid-template-columns: 130px 1fr;
      gap: 20px;
    }
    .exp-date { font-family: var(--font-mono); font-size: 12px; color: var(--accent); letter-spacing: 0.05em; padding-top: 2px; }
    .exp-content { display: flex; flex-direction: column; gap: 6px; }
    .exp-role { font-size: 17px; font-weight: 700; color: var(--heading); display: inline-flex; align-items: center; gap: 6px; }
    .exp-company { font-size: 14px; color: var(--bright); font-weight: 500; margin-bottom: 6px; }
    .exp-desc { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 14px; }
    .exp-tags { display: flex; flex-wrap: wrap; gap: 6px; }

    /* Project Cards */
    .project-card {
      padding: 24px;
      border-radius: 8px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .project-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--heading);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .project-title a { color: var(--heading); display: inline-flex; align-items: center; gap: 6px; }
    .project-title a:hover { color: var(--accent); }
    .link-arrow { display: inline-block; transition: transform 0.2s ease; }
    .project-card:hover .link-arrow { transform: translate(3px, -3px); color: var(--accent); }
    .project-desc { font-size: 14px; color: var(--muted); line-height: 1.65; margin-bottom: 16px; }
    .project-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tech-pill {
      font-family: var(--font-mono);
      font-size: 11.5px;
      padding: 4px 12px;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid var(--border);
      font-weight: 500;
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

    /* Footer Note */
    .colophon { font-size: 13px; color: #55617d; line-height: 1.6; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }

    @media (max-width: 900px) {
      .split-container { flex-direction: column; padding: 0 24px; }
      .split-left { width: 100%; position: static; height: auto; padding: 60px 0 32px; }
      .side-nav { display: none; }
      .split-right { width: 100%; padding: 0 0 60px; gap: 60px; }
      .hero-name { font-size: 38px; }
      .exp-card { grid-template-columns: 1fr; gap: 8px; }
    }
  </style>
</head>
<body>
  <!-- Cursor Spotlight Radial Glow -->
  <div id="cursorSpotlight"></div>

  <div class="split-container">
    <!-- Left Sticky Column -->
    <aside class="split-left">
      <div>
        <div class="hero-intro">Hi, my name is</div>
        <h1 class="hero-name">${escapeHtml(hero.headline || site.title)}</h1>
        <div class="hero-title">${escapeHtml(hero.tagline || 'Staff Software Engineer & Platform Architect')}</div>
        <p class="hero-bio">${escapeHtml(hero.bio || site.description || 'Designing microsecond edge routing, distributed caching systems, and high-velocity web infrastructure.')}</p>

        <nav class="side-nav" id="sideNav">
          <a href="#about" class="nav-indicator active" data-target="about">About</a>
          <a href="#experience" class="nav-indicator" data-target="experience">Experience</a>
          <a href="#projects" class="nav-indicator" data-target="projects">Projects</a>
          <a href="#skills" class="nav-indicator" data-target="skills">Skills</a>
        </nav>
      </div>

      <div class="side-social">
        <a href="mailto:${site.seo_config?.contactEmail || 'contact@example.com'}">Email ↗</a> &bull;
        <a href="#projects">Works ↗</a> &bull;
        <a href="/feed.xml">RSS ↗</a>
      </div>
    </aside>

    <!-- Right Scrollable Column -->
    <main class="split-right">
      <!-- About -->
      <section id="about">
        <h2 class="section-title">About</h2>
        <div class="about-prose">
          <p>${escapeHtml(about.body || hero.bio || 'Over 8 years specializing in high-throughput distributed infrastructure, zero-runtime frontend architecture, and resilient cloud engineering.')}</p>
          <p>My work centers on <strong>sub-15ms edge routing</strong>, static web publishing at scale, and designing accessible, lightning-fast interfaces that eliminate hydration overhead.</p>
          <p>Outside of architecture reviews and performance benchmarking, I actively contribute to open source developer tools, run distributed systems research, and mentor upcoming engineers.</p>
        </div>
      </section>

      ${experience.length > 0 ? `
      <!-- Experience -->
      <section id="experience">
        <h2 class="section-title">Experience</h2>
        <div class="group-list">
          ${experience.map(exp => `
            <div class="exp-card">
              <div class="exp-date">${escapeHtml(exp.period || exp.year || '2022 — Present')}</div>
              <div class="exp-content">
                <div class="exp-role">
                  <span>${escapeHtml(exp.role || exp.title || 'Staff Engineer')}</span>
                  <span style="color:var(--muted);">&middot;</span>
                  <span class="exp-company">${escapeHtml(exp.company || 'Tech Co.')}</span>
                </div>
                <p class="exp-desc">${escapeHtml(exp.description || '')}</p>
                ${exp.tags && exp.tags.length > 0 ? `
                  <div class="exp-tags">
                    ${exp.tags.map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      ${projects.length > 0 ? `
      <!-- Projects -->
      <section id="projects">
        <h2 class="section-title">Selected Projects</h2>
        <div class="group-list">
          ${projects.map(proj => `
            <div class="project-card">
              <div class="project-title">
                <a href="${sanitizeUrl(proj.liveUrl || '#')}" target="_blank" rel="noopener noreferrer">
                  <span>${escapeHtml(proj.title)}</span>
                  <span class="link-arrow">&nearr;</span>
                </a>
              </div>
              <p class="project-desc">${escapeHtml(proj.description || '')}</p>
              ${proj.tags && proj.tags.length > 0 ? `
                <div class="project-tags">
                  ${proj.tags.map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

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
            <span class="skill-badge">WebAssembly</span>
            <span class="skill-badge">Distributed Systems</span>
            <span class="skill-badge">Performance Tuning</span>
            <span class="skill-badge">Git &amp; CI/CD</span>
            <span class="skill-badge">Design Systems</span>
          `}
        </div>

        <div class="colophon">
          Built with lightweight semantic HTML and CSS. Zero React hydration overhead. Sub-10ms response latency on global edge CDN.
        </div>
      </section>
    </main>
  </div>

  <script>
    // Spotlight radial mouse tracker
    window.addEventListener('mousemove', function(e) {
      var glow = document.getElementById('cursorSpotlight');
      if (glow) {
        glow.style.background = 'radial-gradient(600px at ' + e.clientX + 'px ' + e.clientY + 'px, rgba(100, 255, 218, 0.08), transparent 80%)';
      }
    });

    // Scroll spy active nav indicator
    (function() {
      var sections = document.querySelectorAll('section[id]');
      var navLinks = document.querySelectorAll('.nav-indicator');

      function onScroll() {
        var scrollPos = window.scrollY + 200;
        sections.forEach(function(sec) {
          var top = sec.offsetTop;
          var height = sec.offsetHeight;
          var id = sec.getAttribute('id');
          if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(function(link) {
              if (link.getAttribute('data-target') === id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
    })();
  </script>
  ${renderClientScript()}
</body>
</html>`;
}
