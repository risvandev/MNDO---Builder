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
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export async function handleRoute() {
  const hash = window.location.hash || '#/';
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Header & Footer visibility logic (Studio Editor has its own full-screen layout)
  const isStudio = hash.startsWith('#/editor/');

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
  if (hash === '#/' || hash === '#' || hash === '') {
    renderHomePage(mainWrap);
  } else if (hash === '#/templates') {
    renderTemplatesCatalog(mainWrap);
  } else if (hash === '#/features') {
    renderFeaturesPage(mainWrap);
  } else if (hash === '#/faq') {
    renderFaqPage(mainWrap);
  } else if (hash === '#/privacy') {
    renderPrivacyPage(mainWrap);
  } else if (hash === '#/terms') {
    renderTermsPage(mainWrap);
  } else if (hash === '#/contact') {
    renderPlatformContactPage(mainWrap);
  } else if (hash === '#/report-abuse') {
    renderReportAbusePage(mainWrap);
  } else if (hash === '#/auth') {
    renderAuthPage(mainWrap);
  } else if (hash === '#/auth/callback') {
    renderAuthCallbackPage(mainWrap);
  } else if (hash === '#/dashboard') {
    await renderDashboard(mainWrap);
  } else if (hash === '#/create') {
    renderCreateWizard(mainWrap);
  } else if (hash.startsWith('#/editor/')) {
    const siteId = hash.replace('#/editor/', '').split('?')[0];
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
        <a href="#/dashboard" class="btn btn-secondary btn-sm">My Dashboard</a>
        <a href="#/create" class="btn btn-primary btn-sm">+ New Site</a>
      `;
    } else {
      authActions.innerHTML = `
        <a href="#/auth" class="btn btn-secondary btn-sm">Sign In</a>
        <a href="#/auth" class="btn btn-primary btn-sm">Get Started Free</a>
      `;
    }
  });

  header.innerHTML = `
    <div class="app-container">
      <div class="header-inner">
        <a href="#/" class="brand-wrapper">
          <div class="brand-icon">M</div>
          <div>
            <span class="brand-title">MNDO Builder</span>
          </div>
          <span class="brand-badge">Free</span>
        </a>

        <nav class="main-nav">
          <a href="#/templates" class="nav-item">Templates</a>
          <a href="#/features" class="nav-item">Features</a>
          <a href="#/faq" class="nav-item">FAQ & Setup</a>
          <a href="#/contact" class="nav-item">Contact</a>
        </nav>

        <div class="nav-actions" id="headerAuthActions">
          <a href="#/auth" class="btn btn-primary btn-sm">Get Started</a>
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
            <div class="brand-icon" style="width:28px; height:28px; font-size:14px;">M</div>
            <span class="brand-title" style="font-size:18px;">MNDO Builder</span>
          </div>
          <p style="color:var(--text-muted); font-size:13px; max-width:320px; line-height:1.6; margin-bottom:16px;">
            A lightweight, free website creation and publishing platform for students, developers, and creators.
          </p>
          <div style="font-size:12px; color:var(--text-dim);">
            Wildcard domains powered by Cloudflare Workers & Supabase.
          </div>
        </div>

        <div>
          <div class="footer-col-title">Product</div>
          <ul class="footer-links">
            <li><a href="#/templates" class="footer-link">8 Starter Templates</a></li>
            <li><a href="#/features" class="footer-link">Architecture & Features</a></li>
            <li><a href="#/create" class="footer-link">Create a Website</a></li>
            <li><a href="#/dashboard" class="footer-link">User Dashboard</a></li>
          </ul>
        </div>

        <div>
          <div class="footer-col-title">Support & Help</div>
          <ul class="footer-links">
            <li><a href="#/faq" class="footer-link">Help & DNS FAQ</a></li>
            <li><a href="#/contact" class="footer-link">Contact Us</a></li>
            <li><a href="#/report-abuse" class="footer-link">Report Abuse</a></li>
          </ul>
        </div>

        <div>
          <div class="footer-col-title">Legal</div>
          <ul class="footer-links">
            <li><a href="#/privacy" class="footer-link">Privacy Policy</a></li>
            <li><a href="#/terms" class="footer-link">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div>&copy; ${year} MNDO Builder. Free community edition.</div>
        <div style="display:flex; gap:16px;">
          <span>Zero Paid APIs</span>
          <span>&bull;</span>
          <span>Zero React Runtime on Public Sites</span>
        </div>
      </div>
    </div>
  `;
  return footer;
}

// ------------------------------------------------------------------------------
// PAGE 1: HOME LANDING PAGE
// ------------------------------------------------------------------------------
function renderHomePage(container) {
  container.innerHTML = `
    <!-- Hero Section -->
    <section class="page-section" style="padding-top:72px; padding-bottom:72px; text-align:center;">
      <div class="app-container">
        <span class="section-tag">Free Website & Portfolio Publishing</span>
        <h1 style="font-size:clamp(36px, 6vw, 64px); font-weight:800; letter-spacing:-0.03em; max-width:860px; margin:0 auto 20px; line-height:1.1;">
          Build and publish your portfolio in minutes. <span style="background:linear-gradient(135deg, #6366f1, #06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">No coding required.</span>
        </h1>
        <p style="font-size:18px; color:var(--text-muted); max-width:640px; margin:0 auto 36px; line-height:1.6;">
          Choose a responsive template, enter your projects and background, and publish instantly to a free 
          <code style="font-family:var(--font-mono); color:var(--accent-cyan); background:rgba(6,182,212,0.1); padding:2px 8px; border-radius:4px;">username.${CONFIG.PLATFORM_DOMAIN}</code> subdomain.
        </p>

        <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap; margin-bottom:56px;">
          <a href="#/create" class="btn btn-primary btn-lg">Start Building Free &rarr;</a>
          <a href="#/templates" class="btn btn-secondary btn-lg">Explore 8 Templates</a>
        </div>

        <!-- Interactive Subdomain Bar Demo -->
        <div style="max-width:540px; margin:0 auto; background:rgba(18,24,38,0.8); border:1px solid var(--border-subtle); border-radius:var(--radius-lg); padding:16px; box-shadow:var(--shadow-lg);">
          <div style="font-size:12px; font-weight:700; color:var(--text-dim); text-transform:uppercase; margin-bottom:8px; text-align:left;">Claim your address:</div>
          <div class="subdomain-input-group">
            <span class="subdomain-prefix">https://</span>
            <input type="text" class="subdomain-input" id="homeSubdomainInput" placeholder="yourname" maxlength="32">
            <span class="subdomain-suffix">.${CONFIG.PLATFORM_DOMAIN}</span>
          </div>
          <div id="homeSubdomainStatus" style="font-size:12px; margin-top:8px; text-align:left; color:var(--text-dim);">
            Enter a username to check instant availability
          </div>
        </div>
      </div>
    </section>

    <!-- Templates Showcase Carousel -->
    <section class="page-section" style="background:var(--bg-surface); border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
      <div class="app-container">
        <div class="section-headline">
          <span class="section-tag">Curated Designs</span>
          <h2 class="section-title">8 Production Starter Templates</h2>
          <p class="section-desc">Half minimal and typography-focused, half expressive with visual showcases. Mobile-ready and lightning fast.</p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(270px, 1fr)); gap:24px;">
          ${TEMPLATES.map(t => `
            <div class="card card-hover" style="display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                  <span class="badge" style="background:rgba(99,102,241,0.15); color:#a5b4fc; border:1px solid rgba(99,102,241,0.3);">${t.category}</span>
                  <div style="width:14px; height:14px; border-radius:50%; background:${t.accentDefault};"></div>
                </div>
                <h3 style="font-size:18px; font-weight:700; color:#fff; margin-bottom:8px;">${t.name}</h3>
                <p style="font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:16px;">${t.description}</p>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary btn-sm btn-preview-template" data-template="${t.id}" style="flex:1;">Live Preview</button>
                <a href="#/create" class="btn btn-primary btn-sm">Use</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Why MNDO Builder (Zero Runtime & Architecture) -->
    <section class="page-section">
      <div class="app-container">
        <div class="section-headline">
          <span class="section-tag">Performance by Design</span>
          <h2 class="section-title">Why MNDO Builder is Different</h2>
          <p class="section-desc">We engineered MNDO Builder to be light, sustainable, and free forever on available tiers.</p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:28px;">
          <div class="card">
            <div style="font-size:28px; margin-bottom:12px;">⚡</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:8px; color:#fff;">Zero-React Public HTML</h3>
            <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">Published sites return pure, semantic HTML and clean CSS without megabytes of JavaScript frameworks. 100/100 Lighthouse performance.</p>
          </div>
          <div class="card">
            <div style="font-size:28px; margin-bottom:12px;">🌐</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:8px; color:#fff;">Edge Subdomain Routing</h3>
            <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">A single Cloudflare Worker handles wildcard routing (*.mndo.online). No manual DNS records or individual project deployments needed.</p>
          </div>
          <div class="card">
            <div style="font-size:28px; margin-bottom:12px;">🛡️</div>
            <h3 style="font-size:18px; font-weight:700; margin-bottom:8px; color:#fff;">Built-in SEO & llms.txt</h3>
            <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">Automatic robots.txt, sitemap.xml, PWA webmanifest, RSS feeds, and modern llms.txt markdown summaries generated directly from your content.</p>
          </div>
        </div>
      </div>
    </section>
  `;

  // Home subdomain availability input logic
  const homeSlugInput = container.querySelector('#homeSubdomainInput');
  const homeStatus = container.querySelector('#homeSubdomainStatus');
  let homeTimer = null;

  if (homeSlugInput && homeStatus) {
    homeSlugInput.addEventListener('input', (e) => {
      clearTimeout(homeTimer);
      const val = e.target.value.toLowerCase().trim();
      if (!val) {
        homeStatus.textContent = 'Enter a username to check instant availability';
        homeStatus.style.color = 'var(--text-dim)';
        return;
      }

      homeStatus.textContent = 'Checking availability...';
      homeStatus.style.color = 'var(--accent-amber)';

      homeTimer = setTimeout(async () => {
        const avail = await checkSubdomainAvailability(val);
        if (avail.available) {
          homeStatus.innerHTML = `<span style="color:var(--accent-emerald);">✓ <strong>${avail.slug}.${CONFIG.PLATFORM_DOMAIN}</strong> is available! <a href="#/create" style="margin-left:8px; text-decoration:underline;">Claim it now &rarr;</a></span>`;
        } else {
          homeStatus.innerHTML = `<span style="color:var(--accent-rose);">✕ ${avail.reason}</span>`;
        }
      }, 350);
    });
  }

  // Template preview modal listeners
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
        <h1 class="section-title">Explore All 8 Templates</h1>
        <p class="section-desc">Each template is fully mobile-responsive and crafted for high visual appeal without requiring any coding.</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:28px;">
        ${TEMPLATES.map(t => `
          <div class="card card-hover" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span class="badge" style="background:rgba(99,102,241,0.15); color:#a5b4fc; border:1px solid rgba(99,102,241,0.3);">${t.category}</span>
                <span style="font-size:12px; color:var(--text-dim); font-family:var(--font-mono);">ID: ${t.id}</span>
              </div>
              <h3 style="font-size:20px; font-weight:700; color:#fff; margin-bottom:8px;">${t.name}</h3>
              <p style="font-size:14px; color:var(--text-muted); line-height:1.6; margin-bottom:16px;">${t.description}</p>
              
              <div style="margin-bottom:20px;">
                <div style="font-size:12px; font-weight:700; color:var(--text-dim); text-transform:uppercase; margin-bottom:8px;">Key Features:</div>
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  ${t.features.map(f => `<span style="font-size:11px; background:rgba(255,255,255,0.05); color:#cbd5e1; padding:3px 8px; border-radius:4px;">${f}</span>`).join('')}
                </div>
              </div>
            </div>

            <div style="display:flex; gap:10px;">
              <button class="btn btn-secondary btn-sm btn-preview-template" data-template="${t.id}" style="flex:1;">Live Preview</button>
              <a href="#/create" class="btn btn-primary btn-sm">Use Template</a>
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
          site_type: 'portfolio',
          template_id: templateId,
          subdomain_slug: 'demo',
          theme_config: { primaryColor: tmpl.accentDefault, fontPair: 'inter-outfit' },
          seo_config: {},
          content: {
            hero: {
              headline: 'Jane Doe',
              tagline: 'Senior Full Stack Engineer & Cloud Architect',
              bio: 'Passionate about crafting fast, resilient web applications and distributed systems.'
            },
            about: {
              body: 'I have 6+ years of experience designing high-throughput applications and leading engineering teams. When not coding, I contribute to open source and mentor budding developers.'
            },
            skills: [{ name: 'JavaScript' }, { name: 'Cloudflare Workers' }, { name: 'PostgreSQL' }, { name: 'Node.js' }],
            projects: [
              {
                title: 'High Velocity Cache',
                description: 'An edge caching layer reducing database latency by 85%.',
                tags: ['Edge', 'KV', 'Rust'],
                liveUrl: 'https://example.com'
              }
            ],
            experience: [
              { role: 'Lead Architect', company: 'TechEdge Inc.', period: '2023 - Present', description: 'Overseeing cloud infrastructure and developer productivity.' }
            ],
            contact: { enableForm: true, heading: "Let's connect" }
          }
        },
        pages: [],
        posts: []
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
        <div class="card">
          <h3 style="font-size:20px; font-weight:700; color:#fff; margin-bottom:12px;">Cloudflare Worker Wildcard Routing</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
            Instead of spinning up separate hosting projects or managing individual DNS records for every user, a single lightweight Cloudflare Worker intercepts *.mndo.online/*, resolves the user slug, queries cached public database snapshots, and delivers plain HTML in sub-10ms.
          </p>
        </div>

        <div class="card">
          <h3 style="font-size:20px; font-weight:700; color:#fff; margin-bottom:12px;">Zero React Runtime on Generated Sites</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
            Visitors to your published website get clean, semantic HTML5 and vanilla CSS. There is no React hydration overhead, no framework startup latency, and no mobile battery drain.
          </p>
        </div>

        <div class="card">
          <h3 style="font-size:20px; font-weight:700; color:#fff; margin-bottom:12px;">Automated Machine-Readable llms.txt</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
            Every published website automatically generates /llms.txt alongside robots.txt and sitemap.xml. AI systems and LLM crawlers can accurately read your canonical project index without hallucinations.
          </p>
        </div>

        <div class="card">
          <h3 style="font-size:20px; font-weight:700; color:#fff; margin-bottom:12px;">Security & Row-Level Authorization</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
            Every database table is guarded by PostgreSQL Row Level Security (RLS). Anonymous visitors can only access public data returned by a restricted RPC function, preventing draft leaks or credential exposure.
          </p>
        </div>

        <div class="card">
          <h3 style="font-size:20px; font-weight:700; color:#fff; margin-bottom:12px;">Integrated Spam-Protected Contact Forms</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
            Public visitors can submit messages directly to your site owner inbox. Submissions are guarded by honeypot anti-spam fields, strict length validation, and Cloudflare rate limits.
          </p>
        </div>

        <div class="card">
          <h3 style="font-size:20px; font-weight:700; color:#fff; margin-bottom:12px;">Free-Tier Sustainability (₹0 Operating Cost)</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
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
        <div class="card">
          <h3 style="font-size:17px; font-weight:700; color:#fff; margin-bottom:8px;">How does the *.mndo.online subdomain assignment work?</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
            When you enter a username (e.g., <code>risvan</code>), our system checks that it is available and not a reserved platform name. Upon publishing, the Cloudflare Worker wildcard route automatically serves your website at <code>https://risvan.mndo.online</code> with an automatic SSL certificate.
          </p>
        </div>

        <div class="card">
          <h3 style="font-size:17px; font-weight:700; color:#fff; margin-bottom:8px;">Will my existing website at mndo.online be affected?</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
            No. The apex domain (<code>mndo.online</code>) and <code>www.mndo.online</code> are explicitly guarded. The Worker passes through apex requests or reserves them for your existing origin. Your existing DNS records (MX, mail, SPF, apex A/CNAME) must be preserved during Cloudflare zone setup.
          </p>
        </div>

        <div class="card">
          <h3 style="font-size:17px; font-weight:700; color:#fff; margin-bottom:8px;">Why is email verification required before publishing?</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
            To prevent spam, automated bots, and abuse of the free subdomain wildcard service, publishing is strictly restricted to accounts with verified email addresses.
          </p>
        </div>

        <div class="card">
          <h3 style="font-size:17px; font-weight:700; color:#fff; margin-bottom:8px;">What are the free account limits?</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
            Each free account can create up to 3 websites and store up to 20 MB of assets (images up to 2 MB, PDF resumes up to 5 MB). This ensures the platform can operate reliably at ₹0 cost on free cloud tiers.
          </p>
        </div>

        <div class="card">
          <h3 style="font-size:17px; font-weight:700; color:#fff; margin-bottom:8px;">Can I unpublish or delete my website later?</h3>
          <p style="color:var(--text-muted); font-size:14px; line-height:1.6;">
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
      <div style="font-size:13px; color:var(--accent-amber); background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:12px 16px; margin-bottom:28px;">
        <strong>[PLATFORM OWNER REVIEW NEEDED]:</strong> This is a starter legal draft. The platform owner must review and supply their legal entity name, operational jurisdiction, and designated support/DPO email before public commercial operations.
      </div>

      <div class="card" style="font-size:14px; color:var(--text-muted); line-height:1.8;">
        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">1. Information We Collect</h3>
        <p style="margin-bottom:16px;">We collect information you provide directly to us when creating an account, including your email address and display name. When you use the builder, we store your submitted site content, uploaded media (images, PDF documents), and public contact form submissions.</p>

        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">2. Public Website Content</h3>
        <p style="margin-bottom:16px;">Any content, projects, images, and resume documents that you publish to your subdomain (e.g. username.mndo.online) are publicly accessible on the internet. Please do not publish sensitive personal data, private home addresses, or confidential credentials.</p>

        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">3. Service Providers & Hosting</h3>
        <p style="margin-bottom:16px;">We use Cloudflare (for edge routing and DDoS mitigation) and Supabase (for database and file storage). Data is processed in accordance with industry security standards and encrypted in transit.</p>

        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">4. Account & Data Deletion</h3>
        <p style="margin-bottom:16px;">You have the right to delete your website and uploaded assets at any time through the MNDO Builder dashboard. Deleting a site removes its records and stored files from our active database.</p>

        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">5. Contact Information</h3>
        <p>For privacy inquiries or data removal requests, please reach out via our <a href="#/contact">Platform Contact Form</a> or contact <code>[OWNER_CONTACT_EMAIL]</code>.</p>
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
      <div style="font-size:13px; color:var(--accent-amber); background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:12px 16px; margin-bottom:28px;">
        <strong>[PLATFORM OWNER REVIEW NEEDED]:</strong> This document establishes service boundaries and acceptable use. The platform owner must specify governing law and official legal contact details.
      </div>

      <div class="card" style="font-size:14px; color:var(--text-muted); line-height:1.8;">
        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">1. Service Description</h3>
        <p style="margin-bottom:16px;">MNDO Builder provides a free, lightweight website creation and publishing tool. Websites are hosted under wildcard subdomains (*.mndo.online). The service is provided on an "as-is" and "as-available" basis.</p>

        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">2. Acceptable Use Policy</h3>
        <p style="margin-bottom:16px;">You agree not to use MNDO Builder to publish or distribute: phishing pages, malware, spam, illegal content, copyrighted materials without authorization, deceptive impersonation of brands or individuals, or content violating local laws. Violations will result in immediate subdomain suspension.</p>

        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">3. Subdomains & Reserved Names</h3>
        <p style="margin-bottom:16px;">Subdomain slugs are assigned on a first-come, first-served basis subject to platform rules. MNDO Builder reserves the right to reclaim, suspend, or reassign subdomains that infringe on trademarks, mimic platform infrastructure, or remain abandoned.</p>

        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">4. Usage Quotas & Limitations</h3>
        <p style="margin-bottom:16px;">To maintain a free tier, users are subject to reasonable quotas (3 sites per account, 20 MB total storage). Circumventing quotas through automated bot registrations is strictly prohibited.</p>

        <h3 style="color:#fff; font-size:17px; margin-bottom:8px;">5. Abuse Reporting</h3>
        <p>If you encounter an abusive or malicious website hosted on our platform, please report it immediately via the <a href="#/report-abuse">Report Abuse</a> page.</p>
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
function renderAuthPage(container) {
  container.innerHTML = `
    <div class="app-container-sm" style="padding-top:48px; padding-bottom:72px;">
      <div style="max-width:440px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:28px;">
          <h1 style="font-size:28px; font-weight:800; margin-bottom:8px;">MNDO Builder</h1>
          <p style="color:var(--text-muted); font-size:14px;">Sign in to manage and publish your websites.</p>
        </div>

        <div class="card" style="padding:32px;">
          <!-- Auth Mode Toggle -->
          <div class="editor-tabs" style="margin-bottom:24px;">
            <button class="editor-tab-item active" id="btnAuthTabSignIn">Sign In</button>
            <button class="editor-tab-item" id="btnAuthTabSignUp">Register</button>
          </div>

          <!-- Google OAuth Button -->
          <button class="btn btn-secondary" id="btnGoogleAuth" style="width:100%; margin-bottom:20px; font-size:14px;">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"/></svg>
            Continue with Google
          </button>

          <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; color:var(--text-dim); font-size:12px;">
            <div style="flex:1; height:1px; background:var(--border-subtle);"></div>
            <span>or with email</span>
            <div style="flex:1; height:1px; background:var(--border-subtle);"></div>
          </div>

          <!-- Email / Password Form -->
          <form id="authEmailForm">
            <div class="form-group" id="groupDisplayName" style="display:none;">
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
            <button type="submit" class="btn btn-primary" id="btnSubmitAuth" style="width:100%; margin-top:8px;">Sign In</button>
          </form>

          <div style="margin-top:16px; text-align:center;">
            <a href="#" id="linkForgotPassword" style="font-size:12px; color:var(--text-dim);">Forgot password?</a>
          </div>
        </div>
      </div>
    </div>
  `;

  let mode = 'signin';
  const tabSignIn = container.querySelector('#btnAuthTabSignIn');
  const tabSignUp = container.querySelector('#btnAuthTabSignUp');
  const groupName = container.querySelector('#groupDisplayName');
  const btnSubmit = container.querySelector('#btnSubmitAuth');
  const form = container.querySelector('#authEmailForm');

  tabSignIn.addEventListener('click', () => {
    mode = 'signin';
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    groupName.style.display = 'none';
    btnSubmit.textContent = 'Sign In';
  });

  tabSignUp.addEventListener('click', () => {
    mode = 'signup';
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    groupName.style.display = 'block';
    btnSubmit.textContent = 'Create Account';
  });

  // Google OAuth
  container.querySelector('#btnGoogleAuth').addEventListener('click', async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

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
            cancelText: 'Got It'
          });
        } else {
          showToast('Account created successfully!', 'success');
          window.location.hash = '#/dashboard';
        }
      } else {
        await signInWithEmail(email, password);
        showToast('Welcome back!', 'success');
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = mode === 'signup' ? 'Create Account' : 'Sign In';
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
    window.location.hash = '#/dashboard';
  }, 800);
}

// ------------------------------------------------------------------------------
// PAGE 11: CREATE WEBSITE WIZARD
// ------------------------------------------------------------------------------
function renderCreateWizard(container) {
  container.innerHTML = `
    <div class="app-container-sm" style="padding-top:48px; padding-bottom:72px;">
      <div style="margin-bottom:32px;">
        <span class="section-tag">New Website Wizard</span>
        <h1 style="font-size:32px; font-weight:800; margin-bottom:8px;">Create a New Website</h1>
        <p style="color:var(--text-muted); font-size:14px;">Fill in basic details and choose a starting template. You can customize everything later in the Studio.</p>
      </div>

      <div class="card" style="padding:32px;">
        <form id="createSiteForm">
          <div class="form-group">
            <label class="form-label">Website Type</label>
            <select class="form-select" id="wizardSiteType">
              <option value="portfolio">Portfolio (Students, Developers, Creators)</option>
              <option value="personal">Personal Profile & Resume</option>
              <option value="blog">Personal Blog</option>
              <option value="business">Small Business Landing Page</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Website Title / Your Name</label>
            <input type="text" class="form-input" id="wizardSiteTitle" required placeholder="Jane Doe - Software Engineer">
          </div>

          <div class="form-group">
            <label class="form-label">Short Tagline or Description</label>
            <textarea class="form-textarea" rows="2" id="wizardSiteDesc" placeholder="Brief 1-line description..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Starting Template</label>
            <select class="form-select" id="wizardTemplate">
              ${TEMPLATES.map(t => `<option value="${t.id}">${t.name} (${t.category})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Choose Subdomain</label>
            <div class="subdomain-input-group">
              <span class="subdomain-prefix">https://</span>
              <input type="text" class="subdomain-input" id="wizardSubdomain" required placeholder="yourname" maxlength="32">
              <span class="subdomain-suffix">.${CONFIG.PLATFORM_DOMAIN}</span>
            </div>
            <div id="wizardSubdomainStatus" style="font-size:12px; margin-top:8px; color:var(--text-dim);">
              Letters, numbers, and hyphens only (3-32 characters).
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" id="btnSubmitWizard" style="width:100%; margin-top:12px;">
            Create & Open Studio &rarr;
          </button>
        </form>
      </div>
    </div>
  `;

  // Auto-slug generator on title input
  const titleInput = container.querySelector('#wizardSiteTitle');
  const slugInput = container.querySelector('#wizardSubdomain');
  const statusEl = container.querySelector('#wizardSubdomainStatus');
  let slugEditedManually = false;
  let timer = null;

  slugInput.addEventListener('input', () => {
    slugEditedManually = true;
    checkSlug();
  });

  titleInput.addEventListener('input', () => {
    if (!slugEditedManually) {
      const generated = titleInput.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 24);
      slugInput.value = generated;
      checkSlug();
    }
  });

  function checkSlug() {
    clearTimeout(timer);
    const val = slugInput.value.toLowerCase().trim();
    if (!val) {
      statusEl.textContent = 'Letters, numbers, and hyphens only (3-32 characters).';
      statusEl.style.color = 'var(--text-dim)';
      return;
    }

    timer = setTimeout(async () => {
      const avail = await checkSubdomainAvailability(val);
      if (avail.available) {
        statusEl.innerHTML = `<span style="color:var(--accent-emerald);">✓ <strong>${avail.slug}.${CONFIG.PLATFORM_DOMAIN}</strong> is available!</span>`;
      } else {
        statusEl.innerHTML = `<span style="color:var(--accent-rose);">✕ ${avail.reason}</span>`;
      }
    }, 350);
  }

  // Submit wizard
  container.querySelector('#createSiteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('wizardSiteType').value;
    const title = document.getElementById('wizardSiteTitle').value.trim();
    const desc = document.getElementById('wizardSiteDesc').value.trim();
    const templateId = document.getElementById('wizardTemplate').value;
    const slug = document.getElementById('wizardSubdomain').value.trim().toLowerCase();
    const btn = document.getElementById('btnSubmitWizard');

    btn.disabled = true;
    btn.textContent = 'Creating Website...';

    try {
      const tmpl = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
      const newSite = await createSite({
        site_type: type,
        title: title,
        description: desc,
        template_id: templateId,
        subdomain_slug: slug,
        theme_config: { primaryColor: tmpl.accentDefault, fontPair: 'inter-outfit' },
        seo_config: { metaTitle: title, metaDescription: desc, discourageSearch: false },
        content: {
          hero: {
            headline: title,
            tagline: desc || 'Portfolio & Personal Website',
            bio: 'Welcome to my website. I build thoughtful digital products and write about modern engineering.'
          },
          about: {
            body: 'Write your biography and story here. Share your achievements, interests, and background.'
          },
          skills: [{ name: 'JavaScript' }, { name: 'CSS' }, { name: 'Cloudflare' }],
          projects: [],
          experience: [],
          education: [],
          contact: { enableForm: true, heading: "Let's connect" }
        }
      });

      showToast('Website created successfully!', 'success');
      window.location.hash = `#/editor/${newSite.id}`;
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Create & Open Studio →';
    }
  });
}

// ------------------------------------------------------------------------------
// PAGE 12: 404 NOT FOUND
// ------------------------------------------------------------------------------
function render404Page(container) {
  container.innerHTML = `
    <div class="app-container" style="padding:100px 0; text-align:center;">
      <span class="badge" style="background:rgba(244,63,94,0.15); color:#fda4af; margin-bottom:16px;">Error 404</span>
      <h1 style="font-size:36px; font-weight:800; margin-bottom:12px;">Page Not Found</h1>
      <p style="color:var(--text-muted); max-width:440px; margin:0 auto 28px;">The page you are looking for does not exist on MNDO Builder.</p>
      <a href="#/" class="btn btn-primary">Return Home</a>
    </div>
  `;
}

function escapeHtml(str) {
  const p = document.createElement('p');
  p.textContent = str || '';
  return p.innerHTML;
}
