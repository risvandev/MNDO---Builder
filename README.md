# MNDO Builder

> A free, lightweight website creation and publishing platform focused primarily on students, developers, and personal portfolios.

MNDO Builder allows anyone to create a professional, mobile-responsive website without writing code. Users select a starter template, input their details and projects, customize appearance, preview live, and publish immediately to a free subdomain such as `risvan.mndo.online`.

---

## Key Priorities & Architecture

1. **₹0 Initial Operating Cost**: Runs on Cloudflare Pages, Cloudflare Workers, and Supabase free tiers.
2. **Zero-React Public HTML**: Published websites render as ordinary semantic HTML5, CSS, and minimal vanilla JavaScript. No React runtime, zero client hydration bugs, and instant First Contentful Paint.
3. **Single Wildcard Worker Routing**: All published subdomains (`*.mndo.online/*`) are served through a single Cloudflare Worker. No separate hosting projects or DNS records are created per user.
4. **Apex Domain Safety**: The existing website at `mndo.online` is protected and preserved without interference.
5. **Form-Based Studio**: Clean, intuitive form editor with live isolated iframe preview (Desktop, Tablet, Mobile) without complicated drag-and-drop bloat.
6. **Automatic Technical Resources**: Automatically generates `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/manifest.webmanifest`, and `/feed.xml` directly from saved content.

---

## 8 Production Starter Templates

| Template | Category | Description |
| :--- | :--- | :--- |
| **Minimal Portfolio** | Portfolio | Swiss typography, monochrome high-contrast, generous whitespace. |
| **Developer Portfolio** | Developer | Dark terminal motif, monospace accents, tech stack pills, repo cards. |
| **Student / Academic** | Academic | Editorial serif typography, research interests, publications, CV download. |
| **Professional Profile** | Executive | Sleek corporate presentation, career timeline, impact stats, testimonials. |
| **Creative Portfolio** | Design | Bold expressive typography, visual project grid, art gallery showcase. |
| **Modern Portfolio** | Tech / SaaS | Glassmorphism styling, soft gradient glow, interactive pill tags. |
| **Personal Blog** | Blogging | Reading-time estimate, article archive, author card, RSS feed. |
| **Small Business** | Landing | Services grid with pricing, customer reviews, hours & consultation form. |

---

## Project Structure

```text
mndo-builder/
├── index.html                  # Application entry point
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite build configuration
├── .env.example                # Documented environment variable template
├── src/
│   ├── styles/                 # Pure CSS design system
│   │   ├── base.css            # Tokens, resets, theme variables
│   │   ├── layout.css          # Header, footer, grid wrappers
│   │   ├── components.css      # Buttons, badges, cards, modals, toasts
│   │   └── editor.css          # Studio sidebar, repeaters, iframe viewport
│   ├── js/
│   │   ├── app.js              # Application bootstrapper
│   │   ├── router.js           # Client-side router & platform pages
│   │   ├── config.js           # Configuration constants & quotas
│   │   ├── supabase.js         # Supabase client & local mock adapter
│   │   ├── auth.js             # Email/password & Google OAuth
│   │   ├── dashboard.js        # Minimal user dashboard
│   │   ├── editor.js           # Form-based studio & live preview
│   │   ├── publishing.js       # Subdomain publishing & unpublishing
│   │   ├── uploads.js          # File validation & upload handling
│   │   ├── validation.js       # Subdomain slug validation & availability
│   │   └── components/
│   │       ├── toast.js        # Toast alerts
│   │       └── modal.js        # Accessible dialogs
│   └── templates/              # Shared template engine
│       ├── sanitizer.js        # XSS protection, safe URLs & markdown
│       ├── seo-generators.js   # robots.txt, sitemap, llms.txt, feed, 404
│       ├── common.js           # Shared <head>, nav, contact form, footer
│       ├── minimal.js          # Template 1
│       ├── developer.js        # Template 2
│       ├── academic.js         # Template 3
│       ├── professional.js     # Template 4
│       ├── creative.js         # Template 5
│       ├── modern.js           # Template 6
│       ├── personal-blog.js    # Template 7
│       ├── business.js         # Template 8
│       └── index.js            # Main template registry & dispatcher
├── worker/
│   ├── src/
│   │   ├── index.js            # Cloudflare Worker fetch handler
│   │   ├── hostname.js         # Subdomain parser & reserved names
│   │   ├── public-site.js      # Public read-only Supabase RPC loader
│   │   ├── contact-forms.js    # /api/contact handler with honeypot
│   │   └── security.js         # CSP & HTTP security headers
│   └── wrangler.toml           # Cloudflare Worker configuration
├── supabase/
│   ├── migrations/
│   │   └── 20261026000000_init_schema.sql # PostgreSQL schema & RLS
│   └── seed.sql                # Starter seed data for demo & testing
├── tests/                      # Automated Vitest test suite
│   ├── slug-validation.test.js
│   ├── html-sanitizer.test.js
│   ├── template-renderer.test.js
│   ├── seo-resources.test.js
│   └── worker-routing.test.js
├── DEPLOYMENT.md               # Step-by-step production deployment guide
└── SECURITY.md                 # Security model & RLS architecture
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. 
*Note: The builder includes an automatic local storage adapter so you can immediately create, customize, and preview websites even before connecting Supabase credentials.*

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
Generates production-optimized assets in `dist/`.

---

## Free-Tier Usage Quotas

To ensure the platform operates reliably at zero cost, quotas are enforced:
- **Websites per account**: Maximum 3 websites.
- **Total account storage**: Maximum 20 MB.
- **Images**: JPG, PNG, WebP only; maximum 2 MB per file.
- **Documents / Resumes**: PDF only; maximum 5 MB per file.
- **Logos / Favicons**: Maximum 512 KB.
- **Email Verification**: Required prior to publishing.
