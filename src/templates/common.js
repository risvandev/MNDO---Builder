// ==============================================================================
// MNDO BUILDER - SHARED TEMPLATE HELPERS & COMMON COMPONENTS
// ==============================================================================
import { escapeHtml, sanitizeUrl } from './sanitizer.js';
import { getBaseUrl } from './seo-generators.js';

export const FONT_PAIRS = {
  'inter-outfit': {
    name: 'Inter & Outfit (Modern Clean)',
    heading: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap'
  },
  'jetbrains-inter': {
    name: 'JetBrains Mono & Inter (Developer Tech)',
    heading: "'JetBrains Mono', monospace",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700&display=swap'
  },
  'merriweather-roboto': {
    name: 'Merriweather & Roboto (Academic Editorial)',
    heading: "'Merriweather', serif",
    body: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Roboto:wght@400;500;700&display=swap'
  },
  'playfair-plus': {
    name: 'Playfair & Plus Jakarta (Sophisticated Executive)',
    heading: "'Playfair Display', serif",
    body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
  },
  'syne-inter': {
    name: 'Syne & Inter (Creative Expressive)',
    heading: "'Syne', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@600;700;800&display=swap'
  }
};

/**
 * Generate standard HTML <head> with SEO tags, social cards, fonts, and responsive meta.
 */
