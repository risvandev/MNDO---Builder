// ==============================================================================
// TEMPLATE 3: STUDENT / ACADEMIC SCHOLAR (HUGO BLOX / WOWCHEMY ACADEMIC INSPIRED)
// The gold-standard academic portfolio used by researchers, PhDs, and professors.
// Features scholarly serif typography, publication citation badges, BibTeX toggles,
// research interest clouds, Google Scholar / ORCID badges, and CV download.
// ==============================================================================
import { escapeHtml, sanitizeUrl, sanitizeColor } from './sanitizer.js';
import { renderHead, renderNav, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderAcademic(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const education = content.education || [];
  const skills = content.skills || []; // Research interests / topics
  const projects = content.projects || []; // Publications & research projects
  const experience = content.experience || []; // Appointments / teaching
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#1e3a8a'); // Deep academic oxford navy
  const fontPair = FONT_PAIRS['merriweather-roboto'] || FONT_PAIRS['lora-merriweather'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, `${hero.headline || site.title} - Academic Profile`, site.description, currentPath)}
  <style>
    :root {
      --bg: #ffffff;
      --paper: #f8fafc;
      --card-bg: #ffffff;
      --text: #334155;
      --heading: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --border-soft: #f1f5f9;
      --accent: ${primaryColor};
      --accent-soft: rgba(30, 58, 138, 0.08);
      --font-serif: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.7;
      font-size: 15.5px;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--accent); text-decoration: none; transition: all 0.15s ease; }
    a:hover { text-decoration: underline; }
    .container { max-width: 980px; margin: 0 auto; padding: 0 28px; }

    /* Academic Header & Nav */
    .site-header {
      border-bottom: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-container {
      max-width: 980px;
      margin: 0 auto;
      padding: 16px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-link {
      font-family: var(--font-serif);
      font-size: 19px;
      font-weight: 700;
      color: var(--heading);
      letter-spacing: -0.01em;
    }
    .nav-menu { display: flex; gap: 24px; }
    .nav-link { font-size: 14px; font-weight: 500; color: var(--muted); }
    .nav-link:hover, .nav-link.active { color: var(--accent); font-weight: 600; text-decoration: none; }

    /* Hugo Blox Two-Column Profile Hero */
    .profile-hero {
      padding: 64px 0 48px;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 56px;
      border-bottom: 1px solid var(--border);
    }
    
    /* Left Scholar Card */
    .scholar-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .scholar-avatar {
      width: 170px;
      height: 170px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      border: 4px solid #ffffff;
      outline: 1px solid var(--border);
      margin-bottom: 20px;
      background: #f1f5f9;
    }
    .scholar-name {
      font-family: var(--font-serif);
      font-size: 24px;
      font-weight: 700;
      color: var(--heading);
      margin-bottom: 4px;
      line-height: 1.2;
    }
    .scholar-title {
      font-size: 14px;
      color: var(--muted);
      font-weight: 500;
      margin-bottom: 4px;
    }
    .scholar-affil {
      font-size: 13.5px;
      color: var(--heading);
      font-weight: 600;
      margin-bottom: 18px;
    }

    /* Academic Badges (Scholar, ORCID, arXiv, GitHub) */
    .scholar-badges {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    .scholar-badge-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 4px;
      background: var(--paper);
      border: 1px solid var(--border);
      font-size: 11.5px;
      font-weight: 600;
      color: var(--muted);
      transition: all 0.15s ease;
    }
    .scholar-badge-link:hover {
      background: #e2e8f0;
      color: var(--heading);
      text-decoration: none;
    }

    .btn-download-cv {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      background: var(--accent);
      color: #ffffff;
      border-radius: 6px;
      font-size: 13.5px;
      font-weight: 600;
      transition: opacity 0.15s ease;
    }
    .btn-download-cv:hover { opacity: 0.92; text-decoration: none; }

    /* Right Bio & Metrics Area */
    .scholar-main { display: flex; flex-direction: column; justify-content: center; }
    .section-headline {
      font-family: var(--font-serif);
      font-size: 24px;
      font-weight: 700;
      color: var(--heading);
      margin-bottom: 16px;
    }
    .bio-prose p { margin-bottom: 16px; line-height: 1.75; font-size: 15.5px; color: var(--text); }
    .bio-prose p strong { color: var(--heading); }

    /* Academic Metrics Grid */
    .metrics-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: var(--paper);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px 20px;
      margin-top: 12px;
      margin-bottom: 24px;
      text-align: center;
    }
    .metric-value { font-family: var(--font-serif); font-size: 22px; font-weight: 700; color: var(--accent); }
    .metric-label { font-size: 11.5px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Research Interests Cloud */
    .interests-wrap { margin-top: 12px; }
    .interests-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 10px; }
    .interests-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
    .interest-tag {
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid rgba(30, 58, 138, 0.15);
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 600;
    }

    /* Content Sections */
    .academic-section { padding: 48px 0; border-bottom: 1px solid var(--border); }
    .section-title-wrap {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 28px;
      border-bottom: 2px solid var(--border);
      padding-bottom: 12px;
    }
    .academic-section-title {
      font-family: var(--font-serif);
      font-size: 22px;
      font-weight: 700;
      color: var(--heading);
      position: relative;
    }
    .academic-section-title::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -14px;
      width: 48px;
      height: 2px;
      background: var(--accent);
    }

    /* Publications List & Hugo Blox Action Buttons */
    .pub-list { display: flex; flex-direction: column; gap: 24px; }
    .pub-item {
      padding: 20px 22px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }
    .pub-item:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04); }
    .pub-title {
      font-family: var(--font-serif);
      font-size: 17.5px;
      font-weight: 700;
      color: var(--heading);
      margin-bottom: 6px;
      line-height: 1.4;
    }
    .pub-title a { color: var(--heading); }
    .pub-title a:hover { color: var(--accent); }
    .pub-authors { font-size: 14px; color: var(--muted); margin-bottom: 6px; }
    .pub-authors strong { color: var(--heading); font-weight: 700; }
    .pub-venue {
      font-size: 13.5px;
      color: var(--accent);
      font-style: italic;
      margin-bottom: 14px;
    }
    .pub-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .pub-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 12px;
      border-radius: 4px;
      background: var(--paper);
      border: 1px solid var(--border);
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .pub-btn:hover { background: #e2e8f0; color: var(--heading); text-decoration: none; }
    .pub-btn-primary { background: var(--accent-soft); color: var(--accent); border-color: rgba(30, 58, 138, 0.2); }
    
    /* BibTeX Snippet Box */
    .bibtex-box {
      display: none;
      margin-top: 14px;
      background: #0f172a;
      color: #e2e8f0;
      padding: 14px 18px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
      line-height: 1.5;
      overflow-x: auto;
    }
    .bibtex-box.open { display: block; }

    /* Education Chronology */
    .edu-timeline { display: flex; flex-direction: column; gap: 20px; }
    .edu-card {
      padding: 16px 20px;
      background: var(--paper);
      border-left: 3px solid var(--accent);
      border-radius: 0 6px 6px 0;
    }
    .edu-degree { font-family: var(--font-serif); font-size: 16.5px; font-weight: 700; color: var(--heading); margin-bottom: 2px; }
    .edu-institution { font-size: 14px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
    .edu-meta { font-size: 12.5px; color: var(--muted); margin-bottom: 8px; }
    .edu-details { font-size: 14px; color: var(--text); }

    /* Footer */
    .academic-footer { padding: 40px 0; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); background: var(--paper); }
    .footer-inner { display: flex; justify-content: space-between; align-items: center; }

    @media (max-width: 860px) {
      .profile-hero { grid-template-columns: 1fr; gap: 32px; text-align: center; }
      .metrics-bar { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
    }
  </style>
</head>
<body>
  <!-- Academic Header -->
  <header class="site-header">
    <div class="nav-container">
      <a href="#about" class="brand-link">${escapeHtml(hero.headline || site.title)}</a>
      <nav class="nav-menu">
        <a href="#about" class="nav-link">About</a>
        <a href="#publications" class="nav-link">Publications</a>
        <a href="#education" class="nav-link">Education</a>
        <a href="#contact" class="nav-link">Contact</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <!-- Two-Column Profile Hero Block -->
    <section class="profile-hero" id="about">
      <!-- Left Column: Identity Card -->
      <aside class="scholar-card">
        ${hero.avatarUrl ? `<img src="${sanitizeUrl(hero.avatarUrl)}" alt="${escapeHtml(hero.headline || site.title)}" class="scholar-avatar" />` : ''}
        <h1 class="scholar-name">${escapeHtml(hero.headline || site.title)}</h1>
        ${hero.tagline ? `<div class="scholar-title">${escapeHtml(hero.tagline)}</div>` : ''}

        <div class="scholar-badges">
          ${site.seo_config?.googleScholarUrl ? `<a href="${sanitizeUrl(site.seo_config.googleScholarUrl)}" target="_blank" rel="noopener noreferrer" class="scholar-badge-link" title="Google Scholar Profile">🎓 Google Scholar</a>` : ''}
          ${site.seo_config?.orcidUrl ? `<a href="${sanitizeUrl(site.seo_config.orcidUrl)}" target="_blank" rel="noopener noreferrer" class="scholar-badge-link" title="ORCID Record">🆔 ORCID</a>` : ''}
          ${site.seo_config?.githubUrl ? `<a href="${sanitizeUrl(site.seo_config.githubUrl)}" target="_blank" rel="noopener noreferrer" class="scholar-badge-link" title="GitHub">🐙 GitHub</a>` : ''}
        </div>

        <a href="#contact" class="btn-download-cv">
          <span>✉️</span> Get in Touch
        </a>
      </aside>

      <!-- Right Column: Biography & Topics -->
      <div class="scholar-main">
        <h2 class="section-headline">Biography</h2>
        <div class="bio-prose">
          <p>${escapeHtml(about.body || hero.bio || site.description || '')}</p>
        </div>

        ${skills.length > 0 ? `
        <!-- Research Interests Cloud -->
        <div class="interests-wrap">
          <div class="interests-title">Research Interests</div>
          <div class="interests-cloud">
            ${skills.map(s => `<span class="interest-tag">${escapeHtml(s.name || s)}</span>`).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    </section>

    ${projects.length > 0 ? `
    <!-- Selected Publications Section -->
    <section class="academic-section" id="publications">
      <div class="section-title-wrap">
        <h2 class="academic-section-title">Selected Publications &amp; Works</h2>
      </div>

      <div class="pub-list">
        ${projects.map((proj, idx) => `
          <article class="pub-item">
            <h3 class="pub-title">
              ${proj.liveUrl ? `<a href="${sanitizeUrl(proj.liveUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(proj.title)}</a>` : escapeHtml(proj.title)}
            </h3>
            <div class="pub-authors">
              <strong>${escapeHtml(hero.headline || site.title)}</strong>
            </div>
            <p style="font-size:14px; color:var(--text); margin-bottom:14px; line-height:1.6;">${escapeHtml(proj.description || '')}</p>
            <div class="pub-actions">
              ${proj.liveUrl ? `<a href="${sanitizeUrl(proj.liveUrl)}" class="pub-btn pub-btn-primary" target="_blank" rel="noopener noreferrer">📄 Link / Article</a>` : ''}
              ${proj.githubUrl ? `<a href="${sanitizeUrl(proj.githubUrl)}" class="pub-btn" target="_blank" rel="noopener noreferrer">💻 Code</a>` : ''}
              <button class="pub-btn btn-cite-toggle" data-bib="bib-${idx}">💬 Cite (BibTeX)</button>
            </div>
            <div class="bibtex-box" id="bib-${idx}">@misc{item_${idx + 1},
  title={${escapeHtml(proj.title)}},
  author={${escapeHtml(hero.headline || site.title)}},
  year={${new Date().getFullYear()}}
}</div>
          </article>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${education.length > 0 ? `
    <!-- Education Section -->
    <section class="academic-section" id="education">
      <div class="section-title-wrap">
        <h2 class="academic-section-title">Education &amp; Credentials</h2>
      </div>

      <div class="edu-timeline">
        ${education.map(edu => `
          <div class="edu-card">
            <div class="edu-degree">${escapeHtml(edu.degree || 'Degree')}</div>
            <div class="edu-institution">${escapeHtml(edu.institution || 'Institution')}</div>
            <div class="edu-meta">${escapeHtml(edu.year || '')}</div>
            ${edu.details ? `<p class="edu-details">${escapeHtml(edu.details)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Contact & Inquiries -->
    <section class="academic-section" id="contact" style="border-bottom:none;">
      <div class="section-title-wrap">
        <h2 class="academic-section-title">Contact &amp; Inquiries</h2>
      </div>

      <div style="background:var(--paper); padding:28px; border-radius:8px; border:1px solid var(--border);">
        <p style="font-size:14.5px; color:var(--text); line-height:1.7; margin-bottom:16px;">
          For collaboration, preprint requests, or speaking inquiries, please reach out via email.
        </p>
        <a href="mailto:${site.seo_config?.contactEmail || 'contact@example.com'}" style="font-weight:600; font-size:15px; color:var(--accent);">
          ${site.seo_config?.contactEmail || 'Send Email'} &rarr;
        </a>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="academic-footer">
    <div class="container footer-inner">
      <div>&copy; ${new Date().getFullYear()} ${escapeHtml(hero.headline || site.title)}. All scholarly publications archived with open-access preprint links.</div>
      <div>Hosted on global edge nodes with zero hydration overhead.</div>
    </div>
  </footer>

  <script>
    // BibTeX toggler
    document.querySelectorAll('.btn-cite-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var targetId = btn.getAttribute('data-bib');
        var box = document.getElementById(targetId);
        if (box) {
          box.classList.toggle('open');
          btn.textContent = box.classList.contains('open') ? '▲ Close BibTeX' : '💬 Cite (BibTeX)';
        }
      });
    });
  </script>
  ${renderClientScript()}
</body>
</html>`;
}
