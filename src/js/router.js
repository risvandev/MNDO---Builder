// ==============================================================================
// MNDO BUILDER - CLIENT-SIDE ROUTER & PUBLIC PLATFORM PAGES
// ==============================================================================
import { getCurrentUser, createSite, submitAbuseReport } from './supabase.js';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, resetPasswordForEmail, signOut } from './auth.js';
import { renderDashboard } from './dashboard.js';
import { renderEditor } from './editor.js';
import { TEMPLATES, renderSite } from '../templates/index.js';
import { validateSubdomainSlug, checkSubdomainAvailability } from './validation.js';
import { showToast } from './components/toast.js';
import { openModal } from './components/modal.js';
import { CONFIG } from './config.js';

export function initRouter() {
  // Listen for browser Back/Forward navigation
  window.addEventListener('popstate', handleRoute);

  // Backward compatibility: If an old #/ link is triggered, handle it
  window.addEventListener('hashchange', handleRoute);

  // Global link click interceptor for internal SPA routing
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;

    // Ignore external links, mailto, tel, target="_blank", or modifier keys
    if (
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      e.ctrlKey || e.metaKey || e.shiftKey || e.altKey
    ) {
      return;
    }

    // Intercept internal routing: starts with / or #
    if (href.startsWith('/') || href.startsWith('#')) {
      e.preventDefault();
      navigate(href);
    }
  });

  handleRoute();
}

/**
 * Programmatic SPA navigation without full page reload.
 * Automatically converts legacy hash paths ("#/dashboard" -> "/dashboard").
 * @param {string} to - Destination path (e.g. "/dashboard", "/create", "/editor/...")
 */
export function navigate(to) {
  if (!to) to = '/';
  if (to.startsWith('#')) {
    to = to.replace(/^#\/?/, '/');
  }
  if (!to.startsWith('/')) {
    to = '/' + to;
  }

  const current = window.location.pathname + window.location.search;
  if (current !== to) {
    window.history.pushState(null, '', to);
  }
  handleRoute();
}

export async function handleRoute() {
  // 1. Transparent legacy hash migration (e.g. /#/dashboard -> /dashboard)
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    const cleanFromHash = window.location.hash.replace(/^#\/?/, '/');
    window.history.replaceState(null, '', cleanFromHash);
  }

  // 2. Read clean pathname and query string
  let rawPath = window.location.pathname || '/';
  if (rawPath.length > 1 && rawPath.endsWith('/')) {
    rawPath = rawPath.slice(0, -1);
  }
  const queryString = window.location.search ? window.location.search.slice(1) : '';

  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Header & Footer visibility logic (Studio Editor has its own full-screen layout)
  const isStudio = rawPath.startsWith('/editor/');

  // Clean mount container
  appContainer.innerHTML = '';

  if (!isStudio) {
    appContainer.appendChild(createHeader());
  }

  const mainWrap = document.createElement('main');
  mainWrap.className = 'main-content';
  appContainer.appendChild(mainWrap);

  if (!isStudio) {
    appContainer.appendChild(createFooter());
  }

  // Route matching
  if (heroTypewriterTimer) {
    clearTimeout(heroTypewriterTimer);
    heroTypewriterTimer = null;
  }

  if (rawPath === '/' || rawPath === '') {
    renderHomePage(mainWrap);
  } else if (rawPath === '/templates') {
    renderTemplatesCatalog(mainWrap);
  } else if (rawPath === '/features') {
    renderFeaturesPage(mainWrap);
  } else if (rawPath === '/faq') {
    renderFaqPage(mainWrap);
  } else if (rawPath === '/privacy') {
    renderPrivacyPage(mainWrap);
  } else if (rawPath === '/terms') {
    renderTermsPage(mainWrap);
  } else if (rawPath === '/contact') {
    renderPlatformContactPage(mainWrap);
  } else if (rawPath === '/report-abuse') {
    renderReportAbusePage(mainWrap);
  } else if (rawPath === '/login' || rawPath === '/signin') {
    renderAuthPage(mainWrap, 'signin');
  } else if (rawPath === '/signup') {
    renderAuthPage(mainWrap, 'signup');
  } else if (rawPath === '/auth') {
    const params = new URLSearchParams(queryString || '');
    const m = params.get('mode') === 'signup' ? 'signup' : 'signin';
    renderAuthPage(mainWrap, m);
  } else if (rawPath === '/auth/callback') {
    renderAuthCallbackPage(mainWrap);
  } else if (rawPath === '/dashboard') {
    const user = await getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    await renderDashboard(mainWrap);
  } else if (rawPath === '/create') {
    const user = await getCurrentUser();
    if (!user) {
      showToast('Please log in or sign up to create your website and claim a subdomain.', 'info');
      const search = queryString ? '&' + queryString : '';
      navigate(`/signup?redirect=create${search}`);
      return;
    }
    renderCreateWizard(mainWrap);
  } else if (rawPath.startsWith('/editor/')) {
    const siteId = rawPath.replace('/editor/', '').split('/')[0].split('?')[0];
    await renderEditor(mainWrap, siteId);
  } else {
    render404Page(mainWrap);
  }

  window.scrollTo(0, 0);
}

// ------------------------------------------------------------------------------
// TOP NAVIGATION HEADER
// ------------------------------------------------------------------------------
function createHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';

  getCurrentUser().then(user => {
    const authActions = header.querySelector('#headerAuthActions');
    if (!authActions) return;
    if (user) {
      authActions.innerHTML = `
        <a href="/dashboard" class="btn btn-secondary btn-sm">Dashboard</a>
        <a href="/create" class="btn btn-primary btn-sm">+ New Site</a>
      `;
    } else {
      authActions.innerHTML = `
        <a href="/login" class="btn btn-secondary btn-sm">Log In</a>
        <a href="/signup" class="btn btn-primary btn-sm">Sign Up</a>
      `;
    }
  });

  header.innerHTML = `
    <div class="app-container">
      <div class="header-inner">
        <a href="/" class="brand-wrapper">
          <div class="brand-icon">M</div>
          <div>
            <span class="brand-title">MNDO<span class="brand-dot"></span> Builder</span>
          </div>
        </a>

        <nav class="main-nav">
          <a href="/templates" class="nav-item">Templates</a>
          <a href="/features" class="nav-item">Features</a>
          <a href="/faq" class="nav-item">FAQ</a>
          <a href="/contact" class="nav-item">Contact</a>
        </nav>

        <div class="nav-actions" id="headerAuthActions">
          <a href="/login" class="btn btn-secondary btn-sm">Log In</a>
          <a href="/signup" class="btn btn-primary btn-sm">Sign Up</a>
        </div>
      </div>
    </div>
  `;
  return header;
}