export function renderHead(site, pageTitle = null, pageDescription = null, currentPath = '/') {
  const baseUrl = getBaseUrl(site);
  const canonicalUrl = `${baseUrl}${currentPath === '/' ? '' : currentPath}`;
  const title = pageTitle ? `${escapeHtml(pageTitle)} | ${escapeHtml(site.title)}` : escapeHtml(site.title || 'Personal Website');
  const description = escapeHtml(pageDescription || site.seo_config?.metaDescription || site.description || site.content?.hero?.tagline || '');
  const primaryColor = site.theme_config?.primaryColor || '#2563eb';
  const fontPairKey = site.theme_config?.fontPair || 'inter-outfit';
  const fontInfo = FONT_PAIRS[fontPairKey] || FONT_PAIRS['inter-outfit'];
  const discourage = Boolean(site.seo_config?.discourageSearch);
  const faviconUrl = site.theme_config?.faviconUrl ? sanitizeUrl(site.theme_config.faviconUrl) : '/favicon.ico';

  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  ${discourage ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  ${site.theme_config?.logoUrl ? `<meta property="og:image" content="${sanitizeUrl(site.theme_config.logoUrl)}">` : ''}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">

  <!-- Favicon & PWA -->
  <link rel="icon" href="${faviconUrl}">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="${primaryColor}">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontInfo.googleFontUrl}" rel="stylesheet">
  `;
}

/**
 * Render Header Navigation Bar
 */
export function renderNav(site, pages = [], currentPath = '/') {
  const siteTitle = escapeHtml(site.title || 'My Portfolio');
  const logoUrl = site.theme_config?.logoUrl ? sanitizeUrl(site.theme_config.logoUrl) : null;
  const isMultiPage = Array.isArray(pages) && pages.length > 0;

  // Build nav items
  let navItems = [];
  if (!isMultiPage) {
    // Single page anchor navigation
    navItems = [
      { label: 'About', href: '#about' },
      { label: 'Projects', href: '#projects' },
      { label: 'Experience', href: '#experience' },
      { label: 'Contact', href: '#contact' }
    ];
  } else {
    // Multi-page navigation
    navItems.push({ label: 'Home', href: '/', active: currentPath === '/' });
    for (const p of pages) {
      if (p.is_in_nav !== false && p.is_published !== false && p.path) {
        navItems.push({
          label: escapeHtml(p.title),
          href: p.path,
          active: currentPath === p.path
        });
      }
    }
  }

  // If blog exists, add blog link
  if (site.site_type === 'blog' || (site.posts && site.posts.length > 0)) {
    if (!navItems.some(n => n.href === '/blog')) {
      navItems.push({ label: 'Blog', href: '/blog', active: currentPath.startsWith('/blog') });
    }
  }

  const navLinksHtml = navItems.map(item => `
    <a href="${item.href}" class="nav-link ${item.active ? 'active' : ''}">${escapeHtml(item.label)}</a>
  `).join('\n');

  return `
  <header class="site-header">
    <div class="nav-container">
      <a href="/" class="brand-link">
        ${logoUrl ? `<img src="${logoUrl}" alt="${siteTitle}" class="brand-logo">` : ''}
        <span class="brand-text">${siteTitle}</span>
      </a>
      <button class="nav-toggle" aria-label="Toggle navigation" id="navToggle">
        <span class="hamburger"></span>
      </button>
      <nav class="nav-menu" id="navMenu">
        ${navLinksHtml}
      </nav>
    </div>
  </header>
  `;
}

/**
 * Render Interactive Contact Form
 */
export function renderContactForm(site) {
  const siteId = site.id;
  const heading = site.content?.contact?.heading || "Let's connect";
  const subheading = site.content?.contact?.subheading || "Send a message and I will get back to you shortly.";
  const directEmail = site.content?.contact?.email || site.content?.social?.email || null;

  return `
  <div class="contact-card">
    <div class="contact-info">
      <h3>${escapeHtml(heading)}</h3>
      <p>${escapeHtml(subheading)}</p>
      ${directEmail ? `<p class="direct-email">Email: <a href="mailto:${escapeHtml(directEmail)}">${escapeHtml(directEmail)}</a></p>` : ''}
    </div>
    <form class="site-contact-form" id="contactForm" data-site-id="${siteId}">
      <!-- Honeypot anti-spam field (hidden from real users) -->
      <div style="display:none !important;" aria-hidden="true">
        <label for="honeypot_field">Leave this empty</label>
        <input type="text" id="honeypot_field" name="_honeypot" tabindex="-1" autocomplete="off">
      </div>
      <div class="form-group">
        <label for="sender_name">Your Name</label>
        <input type="text" id="sender_name" name="name" required placeholder="Jane Doe" maxlength="100">
      </div>
      <div class="form-group">
        <label for="sender_email">Your Email</label>
        <input type="email" id="sender_email" name="email" required placeholder="jane@example.com" maxlength="120">
      </div>
      <div class="form-group">
        <label for="message_content">Message</label>
        <textarea id="message_content" name="message" rows="4" required placeholder="How can I help you?" maxlength="3000"></textarea>
      </div>
      <button type="submit" class="submit-btn" id="contactSubmitBtn">
        <span class="btn-text">Send Message</span>
        <span class="btn-spinner" style="display:none;">Sending...</span>
      </button>
      <div class="form-status" id="formStatus" role="status" aria-live="polite"></div>
    </form>
  </div>
  `;
}

/**
 * Render standard site footer
 */
export function renderFooter(site) {
  const year = new Date().getFullYear();
  const title = escapeHtml(site.title || 'Personal Website');
  return `
  <footer class="site-footer">
    <div class="footer-container">
      <p class="copyright">&copy; ${year} ${title}. All rights reserved.</p>
    </div>
  </footer>
  `;
}

/**
 * Standard client-side script for navigation toggle and AJAX contact form submission
 */
export function renderClientScript() {
  return `
  <script>
    (function() {
      // Mobile Navigation Toggle
      var toggle = document.getElementById('navToggle');
      var menu = document.getElementById('navMenu');
      if (toggle && menu) {
        toggle.addEventListener('click', function() {
          var open = menu.classList.toggle('open');
          toggle.setAttribute('aria-expanded', open);
        });
      }

      // Contact Form Submission
      var form = document.getElementById('contactForm');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          var btn = document.getElementById('contactSubmitBtn');
          var status = document.getElementById('formStatus');
          var siteId = form.getAttribute('data-site-id');
          var name = document.getElementById('sender_name').value;
          var email = document.getElementById('sender_email').value;
          var message = document.getElementById('message_content').value;
          var honeypot = document.getElementById('honeypot_field') ? document.getElementById('honeypot_field').value : '';

          btn.disabled = true;
          var textSpan = btn.querySelector('.btn-text');
          var spinSpan = btn.querySelector('.btn-spinner');
          if (textSpan) textSpan.style.display = 'none';
          if (spinSpan) spinSpan.style.display = 'inline';
          status.className = 'form-status';
          status.textContent = '';

          fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              siteId: siteId,
              name: name,
              email: email,
              message: message,
              _honeypot: honeypot
            })
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            btn.disabled = false;
            if (textSpan) textSpan.style.display = 'inline';
            if (spinSpan) spinSpan.style.display = 'none';
            if (data.success) {
              status.className = 'form-status success';
              status.textContent = data.message || 'Message sent successfully! Thank you.';
              form.reset();
            } else {
              status.className = 'form-status error';
              status.textContent = data.error || 'Failed to send message. Please try again.';
            }
          })
          .catch(function(err) {
            btn.disabled = false;
            if (textSpan) textSpan.style.display = 'inline';
            if (spinSpan) spinSpan.style.display = 'none';
            status.className = 'form-status error';
            status.textContent = 'Network error. Please try again later.';
          });
        });
      }
    })();
  </script>
  `;
}
