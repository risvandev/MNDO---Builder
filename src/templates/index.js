// ==============================================================================
// MNDO BUILDER - TEMPLATE ENGINE & REGISTRY
// ==============================================================================
import { renderMinimal } from './minimal.js';
import { renderDeveloper } from './developer.js';
import { renderAcademic } from './academic.js';
import { renderProfessional } from './professional.js';
import { renderCreative } from './creative.js';
import { renderModern } from './modern.js';
import { renderPersonalBlog } from './personal-blog.js';
import { renderBusiness } from './business.js';
import { renderThesisStory } from './thesis-story.js';
import { renderResearchScholar } from './research-scholar.js';
import { renderDocsBook } from './docs-book.js';
import { renderMinimalText } from './minimal-text.js';
import { renderInteractiveResume } from './interactive-resume.js';
import { renderProductLaunch } from './product-launch.js';
import { renderVisualGallery } from './visual-gallery.js';
import { renderDigitalGarden } from './digital-garden.js';
import { renderSplitEngineer } from './split-engineer.js';
import { renderDesignEngineer } from './design-engineer.js';
import { renderOssMaintainer } from './oss-maintainer.js';
import { renderCustomPage } from './custom-page.js';
import {
  renderRobotsTxt,
  renderSitemapXml,
  renderLlmsTxt,
  renderManifest,
  renderFeedXml,
  render404
} from './seo-generators.js';

/**
 * Catalog of production templates with metadata, features, and descriptions.
 * Each template explicitly declares its editorMode: 'portfolio', 'blog', or 'landing'.
 */