// ------------------------------------------------------------------------------
// FOOTER
// ------------------------------------------------------------------------------
function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="app-container">
      <div class="footer-grid">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            <div class="brand-icon" style="width:28px; height:28px; font-size:14px; border-radius:6px;">M</div>
            <span class="brand-title" style="font-size:18px;">MNDO<span class="brand-dot"></span> Builder</span>
          </div>
          <p style="color:var(--muted); font-size:13px; max-width:320px; line-height:1.6; margin-bottom:16px;">
            Lightweight website creation and publishing platform.
          </p>
          <div style="font-size:12px; color:var(--muted-light);">
            Powered by Cloudflare Workers &amp; Supabase.
          </div>
        </div>

        <div>
          <div class="footer-col-title">Product</div>
          <ul class="footer-links">
            <li><a href="/templates" class="footer-link">Templates</a></li>
            <li><a href="/features" class="footer-link">Features</a></li>
            <li><a href="/create" class="footer-link">Create Site</a></li>
            <li><a href="/dashboard" class="footer-link">Dashboard</a></li>
          </ul>
        </div>

        <div>
          <div class="footer-col-title">Support</div>
          <ul class="footer-links">
            <li><a href="/faq" class="footer-link">FAQ</a></li>
            <li><a href="/contact" class="footer-link">Contact</a></li>
            <li><a href="/report-abuse" class="footer-link">Report Abuse</a></li>
          </ul>
        </div>

        <div>
          <div class="footer-col-title">Legal</div>
          <ul class="footer-links">
            <li><a href="/privacy" class="footer-link">Privacy</a></li>
            <li><a href="/terms" class="footer-link">Terms</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div>&copy; ${year} MNDO Builder.</div>
        <div style="display:flex; gap:16px;">
          <span>Zero Paid APIs</span>
          <span>&bull;</span>
          <span>Zero React Runtime</span>
        </div>
      </div>
    </div>
  `;
  return footer;
}

// ------------------------------------------------------------------------------
// HERO TYPEWRITER WRITING EFFECT
// ------------------------------------------------------------------------------
let heroTypewriterTimer = null;

function startHeroTypewriter(container) {
  if (heroTypewriterTimer) {
    clearTimeout(heroTypewriterTimer);
    heroTypewriterTimer = null;
  }

  const typedEl = container.querySelector('#heroTypedWord');
  if (!typedEl) return;

  const phrases = [
    'Publish your portfolio.',
    'Claim your free subdomain.',
    'Host your resume online.',
    'Launch your personal blog.',
    'Build without code.'
  ];
  let phraseIdx = 0;
  let charIdx = phrases[0].length;
  let isDeleting = true;

  function typeStep() {
    if (!document.body.contains(typedEl)) return;

    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
      charIdx--;
      typedEl.textContent = currentPhrase.slice(0, charIdx);
      if (charIdx <= 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        heroTypewriterTimer = setTimeout(typeStep, 350);
        return;
      }
      heroTypewriterTimer = setTimeout(typeStep, 35);
    } else {
      charIdx++;
      typedEl.textContent = currentPhrase.slice(0, charIdx);
      if (charIdx >= currentPhrase.length) {
        isDeleting = true;
        heroTypewriterTimer = setTimeout(typeStep, 2400);
        return;
      }
      heroTypewriterTimer = setTimeout(typeStep, 70);
    }
  }

  heroTypewriterTimer = setTimeout(typeStep, 2200);
}

// ------------------------------------------------------------------------------
// PAGE 1: HOME LANDING PAGE (MINIMAL EDITORIAL)
// ------------------------------------------------------------------------------
function renderHomePage(container) {
  container.innerHTML = `
    <!-- Hero Section -->
    <section class="page-section" style="padding-top:72px; padding-bottom:72px; text-align:center;">
      <div class="app-container" style="display:flex; flex-direction:column; align-items:center;">
        
        <!-- Eyebrow Badge (Properly stacked in row, cannot collide with title) -->
        <div class="hero-eyebrow-wrap">
          <div class="hero-badge">
            <span class="pulse-beacon"></span>
            <span>MNDO Builder</span>
          </div>
        </div>

        <!-- Main Thin Title with Typewriter Writing Effect -->
        <h1 class="hero-thin-title">
          <span id="heroTypedWord">Publish your portfolio.</span><span class="typing-cursor">|</span>
        </h1>

        <!-- Hero Subtitle & Description (Slightly richer context) -->
        <p class="hero-subtext">
          Zero-code website publishing for students, developers, and creators.<br>
          Choose a starter design, customize in the studio, and claim a free <code style="font-family:var(--font-mono); font-size:13px; background:var(--paper-soft); padding:2px 8px; border-radius:6px; border:1px solid var(--line); color:var(--ink);">.mndo.online</code> address. Sign up to host online.
        </p>

        <!-- Mandatory Auth Action Buttons -->
        <div id="heroAuthActions" style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:32px;">
          <a href="/auth?mode=signup" class="btn btn-primary btn-lg" style="padding:12px 28px;">Sign Up</a>
          <a href="/auth?mode=signin" class="btn btn-secondary btn-lg" style="padding:12px 24px;">Log In</a>
        </div>

        <!-- Subdomain Claim Bar -->
        <div style="max-width:480px; width:100%; margin:0 auto; background:#ffffff; border:1px solid var(--line); border-radius:var(--radius-full); padding:6px 6px 6px 18px; box-shadow:0 4px 20px rgba(0,0,0,0.04); display:flex; align-items:center; gap:8px;">
          <span style="font-family:var(--font-mono); font-size:13px; color:var(--muted-light);">https://</span>
          <input type="text" id="homeSubdomainInput" placeholder="yourname" maxlength="32" style="border:none; outline:none; background:transparent; font-family:var(--font-mono); font-size:14px; color:var(--ink); flex:1; min-width:90px; padding:6px 2px;">
          <span style="font-family:var(--font-mono); font-size:13px; color:var(--muted); font-weight:500;">.${CONFIG.PLATFORM_DOMAIN}</span>
          <button class="btn btn-primary btn-sm" id="btnClaimSubdomain" style="padding:8px 18px; font-size:13px; border-radius:var(--radius-full);">Claim</button>
        </div>
        <div id="homeSubdomainStatus" style="font-size:12px; margin-top:10px; text-align:center; color:var(--muted); min-height:18px;"></div>

        <!-- Editorial Feature Badges -->
        <div class="hero-highlights">
          <span>⚡ 100/100 Performance</span>
          <span>&bull;</span>
          <span>🔒 Free Edge SSL</span>
          <span>&bull;</span>
          <span>🌐 Zero Server Fees</span>
          <span>&bull;</span>
          <span>📱 Fully Responsive</span>
        </div>
      </div>
    </section>

    <!-- SECTION 1: USE CASES (WHAT IT IS USED FOR) -->
    <section class="page-section page-section-alt" id="use-cases">
      <div class="app-container">
        <div class="section-headline">
          <span class="section-tag">Use Cases</span>
          <h2 class="section-title">Built for What You Create</h2>
          <p class="section-desc">Distraction-free, zero-code publishing tailored for students, developers, writers, and creators.</p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:24px;">
          <!-- 1. Portfolios -->
          <div class="card card-hover" style="display:flex; flex-direction:column; justify-content:space-between; background:#ffffff; padding:28px;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <span class="badge" style="background:var(--paper-soft); color:var(--muted); border:1px solid var(--line);">Developers &bull; Designers</span>
                <span style="font-size:22px;">💻</span>
              </div>
              <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:10px;">Portfolios</h3>
              <p style="font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:18px;">
                Showcase your featured projects, live demos, GitHub repositories, and tech stack in clean, responsive layouts that load instantly.
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px;">
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Project Gallery</span>
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Tech Stack</span>
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Live Previews</span>
              </div>
            </div>
            <div>
              <a href="/auth?mode=signup&redirect=create&type=portfolio" class="btn btn-primary btn-sm btn-use-case" data-type="portfolio" style="width:100%; text-align:center;">Create Portfolio &rarr;</a>
            </div>
          </div>

          <!-- 2. Personal Blogs & Writings -->
          <div class="card card-hover" style="display:flex; flex-direction:column; justify-content:space-between; background:#ffffff; padding:28px;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <span class="badge" style="background:var(--paper-soft); color:var(--muted); border:1px solid var(--line);">Writers &bull; Thinkers</span>
                <span style="font-size:22px;">✍️</span>
              </div>
              <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:10px;">Blogs &amp; Writings</h3>
              <p style="font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:18px;">
                Publish personal essays, technical notes, tutorials, and stories with distraction-free editorial typography and estimated read times.
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px;">
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Editorial Type</span>
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Reading Time</span>
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Zero Ads</span>
              </div>
            </div>
            <div>
              <a href="/auth?mode=signup&redirect=create&type=blog" class="btn btn-primary btn-sm btn-use-case" data-type="blog" style="width:100%; text-align:center;">Start a Blog &rarr;</a>
            </div>
          </div>

          <!-- 3. Digital Resumes & Profiles -->
          <div class="card card-hover" style="display:flex; flex-direction:column; justify-content:space-between; background:#ffffff; padding:28px;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <span class="badge" style="background:var(--paper-soft); color:var(--muted); border:1px solid var(--line);">Students &bull; Career</span>
                <span style="font-size:22px;">📄</span>
              </div>
              <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:10px;">Resumes &amp; Profiles</h3>
              <p style="font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:18px;">
                A clean digital CV featuring your career history, education, certifications, contact channels, and downloadable PDF resume attachment.
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px;">
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Career Timeline</span>
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">PDF Download</span>
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Hiring Ready</span>
              </div>
            </div>
            <div>
              <a href="/auth?mode=signup&redirect=create&type=personal" class="btn btn-primary btn-sm btn-use-case" data-type="personal" style="width:100%; text-align:center;">Create Resume &rarr;</a>
            </div>
          </div>

          <!-- 4. Projects & Launches -->
          <div class="card card-hover" style="display:flex; flex-direction:column; justify-content:space-between; background:#ffffff; padding:28px;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <span class="badge" style="background:var(--paper-soft); color:var(--muted); border:1px solid var(--line);">Makers &bull; Launches</span>
                <span style="font-size:22px;">🚀</span>
              </div>
              <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:10px;">Projects &amp; Launches</h3>
              <p style="font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:18px;">
                Launch dedicated one-pagers for side projects, open-source libraries, products, or creative ideas with built-in visitor contact forms.
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:20px;">
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Fast One-Pager</span>
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Contact Form</span>
                <span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">Custom Domain</span>
              </div>
            </div>
            <div>
              <a href="/auth?mode=signup&redirect=create&type=business" class="btn btn-primary btn-sm btn-use-case" data-type="business" style="width:100%; text-align:center;">Launch Project &rarr;</a>
            </div>
          </div>
        </div>

        <div style="text-align:center; margin-top:36px;">
          <a href="/templates" class="btn btn-secondary btn-sm" style="font-size:13px; padding:8px 20px;">
            Browse All Starter Templates &rarr;
          </a>
        </div>
      </div>
    </section>

    <!-- SECTION 2: FEATURES -->
    <section class="page-section" id="features">
      <div class="app-container">
        <div class="section-headline">
          <span class="section-tag">Platform Features</span>
          <h2 class="section-title">Everything You Need. Zero Bloat.</h2>
          <p class="section-desc">Modern edge hosting engineered for extreme performance, privacy, and simplicity.</p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:28px;">
          <!-- Feature 1 -->
          <div class="card" style="background:#ffffff; padding:28px;">
            <div style="font-size:28px; margin-bottom:14px;">🌐</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:8px; color:var(--ink);">Free *.mndo.online Subdomain</h3>
            <p style="color:var(--muted); font-size:14px; line-height:1.6;">
              Claim your unique address instantly. Wildcard edge routing provisions your subdomain immediately with automatic HTTPS certificates and zero DNS setup.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="card" style="background:#ffffff; padding:28px;">
            <div style="font-size:28px; margin-bottom:14px;">⚡</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:8px; color:var(--ink);">Pure HTML &amp; Vanilla CSS</h3>
            <p style="color:var(--muted); font-size:14px; line-height:1.6;">
              No React runtime overhead on published websites. Enjoy instant first paints, sub-10ms global delivery, and flawless 100/100 Lighthouse performance.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="card" style="background:#ffffff; padding:28px;">
            <div style="font-size:28px; margin-bottom:14px;">🎨</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:8px; color:var(--ink);">Visual Zero-Code Studio</h3>
            <p style="color:var(--muted); font-size:14px; line-height:1.6;">
              Edit text, customize accent colors, adjust font pairings, and manage sections in a live side-by-side studio with instant desktop, tablet, and mobile previews.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="card" style="background:#ffffff; padding:28px;">
            <div style="font-size:28px; margin-bottom:14px;">📬</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:8px; color:var(--ink);">Spam-Protected Contact Forms</h3>
            <p style="color:var(--muted); font-size:14px; line-height:1.6;">
              Receive messages from prospective clients or employers directly in your private dashboard, guarded by honeypot anti-spam fields and edge rate limits.
            </p>
          </div>

          <!-- Feature 5 -->
          <div class="card" style="background:#ffffff; padding:28px;">
            <div style="font-size:28px; margin-bottom:14px;">📁</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:8px; color:var(--ink);">Asset &amp; Document Hosting</h3>
            <p style="color:var(--muted); font-size:14px; line-height:1.6;">
              Direct image uploads for avatars and project screenshots with automatic client-side compression, plus secure PDF document hosting for your resume.
            </p>
          </div>

          <!-- Feature 6 -->
          <div class="card" style="background:#ffffff; padding:28px;">
            <div style="font-size:28px; margin-bottom:14px;">🛡️</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:8px; color:var(--ink);">Automated SEO &amp; llms.txt</h3>
            <p style="color:var(--muted); font-size:14px; line-height:1.6;">
              Every published site automatically outputs canonical meta tags, sitemap.xml, robots.txt, and machine-readable llms.txt for search engines and AI assistants.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: CALL TO ACTION -->
    <section class="page-section page-section-alt" style="text-align:center;">
      <div class="app-container-sm">
        <h2 style="font-size:32px; font-weight:800; color:var(--ink); margin-bottom:12px; letter-spacing:-0.03em;">Ready to claim your subdomain?</h2>
        <p style="color:var(--muted); font-size:16px; margin-bottom:28px; line-height:1.6;">
          Join students, developers, and creators publishing free, fast portfolios and blogs with MNDO Builder.
        </p>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <a href="/auth?mode=signup" class="btn btn-primary btn-lg" style="padding:12px 28px;">Sign Up to Host</a>
          <a href="/templates" class="btn btn-secondary btn-lg" style="padding:12px 24px;">Explore Templates</a>
        </div>
      </div>
    </section>
  `;

  // Dynamic buttons if logged in
  getCurrentUser().then(user => {
    const heroActions = container.querySelector('#heroAuthActions');
    if (heroActions) {
      if (user) {
        heroActions.innerHTML = `
          <a href="/create" class="btn btn-primary btn-lg">+ New Site</a>
          <a href="/dashboard" class="btn btn-secondary btn-lg">Dashboard</a>
        `;
      } else {
        heroActions.innerHTML = `
          <a href="/auth?mode=signup" class="btn btn-primary btn-lg" style="padding:12px 28px;">Sign Up</a>
          <a href="/auth?mode=signin" class="btn btn-secondary btn-lg" style="padding:12px 24px;">Log In</a>
        `;
      }
    }
    if (user) {
      container.querySelectorAll('.btn-use-case').forEach(btn => {
        const type = btn.getAttribute('data-type');
        btn.setAttribute('href', `/create?type=${type}`);
      });
    } else {
      container.querySelectorAll('.btn-use-case').forEach(btn => {
        const type = btn.getAttribute('data-type');
        btn.setAttribute('href', `/auth?mode=signup&redirect=create&type=${type}`);
      });
    }
  });

  // Start typewriter writing animation
  startHeroTypewriter(container);

  // Subdomain claim & check logic
  const homeSlugInput = container.querySelector('#homeSubdomainInput');
  const homeStatus = container.querySelector('#homeSubdomainStatus');
  const btnClaim = container.querySelector('#btnClaimSubdomain');
  let homeTimer = null;

  async function checkAvailability(val) {
    if (!val) {
      homeStatus.textContent = '';
      return null;
    }
    homeStatus.textContent = 'Checking...';
    homeStatus.style.color = 'var(--muted)';
    const avail = await checkSubdomainAvailability(val);
    if (avail.available) {
      homeStatus.innerHTML = `<span style="color:var(--accent-emerald);">✓ <strong>${avail.slug}.${CONFIG.PLATFORM_DOMAIN}</strong> is available</span>`;
    } else {
      homeStatus.innerHTML = `<span style="color:var(--accent-rose);">✕ ${avail.reason}</span>`;
    }
    return avail;
  }

  if (homeSlugInput && homeStatus) {
    homeSlugInput.addEventListener('input', (e) => {
      clearTimeout(homeTimer);
      const val = homeSlugInput.value.toLowerCase().trim();
      homeTimer = setTimeout(() => checkAvailability(val), 350);
    });

    if (btnClaim) {
      btnClaim.addEventListener('click', async () => {
        const val = homeSlugInput.value.toLowerCase().trim();
        if (!val) {
          homeStatus.textContent = 'Enter a name to check';
          homeStatus.style.color = 'var(--accent-amber)';
          homeSlugInput.focus();
          return;
        }

        const avail = await checkAvailability(val);
        if (avail && avail.available) {
          const user = await getCurrentUser();
          if (user) {
            navigate(`/create?slug=${encodeURIComponent(avail.slug)}`);
          } else {
            showToast(`'${avail.slug}.${CONFIG.PLATFORM_DOMAIN}' is available! Sign up to host.`, 'success');
            navigate(`/auth?mode=signup&slug=${encodeURIComponent(avail.slug)}`);
          }
        }
      });
    }
  }

  // Template preview buttons
  attachTemplatePreviewButtons(container);
}

// ------------------------------------------------------------------------------
// PAGE 2: TEMPLATES CATALOG
// ------------------------------------------------------------------------------
function renderTemplatesCatalog(container) {
  container.innerHTML = `
    <div class="app-container" style="padding-top:48px; padding-bottom:72px;">
      <div class="section-headline">
        <span class="section-tag">Template Catalog</span>
        <h1 class="section-title">Explore All Templates</h1>
        <p class="section-desc">Each template is fully mobile-responsive and crafted for high visual appeal without requiring any coding.</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:28px;">
        ${TEMPLATES.map(t => `
          <div class="card card-hover" style="display:flex; flex-direction:column; justify-content:space-between; background:#ffffff;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span class="badge" style="background:var(--paper-soft); color:var(--muted); border:1px solid var(--line);">${t.category}</span>
                <span style="font-size:12px; color:var(--muted-light); font-family:var(--font-mono);">ID: ${t.id}</span>
              </div>
              <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:8px;">${t.name}</h3>
              <p style="font-size:14px; color:var(--muted); line-height:1.6; margin-bottom:16px;">${t.description}</p>
              
              <div style="margin-bottom:20px;">
                <div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Key Features:</div>
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  ${t.features.map(f => `<span style="font-size:11px; background:var(--paper-soft); color:var(--muted); padding:3px 10px; border-radius:var(--radius-full); border:1px solid var(--line);">${f}</span>`).join('')}
                </div>
              </div>
            </div>

            <div style="display:flex; gap:10px;">
              <button class="btn btn-secondary btn-sm btn-preview-template" data-template="${t.id}" style="flex:1;">Live Preview</button>
              <a href="/create?template=${t.id}" class="btn btn-primary btn-sm">Use Template</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  attachTemplatePreviewButtons(container);
}

function attachTemplatePreviewButtons(container) {
  container.querySelectorAll('.btn-preview-template').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.getAttribute('data-template');
      const tmpl = TEMPLATES.find(t => t.id === templateId);
      if (!tmpl) return;

      const mockData = {
        site: {
          id: 'preview-site',
          title: `${tmpl.name} Demo`,
          description: tmpl.description,
          site_type: templateId === 'personal-blog' || templateId === 'thesis-story' ? 'blog' : 'portfolio',
          template_id: templateId,
          subdomain_slug: 'demo',
          theme_config: { primaryColor: tmpl.accentDefault, fontPair: 'inter-outfit' },
          seo_config: {},
          content: {
            hero: {
              headline: 'Alex Morgan',
              tagline: 'Writer, Researcher & Platform Architect',
              bio: 'Passionate about crafting fast, resilient systems and writing thoughtful computational research.'
            },
            about: {
              body: '6+ years designing scalable systems and publishing open research. Exploring distributed databases, edge networks, and modern UI engineering.'
            },
            skills: [
              { name: 'TypeScript' },
              { name: 'Cloudflare Workers' },
              { name: 'Distributed Systems' },
              { name: 'PostgreSQL' },
              { name: 'WebAssembly' },
              { name: 'Design Systems' }
            ],
            projects: [
              {
                title: 'High-Velocity Edge Mesh',
                description: 'A global microsecond edge routing and static delivery engine serving 50M+ requests with sub-15ms response latency.',
                tags: ['Cloudflare Workers', 'Edge Computing', 'Rust'],
                liveUrl: 'https://example.com',
                githubUrl: 'https://github.com/example/edge-mesh'
              },
              {
                title: 'Zero-Runtime Design Architecture',
                description: 'Pure semantic HTML compiler and CSS token system producing zero hydration overhead and 100/100 Lighthouse performance.',
                tags: ['HTML5', 'CSS Architecture', 'Performance'],
                liveUrl: 'https://example.com',
                githubUrl: 'https://github.com/example/zero-runtime'
              },
              {
                title: 'Real-Time Telemetry Shaders',
                description: 'Hardware-accelerated WebGL dashboard visualizing high-throughput streaming metrics with 60 FPS silky smooth rendering.',
                tags: ['WebGL', 'Canvas', 'TypeScript'],
                liveUrl: 'https://example.com',
                githubUrl: 'https://github.com/example/telemetry'
              }
            ],
            experience: [
              {
                role: 'Principal Platform Architect',
                company: 'TechEdge Labs',
                period: '2023 - Present',
                description: 'Leading global edge infrastructure, high-throughput static publishing systems, and developer productivity tooling.'
              },
              {
                role: 'Senior Full-Stack Engineer',
                company: 'Modern Web Studio',
                period: '2021 - 2023',
                description: 'Designed accessible design systems, resilient cloud backends, and responsive user interfaces.'
              }
            ],
            education: [
              {
                degree: 'B.S. in Computer Science & Systems',
                institution: 'Institute of Technology',
                year: '2017 - 2021',
                details: 'Specialization in distributed computing, networking protocols, and systems performance.'
              }
            ],
            contact: { enableForm: true, heading: "Let's connect" }
          }
        },
        pages: [],
        posts: [
          {
            id: 'post-1',
            slug: 'prologue-origins-of-inquiry',
            title: 'Prologue: Origins of the Inquiry',
            excerpt: 'An investigation into fundamental computational constraints and memory architecture.',
            body_markdown: '## The Architecture of Mind\n\nEvery computational inquiry begins with a boundary constraint.\n\n> "Structure defines possibility, and constraints yield elegance."\n\n### Foundations\n\nIn this opening chapter, we formalize the premise and trace its antecedents through historical literature.',
            published_at: new Date().toISOString(),
            status: 'published'
          },
          {
            id: 'post-2',
            slug: 'chapter-one-empirical-frontiers',
            title: 'Chapter 1: Empirical Frontiers',
            excerpt: 'Systematic observation across edge deployment environments and latency distribution curves.',
            body_markdown: '## Empirical Observations\n\nBenchmarking edge nodes reveals unexpected patterns in packet propagation.\n\n* Phase 1: Cold start latency reduction\n* Phase 2: Distributed memory synchronization\n* Phase 3: Global cache invalidation',
            published_at: new Date().toISOString(),
            status: 'published'
          }
        ]
      };

      const html = renderSite(mockData, '/').body;

      openModal({
        title: `Preview: ${tmpl.name}`,
        contentHtml: `
          <div style="width:100%; height:520px; border-radius:8px; overflow:hidden; border:1px solid var(--border-subtle); background:#fff;">
            <iframe id="modalPreviewIframe" style="width:100%; height:100%; border:none;" sandbox="allow-scripts allow-same-origin"></iframe>
          </div>
        `,
        cancelText: 'Close'
      });

      setTimeout(() => {
        const frame = document.getElementById('modalPreviewIframe');
        if (frame) frame.srcdoc = html;
      }, 50);
    });
  });
}

// ------------------------------------------------------------------------------
// PAGE 3: FEATURES PAGE
// ------------------------------------------------------------------------------
function renderFeaturesPage(container) {
  container.innerHTML = `
    <div class="app-container" style="padding-top:48px; padding-bottom:72px;">
      <div class="section-headline">
        <span class="section-tag">Platform Architecture</span>
        <h1 class="section-title">Built for Speed, Zero Runtime Bloat</h1>
        <p class="section-desc">MNDO Builder combines Cloudflare Workers, Pages, and Supabase to deliver a world-class publishing engine without operating costs.</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:32px;">
        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:12px;">Cloudflare Worker Wildcard Routing</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            Instead of spinning up separate hosting projects or managing individual DNS records for every user, a single lightweight Cloudflare Worker intercepts *.mndo.online/*, resolves the user slug, queries cached public database snapshots, and delivers plain HTML in sub-10ms.
          </p>
        </div>

        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:12px;">Zero React Runtime on Generated Sites</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            Visitors to your published website get clean, semantic HTML5 and vanilla CSS. There is no React hydration overhead, no framework startup latency, and no mobile battery drain.
          </p>
        </div>

        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:12px;">Automated Machine-Readable llms.txt</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            Every published website automatically generates /llms.txt alongside robots.txt and sitemap.xml. AI systems and LLM crawlers can accurately read your canonical project index without hallucinations.
          </p>
        </div>

        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:12px;">Security & Row-Level Authorization</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            Every database table is guarded by PostgreSQL Row Level Security (RLS). Anonymous visitors can only access public data returned by a restricted RPC function, preventing draft leaks or credential exposure.
          </p>
        </div>

        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:12px;">Integrated Spam-Protected Contact Forms</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            Public visitors can submit messages directly to your site owner inbox. Submissions are guarded by honeypot anti-spam fields, strict length validation, and Cloudflare rate limits.
          </p>
        </div>

        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:12px;">Free-Tier Sustainability (₹0 Operating Cost)</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            Designed strictly within Cloudflare Free and Supabase Free quotas: 3 websites per account, 20 MB asset storage, 2 MB image limit, and 5 MB PDF document limit.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------------------------
// PAGE 4: FAQ & DOMAIN SETUP GUIDE
// ------------------------------------------------------------------------------
function renderFaqPage(container) {
  container.innerHTML = `
    <div class="app-container" style="padding-top:48px; padding-bottom:72px;">
      <div class="section-headline">
        <span class="section-tag">Frequently Asked Questions</span>
        <h1 class="section-title">Help & Documentation</h1>
        <p class="section-desc">Learn about custom subdomains, DNS management, and account quotas.</p>
      </div>

      <div style="max-width:800px; margin:0 auto; display:flex; flex-direction:column; gap:20px;">
        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:17px; font-weight:700; color:var(--ink); margin-bottom:8px;">How does the *.mndo.online subdomain assignment work?</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            When you enter a username (e.g., <code>risvan</code>), our system checks that it is available and not a reserved platform name. Upon publishing, the Cloudflare Worker wildcard route automatically serves your website at <code>https://risvan.mndo.online</code> with an automatic SSL certificate.
          </p>
        </div>

        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:17px; font-weight:700; color:var(--ink); margin-bottom:8px;">Will my existing website at mndo.online be affected?</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            No. The apex domain (<code>mndo.online</code>) and <code>www.mndo.online</code> are explicitly guarded. The Worker passes through apex requests or reserves them for your existing origin. Your existing DNS records (MX, mail, SPF, apex A/CNAME) must be preserved during Cloudflare zone setup.
          </p>
        </div>

        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:17px; font-weight:700; color:var(--ink); margin-bottom:8px;">Why is email verification required before publishing?</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            To prevent spam, automated bots, and abuse of the free subdomain wildcard service, publishing is strictly restricted to accounts with verified email addresses.
          </p>
        </div>

        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:17px; font-weight:700; color:var(--ink); margin-bottom:8px;">What are the free account limits?</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            Each free account can create up to 3 websites and store up to 20 MB of assets (images up to 2 MB, PDF resumes up to 5 MB). This ensures the platform can operate reliably at ₹0 cost on free cloud tiers.
          </p>
        </div>

        <div class="card" style="background:#ffffff;">
          <h3 style="font-size:17px; font-weight:700; color:var(--ink); margin-bottom:8px;">Can I unpublish or delete my website later?</h3>
          <p style="color:var(--muted); font-size:14px; line-height:1.6;">
            Yes! You can unpublish your site with one click from the dashboard or studio. An unpublished site immediately returns a 404 to the public while retaining your drafts safely in your account.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------------------------
// PAGE 5: PRIVACY POLICY (WITH EDITABLE REVIEW MARKERS)
// ------------------------------------------------------------------------------
function renderPrivacyPage(container) {
  container.innerHTML = `
    <div class="app-container-sm" style="padding-top:48px; padding-bottom:72px;">
      <h1 style="font-size:32px; font-weight:800; margin-bottom:12px;">Privacy Policy</h1>
      <div style="font-size:13px; color:#b45309; background:#fef3c7; border:1px solid #fde68a; border-radius:10px; padding:12px 16px; margin-bottom:28px;">
        <strong>[PLATFORM OWNER REVIEW NEEDED]:</strong> This is a starter legal draft. The platform owner must review and supply their legal entity name, operational jurisdiction, and designated support/DPO email before public commercial operations.
      </div>

      <div class="card" style="font-size:14px; color:var(--muted); line-height:1.8; background:#ffffff;">
        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">1. Information We Collect</h3>
        <p style="margin-bottom:16px;">We collect information you provide directly to us when creating an account, including your email address and display name. When you use the builder, we store your submitted site content, uploaded media (images, PDF documents), and public contact form submissions.</p>

        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">2. Public Website Content</h3>
        <p style="margin-bottom:16px;">Any content, projects, images, and resume documents that you publish to your subdomain (e.g. username.mndo.online) are publicly accessible on the internet. Please do not publish sensitive personal data, private home addresses, or confidential credentials.</p>

        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">3. Service Providers & Hosting</h3>
        <p style="margin-bottom:16px;">We use Cloudflare (for edge routing and DDoS mitigation) and Supabase (for database and file storage). Data is processed in accordance with industry security standards and encrypted in transit.</p>

        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">4. Account & Data Deletion</h3>
        <p style="margin-bottom:16px;">You have the right to delete your website and uploaded assets at any time through the MNDO Builder dashboard. Deleting a site removes its records and stored files from our active database.</p>

        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">5. Contact Information</h3>
        <p>For privacy inquiries or data removal requests, please reach out via our <a href="/contact">Platform Contact Form</a> or contact <code>[OWNER_CONTACT_EMAIL]</code>.</p>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------------------------
// PAGE 6: TERMS OF SERVICE (WITH EDITABLE REVIEW MARKERS)
// ------------------------------------------------------------------------------
function renderTermsPage(container) {
  container.innerHTML = `
    <div class="app-container-sm" style="padding-top:48px; padding-bottom:72px;">
      <h1 style="font-size:32px; font-weight:800; margin-bottom:12px;">Terms of Service</h1>
      <div style="font-size:13px; color:#b45309; background:#fef3c7; border:1px solid #fde68a; border-radius:10px; padding:12px 16px; margin-bottom:28px;">
        <strong>[PLATFORM OWNER REVIEW NEEDED]:</strong> This document establishes service boundaries and acceptable use. The platform owner must specify governing law and official legal contact details.
      </div>

      <div class="card" style="font-size:14px; color:var(--muted); line-height:1.8; background:#ffffff;">
        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">1. Service Description</h3>
        <p style="margin-bottom:16px;">MNDO Builder provides a free, lightweight website creation and publishing tool. Websites are hosted under wildcard subdomains (*.mndo.online). The service is provided on an "as-is" and "as-available" basis.</p>

        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">2. Acceptable Use Policy</h3>
        <p style="margin-bottom:16px;">You agree not to use MNDO Builder to publish or distribute: phishing pages, malware, spam, illegal content, copyrighted materials without authorization, deceptive impersonation of brands or individuals, or content violating local laws. Violations will result in immediate subdomain suspension.</p>

        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">3. Subdomains & Reserved Names</h3>
        <p style="margin-bottom:16px;">Subdomain slugs are assigned on a first-come, first-served basis subject to platform rules. MNDO Builder reserves the right to reclaim, suspend, or reassign subdomains that infringe on trademarks, mimic platform infrastructure, or remain abandoned.</p>

        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">4. Usage Quotas & Limitations</h3>
        <p style="margin-bottom:16px;">To maintain a free tier, users are subject to reasonable quotas (3 sites per account, 20 MB total storage). Circumventing quotas through automated bot registrations is strictly prohibited.</p>

        <h3 style="color:var(--ink); font-size:17px; margin-bottom:8px;">5. Abuse Reporting</h3>
        <p>If you encounter an abusive or malicious website hosted on our platform, please report it immediately via the <a href="/report-abuse">Report Abuse</a> page.</p>
      </div>
    </div>
  `;
}

// ------------------------------------------------------------------------------
// PAGE 7: PLATFORM CONTACT FORM
// ------------------------------------------------------------------------------
function renderPlatformContactPage(container) {
  container.innerHTML = `
    <div class="app-container-sm" style="padding-top:48px; padding-bottom:72px;">
      <div class="section-headline">
        <span class="section-tag">Get In Touch</span>
        <h1 class="section-title">Contact MNDO Builder</h1>
        <p class="section-desc">Have questions about the platform, feedback, or need help? Send us a message.</p>
      </div>

      <div class="card" style="padding:32px;">
        <form id="platformContactForm">
          <div class="form-group">
            <label class="form-label">Your Name</label>
            <input type="text" class="form-input" id="pContactName" required placeholder="Jane Doe" maxlength="100">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-input" id="pContactEmail" required placeholder="jane@example.com" maxlength="120">
          </div>
          <div class="form-group">
            <label class="form-label">Message</label>
            <textarea class="form-textarea" id="pContactMsg" rows="5" required placeholder="How can we assist you?" maxlength="3000"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Send Message</button>
        </form>
      </div>
    </div>
  `;

  container.querySelector('#platformContactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you for reaching out! Your message has been recorded.', 'success');
    e.target.reset();
  });
}

// ------------------------------------------------------------------------------
// PAGE 8: REPORT ABUSE
// ------------------------------------------------------------------------------
function renderReportAbusePage(container) {
  container.innerHTML = `
    <div class="app-container-sm" style="padding-top:48px; padding-bottom:72px;">
      <div class="section-headline">
        <span class="section-tag">Trust & Safety</span>
        <h1 class="section-title">Report Website Abuse</h1>
        <p class="section-desc">We investigate all reports of phishing, spam, malware, or copyright violations hosted on MNDO subdomains.</p>
      </div>

      <div class="card" style="padding:32px;">
        <form id="abuseReportForm">
          <div class="form-group">
            <label class="form-label">Target Subdomain (or full URL)</label>
            <input type="text" class="form-input" id="abuseSubdomain" required placeholder="badsite (or badsite.mndo.online)">
          </div>
          <div class="form-group">
            <label class="form-label">Reason for Report</label>
            <select class="form-select" id="abuseReason">
              <option value="phishing">Phishing / Credential Harvesting</option>
              <option value="spam">Spam / Deceptive Advertising</option>
              <option value="copyright">Copyright Infringement</option>
              <option value="harassment">Harassment or Defamation</option>
              <option value="malware">Malware / Malicious Redirects</option>
              <option value="other">Other Violation</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Your Email (optional, for follow-up)</label>
            <input type="email" class="form-input" id="abuseEmail" placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label class="form-label">Detailed Description of Abuse</label>
            <textarea class="form-textarea" id="abuseDesc" rows="4" required placeholder="Please describe why this website violates terms and attach any evidence or URLs..."></textarea>
          </div>
          <button type="submit" class="btn btn-danger" style="width:100%;">Submit Abuse Report</button>
        </form>
      </div>
    </div>
  `;

  container.querySelector('#abuseReportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const sub = document.getElementById('abuseSubdomain').value.trim().replace(/^https?:\/\//, '').split('.')[0];
    const reason = document.getElementById('abuseReason').value;
    const email = document.getElementById('abuseEmail').value.trim();
    const desc = document.getElementById('abuseDesc').value.trim();

    try {
      await submitAbuseReport({ subdomain: sub, reason, email, description: desc });
      showToast('Abuse report submitted. Thank you for keeping the platform safe.', 'success');
      e.target.reset();
    } catch (err) {
      showToast('Failed submitting report. Please try again.', 'error');
    }
  });
}

