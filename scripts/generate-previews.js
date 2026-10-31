// ==============================================================================
// MNDO BUILDER - STATIC TEMPLATES EXPORT SCRIPT FOR MANUAL TESTING
// ==============================================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEMPLATES, renderSite } from '../src/templates/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../dist/templates-preview');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function getSampleData(tmpl) {
  const isBlog = ['personal-blog', 'thesis-story', 'minimal-text', 'digital-garden', 'docs-book'].includes(tmpl.id);
  const isAcademic = ['academic', 'research-scholar'].includes(tmpl.id);
  const isDeveloper = ['developer', 'oss-maintainer'].includes(tmpl.id);
  const isDesignEngineer = ['design-engineer', 'creative', 'visual-gallery'].includes(tmpl.id);
  const isStaff = ['split-engineer', 'modern', 'professional'].includes(tmpl.id);
  const isResume = tmpl.id === 'interactive-resume';

  if (isAcademic) {
    return {
      site: {
        id: 'preview-site',
        title: 'Dr. Elena Rostova',
        description: 'Principal AI & Systems Research Scholar investigating distributed edge inference and foundation models.',
        site_type: 'portfolio',
        template_id: tmpl.id,
        subdomain_slug: 'elena',
        theme_config: { primaryColor: '#1e3a8a', fontPair: 'merriweather-roboto' },
        seo_config: { contactEmail: 'elena.rostova@stanford.edu' },
        content: {
          hero: {
            headline: 'Dr. Elena Rostova',
            tagline: 'Principal AI & Systems Research Scientist',
            bio: 'Investigating foundation models, distributed edge inference, and memory-bounded neural architectures across Stanford and Berkeley AI Lab.'
          },
          about: {
            body: 'My laboratory investigates decentralized memory-bounded attention KV-cache synchronization across edge networks. We focus on sub-15ms edge compute, provable privacy bounds for distributed learning, and compiling transformers directly into static WebAssembly.'
          },
          skills: [
            { name: 'Distributed Systems' },
            { name: 'Edge AI Inference' },
            { name: 'Model Compression' },
            { name: 'Privacy-Preserving ML' },
            { name: 'WebAssembly Runtimes' }
          ],
          projects: [
            {
              title: 'Zero-Latency Attention Caching for Distributed Edge Inference',
              description: 'We introduce a decentralized memory-bounded attention KV-cache synchronizer operating across edge cloud instances with sub-15ms latency guarantees.',
              tags: ['NeurIPS 2024', 'Edge AI', 'Distributed Systems'],
              liveUrl: 'https://example.edu/paper-1.pdf',
              githubUrl: 'https://github.com/example/attention-cache'
            },
            {
              title: 'Memory-Bounded Transformers for Zero-Runtime Edge Publishing',
              description: 'Formalizing structural sparsity algorithms that compile multi-head attention weights directly into static WebAssembly representations.',
              tags: ['ICML 2023', 'Spotlight', 'Sparse Models'],
              liveUrl: 'https://example.edu/paper-2.pdf',
              githubUrl: 'https://github.com/example/sparse-transformers'
            }
          ],
          experience: [
            {
              role: 'Principal Research Scientist',
              company: 'Stanford AI & Edge Systems Lab',
              period: '2023 — Present',
              description: 'Leading research on decentralized transformer caching and low-latency edge model distribution.'
            }
          ],
          education: [
            {
              degree: 'Ph.D. in Computer Science',
              institution: 'Stanford University · School of Engineering',
              year: '2019 — 2023',
              details: 'Dissertation: Decentralized Memory Models for High-Throughput Edge Networks. Stanford Graduate Fellow.'
            }
          ],
          contact: { enableForm: true, heading: 'Office Hours & Inquiries' }
        }
      },
      pages: [],
      posts: []
    };
  }

  if (isDeveloper) {
    return {
      site: {
        id: 'preview-site',
        title: 'Kaelen Chen',
        description: 'Systems & Open Source Toolmaker writing high-throughput distributed networks in Rust and Go.',
        site_type: 'portfolio',
        template_id: tmpl.id,
        subdomain_slug: 'kaelen',
        theme_config: { primaryColor: '#10b981', fontPair: 'jetbrains-inter' },
        seo_config: { contactEmail: 'kaelen@systems.dev' },
        content: {
          hero: {
            headline: 'Kaelen Chen',
            tagline: 'Systems & Open Source Toolmaker',
            bio: 'Writing high-throughput distributed systems, terminal developer tools, and microsecond edge proxies in Rust, Go, and WebAssembly.'
          },
          about: {
            body: 'Focusing on low-level Linux systems engineering, sub-millisecond network socket proxies, zero-copy memory pipelines, and zero-runtime static site compilers.'
          },
          skills: [
            { name: 'Rust' },
            { name: 'Go' },
            { name: 'TypeScript' },
            { name: 'Linux eBPF' },
            { name: 'Cloudflare Workers' }
          ],
          projects: [
            {
              title: 'edge-mesh-runtime',
              description: 'Microsecond distributed in-memory cache synchronizer and edge routing layer deployed across 300+ CDN points of presence.',
              tags: ['Rust', 'WebAssembly', 'Edge KV', 'Stars: 2.8k'],
              liveUrl: 'https://github.com/example/edge-mesh',
              githubUrl: 'https://github.com/example/edge-mesh'
            },
            {
              title: 'zero-runtime-compiler',
              description: 'Zero-hydration static HTML & CSS token compiler delivering 100/100 Lighthouse performance without client JavaScript overhead.',
              tags: ['TypeScript', 'Compiler', 'CSS Architecture', 'Stars: 1.4k'],
              liveUrl: 'https://github.com/example/zero-runtime',
              githubUrl: 'https://github.com/example/zero-runtime'
            }
          ],
          experience: [
            {
              role: 'Principal Systems Architect',
              company: 'TechEdge Labs · Core Infrastructure',
              period: '2023 — Present',
              description: 'Designed microsecond edge cache replication across global CDN nodes.'
            }
          ],
          education: [
            {
              degree: 'B.S. in Computer Systems & Architecture',
              institution: 'Polytechnic Institute',
              year: '2016 — 2020',
              details: 'Core research in OS kernel internals, memory management, and distributed networking.'
            }
          ],
          contact: { enableForm: true, heading: 'TTY Ping' }
        }
      },
      pages: [],
      posts: []
    };
  }

  if (isDesignEngineer) {
    return {
      site: {
        id: 'preview-site',
        title: 'Marcus Vance',
        description: 'Design Engineer & Product Craft crafting tactile digital surfaces and zero-runtime systems.',
        site_type: 'portfolio',
        template_id: tmpl.id,
        subdomain_slug: 'marcus',
        theme_config: { primaryColor: '#6366f1', fontPair: 'inter-outfit' },
        seo_config: { contactEmail: 'marcus@craft.design' },
        content: {
          hero: {
            headline: 'Marcus Vance',
            tagline: 'Design Engineer & Product Craft',
            bio: 'Designing tactile web interfaces, micro-interactions, and zero-runtime design systems. Bridging high-level visual polish with low-level systems speed.'
          },
          about: {
            body: 'I believe true product craft is subtractive. By eliminating framework runtime bloat and engineering semantic HTML with tactile typography and 60 FPS CSS micro-animations, digital tools feel instant and delightful.'
          },
          skills: [
            { name: 'Design Tokens' },
            { name: 'CSS Architecture' },
            { name: 'Tactile Typography' },
            { name: 'WebGL & Canvas' }
          ],
          projects: [
            {
              title: 'Linear-Style Bento Architecture',
              description: '12-column bento grid design system with tactile card interactions, micro-borders, and +340% conversion metrics.',
              tags: ['Design System', 'Bento Grid', 'CSS', 'Case Study'],
              liveUrl: 'https://example.com/bento',
              githubUrl: 'https://github.com/example/bento'
            }
          ],
          experience: [
            {
              role: 'Principal Design Engineer',
              company: 'Modern Craft Studio',
              period: '2023 — Present',
              description: 'Leading design systems, micro-interactions, and high-velocity frontend architecture.'
            }
          ],
          education: [
            {
              degree: 'B.F.A. in Interactive Design',
              institution: 'School of Design & Tech',
              year: '2017 — 2021',
              details: 'Specialization in typography, human-computer interaction, and design systems.'
            }
          ],
          contact: { enableForm: true, heading: 'Start a Craft Inquiry' }
        }
      },
      pages: [],
      posts: []
    };
  }

  if (isStaff || isResume) {
    return {
      site: {
        id: 'preview-site',
        title: 'Alex Rivera',
        description: 'Staff Platform Architect specializing in distributed edge runtimes, zero-runtime architecture, and high-throughput systems.',
        site_type: 'portfolio',
        template_id: tmpl.id,
        subdomain_slug: 'alex',
        theme_config: { primaryColor: '#64ffda', fontPair: 'jetbrains-inter' },
        seo_config: { contactEmail: 'alex.rivera@edge-mesh.com' },
        content: {
          hero: {
            headline: 'Alex Rivera',
            tagline: 'Staff Platform Architect & Principal Systems Lead',
            bio: 'Designing microsecond edge routing, distributed caching systems, and high-velocity web infrastructure serving 50M+ requests with sub-15ms response latency.'
          },
          about: {
            body: 'Over 8 years specializing in high-throughput distributed infrastructure, zero-runtime frontend architecture, and resilient cloud engineering. Focused on sub-15ms edge latency, zero-hydration markup, and tactile typography.'
          },
          skills: [
            { name: 'TypeScript' },
            { name: 'Cloudflare Workers' },
            { name: 'Distributed Systems' },
            { name: 'Rust' },
            { name: 'PostgreSQL' }
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
            }
          ],
          experience: [
            {
              role: 'Principal Platform Architect',
              company: 'TechEdge Labs',
              period: '2023 — Present',
              description: 'Leading global edge infrastructure, high-throughput static publishing systems, and developer productivity tooling.'
            }
          ],
          education: [
            {
              degree: 'B.S. in Computer Science & Systems Architecture',
              institution: 'Institute of Technology',
              year: '2017 — 2021',
              details: 'Magna Cum Laude. Specialization in distributed computing and networking protocols.'
            }
          ],
          contact: { enableForm: true, heading: "Let's connect" }
        }
      },
      pages: [],
      posts: []
    };
  }

  return {
    site: {
      id: 'preview-site',
      title: tmpl.name,
      description: tmpl.description,
      site_type: isBlog ? 'blog' : 'portfolio',
      template_id: tmpl.id,
      subdomain_slug: 'demo',
      theme_config: { primaryColor: tmpl.accentDefault, fontPair: 'inter-outfit' },
      seo_config: {},
      content: {
        hero: {
          headline: isBlog ? 'Writings & Computational Inquiries' : 'Alex Morgan',
          tagline: isBlog ? 'Essays on distributed systems, memory models, and digital craft.' : 'Design Engineer & Platform Architect',
          bio: isBlog
            ? 'Publishing unhurried inquiries into systems architecture, philosophy of technology, and computational aesthetics.'
            : 'Designing high-velocity platforms, zero-runtime frontend architectures, and distributed edge systems.'
        },
        about: {
          body: isBlog
            ? 'I write long-form thesis explorations and field notes on system design. Every piece of writing here is compiled statically and distributed across global edge nodes.'
            : 'Over 7 years specializing in high-throughput distributed infrastructure and minimalist web interfaces.'
        },
        skills: [
          { name: 'TypeScript' },
          { name: 'Cloudflare Workers' },
          { name: 'Distributed Systems' }
        ],
        projects: [
          {
            title: 'High-Velocity Edge Mesh',
            description: 'A global microsecond edge routing and static delivery engine serving 50M+ requests with sub-15ms response latency.',
            tags: ['Cloudflare Workers', 'Edge Computing', 'Rust'],
            liveUrl: 'https://example.com',
            githubUrl: 'https://github.com/example/edge-mesh'
          }
        ],
        experience: [
          {
            role: 'Principal Platform Architect',
            company: 'TechEdge Labs',
            period: '2023 - Present',
            description: 'Leading global edge infrastructure and developer tooling.'
          }
        ],
        education: [
          {
            degree: 'B.S. in Computer Science & Systems',
            institution: 'Institute of Technology',
            year: '2017 - 2021',
            details: 'Specialization in distributed computing and systems performance.'
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
      }
    ]
  };
}

console.log(`Generating manual HTML preview files for ${TEMPLATES.length} templates...\n`);

const CATEGORY_MAP = {
  blog: [
    'thesis-story',
    'minimal-text',
    'personal-blog',
    'digital-garden',
    'docs-book'
  ],
  business: [
    'product-launch',
    'business'
  ]
};

function getTemplateCategory(tmplId) {
  if (CATEGORY_MAP.blog.includes(tmplId)) return 'blog';
  if (CATEGORY_MAP.business.includes(tmplId)) return 'business';
  return 'portfolio';
}

const templateLinks = [];

for (const tmpl of TEMPLATES) {
  const data = getSampleData(tmpl);
  const result = renderSite(data, '/');
  const fileName = `${tmpl.id}.html`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, result.body, 'utf-8');
  const catKey = getTemplateCategory(tmpl.id);
  templateLinks.push({
    id: tmpl.id,
    name: tmpl.name,
    categoryKey: catKey,
    categoryLabel: catKey === 'blog' ? 'Writing & Thesis' : catKey === 'business' ? 'Landing Page' : 'Portfolio',
    categoryIcon: catKey === 'blog' ? '✍️' : catKey === 'business' ? '🚀' : '💼',
    description: tmpl.description,
    accent: tmpl.accentDefault,
    fileName
  });
  console.log(`✓ [${tmpl.category}] ${tmpl.name} -> dist/templates-preview/${fileName}`);
}

