import { describe, it, expect } from 'vitest';
import { renderSite, TEMPLATES } from '../src/templates/index.js';

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

  it('renders all 8 templates successfully with clean semantic HTML', () => {
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

  it('returns high quality 404 response for non-existent page paths', () => {
    const result = renderSite(baseSiteData, '/non-existent-secret-page');
    expect(result.status).toBe(404);
    expect(result.body).toContain('404');
    expect(result.body).toContain('Page Not Found');
  });
});