export const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal Portfolio',
    category: 'Portfolio',
    editorMode: 'portfolio',
    description: 'Swiss typography, neutral high-contrast aesthetic, and generous whitespace. Ideal for writers, architects, and minimalist engineers.',
    features: ['Typography-led', 'Selected works', 'Timeline history', 'Single/multi-page', 'Fast load speed'],
    accentDefault: '#111827',
    renderer: renderMinimal
  },
  {
    id: 'developer',
    name: 'Developer Portfolio',
    category: 'Developer',
    editorMode: 'portfolio',
    description: 'Dark terminal motif with monospace accents, tech stack pills, GitHub repo cards, and live demo links.',
    features: ['Terminal hero', 'Monospace typography', 'Tech stack pills', 'Repository cards', 'Contact ping'],
    accentDefault: '#10b981',
    renderer: renderDeveloper
  },
  {
    id: 'academic',
    name: 'Student / Academic',
    category: 'Academic',
    editorMode: 'portfolio',
    description: 'Scholarly serif typography with research interests, publication list with citations, and prominent CV PDF download.',
    features: ['Serif editorial', 'Publications with citations', 'Research topics', 'Education milestones', 'CV PDF download'],
    accentDefault: '#1e3a8a',
    renderer: renderAcademic
  },
  {
    id: 'professional',
    name: 'Professional Profile',
    category: 'Executive',
    editorMode: 'portfolio',
    description: 'Corporate executive presentation with career trajectory timeline, impact stats, testimonials, and resume download.',
    features: ['Executive presentation', 'Career chronology', 'Client testimonials', 'Core competencies', 'Resume download'],
    accentDefault: '#0f766e',
    renderer: renderProfessional
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    category: 'Design & Visual',
    editorMode: 'portfolio',
    description: 'Bold expressive typography, dark visual showcase, image gallery, and prominent project cards for visual creators.',
    features: ['Visual showcase', 'Art gallery', 'Bold typography', 'Creative statement', 'Client inquiry'],
    accentDefault: '#ec4899',
    renderer: renderCreative
  },
  {
    id: 'modern',
    name: 'Modern Portfolio',
    category: 'Tech / SaaS',
    editorMode: 'portfolio',
    description: 'Clean glassmorphic cards, gradient accents, responsive grid, and smooth interactive hover effects.',
    features: ['Glassmorphic styling', 'Soft gradient glow', 'Project cards', 'Interactive pill tags', 'Modern grid'],
    accentDefault: '#6366f1',
    renderer: renderModern
  },
  {
    id: 'personal-blog',
    name: 'Personal Blog',
    category: 'Blogging & Writing',
    editorMode: 'blog',
    description: 'Typography-first reading experience with article archive, estimated reading time, author profile, and RSS feed.',
    features: ['Article archive', 'Reading time estimate', 'Individual reader view', 'Author card', 'RSS Feed'],
    accentDefault: '#b45309',
    renderer: renderPersonalBlog
  },
  {
    id: 'business',
    name: 'Small Business',
    category: 'Business Landing',
    editorMode: 'landing',
    description: 'High-converting landing page with services grid, customer reviews, photo showcase, business info, and quote request.',
    features: ['Value proposition hero', 'Services grid', 'Customer testimonials', 'Operating details', 'Consultation form'],
    accentDefault: '#0284c7',
    renderer: renderBusiness
  },
  {
    id: 'thesis-story',
    name: 'Thesis & Long-form Story',
    category: 'Writing & Thesis',
    editorMode: 'blog',
    description: 'Long-form thesis chapters, serialized stories, and essays with reading progress, estimated reading time, and clean table of contents.',
    features: ['Chapter reader', 'Reading progress bar', 'Reading time estimate', 'Table of contents', 'Author card'],
    accentDefault: '#854d0e',
    renderer: renderThesisStory
  },
  {
    id: 'research-scholar',
    name: 'Research & Publication Scholar',
    category: 'Academic & Research',
    editorMode: 'portfolio',
    description: 'Two-column academic split with sticky scholar identity card, publications with PDF/Code/Cite badges, and credentials timeline.',
    features: ['Sticky scholar card', 'Publication badges (PDF/Code/Cite)', 'Research interests', 'Education timeline', 'Contact form'],
    accentDefault: '#0369a1',
    renderer: renderResearchScholar
  },
  {
    id: 'docs-book',
    name: 'Technical Docs & Knowledge Base',
    category: 'Docs & Handbook',
    editorMode: 'blog',
    description: 'Documentation tree sidebar, real-time topic search, code blocks, callout notice admonitions, and breadcrumb navigation.',
    features: ['Documentation tree', 'Live search filter', 'Code copy blocks', 'Callout admonitions', 'Prev/Next navigation'],
    accentDefault: '#0284c7',
    renderer: renderDocsBook
  },
  {
    id: 'minimal-text',
    name: 'Ultra-Minimalist TXT',
    category: 'Writing & Essay',
    editorMode: 'blog',
    description: 'Sub-5KB text-first publishing inspired by Bear Blog & Mataroa. Instant 0.05s load time, zero clutter, and pure focus on prose.',
    features: ['Sub-5KB footprint', 'Instant load speed', 'Pure prose focus', 'Chronological index', 'Dark/Light adaptive'],
    accentDefault: '#171717',
    renderer: renderMinimalText
  },
  {
    id: 'interactive-resume',
    name: 'Interactive CV & Resume',
    category: 'Career & Resume',
    editorMode: 'portfolio',
    description: 'Crisp digital resume inspired by Read.cv & JSON Resume. One-click PDF print stylesheet, experience timeline, and verified skills pills.',
    features: ['Print-to-PDF ready', 'Career timeline', 'Skills matrix', 'Credentials list', 'Selected works'],
    accentDefault: '#0f172a',
    renderer: renderInteractiveResume
  },
  {
    id: 'product-launch',
    name: 'Product & SaaS Launchpad',
    category: 'Landing & Launch',
    editorMode: 'landing',
    description: 'High-converting single-page landing inspired by Carrd & Indie Hackers with metric counters, feature cards, and lead capture form.',
    features: ['Metric stat counters', 'Feature cards grid', 'Social proof badges', 'Conversion CTA', 'Lead inquiry form'],
    accentDefault: '#6366f1',
    renderer: renderProductLaunch
  },
  {
    id: 'visual-gallery',
    name: 'Visual Showcase & Gallery',
    category: 'Design & Photo',
    editorMode: 'portfolio',
    description: 'Spatial visual portfolio inspired by Cargo Collective & VSCO Grid with full-bleed project cards, image hover effects, and tag overlays.',
    features: ['Masonry grid layout', 'Image hover zoom', 'Category tag pills', 'Visual statement', 'Studio inquiry'],
    accentDefault: '#0a0a0a',
    renderer: renderVisualGallery
  },
  {
    id: 'digital-garden',
    name: 'Digital Garden & Notes',
    category: 'Notes & Garden',
    editorMode: 'blog',
    description: 'Networked public thought stream inspired by Quartz & Obsidian with botanical growth stages (Seedling, Budding, Evergreen) and live search.',
    features: ['Botanical growth stages', 'Live note search', 'Idea stream', 'Tag categorization', 'Public second brain'],
    accentDefault: '#059669',
    renderer: renderDigitalGarden
  },
  {
    id: 'split-engineer',
    name: 'Staff Engineer (Split Screen)',
    category: 'Developer & Tech',
    editorMode: 'portfolio',
    description: 'Iconic 2-column split portfolio inspired by Brittany Chiang v4. Sticky navigation with active scroll tracking, project cards, and tech stack pills.',
    features: ['Sticky split navigation', 'Scroll spy tracker', 'Project cards', 'Experience chronology', 'Tech stack pills'],
    accentDefault: '#64ffda',
    renderer: renderSplitEngineer
  },
  {
    id: 'design-engineer',
    name: 'Design Engineer & Craft',
    category: 'Design & Frontend',
    editorMode: 'portfolio',
    description: 'Craft-focused portfolio inspired by Linear & Rauno Freiberg. For UI/UX designers and frontend architects highlighting case studies with metrics.',
    features: ['Case study metrics', 'Craft philosophy', 'Live project links', 'Interactive stack', 'Status beacon'],
    accentDefault: '#6366f1',
    renderer: renderDesignEngineer
  },
  {
    id: 'oss-maintainer',
    name: 'Open Source Toolmaker',
    category: 'Open Source & CLI',
    editorMode: 'portfolio',
    description: 'Repository showcase inspired by top open-source maintainers. Features GitHub repo cards with star/fork badges, CLI install banner, and sponsorship CTA.',
    features: ['GitHub repo cards', 'Stars & forks metrics', 'CLI installation pill', 'Sponsorship badge', 'Tech ecosystems'],
    accentDefault: '#8b5cf6',
    renderer: renderOssMaintainer
  }
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map(t => [t.id, t]));

