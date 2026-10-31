// ==============================================================================
// TEMPLATE 8: SMALL BUSINESS
// Services, introduction, testimonials, gallery, business info & contact form.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown, sanitizeColor } from './sanitizer.js';
import { renderHead, renderNav, renderContactForm, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderBusiness(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const services = content.services || [];
  const testimonials = content.testimonials || [];
  const gallery = content.gallery || [];
  const contact = content.contact || {};
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#0284c7'); // Professional Sky Blue
  const fontPair = FONT_PAIRS['playfair-plus'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #ffffff;
      --card-bg: #f8fafc;
      --border: #e2e8f0;
      --text: #334155;
      --heading: #0f172a;
      --muted: #64748b;
      --accent: ${primaryColor};
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.6; }
    a { color: var(--accent); text-decoration: none; }
    .container { max-width: 1040px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .site-header { background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .nav-container { max-width: 1040px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-heading); font-size: 22px; font-weight: 700; color: var(--heading); }
    .nav-menu { display: flex; gap: 24px; align-items: center; }
    .nav-link { font-size: 14px; font-weight: 600; color: var(--muted); }
    .nav-link:hover, .nav-link.active { color: var(--accent); }
    .nav-toggle { display: none; background: none; border: none; font-size: 22px; cursor: pointer; }

    /* Hero */
    .hero-section { padding: 80px 0 64px; text-align: center; background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%); border-bottom: 1px solid var(--border); }
    .hero-title { font-family: var(--font-heading); font-size: clamp(36px, 5.5vw, 56px); font-weight: 800; color: var(--heading); line-height: 1.15; margin-bottom: 16px; max-width: 820px; margin-left: auto; margin-right: auto; }
    .hero-tag { font-size: 20px; color: var(--muted); margin-bottom: 32px; max-width: 680px; margin-left: auto; margin-right: auto; }
    .hero-actions { display: flex; gap: 16px; justify-content: center; }
    .btn { display: inline-flex; align-items: center; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 8px; transition: transform 0.2s, opacity 0.2s; }
    .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); }
    .btn-primary:hover { transform: translateY(-2px); opacity: 0.95; }
    .btn-secondary { background: #fff; border: 1px solid var(--border); color: var(--heading); }
    .btn-secondary:hover { background: #f8fafc; }

    /* Sections */
    .section { padding: 64px 0; }
    .section-head { text-align: center; max-width: 640px; margin: 0 auto 48px; }
    .section-eyebrow { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 8px; }
    .section-title { font-family: var(--font-heading); font-size: 32px; font-weight: 800; color: var(--heading); }

    /* Services Grid */
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; }
    .service-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 32px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s, border-color 0.2s; }
    .service-card:hover { transform: translateY(-4px); border-color: var(--accent); }
    .service-title { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--heading); margin-bottom: 10px; }
    .service-desc { font-size: 15px; color: var(--text); line-height: 1.6; margin-bottom: 16px; flex-grow: 1; }
    .service-price { font-size: 18px; font-weight: 800; color: var(--accent); }

    /* About Section */
    .about-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
    .about-content h2 { font-family: var(--font-heading); font-size: 32px; font-weight: 800; color: var(--heading); margin-bottom: 16px; }
    .about-content p { font-size: 16px; line-height: 1.7; margin-bottom: 16px; }

    /* Testimonials */
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .testimonial-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 28px; }
    .test-stars { color: #f59e0b; font-size: 16px; margin-bottom: 12px; }
    .test-text { font-size: 15px; color: var(--text); font-style: italic; margin-bottom: 16px; line-height: 1.6; }
    .test-author { font-weight: 700; color: var(--heading); font-size: 14px; }
    .test-comp { font-size: 12px; color: var(--muted); }

    /* Gallery */
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .gallery-img { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); }

    /* Contact & Info Grid */
    .contact-box { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 40px; display: grid; grid-template-columns: 1fr 1.2fr; gap: 48px; }
    .biz-details { display: flex; flex-direction: column; gap: 20px; }
    .biz-item-title { font-weight: 700; color: var(--heading); font-size: 14px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    .biz-item-text { font-size: 15px; color: var(--text); }

    /* Footer */
    .site-footer { background: #0f172a; color: #94a3b8; padding: 48px 0; font-size: 14px; }
    .footer-container { max-width: 1040px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }
    .platform-badge a { color: #cbd5e1; }
    .platform-badge span { color: #38bdf8; font-weight: 700; }

    @media (max-width: 768px) {
      .about-wrap { grid-template-columns: 1fr; }
      .contact-box { grid-template-columns: 1fr; gap: 32px; }
      .nav-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: #fff; padding: 20px; border-bottom: 1px solid var(--border); }
      .nav-menu.open { display: flex; }
      .nav-toggle { display: block; }
    }
  </style>
</head>
<body>
  ${renderNav(site, pages, currentPath)}
  <main>
    <section class="hero-section" id="hero">
      <div class="container">
        <h1 class="hero-title">${escapeHtml(hero.headline || site.title)}</h1>
        <p class="hero-tag">${escapeHtml(hero.tagline || hero.bio || site.description || '')}</p>
        <div class="hero-actions">
          ${hero.primaryCta?.text ? `<a href="${sanitizeUrl(hero.primaryCta.url || '#contact')}" class="btn btn-primary">${escapeHtml(hero.primaryCta.text)}</a>` : '<a href="#contact" class="btn btn-primary">Schedule Consultation</a>'}
          <a href="#services" class="btn btn-secondary">Explore Services</a>
        </div>
      </div>
    </section>

    ${services.length > 0 ? `
    <section class="section" id="services">
      <div class="container">
        <div class="section-head">
          <div class="section-eyebrow">What We Offer</div>
          <h2 class="section-title">Professional Services</h2>
        </div>
        <div class="services-grid">
          ${services.map(s => `
            <div class="service-card">
              <div>
                <h3 class="service-title">${escapeHtml(s.title)}</h3>
                <p class="service-desc">${escapeHtml(s.description || '')}</p>
              </div>
              ${s.price ? `<div class="service-price">${escapeHtml(s.price)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    ${about.body ? `
    <section class="section" style="background:#f8fafc; border-top:1px solid var(--border); border-bottom:1px solid var(--border);" id="about">
      <div class="container about-wrap">
        <div class="about-content">
          <h2>About Our Business</h2>
          <div class="prose">${renderSafeMarkdown(about.body)}</div>
        </div>
        ${hero.avatarUrl ? `<img src="${sanitizeUrl(hero.avatarUrl)}" alt="About us" style="width:100%; border-radius:12px; object-fit:cover; max-height:380px;">` : ''}
      </div>
    </section>
    ` : ''}

    ${testimonials.length > 0 ? `
    <section class="section" id="testimonials">
      <div class="container">
        <div class="section-head">
          <div class="section-eyebrow">Client Feedback</div>
          <h2 class="section-title">What Our Customers Say</h2>
        </div>
        <div class="testimonials-grid">
          ${testimonials.map(t => `
            <div class="testimonial-card">
              <div class="test-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p class="test-text">&ldquo;${escapeHtml(t.quote || '')}&rdquo;</p>
              <div class="test-author">${escapeHtml(t.name || '')}</div>
              <div class="test-comp">${escapeHtml(t.company || t.role || '')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    ${gallery.length > 0 ? `
    <section class="section" id="gallery">
      <div class="container">
        <div class="section-head">
          <div class="section-eyebrow">Photo Showcase</div>
          <h2 class="section-title">Our Work in Action</h2>
        </div>
        <div class="gallery-grid">
          ${gallery.map(g => `<img src="${sanitizeUrl(g.imageUrl)}" alt="${escapeHtml(g.caption || 'Business gallery')}" class="gallery-img">`).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <section class="section" id="contact">
      <div class="container">
        <div class="contact-box">
          <div class="biz-details">
            <div>
              <h3 style="font-family:var(--font-heading); font-size:24px; color:var(--heading); margin-bottom:12px;">Get In Touch</h3>
              <p style="color:var(--muted); font-size:15px;">Have questions about our services or need a quote? Contact our team directly.</p>
            </div>
            ${contact.phone ? `
              <div>
                <div class="biz-item-title">Phone</div>
                <div class="biz-item-text"><a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a></div>
              </div>
            ` : ''}
            ${contact.email ? `
              <div>
                <div class="biz-item-title">Email</div>
                <div class="biz-item-text"><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></div>
              </div>
            ` : ''}
            ${contact.location ? `
              <div>
                <div class="biz-item-title">Location</div>
                <div class="biz-item-text">${escapeHtml(contact.location)}</div>
              </div>
            ` : ''}
          </div>
          <div>
            ${renderContactForm(site)}
          </div>
        </div>
      </div>
    </section>
  </main>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