const portfolios = templateLinks.filter(t => t.categoryKey === 'portfolio');
const writings = templateLinks.filter(t => t.categoryKey === 'blog');
const landings = templateLinks.filter(t => t.categoryKey === 'business');

function renderCardList(list) {
  return list.map((t, idx) => `
    <div class="card">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span class="badge">${t.categoryIcon} ${t.categoryLabel}</span>
          <span style="font-family:monospace; font-size:11px; color:var(--muted);">${t.id}</span>
        </div>
        <h2>${t.name}</h2>
        <p class="desc">${t.description}</p>
      </div>
      <div>
        <a href="${t.fileName}" class="btn" target="_blank">Open Full Preview ↗</a>
      </div>
    </div>
  `).join('');
}

// Generate an index navigation page
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MNDO Builder — Offline Template Previews</title>
  <style>
    :root {
      --bg: #0e0e10;
      --card-bg: #18181b;
      --border: #27272a;
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --accent: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 48px 24px 80px;
      line-height: 1.5;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
    h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 6px; }
    p.subtitle { color: var(--muted); font-size: 15px; }
    
    .tab-bar { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
    .tab-btn {
      padding: 6px 16px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: #18181b;
      color: var(--muted);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .tab-btn.active {
      background: #f4f4f5;
      color: #0e0e10;
      border-color: #f4f4f5;
    }

    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #27272a;
    }
    .section-heading { font-size: 20px; font-weight: 700; color: #fff; }
    .section-count {
      font-size: 12px;
      font-weight: 600;
      background: #27272a;
      color: #a1a1aa;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .section-desc { font-size: 13px; color: var(--muted); margin-bottom: 16px; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .card:hover { transform: translateY(-2px); border-color: #3f3f46; }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 4px;
      background: #27272a;
      color: #d4d4d8;
    }
    h2 { font-size: 18px; font-weight: 600; color: #fff; margin: 8px 0 6px; }
    p.desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--accent);
      color: #000;
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      border-radius: 6px;
      transition: opacity 0.15s ease;
    }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>MNDO Builder — Template Gallery</h1>
      <p class="subtitle">19 production templates organized by category: Portfolios, Writings &amp; Thesis, and Landing Pages.</p>
    </header>

    <!-- Category Tabs -->
    <div class="tab-bar">
      <button class="tab-btn active" data-filter="all">All (${templateLinks.length})</button>
      <button class="tab-btn" data-filter="portfolios">💼 Portfolios (${portfolios.length})</button>
      <button class="tab-btn" data-filter="writings">✍️ Writings &amp; Thesis (${writings.length})</button>
      <button class="tab-btn" data-filter="landings">🚀 Landing Pages (${landings.length})</button>
    </div>

    <!-- Section 1: Portfolios -->
    <section id="sec-portfolios" style="margin-bottom: 48px;">
      <div class="section-title-wrap">
        <span style="font-size: 22px;">💼</span>
        <h2 class="section-heading">Portfolios</h2>
        <span class="section-count">${portfolios.length} Templates</span>
      </div>
      <p class="section-desc">Tailored for software engineers, design engineers, researchers, academics, and creative visual specialists.</p>
      <div class="grid">
        ${renderCardList(portfolios)}
      </div>
    </section>

    <!-- Section 2: Writings & Thesis -->
    <section id="sec-writings" style="margin-bottom: 48px;">
      <div class="section-title-wrap">
        <span style="font-size: 22px;">✍️</span>
        <h2 class="section-heading">Writings &amp; Thesis</h2>
        <span class="section-count">${writings.length} Templates</span>
      </div>
      <p class="section-desc">Typography-focused layouts for long-form essays, serialized thesis chapters, digital gardens, and documentation.</p>
      <div class="grid">
        ${renderCardList(writings)}
      </div>
    </section>

    <!-- Section 3: Landing Pages -->
    <section id="sec-landings" style="margin-bottom: 48px;">
      <div class="section-title-wrap">
        <span style="font-size: 22px;">🚀</span>
        <h2 class="section-heading">Landing Pages</h2>
        <span class="section-count">${landings.length} Templates</span>
      </div>
      <p class="section-desc">Conversion-oriented single-page launchpads for indie products, micro-SaaS, agencies, and businesses.</p>
      <div class="grid">
        ${renderCardList(landings)}
      </div>
    </section>
  </div>

  <script>
    const btns = document.querySelectorAll('.tab-btn');
    const secPortfolios = document.getElementById('sec-portfolios');
    const secWritings = document.getElementById('sec-writings');
    const secLandings = document.getElementById('sec-landings');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        if (filter === 'all') {
          secPortfolios.style.display = 'block';
          secWritings.style.display = 'block';
          secLandings.style.display = 'block';
        } else if (filter === 'portfolios') {
          secPortfolios.style.display = 'block';
          secWritings.style.display = 'none';
          secLandings.style.display = 'none';
        } else if (filter === 'writings') {
          secPortfolios.style.display = 'none';
          secWritings.style.display = 'block';
          secLandings.style.display = 'none';
        } else if (filter === 'landings') {
          secPortfolios.style.display = 'none';
          secWritings.style.display = 'none';
          secLandings.style.display = 'block';
        }
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml, 'utf-8');
console.log(`\n✓ Generated index portal -> dist/templates-preview/index.html`);
console.log(`\nAll 19 templates successfully generated in: ${outputDir}`);
