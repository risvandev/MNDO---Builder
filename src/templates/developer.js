// ==============================================================================
// TEMPLATE 2: DEVELOPER TERMINAL (NEOVIM & ARCH LINUX CLI INSPIRED)
// Authentic terminal window chrome with traffic light controls, realistic zsh prompt,
// git branch telemetry, syntax-colored JSON outputs, and GitHub repository cards with stars & forks.
// ==============================================================================
import { escapeHtml, sanitizeUrl, sanitizeColor } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderDeveloper(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const skills = content.skills || [];
  const projects = content.projects || [];
  const experience = content.experience || [];
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#10b981'); // Emerald terminal green
  const fontPair = FONT_PAIRS['jetbrains-inter'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${hero.headline || site.title} - Terminal Portfolio`, site.description, currentPath)}
  <style>
    :root {
      --bg: #090d16;
      --term-bg: #0d1117;
      --term-bar: #161b22;
      --card-bg: #161b22;
      --card-border: #30363d;
      --text: #c9d1d9;
      --heading: #f0f6fc;
      --muted: #8b949e;
      --accent: ${primaryColor};
      --accent-soft: rgba(16, 185, 129, 0.12);
      --font-mono: ${fontPair.heading};
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
      padding: 32px 16px 80px;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 980px; margin: 0 auto; }

    /* Terminal Window Chrome */
    .terminal-window {
      background: var(--term-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
    }

    /* Terminal Title Bar */
    .terminal-titlebar {
      background: var(--term-bar);
      border-bottom: 1px solid var(--card-border);
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .traffic-lights { display: flex; align-items: center; gap: 8px; }
    .t-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    .t-red { background: #ff5f56; border: 1px solid #e0443e; }
    .t-yellow { background: #ffbd2e; border: 1px solid #dea123; }
    .t-green { background: #27c93f; border: 1px solid #1aab29; }
    .terminal-title {
      font-family: var(--font-mono);
      font-size: 12.5px;
      color: var(--muted);
      font-weight: 500;
      letter-spacing: 0.02em;
    }
    .terminal-status-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    /* Terminal Content */
    .terminal-body { padding: 36px 32px; }

    /* CLI Prompt Formatting */
    .cli-command-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      font-family: var(--font-mono);
      font-size: 14px;
      margin-bottom: 14px;
    }
    .cli-prompt { color: var(--accent); font-weight: 700; }
    .cli-path { color: #58a6ff; font-weight: 600; }
    .cli-git { color: #d29922; font-size: 12.5px; }
    .cli-cmd { color: #ffffff; font-weight: 600; }

    /* Output Blocks */
    .cli-output-block { margin-bottom: 36px; padding-left: 4px; }
    .hero-name-big {
      font-family: var(--font-mono);
      font-size: clamp(32px, 5vw, 44px);
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin-bottom: 8px;
    }
    .hero-role-cli {
      font-family: var(--font-mono);
      font-size: 17px;
      color: var(--accent);
      margin-bottom: 16px;
    }
    .hero-bio-cli {
      font-size: 15px;
      color: #c9d1d9;
      line-height: 1.7;
      max-width: 720px;
      margin-bottom: 24px;
    }
    .cli-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-cli {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      color: #ffffff;
      transition: all 0.15s ease;
    }
    .btn-cli:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }
    .btn-cli-primary { background: var(--accent); color: #000000; border-color: var(--accent); }
    .btn-cli-primary:hover { opacity: 0.9; color: #000; }

    /* GitHub Repository Cards Grid */
    .repo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; margin-top: 12px; }
    .repo-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
    }
    .repo-card:hover {
      border-color: #58a6ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
    .repo-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .repo-title {
      font-family: var(--font-mono);
      font-size: 15.5px;
      font-weight: 700;
      color: #58a6ff;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .repo-title:hover { text-decoration: underline; }
    .repo-visibility {
      font-size: 11px;
      font-family: var(--font-mono);
      color: var(--muted);
      border: 1px solid var(--card-border);
      padding: 2px 7px;
      border-radius: 999px;
    }
    .repo-desc { font-size: 13.5px; color: var(--text); line-height: 1.55; margin-bottom: 16px; flex: 1; }
    .repo-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted);
    }
    .lang-pill { display: inline-flex; align-items: center; gap: 6px; }
    .lang-dot { width: 9px; height: 9px; border-radius: 50%; }

    /* Tech Stack JSON Box */
    .json-box {
      background: #090d16;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 18px 22px;
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.6;
      color: #e6edf3;
      overflow-x: auto;
    }
    .json-key { color: #7ee787; }
    .json-val { color: #a5d6ff; }
    .json-num { color: #ff7b72; }

    /* Experience CLI Timeline */
    .exp-cli-item {
      padding: 14px 18px;
      border-left: 2px solid var(--card-border);
      margin-left: 8px;
      margin-bottom: 16px;
      position: relative;
    }
    .exp-cli-item::before {
      content: '';
      position: absolute;
      left: -6px;
      top: 18px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent);
      border: 2px solid var(--term-bg);
    }
    .exp-cli-title { font-family: var(--font-mono); font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .exp-cli-meta { font-family: var(--font-mono); font-size: 12.5px; color: var(--accent); margin-bottom: 8px; }
    .exp-cli-desc { font-size: 14px; color: var(--text); line-height: 1.6; }

    /* Interactive Command Bar at Bottom */
    .cmd-bar {
      margin-top: 40px;
      padding: 16px 20px;
      background: var(--term-bar);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .cmd-shortcuts { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
    .shortcut-pill {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 3px 10px;
      border-radius: 4px;
      color: #ffffff;
      cursor: pointer;
    }
    .shortcut-pill:hover { border-color: var(--accent); color: var(--accent); }

    @media (max-width: 768px) {
      .terminal-body { padding: 24px 18px; }
      .repo-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Terminal Window -->
    <div class="terminal-window">
      <!-- Title Bar -->
      <div class="terminal-titlebar">
        <div class="traffic-lights">
          <span class="t-dot t-red"></span>
          <span class="t-dot t-yellow"></span>
          <span class="t-dot t-green"></span>
        </div>
        <div class="terminal-title">alex@arch-linux: ~/portfolio (zsh) &mdash; 120&times;36</div>
        <div class="terminal-status-badge">&bull; 0 warnings</div>
      </div>

      <!-- Terminal Body -->
      <div class="terminal-body">
        <!-- Command 1: whoami -->
        <div class="cli-command-row">
          <span class="cli-prompt">alex@edge-mesh</span>
          <span class="cli-path">~</span>
          <span class="cli-git">git:(<span style="color:#f78166;">main</span>)</span>
          <span class="cli-cmd">$ whoami --verbose</span>
        </div>

        <div class="cli-output-block">
          <h1 class="hero-name-big">${escapeHtml(hero.headline || site.title)}</h1>
          <div class="hero-role-cli">&gt; ${escapeHtml(hero.tagline || 'Systems & Edge Platform Architect')}</div>
          <p class="hero-bio-cli">${escapeHtml(hero.bio || site.description || 'Writing high-throughput distributed systems in Rust, TypeScript, and WebAssembly with sub-15ms global edge latency.')}</p>
          <div class="cli-actions">
            <a href="https://github.com/example" target="_blank" class="btn-cli btn-cli-primary">🐙 GitHub Profile</a>
            <a href="mailto:${site.seo_config?.contactEmail || 'alex@example.dev'}" class="btn-cli">✉️ Send Message</a>
            <a href="/feed.xml" class="btn-cli">📡 RSS Feed</a>
          </div>
        </div>

        <!-- Command 2: list repositories -->
        <div class="cli-command-row">
          <span class="cli-prompt">alex@edge-mesh</span>
          <span class="cli-path">~/projects</span>
          <span class="cli-git">git:(<span style="color:#f78166;">main</span>)</span>
          <span class="cli-cmd">$ ./list-repos.sh --featured --sort=stars</span>
        </div>

        <div class="cli-output-block">
          <div class="repo-grid">
            ${projects.length > 0 ? projects.map(proj => `
              <div class="repo-card">
                <div>
                  <div class="repo-top">
                    <a href="${sanitizeUrl(proj.githubUrl || proj.liveUrl || '#')}" target="_blank" class="repo-title">
                      <span>📦 ${escapeHtml(proj.title)}</span>
                    </a>
                    <span class="repo-visibility">Public</span>
                  </div>
                  <p class="repo-desc">${escapeHtml(proj.description || '')}</p>
                </div>
                <div class="repo-meta">
                  <span class="lang-pill">
                    <span class="lang-dot" style="background:#dea584;"></span> Rust
                  </span>
                  <span>⭐ 1.2k</span>
                  <span>🍴 184</span>
                  <span>MIT</span>
                </div>
              </div>
            `).join('') : `
              <div class="repo-card">
                <div>
                  <div class="repo-top">
                    <a href="https://github.com/example/edge-mesh" target="_blank" class="repo-title">
                      <span>📦 edge-mesh-runtime</span>
                    </a>
                    <span class="repo-visibility">Public</span>
                  </div>
                  <p class="repo-desc">Microsecond distributed in-memory cache synchronizer and edge routing layer deployed across 300+ CDN points of presence.</p>
                </div>
                <div class="repo-meta">
                  <span class="lang-pill"><span class="lang-dot" style="background:#dea584;"></span> Rust</span>
                  <span>⭐ 2,840</span>
                  <span>🍴 312</span>
                  <span>MIT</span>
                </div>
              </div>

              <div class="repo-card">
                <div>
                  <div class="repo-top">
                    <a href="https://github.com/example/zero-runtime" target="_blank" class="repo-title">
                      <span>📦 zero-runtime-compiler</span>
                    </a>
                    <span class="repo-visibility">Public</span>
                  </div>
                  <p class="repo-desc">Zero-hydration static HTML &amp; token compiler delivering 100/100 Lighthouse performance with pure semantic CSS.</p>
                </div>
                <div class="repo-meta">
                  <span class="lang-pill"><span class="lang-dot" style="background:#3178c6;"></span> TypeScript</span>
                  <span>⭐ 1,420</span>
                  <span>🍴 190</span>
                  <span>Apache-2.0</span>
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- Command 3: cat stack -->
        <div class="cli-command-row">
          <span class="cli-prompt">alex@edge-mesh</span>
          <span class="cli-path">~/config</span>
          <span class="cli-cmd">$ cat environment.json</span>
        </div>

        <div class="cli-output-block">
          <div class="json-box">{
  <span class="json-key">"runtimes"</span>: [<span class="json-val">"Cloudflare Workers"</span>, <span class="json-val">"Node.js"</span>, <span class="json-val">"WebAssembly"</span>],
  <span class="json-key">"languages"</span>: [<span class="json-val">"Rust"</span>, <span class="json-val">"TypeScript"</span>, <span class="json-val">"Go"</span>, <span class="json-val">"SQL"</span>],
  <span class="json-key">"databases"</span>: [<span class="json-val">"PostgreSQL"</span>, <span class="json-val">"Cloudflare D1"</span>, <span class="json-val">"Redis"</span>],
  <span class="json-key">"median_latency_ms"</span>: <span class="json-num">4.2</span>,
  <span class="json-key">"lighthouse_score"</span>: <span class="json-num">100</span>
}</div>
        </div>

        <!-- Command 4: career telemetry -->
        <div class="cli-command-row">
          <span class="cli-prompt">alex@edge-mesh</span>
          <span class="cli-path">~</span>
          <span class="cli-cmd">$ git log --oneline --graph -n 3</span>
        </div>

        ${experience.length > 0 ? `
        <div class="cli-output-block">
          ${experience.map(exp => `
            <div class="exp-cli-item">
              <div class="exp-cli-title">${escapeHtml(exp.role || exp.title || 'Staff Engineer')} &middot; ${escapeHtml(exp.company || 'Tech Labs')}</div>
              <div class="exp-cli-meta">${escapeHtml(exp.period || exp.year || '2022 — Present')}</div>
              <p class="exp-cli-desc">${escapeHtml(exp.description || '')}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- Command Bar Shortcuts -->
        <div class="cmd-bar">
          <div class="cmd-shortcuts">
            <span>Quick Shortcuts:</span>
            <a href="https://github.com/example" target="_blank" class="shortcut-pill">git remote -v</a>
            <a href="mailto:${site.seo_config?.contactEmail || 'alex@example.dev'}" class="shortcut-pill">mail -s "hello"</a>
            <span class="shortcut-pill" onclick="window.scrollTo({top:0, behavior:'smooth'})">clear &amp;&amp; top</span>
          </div>
          <div style="font-family:var(--font-mono); font-size:12px; color:var(--muted);">
            TTY: /dev/pts/0 (utf-8)
          </div>
        </div>
      </div>
    </div>
  </div>

  ${renderClientScript()}
</body>
</html>`;
}
