import { describe, it, expect } from 'vitest';
import { renderSite, TEMPLATES, getTemplateEditorMode, isBlogMode } from '../src/templates/index.js';

describe('Production Template Engine & Zero-Runtime Validation', () => {
  const baseSiteData = {
    site: {
      id: 'test-site-uuid',
      title: 'Alex Rivera Portfolio',
      description: 'Full stack developer and researcher.',
      site_type: 'portfolio',
      template_id: 'minimal',
      subdomain_slug: 'alex',
      theme_config: { primaryColor: '#2563eb', fontPair: 'inter-outfit' },
      seo_config: { metaDescription: 'Alex Rivera Portfolio', discourageSearch: false },
      content: {
        hero: {
          headline: 'Alex Rivera',
          tagline: 'Staff Software Engineer',
          bio: 'Building resilient cloud architecture.',
          primaryCta: { text: 'View Works', url: '#projects' }
        },
        about: {
          body: 'Specializing in distributed systems and user experience.'
        },
        skills: [{ name: 'JavaScript' }, { name: 'Cloudflare' }, { name: 'PostgreSQL' }],
        projects: [
          {
            title: 'MNDO Builder Engine',
            description: 'Fast edge-based static publishing platform.',
            tags: ['Workers', 'HTML5'],
            liveUrl: 'https://alex.mndo.online'
          }
        ],
        experience: [
          { role: 'Staff Engineer', company: 'Global Cloud', period: '2023 - Present', description: 'Leading platform engineering.' }
        ],
        education: [
          { degree: 'B.S. in CS', institution: 'MIT', year: '2019 - 2023' }
        ],
        contact: {
          enableForm: true,
          heading: 'Let us connect'
        }
      }
    },
    pages: [
      { id: 'page-1', path: '/projects', title: 'Projects Showcase', is_published: true, is_in_nav: true },
      { id: 'page-2', path: '/about', title: 'About Alex', is_published: true, is_in_nav: true }
    ],
    posts: [
      {
        id: 'post-1',
        title: 'Zero-Runtime Publishing',
        slug: 'zero-runtime-publishing',
        excerpt: 'Why static HTML is fast and reliable.',
        body_markdown: '# Fast Web\n\nPure HTML is undefeated.',
        status: 'published',
        published_at: new Date().toISOString()
      }
    ]
  };

  it('renders all production templates successfully with clean semantic HTML', () => {
    for (const tmpl of TEMPLATES) {
      const siteCopy = JSON.parse(JSON.stringify(baseSiteData));
      siteCopy.site.template_id = tmpl.id;

      const result = renderSite(siteCopy, '/');

      expect(result.status, `Template ${tmpl.id} returned non-200`).toBe(200);
      expect(result.type).toBe('html');

      const html = result.body;
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<title>');
      expect(html).toContain('Alex Rivera');

      // CRITICAL REQUIREMENT: Generated websites must render as ordinary HTML, CSS, vanilla JS with NO React runtime!
      expect(html).not.toContain('react.development.js');
      expect(html).not.toContain('react-dom');
      expect(html).not.toContain('__NEXT_DATA__');
      expect(html).not.toContain('_jsx');
    }
  });

  it('renders minimal-text template with sub-5KB raw prose index and reader', () => {
    const textSite = JSON.parse(JSON.stringify(baseSiteData));
    textSite.site.template_id = 'minimal-text';

    const indexRes = renderSite(textSite, '/');
    expect(indexRes.status).toBe(200);
    expect(indexRes.body).toContain('Writings &amp; Essays');

    const readerRes = renderSite(textSite, '/blog/zero-runtime-publishing');
    expect(readerRes.status).toBe(200);
    expect(readerRes.body).toContain('Zero-Runtime Publishing');
    expect(readerRes.body).toContain('Pure HTML is undefeated');
  });

  it('renders interactive-resume template with print button and experience', () => {
    const resumeSite = JSON.parse(JSON.stringify(baseSiteData));
    resumeSite.site.template_id = 'interactive-resume';

    const result = renderSite(resumeSite, '/');
    expect(result.status).toBe(200);
    expect(result.body).toContain('Print / PDF');
    expect(result.body).toContain('Professional Experience');
    expect(result.body).toContain('Staff Engineer');
  });

  it('renders product-launch template with metric counters and conversion CTA', () => {
    const launchSite = JSON.parse(JSON.stringify(baseSiteData));
    launchSite.site.template_id = 'product-launch';

    const result = renderSite(launchSite, '/');
    expect(result.status).toBe(200);
    expect(result.body).toContain('metrics-bar');
    expect(result.body).toContain('cta-box');
    expect(result.body).toContain('Ready to launch your project?');
  });

  it('renders visual-gallery template with masonry grid and visual projects', () => {
    const gallerySite = JSON.parse(JSON.stringify(baseSiteData));
    gallerySite.site.template_id = 'visual-gallery';

    const result = renderSite(gallerySite, '/');
    expect(result.status).toBe(200);
    expect(result.body).toContain('gallery-grid');
    expect(result.body).toContain('gallery-card');
  });

  it('renders digital-garden template with botanical stage indicators and search', () => {
    const gardenSite = JSON.parse(JSON.stringify(baseSiteData));
    gardenSite.site.template_id = 'digital-garden';

    const indexRes = renderSite(gardenSite, '/');
    expect(indexRes.status).toBe(200);
    expect(indexRes.body).toContain('Digital Garden');
    expect(indexRes.body).toContain('gardenSearchInput');

    const noteRes = renderSite(gardenSite, '/blog/zero-runtime-publishing');
    expect(noteRes.status).toBe(200);
    expect(noteRes.body).toContain('note-stage-badge');
    expect(noteRes.body).toContain('Growing in public');
  });

  it('renders thesis-story template with chapter reader and progress bar', () => {
    const thesisSite = JSON.parse(JSON.stringify(baseSiteData));
    thesisSite.site.template_id = 'thesis-story';

    const indexRes = renderSite(thesisSite, '/');
    expect(indexRes.status).toBe(200);
    expect(indexRes.body).toContain('Table of Contents');

    const readerRes = renderSite(thesisSite, '/blog/zero-runtime-publishing');
    expect(readerRes.status).toBe(200);
    expect(readerRes.body).toContain('reading-progress-bar');
    expect(readerRes.body).toContain('Zero-Runtime Publishing');
  });

  it('renders research-scholar template with sticky card and publication badges', () => {
    const scholarSite = JSON.parse(JSON.stringify(baseSiteData));
    scholarSite.site.template_id = 'research-scholar';

    const result = renderSite(scholarSite, '/');
    expect(result.status).toBe(200);
    expect(result.body).toContain('scholar-sidebar');
    expect(result.body).toContain('Publications &amp; Works');
    expect(result.body).toContain('PDF / Article');
  });

  it('renders docs-book template with sidebar tree and topic search', () => {
    const docsSite = JSON.parse(JSON.stringify(baseSiteData));
    docsSite.site.template_id = 'docs-book';

    const result = renderSite(docsSite, '/');
    expect(result.status).toBe(200);
    expect(result.body).toContain('docs-sidebar');
    expect(result.body).toContain('docSearchInput');
    expect(result.body).toContain('doc-nav-list');
  });

  it('renders split-engineer template with 2-column layout and sticky nav', () => {
    const engineerSite = JSON.parse(JSON.stringify(baseSiteData));
    engineerSite.site.template_id = 'split-engineer';

    const result = renderSite(engineerSite, '/');
    expect(result.status).toBe(200);
    expect(result.body).toContain('split-container');
    expect(result.body).toContain('split-left');
    expect(result.body).toContain('side-nav');
    expect(result.body).toContain('Selected Projects');
  });

  it('renders design-engineer template with status pill and case studies', () => {
    const designSite = JSON.parse(JSON.stringify(baseSiteData));
    designSite.site.template_id = 'design-engineer';

    const result = renderSite(designSite, '/');
    expect(result.status).toBe(200);
    expect(result.body).toContain('status-pill');
    expect(result.body).toContain('case-studies');
    expect(result.body).toContain('Selected Work &amp; Case Studies');
  });

  it('renders oss-maintainer template with install banner and repository cards', () => {
    const ossSite = JSON.parse(JSON.stringify(baseSiteData));
    ossSite.site.template_id = 'oss-maintainer';

    const result = renderSite(ossSite, '/');
    expect(result.status).toBe(200);
    expect(result.body).toContain('install-banner');
    expect(result.body).toContain('repo-grid');
    expect(result.body).toContain('Pinned Packages &amp; Repositories');
  });

  it('renders individual published blog posts correctly in reader view', () => {
    const blogSite = JSON.parse(JSON.stringify(baseSiteData));
    blogSite.site.template_id = 'personal-blog';

    const result = renderSite(blogSite, '/blog/zero-runtime-publishing');
    expect(result.status).toBe(200);
    expect(result.body).toContain('Zero-Runtime Publishing');
    expect(result.body).toContain('Fast Web');
  });

  it('renders published custom pages correctly', () => {
    const result = renderSite(baseSiteData, '/projects');
    expect(result.status).toBe(200);
  });

  it('renders dedicated custom page body when page has content (A8)', () => {
    const siteWithCustomContent = JSON.parse(JSON.stringify(baseSiteData));
    siteWithCustomContent.pages = [
      {
        id: 'page-privacy',
        path: '/privacy',
        title: 'Privacy Policy',
        content: '# Privacy Policy\n\nWe do not track your activity or store cookies.',
        is_published: true,
        is_in_nav: true
      }
    ];

    const result = renderSite(siteWithCustomContent, '/privacy');
    expect(result.status).toBe(200);
    expect(result.body).toContain('<h1>Privacy Policy</h1>');
    expect(result.body).toContain('We do not track your activity or store cookies');
    expect(result.body).toContain('custom-page');
  });

  it('determines editor mode consistently across templates and site types (A1)', () => {
    // Blog templates
    expect(getTemplateEditorMode('personal-blog')).toBe('blog');
    expect(getTemplateEditorMode('minimal-text')).toBe('blog');
    expect(getTemplateEditorMode('digital-garden')).toBe('blog');
    expect(getTemplateEditorMode('thesis-story')).toBe('blog');

    // Portfolio templates
    expect(getTemplateEditorMode('minimal')).toBe('portfolio');
    expect(getTemplateEditorMode('split-engineer')).toBe('portfolio');
    expect(getTemplateEditorMode('developer')).toBe('portfolio');
    expect(getTemplateEditorMode('design-engineer')).toBe('portfolio');
    expect(getTemplateEditorMode('interactive-resume')).toBe('portfolio');

    // Landing templates
    expect(getTemplateEditorMode('product-launch')).toBe('landing');
    expect(getTemplateEditorMode('business')).toBe('landing');

    // isBlogMode helper
    expect(isBlogMode({ site_type: 'blog', template_id: 'minimal' })).toBe(true);
    expect(isBlogMode({ site_type: 'portfolio', template_id: 'minimal-text' })).toBe(true);
    expect(isBlogMode({ site_type: 'portfolio', template_id: 'minimal' })).toBe(false);
  });

  it('empty portfolio templates do not render fabricated sample projects or jobs (A14)', () => {
    const emptyPortfolioSite = JSON.parse(JSON.stringify(baseSiteData));
    emptyPortfolioSite.site.content.projects = [];
    emptyPortfolioSite.site.content.experience = [];

    const templatesToCheck = ['minimal', 'split-engineer', 'interactive-resume', 'developer', 'design-engineer'];

    for (const tmplId of templatesToCheck) {
      emptyPortfolioSite.site.template_id = tmplId;
      const res = renderSite(emptyPortfolioSite, '/');
      expect(res.status).toBe(200);

      // Verify fabricated sample companies and projects are NOT in the output
      expect(res.body).not.toContain('TechEdge Labs');
      expect(res.body).not.toContain('Edge Compute &amp; Cache Mesh');
      expect(res.body).not.toContain('Edge Compute & Cache Mesh');
      expect(res.body).not.toContain('Synthetix Systems');
      expect(res.body).not.toContain('Lead Design Systems');
    }
  });

  it('returns high quality 404 response for non-existent page paths', () => {
    const result = renderSite(baseSiteData, '/non-existent-secret-page');
    expect(result.status).toBe(404);
    expect(result.body).toContain('404');
    expect(result.body).toContain('Page Not Found');
  });
});

