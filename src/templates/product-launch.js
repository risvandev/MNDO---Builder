// ==============================================================================
// TEMPLATE 14: PRODUCT & SAAS LAUNCHPAD (CARRD & INDIE HACKERS INSPIRED)
// High-converting single-page landing for micro-SaaS, digital products, and tools.
// ==============================================================================
import { escapeHtml, sanitizeUrl } from './sanitizer.js';
import { renderHead, renderContactForm, renderClientScript, FONT_PAIRS } from './common.js';

export function renderProductLaunch(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const pages = siteData.pages || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const projects = content.projects || [];
  const skills = content.skills || [];
  const primaryColor = site.theme_config?.primaryColor || '#6366f1';
  const fontPair = FONT_PAIRS['inter-outfit'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --text: #f1f5f9;
      --heading: #ffffff;
      --muted: #94a3b8;
      --border: #1e293b;
      --accent: ${primaryColor};
      --accent-glow: rgba(99, 102, 241, 0.25);
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.6;
      font-size: 16px;
      overflow-x: hidden;
    }
    a { color: var(--accent); text-decoration: none; }
    .container { max-width: 1040px; margin: 0 auto; padding: 0 24px; }

    /* Top Nav */
    .launch-nav {
      position: sticky;
      top: 0;
      z-index: 90;
      background: rgba(9, 13, 22, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 16px 0;
    }
    .nav-inner { display: flex; justify-content: space-between; align-items: center; }
    .brand-logo { font-family: var(--font-heading); font-weight: 800; font-size: 18px; color: #fff; letter-spacing: -0.02em; }
    .nav-cta {
      display: inline-flex;
      align-items: center;
      padding: 8px 18px;
      background: var(--accent);
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      border-radius: 6px;
      transition: opacity 0.15s;
    }
    .nav-cta:hover { opacity: 0.9; text-decoration: none; }

    /* Hero Section */
    .hero-wrap {
      padding: 96px 0 64px;
      text-align: center;
      position: relative;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 24px;
    }
    .hero-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
    .hero-title {
      font-family: var(--font-heading);
      font-size: clamp(38px, 6vw, 64px);
      font-weight: 800;
      color: var(--heading);
      letter-spacing: -0.03em;
      line-height: 1.15;
      max-width: 820px;
      margin: 0 auto 20px;
    }
    .hero-lead {
      font-size: clamp(17px, 2.5vw, 20px);
      color: var(--muted);
      max-width: 640px;
      margin: 0 auto 36px;
      line-height: 1.6;
    }
    .hero-actions { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; }
    .btn-main {
      padding: 14px 32px;
      background: var(--accent);
      color: #fff;
      font-weight: 700;
      font-size: 15px;
      border-radius: 8px;
      box-shadow: 0 0 24px var(--accent-glow);
      transition: transform 0.15s;
    }
    .btn-main:hover { transform: translateY(-2px); text-decoration: none; }
    .btn-sub {
      padding: 14px 28px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--heading);
      font-weight: 600;
      font-size: 15px;
      border-radius: 8px;
    }
    .btn-sub:hover { background: rgba(255, 255, 255, 0.1); text-decoration: none; }

    /* Metrics Grid */
    .metrics-bar {
      margin: 48px 0 80px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 28px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      text-align: center;
    }
    .metric-value { font-family: var(--font-heading); font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 4px; }
    .metric-label { font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }

    /* Features Grid */
    .features-section { padding: 40px 0 80px; }
    .section-header { text-align: center; margin-bottom: 48px; }
    .section-eyebrow { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 8px; }
    .section-heading { font-family: var(--font-heading); font-size: 32px; font-weight: 800; color: var(--heading); }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    .feature-card {
      padding: 28px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      transition: border-color 0.2s;
    }
    .feature-card:hover { border-color: rgba(255, 255, 255, 0.2); }
    .feature-title { font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--heading); margin-bottom: 8px; }
    .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

    /* Conversion CTA Box */
    .cta-box {
      margin: 60px 0 80px;
      padding: 56px 36px;
      background: linear-gradient(180deg, #131b2e 0%, #0d121f 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      text-align: center;
      position: relative;
    }
    .cta-title { font-family: var(--font-heading); font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 12px; }
    .cta-desc { font-size: 16px; color: var(--muted); max-width: 520px; margin: 0 auto 28px; }

    /* Footer */
    .site-footer { border-top: 1px solid var(--border); padding: 36px 0; font-size: 13px; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <nav class="launch-nav">
    <div class="container nav-inner">
      <div class="brand-logo">${escapeHtml(site.title)}</div>
      <a href="#contact" class="nav-cta">Get Started &rarr;</a>
    </div>
  </nav>

  <main class="container">
    <section class="hero-wrap">
      <div class="hero-badge">
        <span class="hero-badge-dot"></span>
        <span>${escapeHtml(hero.tagline || 'Modern Software Architecture')}</span>
      </div>
      <h1 class="hero-title">${escapeHtml(hero.headline || site.title)}</h1>
      <p class="hero-lead">${escapeHtml(hero.bio || site.description || 'Fast, lightweight, and engineered for maximum conversion.')}</p>
      <div class="hero-actions">
        <a href="#contact" class="btn-main">Get Instant Access</a>
        <a href="#features" class="btn-sub">Explore Capabilities</a>
      </div>
    </section>

    <!-- Social Proof Metrics -->
    <div class="metrics-bar">
      <div>
        <div class="metric-value">&lt; 15ms</div>
        <div class="metric-label">Edge Response</div>
      </div>
      <div>
        <div class="metric-value">100%</div>
        <div class="metric-label">Static HTML</div>
      </div>
      <div>
        <div class="metric-value">99.99%</div>
        <div class="metric-label">Global Uptime</div>
      </div>
    </div>

    <!-- Features -->
    <section class="features-section" id="features">
      <div class="section-header">
        <div class="section-eyebrow">Engineered For Scale</div>
        <h2 class="section-heading">Core Capabilities &amp; Architecture</h2>
      </div>

      <div class="features-grid">
        ${projects.length > 0 ? projects.map(p => `
          <div class="feature-card">
            <h3 class="feature-title">${escapeHtml(p.title)}</h3>
            <p class="feature-desc">${escapeHtml(p.description || '')}</p>
          </div>
        `).join('') : `
          <div class="feature-card">
            <h3 class="feature-title">Ultra-Fast Edge CDN</h3>
            <p class="feature-desc">Distributed static assets served globally through Cloudflare Workers with microsecond response times.</p>
          </div>
          <div class="feature-card">
            <h3 class="feature-title">Zero Client Bloat</h3>
            <p class="feature-desc">100% pure semantic HTML and minimal CSS. No bloated client bundles, hydration delays, or tracking cookies.</p>
          </div>
          <div class="feature-card">
            <h3 class="feature-title">Automatic Subdomains &amp; SSL</h3>
            <p class="feature-desc">Instant free subdomains provisioned with automated HTTPS certificates and technical SEO configuration.</p>
          </div>
        `}
      </div>
    </section>

    <!-- Conversion Box & Contact -->
    <div class="cta-box" id="contact">
      <h2 class="cta-title">Ready to launch your project?</h2>
      <p class="cta-desc">Connect with us directly to configure your site or learn more about integration.</p>
      ${renderContactForm(site)}
    </div>
  </main>

  <footer class="site-footer">
    <div class="container">
      &copy; ${new Date().getFullYear()} ${escapeHtml(site.title)}. Built for speed.
    </div>
  </footer>
  ${renderClientScript()}
</body>
</html>`;
}