// ------------------------------------------------------------------------------
// PAGE 9: SIGN IN / SIGN UP (AUTHENTICATION)
// ------------------------------------------------------------------------------
function renderAuthPage(container, initialMode = null) {
  const params = new URLSearchParams(window.location.search || (window.location.hash.split('?')[1] || ''));
  
  let requestedMode = initialMode;
  if (!requestedMode) {
    if (window.location.pathname === '/signup' || window.location.hash.startsWith('#/signup')) {
      requestedMode = 'signup';
    } else if (window.location.pathname === '/login' || window.location.pathname === '/signin' || window.location.hash.startsWith('#/login') || window.location.hash.startsWith('#/signin')) {
      requestedMode = 'signin';
    } else {
      requestedMode = params.get('mode') === 'signup' ? 'signup' : 'signin';
    }
  }

  const reservedSlug = params.get('slug') || '';
  const redirectTarget = params.get('redirect') || '';
  const isSignup = requestedMode === 'signup';

  container.innerHTML = `
    <div class="app-container-sm" style="padding-top:48px; padding-bottom:72px;">
      <div style="max-width:440px; margin:0 auto;">
        
        <!-- Branding & Dynamic Header -->
        <div style="text-align:center; margin-bottom:28px;">
          <div style="display:inline-flex; align-items:center; gap:8px; margin-bottom:12px;">
            <div class="brand-icon" style="width:30px; height:30px; font-size:15px;">M</div>
            <span style="font-family:var(--font-heading); font-weight:800; font-size:20px; color:var(--ink);">MNDO<span class="brand-dot"></span> Builder</span>
          </div>
          <h1 id="authPageTitle" style="font-size:28px; font-weight:800; margin-bottom:6px; color:var(--ink); letter-spacing:-0.03em;">
            ${isSignup ? 'Create Your Account' : 'Log In'}
          </h1>
          <p id="authPageDesc" style="color:var(--muted); font-size:14px;">
            ${isSignup ? 'Sign up is mandatory to host online and claim a free subdomain.' : 'Enter your email and password to access your dashboard.'}
          </p>
        </div>

        ${reservedSlug ? `
          <div style="font-size:13px; color:var(--accent-emerald); background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:10px; padding:10px 14px; margin-bottom:20px; text-align:center;">
            ✓ Subdomain <strong>${escapeHtml(reservedSlug)}.${CONFIG.PLATFORM_DOMAIN}</strong> is reserved! Sign up to host.
          </div>
        ` : ''}

        <div class="card" style="padding:32px; background:#ffffff; box-shadow:0 8px 30px rgba(0,0,0,0.04);">
          <!-- Auth Mode Toggle Tabs -->
          <div class="editor-tabs" style="margin-bottom:24px;">
            <button type="button" class="editor-tab-item ${!isSignup ? 'active' : ''}" id="btnAuthTabSignIn" style="flex:1; text-align:center;">Log In</button>
            <button type="button" class="editor-tab-item ${isSignup ? 'active' : ''}" id="btnAuthTabSignUp" style="flex:1; text-align:center;">Sign Up</button>
          </div>

          <!-- Google OAuth Button -->
          <button type="button" class="btn btn-secondary" id="btnGoogleAuth" style="width:100%; margin-bottom:20px; font-size:14px; justify-content:center; gap:10px;">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"/></svg>
            Continue with Google
          </button>

          <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; color:var(--muted-light); font-size:12px;">
            <div style="flex:1; height:1px; background:var(--line);"></div>
            <span>or with email</span>
            <div style="flex:1; height:1px; background:var(--line);"></div>
          </div>

          <!-- Email / Password Form -->
          <form id="authEmailForm">
            <div class="form-group" id="groupDisplayName" style="display:${isSignup ? 'block' : 'none'};">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="authDisplayName" placeholder="Jane Doe">
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="authEmail" required placeholder="you@example.com">
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" id="authPassword" required placeholder="••••••••" minlength="6">
            </div>
            <button type="submit" class="btn btn-primary" id="btnSubmitAuth" style="width:100%; margin-top:8px; padding:12px; font-size:14px; font-weight:600;">
              ${isSignup ? 'Create Account' : 'Log In'}
            </button>
          </form>

          <!-- Bottom Switch Link -->
          <div style="margin-top:20px; text-align:center; font-size:13px; color:var(--muted);">
            <span id="authSwitchPrompt">${isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
            <button type="button" id="btnAuthSwitch" style="background:none; border:none; color:var(--ink); font-weight:600; cursor:pointer; text-decoration:underline; margin-left:4px; font-size:13px;">
              ${isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  let mode = requestedMode;
  const tabSignIn = container.querySelector('#btnAuthTabSignIn');
  const tabSignUp = container.querySelector('#btnAuthTabSignUp');
  const groupName = container.querySelector('#groupDisplayName');
  const btnSubmit = container.querySelector('#btnSubmitAuth');
  const pageTitle = container.querySelector('#authPageTitle');
  const pageDesc = container.querySelector('#authPageDesc');
  const switchPrompt = container.querySelector('#authSwitchPrompt');
  const btnSwitch = container.querySelector('#btnAuthSwitch');
  const form = container.querySelector('#authEmailForm');

  function setMode(newMode) {
    mode = newMode;
    const isNowSignup = mode === 'signup';
    tabSignIn.classList.toggle('active', !isNowSignup);
    tabSignUp.classList.toggle('active', isNowSignup);
    groupName.style.display = isNowSignup ? 'block' : 'none';
    pageTitle.textContent = isNowSignup ? 'Create Your Account' : 'Log In';
    pageDesc.textContent = isNowSignup ? 'Sign up is mandatory to host online and claim a free subdomain.' : 'Enter your email and password to access your dashboard.';
    btnSubmit.textContent = isNowSignup ? 'Create Account' : 'Log In';
    switchPrompt.textContent = isNowSignup ? 'Already have an account?' : "Don't have an account?";
    btnSwitch.textContent = isNowSignup ? 'Log In' : 'Sign Up';

    const qs = window.location.search || '';
    const newPath = (isNowSignup ? '/signup' : '/login') + qs;
    if (window.location.pathname !== (isNowSignup ? '/signup' : '/login')) {
      window.history.replaceState(null, '', newPath);
    }
  }

  tabSignIn.addEventListener('click', () => setMode('signin'));
  tabSignUp.addEventListener('click', () => setMode('signup'));
  btnSwitch.addEventListener('click', () => setMode(mode === 'signup' ? 'signin' : 'signup'));

  // Google OAuth
  container.querySelector('#btnGoogleAuth').addEventListener('click', async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  function completeAuthRedirect() {
    const extraParams = new URLSearchParams();
    if (reservedSlug) extraParams.set('slug', reservedSlug);
    if (params.get('template')) extraParams.set('template', params.get('template'));
    if (params.get('type')) extraParams.set('type', params.get('type'));
    const qs = extraParams.toString();
    const query = qs ? '?' + qs : '';

    if (reservedSlug || redirectTarget === 'create') {
      navigate(`/create${query}`);
    } else {
      navigate('/dashboard');
    }
  }

  // Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authDisplayName').value.trim() || email.split('@')[0];

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Processing...';

    try {
      if (mode === 'signup') {
        const res = await signUpWithEmail(email, password, name);
        if (res.requiresEmailVerification) {
          openModal({
            title: 'Verify Your Email',
            contentHtml: `<p>We sent a verification link to <strong>${escapeHtml(email)}</strong>. Please verify your email before publishing your website.</p>`,
            cancelText: 'Got It',
            onCancel: () => completeAuthRedirect()
          });
        } else {
          showToast('Account created successfully!', 'success');
          completeAuthRedirect();
        }
      } else {
        await signInWithEmail(email, password);
        showToast('Welcome back!', 'success');
        completeAuthRedirect();
      }
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = mode === 'signup' ? 'Sign Up' : 'Log In';
    }
  });

  // Forgot password
  container.querySelector('#linkForgotPassword').addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt('Enter your registered email address:');
    if (email) {
      resetPasswordForEmail(email)
        .then(() => showToast('Password reset instructions sent to your email.', 'info'))
        .catch(err => showToast(err.message, 'error'));
    }
  });
}

// ------------------------------------------------------------------------------
// PAGE 10: AUTH CALLBACK (OAUTH & VERIFICATION HANDLER)
// ------------------------------------------------------------------------------
function renderAuthCallbackPage(container) {
  container.innerHTML = `
    <div class="app-container" style="padding:80px 0; text-align:center;">
      <h2 style="font-size:24px; font-weight:700; margin-bottom:12px;">Verifying Session...</h2>
      <p style="color:var(--text-muted);">Please wait while we complete your authentication.</p>
    </div>
  `;

  setTimeout(() => {
    navigate('/dashboard');
  }, 800);
}

// ------------------------------------------------------------------------------
// PAGE 11: CREATE WEBSITE WIZARD
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// PAGE 11: STEP-BY-STEP CREATE WEBSITE WIZARD
// Step 1: Website Type (Portfolio, Writing & Thesis, Landing Page)
// Step 2: Choose Template (Curated designs with live preview)
// Step 3: Subdomain & Name (Real-time availability check -> Build page)
// ------------------------------------------------------------------------------
function renderCreateWizard(container) {
  const params = new URLSearchParams(window.location.search || (window.location.hash.split('?')[1] || ''));
  const initialSlug = params.get('slug') || '';
  const initialType = params.get('type') || 'portfolio';
  const initialTemplate = params.get('template') || '';

  // Curated templates map by website type
  const TYPE_TEMPLATES = {
    portfolio: [
      'split-engineer',
      'design-engineer',
      'oss-maintainer',
      'minimal',
      'developer',
      'interactive-resume',
      'research-scholar',
      'academic',
      'visual-gallery',
      'creative',
      'professional',
      'modern'
    ],
    blog: [
      'thesis-story',
      'minimal-text',
      'personal-blog',
      'digital-garden',
      'docs-book'
    ],
    business: [
      'product-launch',
      'business',
      'modern'
    ]
  };

  // State
  let currentStep = 1;
  let selectedType = ['portfolio', 'blog', 'business'].includes(initialType) ? initialType : 'portfolio';
  let selectedTemplate = initialTemplate || (selectedType === 'blog' ? 'thesis-story' : selectedType === 'business' ? 'product-launch' : 'split-engineer');
  let siteTitle = '';
  let subdomainSlug = initialSlug || '';
  let isSlugAvailable = false;
  let slugEditedManually = Boolean(initialSlug);
  let debounceTimer = null;
  let filterMode = 'curated'; // 'curated' | 'all'

  // If a template was explicitly requested in URL query, infer its type
  if (initialTemplate) {
    if (TYPE_TEMPLATES.blog.includes(initialTemplate)) selectedType = 'blog';
    else if (TYPE_TEMPLATES.business.includes(initialTemplate)) selectedType = 'business';
    else selectedType = 'portfolio';
    selectedTemplate = initialTemplate;
    currentStep = 2; // Jump directly to template/confirmation
  }

  function getTypeName(type) {
    if (type === 'blog') return 'Writing & Thesis';
    if (type === 'business') return 'Landing Page';
    return 'Portfolio';
  }

  function render() {
    container.innerHTML = `
      <style>
        .wizard-wrap { max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; }
        
        /* Stepper Header */
        .wizard-stepper {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 580px;
          margin: 0 auto 40px;
          position: relative;
        }
        .wizard-step {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: var(--muted);
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .wizard-step.active { color: var(--ink); font-weight: 700; }
        .wizard-step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--line);
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
          transition: all 0.2s ease;
        }
        .wizard-step.active .wizard-step-circle {
          border-color: var(--ink);
          background: var(--ink);
          color: #ffffff;
        }
        .wizard-step.completed .wizard-step-circle {
          border-color: var(--accent-emerald, #10b981);
          background: var(--accent-emerald, #10b981);
          color: #ffffff;
        }
        .wizard-step-line {
          flex: 1;
          height: 2px;
          background: var(--line);
          margin: 0 16px;
          transition: background 0.2s ease;
        }
        .wizard-step-line.completed { background: var(--accent-emerald, #10b981); }

        /* Step Title */
        .step-header { text-align: center; margin-bottom: 36px; }
        .step-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 6px; display: block; }
        .step-title { font-size: 32px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; margin-bottom: 8px; }
        .step-desc { font-size: 15px; color: var(--muted); max-width: 560px; margin: 0 auto; line-height: 1.5; }

        /* Step 1: Type Selection Cards */
        .type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 36px; }
        .type-card {
          background: #ffffff;
          border: 2px solid var(--line);
          border-radius: 12px;
          padding: 28px 24px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s ease;
          position: relative;
        }
        .type-card:hover { border-color: var(--ink-light, #555); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .type-card.selected {
          border-color: var(--ink);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
          background: #ffffff;
        }
        .type-icon { font-size: 32px; margin-bottom: 16px; }
        .type-name { font-size: 20px; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
        .type-desc { font-size: 14px; color: var(--muted); line-height: 1.5; margin-bottom: 20px; flex: 1; }
        .type-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .type-tag { font-size: 11px; background: var(--paper-soft); color: var(--muted); padding: 3px 8px; border-radius: 4px; border: 1px solid var(--line); }
        .type-select-indicator {
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .type-card.selected .type-select-indicator { color: var(--ink); }

        /* Step 2: Templates Grid */
        .filter-bar { display: flex; justify-content: center; gap: 10px; margin-bottom: 28px; }
        .filter-btn {
          padding: 8px 18px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: #ffffff;
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-btn.active { background: var(--ink); color: #ffffff; border-color: var(--ink); }
        
        .tmpl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; margin-bottom: 36px; }
        .tmpl-card {
          background: #ffffff;
          border: 2px solid var(--line);
          border-radius: 10px;
          padding: 20px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.15s ease;
        }
        .tmpl-card:hover { border-color: var(--line-strong); }
        .tmpl-card.selected { border-color: var(--ink); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .tmpl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .tmpl-accent { width: 12px; height: 12px; border-radius: 50%; }
        .tmpl-title { font-size: 17px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
        .tmpl-desc { font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 16px; flex: 1; }
        .tmpl-features { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 16px; }
        .tmpl-features span { font-size: 11px; background: var(--paper-soft); color: var(--muted); padding: 2px 7px; border-radius: 4px; }
        .tmpl-actions { display: flex; gap: 8px; }

        /* Step 3: Domain & Identity */
        .identity-box {
          background: #ffffff;
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 36px;
          max-width: 580px;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        /* Action Buttons Bar */
        .wizard-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--line);
        }

        @media (max-width: 768px) {
          .type-grid { grid-template-columns: 1fr; }
          .wizard-wrap { padding-top: 24px; }
          .identity-box { padding: 24px 20px; }
        }
      </style>

      <div class="wizard-wrap">
        <!-- Stepper Indicators -->
        <div class="wizard-stepper">
          <div class="wizard-step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}" id="navStep1">
            <span class="wizard-step-circle">${currentStep > 1 ? '✓' : '1'}</span>
            <span>Type</span>
          </div>
          <div class="wizard-step-line ${currentStep > 1 ? 'completed' : ''}"></div>
          <div class="wizard-step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}" id="navStep2">
            <span class="wizard-step-circle">${currentStep > 2 ? '✓' : '2'}</span>
            <span>Template</span>
          </div>
          <div class="wizard-step-line ${currentStep > 2 ? 'completed' : ''}"></div>
          <div class="wizard-step ${currentStep === 3 ? 'active' : ''}" id="navStep3">
            <span class="wizard-step-circle">3</span>
            <span>Subdomain</span>
          </div>
        </div>

        <!-- Dynamic Step View -->
        <div id="stepContent">
          ${renderStepContent()}
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderStepContent() {
    if (currentStep === 1) {
      return `
        <div class="step-header">
          <span class="step-tag">Step 1 of 3</span>
          <h1 class="step-title">What are you creating?</h1>
          <p class="step-desc">Choose your website type. We'll tailor the templates and studio controls for your focus.</p>
        </div>

        <div class="type-grid">
          <!-- Card 1: Portfolio -->
          <div class="type-card ${selectedType === 'portfolio' ? 'selected' : ''}" data-type="portfolio">
            <div>
              <div class="type-icon">💼</div>
              <h2 class="type-name">Portfolio</h2>
              <p class="type-desc">Showcase your engineering projects, designs, visual art, achievements, and curriculum vitae.</p>
              <div class="type-tags">
                <span class="type-tag">Developers</span>
                <span class="type-tag">Designers</span>
                <span class="type-tag">Scholars</span>
                <span class="type-tag">Resumes</span>
              </div>
            </div>
            <div class="type-select-indicator">
              ${selectedType === 'portfolio' ? '✓ Selected' : 'Click to Select'}
            </div>
          </div>

          <!-- Card 2: Writing & Blog -->
          <div class="type-card ${selectedType === 'blog' ? 'selected' : ''}" data-type="blog">
            <div>
              <div class="type-icon">✍️</div>
              <h2 class="type-name">Writing &amp; Blog</h2>
              <p class="type-desc">Publish research thesis chapters, long-form stories, technical essays, or living digital garden notes.</p>
              <div class="type-tags">
                <span class="type-tag">Thesis</span>
                <span class="type-tag">Stories</span>
                <span class="type-tag">Essays</span>
                <span class="type-tag">Digital Garden</span>
              </div>
            </div>
            <div class="type-select-indicator">
              ${selectedType === 'blog' ? '✓ Selected' : 'Click to Select'}
            </div>
          </div>

          <!-- Card 3: Landing Page -->
          <div class="type-card ${selectedType === 'business' ? 'selected' : ''}" data-type="business">
            <div>
              <div class="type-icon">🚀</div>
              <h2 class="type-name">Landing Page</h2>
              <p class="type-desc">Launch a micro-SaaS, open-source tool, digital product, or studio with proof metrics and lead forms.</p>
              <div class="type-tags">
                <span class="type-tag">Micro-SaaS</span>
                <span class="type-tag">Products</span>
                <span class="type-tag">Studio</span>
                <span class="type-tag">Tools</span>
              </div>
            </div>
            <div class="type-select-indicator">
              ${selectedType === 'business' ? '✓ Selected' : 'Click to Select'}
            </div>
          </div>
        </div>

        <div class="wizard-actions">
          <a href="/dashboard" class="btn btn-secondary">&larr; Return to Dashboard</a>
          <button class="btn btn-primary btn-lg" id="btnNextStep1">
            Choose Template &rarr;
          </button>
        </div>
      `;
    }

    if (currentStep === 2) {
      const curatedIds = TYPE_TEMPLATES[selectedType] || TYPE_TEMPLATES.portfolio;
      const visibleTemplates = filterMode === 'all' 
        ? TEMPLATES 
        : TEMPLATES.filter(t => curatedIds.includes(t.id));

      return `
        <div class="step-header">
          <span class="step-tag">Step 2 of 3</span>
          <h1 class="step-title">Choose your starting template</h1>
          <p class="step-desc">Handcrafted designs optimized for zero-runtime edge speed. You can customize colors and typography anytime.</p>
        </div>

        <div class="filter-bar">
          <button class="filter-btn ${filterMode === 'curated' ? 'active' : ''}" id="filterCurated">
            Curated for ${getTypeName(selectedType)} (${curatedIds.length})
          </button>
          <button class="filter-btn ${filterMode === 'all' ? 'active' : ''}" id="filterAll">
            All Templates (${TEMPLATES.length})
          </button>
        </div>

        <div class="tmpl-grid">
          ${visibleTemplates.map(t => `
            <div class="tmpl-card ${selectedTemplate === t.id ? 'selected' : ''}" data-template="${t.id}">
              <div>
                <div class="tmpl-header">
                  <span class="badge" style="background:var(--paper-soft); color:var(--muted); border:1px solid var(--line);">${t.category}</span>
                  <div class="tmpl-accent" style="background:${t.accentDefault};"></div>
                </div>
                <h3 class="tmpl-title">${t.name}</h3>
                <p class="tmpl-desc">${t.description}</p>
                <div class="tmpl-features">
                  ${t.features.slice(0, 3).map(f => `<span>${f}</span>`).join('')}
                </div>
              </div>

              <div class="tmpl-actions">
                <button type="button" class="btn btn-secondary btn-sm btn-preview-template" data-template="${t.id}" style="flex:1;">Preview</button>
                <button type="button" class="btn ${selectedTemplate === t.id ? 'btn-primary' : 'btn-outline'} btn-sm btn-select-template" data-template="${t.id}">
                  ${selectedTemplate === t.id ? '✓ Selected' : 'Select'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="wizard-actions">
          <button class="btn btn-secondary" id="btnBackToStep1">&larr; Back to Type</button>
          <button class="btn btn-primary btn-lg" id="btnNextStep2">
            Continue to Subdomain &rarr;
          </button>
        </div>
      `;
    }

    if (currentStep === 3) {
      const tmpl = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
      const placeholderTitle = selectedType === 'blog' 
        ? 'e.g. Investigations in Modern Architecture'
        : selectedType === 'business'
        ? 'e.g. HighVelocity Cloud Systems'
        : 'e.g. Alex Rivera - Staff Software Engineer';

      return `
        <div class="step-header">
          <span class="step-tag">Step 3 of 3</span>
          <h1 class="step-title">Claim your free address &amp; title</h1>
          <p class="step-desc">Every website receives an instant free subdomain with global SSL. Choose your address to launch the studio.</p>
        </div>

        <div class="identity-box">
          <form id="step3Form">
            <div class="form-group">
              <label class="form-label" style="font-weight:700;">Website Title / Name</label>
              <input type="text" class="form-input" id="wizardSiteTitle" required value="${escapeHtml(siteTitle)}" placeholder="${placeholderTitle}">
              <div style="font-size:12px; color:var(--muted); margin-top:6px;">This will be displayed as the main brand and browser header.</div>
            </div>

            <div class="form-group" style="margin-top:24px;">
              <label class="form-label" style="font-weight:700;">Choose Subdomain</label>
              <div class="subdomain-input-group">
                <span class="subdomain-prefix">https://</span>
                <input type="text" class="subdomain-input" id="wizardSubdomain" required value="${escapeHtml(subdomainSlug)}" placeholder="yourname" maxlength="32">
                <span class="subdomain-suffix">.${CONFIG.PLATFORM_DOMAIN}</span>
              </div>
              <div id="wizardSubdomainStatus" style="font-size:13px; margin-top:8px; min-height:22px; color:var(--muted);">
                Letters, numbers, and hyphens only (3-32 characters).
              </div>
            </div>

            <div style="background:var(--paper-soft); border:1px solid var(--line); border-radius:8px; padding:16px; margin-top:24px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.08em; font-weight:700; color:var(--muted);">Starting Template</div>
                <div style="font-weight:700; color:var(--ink); font-size:15px;">${tmpl.name}</div>
              </div>
              <span class="badge" style="background:#ffffff; border:1px solid var(--line);">${tmpl.category}</span>
            </div>

            <div class="wizard-actions" style="margin-top:28px;">
              <button type="button" class="btn btn-secondary" id="btnBackToStep2">&larr; Back to Templates</button>
              <button type="submit" class="btn btn-primary btn-lg" id="btnSubmitWizard" ${isSlugAvailable ? '' : 'disabled'} style="flex:1;">
                Launch Studio &amp; Start Building &rarr;
              </button>
            </div>
          </form>
        </div>
      `;
    }
  }

  function attachEvents() {
    // Stepper navigation clicks
    const nav1 = container.querySelector('#navStep1');
    const nav2 = container.querySelector('#navStep2');
    const nav3 = container.querySelector('#navStep3');
    if (nav1) nav1.addEventListener('click', () => { currentStep = 1; render(); });
    if (nav2) nav2.addEventListener('click', () => { currentStep = 2; render(); });
    if (nav3 && isSlugAvailable) nav3.addEventListener('click', () => { currentStep = 3; render(); });

    // Step 1 Events
    if (currentStep === 1) {
      container.querySelectorAll('.type-card').forEach(card => {
        card.addEventListener('click', () => {
          selectedType = card.getAttribute('data-type');
          // Auto pick default template for this type
          if (selectedType === 'blog') selectedTemplate = 'thesis-story';
          else if (selectedType === 'business') selectedTemplate = 'product-launch';
          else selectedTemplate = 'split-engineer';
          render();
        });
      });

      const next1 = container.querySelector('#btnNextStep1');
      if (next1) {
        next1.addEventListener('click', () => {
          currentStep = 2;
          render();
        });
      }
    }

    // Step 2 Events
    if (currentStep === 2) {
      const filterCurated = container.querySelector('#filterCurated');
      const filterAll = container.querySelector('#filterAll');
      if (filterCurated) {
        filterCurated.addEventListener('click', () => { filterMode = 'curated'; render(); });
      }
      if (filterAll) {
        filterAll.addEventListener('click', () => { filterMode = 'all'; render(); });
      }

      container.querySelectorAll('.tmpl-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.btn-preview-template')) return;
          selectedTemplate = card.getAttribute('data-template');
          render();
        });
      });

      container.querySelectorAll('.btn-select-template').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedTemplate = btn.getAttribute('data-template');
          render();
        });
      });

      attachTemplatePreviewButtons(container);

      const back1 = container.querySelector('#btnBackToStep1');
      if (back1) back1.addEventListener('click', () => { currentStep = 1; render(); });

      const next2 = container.querySelector('#btnNextStep2');
      if (next2) {
        next2.addEventListener('click', () => {
          currentStep = 3;
          render();
        });
      }
    }

    // Step 3 Events
    if (currentStep === 3) {
      const titleInput = container.querySelector('#wizardSiteTitle');
      const slugInput = container.querySelector('#wizardSubdomain');
      const statusEl = container.querySelector('#wizardSubdomainStatus');
      const submitBtn = container.querySelector('#btnSubmitWizard');
      const back2 = container.querySelector('#btnBackToStep2');

      if (back2) back2.addEventListener('click', () => { currentStep = 2; render(); });

      if (titleInput) {
        titleInput.addEventListener('input', () => {
          siteTitle = titleInput.value;
          if (!slugEditedManually) {
            const generated = siteTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 24);
            slugInput.value = generated;
            subdomainSlug = generated;
            checkSlug();
          }
        });
      }

      if (slugInput) {
        slugInput.addEventListener('input', () => {
          slugEditedManually = true;
          subdomainSlug = slugInput.value.toLowerCase().trim();
          checkSlug();
        });
      }

      function checkSlug() {
        clearTimeout(debounceTimer);
        const val = (subdomainSlug || '').trim();
        if (!val) {
          statusEl.textContent = 'Letters, numbers, and hyphens only (3-32 characters).';
          statusEl.style.color = 'var(--muted)';
          isSlugAvailable = false;
          if (submitBtn) submitBtn.disabled = true;
          return;
        }

        statusEl.innerHTML = '<span style="color:var(--muted);">Checking availability...</span>';

        debounceTimer = setTimeout(async () => {
          const avail = await checkSubdomainAvailability(val);
          if (avail.available) {
            statusEl.innerHTML = `<span style="color:var(--accent-emerald, #10b981);">✓ <strong>${avail.slug}.${CONFIG.PLATFORM_DOMAIN}</strong> is available!</span>`;
            isSlugAvailable = true;
            if (submitBtn) submitBtn.disabled = false;
          } else {
            statusEl.innerHTML = `<span style="color:var(--accent-rose, #e11d48);">✕ ${avail.reason}</span>`;
            isSlugAvailable = false;
            if (submitBtn) submitBtn.disabled = true;
          }
        }, 320);
      }

      // Initial check if slug exists
      if (subdomainSlug) {
        checkSlug();
      }

      // Form submission -> create site -> go to build page
      const form = container.querySelector('#step3Form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!isSlugAvailable) return;

          submitBtn.disabled = true;
          submitBtn.textContent = 'Launching Studio...';

          try {
            const isBlog = selectedType === 'blog';
            const isWritingTemplate = ['personal-blog', 'thesis-story', 'minimal-text', 'digital-garden', 'docs-book'].includes(selectedTemplate);
            const actualTemplate = (isBlog && !isWritingTemplate) ? 'personal-blog' : selectedTemplate;
            const tmpl = TEMPLATES.find(t => t.id === actualTemplate) || TEMPLATES[0];

            const finalTitle = siteTitle.trim() || (isBlog ? 'My Thesis & Stories' : selectedType === 'business' ? 'Launch Project' : 'Portfolio Website');
            const finalDesc = isBlog 
              ? 'Writings, research thesis, serialized stories, and ideas.'
              : selectedType === 'business'
              ? 'High-converting product showcase and platform architecture.'
              : 'Portfolio, engineering projects, and credentials.';

            const newSite = await createSite({
              site_type: selectedType,
              title: finalTitle,
              description: finalDesc,
              template_id: actualTemplate,
              subdomain_slug: subdomainSlug,
              theme_config: {
                primaryColor: isBlog ? '#b45309' : tmpl.accentDefault,
                fontPair: isBlog ? 'merriweather-roboto' : 'inter-outfit'
              },
              seo_config: { metaTitle: finalTitle, metaDescription: finalDesc, discourageSearch: false },
              content: {
                hero: {
                  headline: finalTitle,
                  tagline: finalDesc,
                  bio: isBlog
                    ? 'Welcome to my writings. Here you will find essays, thesis chapters, stories, and research.'
                    : 'Welcome to my website. I build thoughtful digital products and write about modern engineering.'
                },
                about: {
                  body: isBlog
                    ? 'About the author, research background, and writing trajectory.'
                    : 'Write your biography and story here. Share your achievements, interests, and background.'
                },
                skills: isBlog 
                  ? [] 
                  : [{ name: 'TypeScript' }, { name: 'Cloudflare Workers' }, { name: 'PostgreSQL' }, { name: 'Distributed Systems' }, { name: 'Design Systems' }],
                projects: isBlog ? [] : [
                  {
                    title: 'Distributed Edge Mesh',
                    description: 'A global microsecond edge routing and static delivery engine serving 50M+ requests with sub-15ms response latency.',
                    tags: ['Cloudflare Workers', 'Edge Computing', 'TypeScript'],
                    liveUrl: 'https://example.com',
                    githubUrl: 'https://github.com/example/edge-mesh'
                  },
                  {
                    title: 'Zero-Runtime Design Architecture',
                    description: 'Pure semantic HTML compiler and CSS token system producing zero hydration overhead and 100/100 Lighthouse performance.',
                    tags: ['HTML5', 'CSS Architecture', 'Performance'],
                    liveUrl: 'https://example.com',
                    githubUrl: 'https://github.com/example/zero-runtime'
                  },
                  {
                    title: 'Real-Time Telemetry Shaders',
                    description: 'Hardware-accelerated WebGL dashboard visualizing high-throughput streaming metrics with 60 FPS silky smooth rendering.',
                    tags: ['WebGL', 'Canvas', 'Performance'],
                    liveUrl: 'https://example.com',
                    githubUrl: 'https://github.com/example/telemetry'
                  }
                ],
                experience: isBlog ? [] : [
                  {
                    role: 'Principal Platform Architect',
                    company: 'Cloud Scale Infrastructure',
                    period: '2023 - Present',
                    description: 'Leading global edge infrastructure, high-throughput static publishing systems, and developer productivity tooling.'
                  },
                  {
                    role: 'Senior Full-Stack Engineer',
                    company: 'Modern Web Studio',
                    period: '2021 - 2023',
                    description: 'Designed accessible design systems, resilient cloud backends, and responsive user interfaces.'
                  }
                ],
                education: isBlog ? [] : [
                  {
                    degree: 'B.S. in Computer Science & Systems',
                    institution: 'Institute of Technology',
                    year: '2017 - 2021',
                    details: 'Specialization in distributed computing, networking protocols, and systems performance.'
                  }
                ],
                contact: { enableForm: true, heading: "Let's connect" }
              },
              posts: isBlog ? [
                {
                  title: 'First Story or Thesis Chapter',
                  slug: 'first-story',
                  excerpt: 'An introduction to my writing, thesis, and ideas.',
                  body_markdown: '# Welcome to My Writings\n\nThis is where you can write your thesis, personal stories, essays, or research papers.\n\nEvery published piece of writing receives its own dedicated, permanent URL on your subdomain.',
                  tags: ['story', 'writing'],
                  status: 'published',
                  published_at: new Date().toISOString()
                }
              ] : []
            });

            showToast('Website created! Opening Studio...', 'success');
            // Directly navigate to build page
            navigate(`/editor/${newSite.id}`);
          } catch (err) {
            showToast(err.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Launch Studio & Start Building →';
          }
        });
      }
    }
  }

  // Initial render
  render();
}

// ------------------------------------------------------------------------------
// PAGE 12: 404 NOT FOUND
// ------------------------------------------------------------------------------
function render404Page(container) {
  container.innerHTML = `
    <div class="app-container" style="padding:100px 0; text-align:center;">
      <span class="badge" style="background:#fff1f2; color:#e11d48; border:1px solid #fecdd3; margin-bottom:16px;">Error 404</span>
      <h1 style="font-size:36px; font-weight:800; margin-bottom:12px; color:var(--ink);">Page Not Found</h1>
      <p style="color:var(--muted); max-width:440px; margin:0 auto 28px;">The page you are looking for does not exist on MNDO Builder.</p>
      <a href="/" class="btn btn-primary">Return Home</a>
    </div>
  `;
}

function escapeHtml(str) {
  const p = document.createElement('p');
  p.textContent = str || '';
  return p.innerHTML;
}