/**
 * Authoritative helper to determine editor mode for any site.
 * @param {string} templateId
 * @param {string} siteType
 * @returns {'blog'|'portfolio'|'landing'}
 */
export function getTemplateEditorMode(templateId, siteType = 'portfolio') {
  if (siteType === 'blog') return 'blog';
  const t = TEMPLATE_MAP[templateId];
  if (t?.editorMode) return t.editorMode;
  return 'portfolio';
}

/**
 * Check if the site operates in writing/blog editor mode.
 * @param {object} site
 * @returns {boolean}
 */
export function isBlogMode(site) {
  if (!site) return false;
  return getTemplateEditorMode(site.template_id, site.site_type) === 'blog';
}

/**
 * Main Template Dispatcher
 * Can render standard HTML pages or automatic technical resources (robots, sitemap, llms.txt, etc.)
 * 
 * @param {object} siteData - { site, pages, posts }
 * @param {string} rawPath - Requested URL path (e.g. '/', '/blog', '/projects', '/robots.txt')
 * @returns {{ type: 'html'|'text'|'xml'|'json', status: number, body: string }}
 */
export function renderSite(siteData, rawPath = '/') {
  const path = (rawPath || '/').split('?')[0];
  const site = siteData?.site || {};
  const pages = siteData?.pages || [];
  const posts = siteData?.posts || [];

  // 1. Technical SEO & AI resources
  if (path === '/robots.txt') {
    return { type: 'text', status: 200, body: renderRobotsTxt(site) };
  }
  if (path === '/sitemap.xml') {
    return { type: 'xml', status: 200, body: renderSitemapXml(site, pages, posts) };
  }
  if (path === '/llms.txt') {
    return { type: 'text', status: 200, body: renderLlmsTxt(site, pages, posts) };
  }
  if (path === '/manifest.webmanifest') {
    return { type: 'json', status: 200, body: renderManifest(site) };
  }
  if (path === '/feed.xml') {
    return { type: 'xml', status: 200, body: renderFeedXml(site, posts) };
  }

  // 2. Select template renderer
  const templateId = site.template_id || 'minimal';
  const template = TEMPLATE_MAP[templateId] || TEMPLATE_MAP['minimal'];

  // 3. Path resolution: Homepage, Blog, or Custom Page
  if (path === '/' || path === '') {
    const html = template.renderer(siteData, '/');
    return { type: 'html', status: 200, body: html };
  }

  if (path.startsWith('/blog')) {
    const html = template.renderer(siteData, path);
    return { type: 'html', status: 200, body: html };
  }

  // Check if path matches an existing published custom page
  const matchedPage = pages.find(p => p.path === path && p.is_published !== false);
  if (matchedPage) {
    const html = renderCustomPage(siteData, matchedPage, path);
    return { type: 'html', status: 200, body: html };
  }

  // 4. Not Found: Render 404 page
  return { type: 'html', status: 404, body: render404(site) };
}

