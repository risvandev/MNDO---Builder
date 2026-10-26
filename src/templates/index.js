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
import {
  renderRobotsTxt,
  renderSitemapXml,
  renderLlmsTxt,
  renderManifest,
  renderFeedXml,
  render404
} from './seo-generators.js';

/**
 * Catalog of the 8 production templates with metadata, features, and descriptions.
 */
export const TEMPLATES = [
  {
    id: 'minimal',
    name: 'Minimal Portfolio',
    category: 'Portfolio',
    description: 'Swiss typography, neutral high-contrast aesthetic, and generous whitespace. Ideal for writers, architects, and minimalist engineers.',
    features: ['Typography-led', 'Selected works', 'Timeline history', 'Single/multi-page', 'Fast load speed'],
    accentDefault: '#111827',
    renderer: renderMinimal
  },
  {
    id: 'developer',
    name: 'Developer Portfolio',
    category: 'Developer',
    description: 'Dark terminal motif with monospace accents, tech stack pills, GitHub repo cards, and live demo links.',
    features: ['Terminal hero', 'Monospace typography', 'Tech stack pills', 'Repository cards', 'Contact ping'],
    accentDefault: '#10b981',
    renderer: renderDeveloper
  },
  {
    id: 'academic',
    name: 'Student / Academic',
    category: 'Academic',
    description: 'Scholarly serif typography with research interests, publication list with citations, and prominent CV PDF download.',
    features: ['Serif editorial', 'Publications with citations', 'Research topics', 'Education milestones', 'CV PDF download'],
    accentDefault: '#1e3a8a',
    renderer: renderAcademic
  },
  {
    id: 'professional',
    name: 'Professional Profile',
    category: 'Executive',
    description: 'Corporate executive presentation with career trajectory timeline, impact stats, testimonials, and resume download.',
    features: ['Executive presentation', 'Career chronology', 'Client testimonials', 'Core competencies', 'Resume download'],
    accentDefault: '#0f766e',
    renderer: renderProfessional
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    category: 'Design & Visual',
    description: 'Bold expressive typography, dark visual showcase, image gallery, and prominent project cards for visual creators.',
    features: ['Visual showcase', 'Art gallery', 'Bold typography', 'Creative statement', 'Client inquiry'],
    accentDefault: '#ec4899',
    renderer: renderCreative
  },
  {
    id: 'modern',
    name: 'Modern Portfolio',
    category: 'Tech / SaaS',
    description: 'Clean glassmorphic cards, gradient accents, responsive grid, and smooth interactive hover effects.',
    features: ['Glassmorphic styling', 'Soft gradient glow', 'Project cards', 'Interactive pill tags', 'Modern grid'],
    accentDefault: '#6366f1',
    renderer: renderModern
  },
  {
    id: 'personal-blog',
    name: 'Personal Blog',
    category: 'Blogging & Writing',
    description: 'Typography-first reading experience with article archive, estimated reading time, author profile, and RSS feed.',
    features: ['Article archive', 'Reading time estimate', 'Individual reader view', 'Author card', 'RSS Feed'],
    accentDefault: '#b45309',
    renderer: renderPersonalBlog
  },
  {
    id: 'business',
    name: 'Small Business',
    category: 'Business Landing',
    description: 'High-converting landing page with services grid, customer reviews, photo showcase, business info, and quote request.',
    features: ['Value proposition hero', 'Services grid', 'Customer testimonials', 'Operating details', 'Consultation form'],
    accentDefault: '#0284c7',
    renderer: renderBusiness
  }
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map(t => [t.id, t]));

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

  // Check if path matches an existing published page
  const matchedPage = pages.find(p => p.path === path && p.is_published !== false);
  if (matchedPage) {
    // Render template with the page's context
    const html = template.renderer(siteData, path);
    return { type: 'html', status: 200, body: html };
  }

  // 4. Not Found: Render 404 page
  return { type: 'html', status: 404, body: render404(site) };
}
