// ==============================================================================
// TEMPLATE 10: RESEARCH & PUBLICATION SCHOLAR (HUGO BLOX ACADEMIC / AL-FOLIO INSPIRED)
// Split layout for researchers, scientists, PhD candidates, and academics.
// Features publications with badges (PDF, Code, BibTeX, DOI) and sticky scholar card.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown } from './sanitizer.js';
import { renderHead, renderNav, renderContactForm, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderResearchScholar(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const skills = content.skills || []; // Research topics / keywords
  const projects = content.projects || []; // Publications & research projects
  const experience = content.experience || []; // Appointments / Teaching
  const education = content.education || []; // Degrees & Education
  const primaryColor = site.theme_config?.primaryColor || '#0369a1'; // Scholarly Navy/Blue
  const fontPair = FONT_PAIRS['merriweather-roboto'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #ffffff;
      --surface: #f8fafc;
      --text: #334155;
      --heading: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --accent: ${primaryColor};
      --font-serif: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.7; font-size: 16px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 1040px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .site-header { border-bottom: 1px solid var(--border); background: rgba(255, 255, 255, 0.95); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(8px); }
    .nav-container { max-width: 1040px; margin: 0 auto; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-serif); font-size: 19px; font-weight: 700; color: var(--heading); }
    .nav-menu { display: flex; gap: 20px; }
    .nav-link { font-size: 14px; font-weight: 500; color: var(--muted); }
    .nav-link:hover { color: var(--accent); }

    /* Scholar Split Layout */
    .scholar-layout { display: grid; grid-template-columns: 280px 1fr; gap: 48px; padding: 48px 0 80px; align-items: start; }

    /* Sticky Profile Sidebar */
    .scholar-sidebar { position: sticky; top: 88px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px 24px; text-align: center; }
    .profile-photo { width: 140px; height: 140px; border-radius: 50%; object-fit: cover; margin: 0 auto 16px; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .scholar-name { font-family: var(--font-serif); font-size: 22px; font-weight: 700; color: var(--heading); line-height: 1.25; margin-bottom: 6px; }
    .scholar-title { font-size: 14px; color: var(--accent); font-weight: 600; margin-bottom: 8px; }
    .scholar-affiliation { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.4; }
    
    .social-pills { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .social-pill { font-size: 12px; font-weight: 600; padding: 5px 12px; background: #ffffff; border: 1px solid var(--border); border-radius: 9999px; color: var(--heading); transition: all 0.15s; }
    .social-pill:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }

    .cv-btn { display: block; width: 100%; padding: 10px; font-size: 13px; font-weight: 600; text-align: center; background: var(--heading); color: #ffffff !important; border-radius: 6px; text-decoration: none !important; transition: opacity 0.15s; }
    .cv-btn:hover { opacity: 0.9; }

    /* Main Content Area */
    .scholar-main section { margin-bottom: 48px; }
    .section-title { font-family: var(--font-serif); font-size: 22px; font-weight: 700; color: var(--heading); margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    
    /* Bio */
    .bio-text { font-size: 16px; line-height: 1.8; color: var(--text); }
    .bio-text p { margin-bottom: 16px; }

    /* Research Interests Pills */
    .topics-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .topic-badge { font-size: 13px; font-weight: 500; padding: 6px 14px; background: #f1f5f9; color: var(--heading); border-radius: 6px; border: 1px solid var(--border); }

    /* Publications List (Hugo Blox Style) */
    .pub-card { padding: 18px 20px; background: #ffffff; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 16px; transition: border-color 0.15s; }
    .pub-card:hover { border-color: var(--accent); }
    .pub-title { font-family: var(--font-serif); font-size: 17px; font-weight: 700; color: var(--heading); line-height: 1.35; margin-bottom: 6px; }
    .pub-authors { font-size: 14px; color: var(--muted); margin-bottom: 8px; }
    .pub-desc { font-size: 14px; color: var(--text); line-height: 1.5; margin-bottom: 12px; }
    .pub-badges { display: flex; flex-wrap: wrap; gap: 8px; }
    .pub-badge-link { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 4px; border: 1px solid var(--border); background: var(--surface); color: var(--heading); transition: all 0.15s; }
    .pub-badge-link:hover { background: var(--accent); color: #ffffff; border-color: var(--accent); text-decoration: none; }

    /* Education & Appointments Timeline */
    .timeline-item { padding-left: 20px; border-left: 2px solid var(--border); margin-bottom: 20px; position: relative; }
    .timeline-item::before { content: ''; position: absolute; left: -6px; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); }
    .timeline-title { font-weight: 700; font-size: 16px; color: var(--heading); }
    .timeline-meta { font-size: 13px; color: var(--muted); margin-bottom: 4px; }
    .timeline-desc { font-size: 14px; color: var(--text); }

    /* Contact Card */
    .contact-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 24px; }

    /* Footer */
    .site-footer { border-top: 1px solid var(--border); padding: 36px 0; font-size: 13px; color: var(--muted); text-align: center; }

    @media (max-width: 860px) {
      .scholar-layout { grid-template-columns: 1fr; }
      .scholar-sidebar { position: static; }
    }
  </style>
</head>
<body>
  ${renderNav(site, pages, currentPath)}

  <main class="container">
    <div class="scholar-layout">
      <!-- Left Column: Sticky Scholar Identity Card -->
      <aside class="scholar-sidebar">
        ${hero.avatarUrl ? `<img src="${sanitizeUrl(hero.avatarUrl)}" alt="${escapeHtml(hero.headline || site.title)}" class="profile-photo">` : ''}
        <h1 class="scholar-name">${escapeHtml(hero.headline || site.title)}</h1>
        <div class="scholar-title">${escapeHtml(hero.tagline || 'Researcher & Academic')}</div>
        <div class="scholar-affiliation">${escapeHtml(hero.bio ? hero.bio.slice(0, 100) : 'Academic Department & Research Lab')}</div>

        <div class="social-pills">
          ${hero.primaryCta?.url ? `<a href="${sanitizeUrl(hero.primaryCta.url)}" target="_blank" rel="noopener" class="social-pill">Google Scholar</a>` : ''}
          <a href="#publications" class="social-pill">Publications</a>
          <a href="#contact" class="social-pill">Email</a>
        </div>

        <a href="#contact" class="cv-btn">Get in Touch / CV &rarr;</a>
      </aside>

      <!-- Right Column: Biography, Publications & Academics -->
      <div class="scholar-main">
        <!-- Biography & Overview -->
        <section id="about">
          <h2 class="section-title">Biography</h2>
          <div class="bio-text">
            ${about.body ? renderSafeMarkdown(about.body) : `<p>${escapeHtml(hero.bio || 'I conduct research in computer science, software engineering, and distributed architectures.')}</p>`}
          </div>

          ${skills.length > 0 ? `
            <div style="margin-top:24px;">
              <h3 style="font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--muted); margin-bottom:8px;">Research Interests</h3>
              <div class="topics-wrap">
                ${skills.map(s => `<span class="topic-badge">${escapeHtml(typeof s === 'string' ? s : s.name)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </section>

        <!-- Selected Publications & Research Projects -->
        <section id="publications">
          <h2 class="section-title">
            <span>Publications &amp; Works</span>
            <span style="font-size:13px; font-weight:600; color:var(--muted);">${projects.length} Papers</span>
          </h2>

          <div class="pub-list">
            ${projects.length === 0 ? `
              <div style="padding:32px; text-align:center; color:var(--muted); border:1px dashed var(--border); border-radius:8px;">
                No publications or papers listed yet.
              </div>
            ` : ''}

            ${projects.map(p => `
              <article class="pub-card">
                <h3 class="pub-title">${escapeHtml(p.title)}</h3>
                <div class="pub-authors">${escapeHtml(hero.headline || site.title)}${p.tags && p.tags.length ? ` &bull; <em>${escapeHtml(p.tags.join(', '))}</em>` : ''}</div>
                ${p.description ? `<p class="pub-desc">${escapeHtml(p.description)}</p>` : ''}
                <div class="pub-badges">
                  ${p.liveUrl ? `<a href="${sanitizeUrl(p.liveUrl)}" target="_blank" rel="noopener" class="pub-badge-link">PDF / Article ↗</a>` : ''}
                  ${p.githubUrl ? `<a href="${sanitizeUrl(p.githubUrl)}" target="_blank" rel="noopener" class="pub-badge-link">Code / Repo ↗</a>` : ''}
                  <span class="pub-badge-link" style="cursor:default;">Cite</span>
                </div>
              </article>
            `).join('')}
          </div>
        </section>

        <!-- Education & Credentials -->
        ${education.length > 0 ? `
          <section id="education">
            <h2 class="section-title">Education</h2>
            <div class="timeline-wrap">
              ${education.map(ed => `
                <div class="timeline-item">
                  <div class="timeline-title">${escapeHtml(ed.degree)}</div>
                  <div class="timeline-meta">${escapeHtml(ed.institution)} &bull; ${escapeHtml(ed.year)}</div>
                  ${ed.details ? `<div class="timeline-desc">${escapeHtml(ed.details)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Teaching / Appointments -->
        ${experience.length > 0 ? `
          <section id="experience">
            <h2 class="section-title">Appointments & Teaching</h2>
            <div class="timeline-wrap">
              ${experience.map(exp => `
                <div class="timeline-item">
                  <div class="timeline-title">${escapeHtml(exp.role)} @ ${escapeHtml(exp.company)}</div>
                  <div class="timeline-meta">${escapeHtml(exp.period || '')}</div>
                  ${exp.description ? `<div class="timeline-desc">${escapeHtml(exp.description)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Contact Section -->
        <section id="contact">
          <h2 class="section-title">Contact & Inquiries</h2>
          <div class="contact-card">
            ${renderContactForm(site, "Connect with Researcher")}
          </div>
        </section>
      </div>
    </div>
  </main>

  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
