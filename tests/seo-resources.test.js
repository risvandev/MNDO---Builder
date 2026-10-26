import { describe, it, expect } from 'vitest';
import { renderSite } from '../src/templates/index.js';

describe('Automatic Technical & SEO Resources', () => {
  const mockSiteData = {
    site: {
      id: 'site-seo-test',
      title: 'Dev Portfolio',
      description: 'Building developer tools.',
      subdomain_slug: 'devlead',
      template_id: 'minimal',
      seo_config: { discourageSearch: false, metaDescription: 'Building developer tools.' },
      content: {
        hero: { headline: 'Dev Lead' },
        about: { body: 'Engineering leader with a passion for web performance.' },
        skills: [{ name: 'JavaScript' }, { name: 'Rust' }],
        projects: [{ title: 'FastEdge', description: 'Fast proxy.', liveUrl: 'https://example.com' }]
      }
    },
    pages: [
      { id: 'p1', path: '/about', title: 'About Me', is_published: true },
      { id: 'p2', path: '/projects', title: 'My Work', is_published: true }
    ],
    posts: [
      { id: 'b1', slug: 'how-edge-workers-work', title: 'How Edge Workers Work', excerpt: 'Deep dive into V8 isolates.', status: 'published' }
    ]
  };

  it('generates robots.txt with allow directives and sitemap reference', () => {
    const res = renderSite(mockSiteData, '/robots.txt');
    expect(res.status).toBe(200);
    expect(res.type).toBe('text');
    expect(res.body).toContain('User-agent: *');
    expect(res.body).toContain('Allow: /');
    expect(res.body).toContain('Sitemap: https://devlead.mndo.online/sitemap.xml');
  });

  it('generates robots.txt with strict disallow when discourageSearch is enabled', () => {
    const discouraged = JSON.parse(JSON.stringify(mockSiteData));
    discouraged.site.seo_config.discourageSearch = true;

    const res = renderSite(discouraged, '/robots.txt');
    expect(res.body).toContain('Disallow: /');
    expect(res.body).toContain('User-agent: GPTBot');
  });

  it('generates sitemap.xml listing published pages and blog posts', () => {
    const res = renderSite(mockSiteData, '/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.type).toBe('xml');
    expect(res.body).toContain('<loc>https://devlead.mndo.online/</loc>');
    expect(res.body).toContain('<loc>https://devlead.mndo.online/about</loc>');
    expect(res.body).toContain('<loc>https://devlead.mndo.online/projects</loc>');
    expect(res.body).toContain('<loc>https://devlead.mndo.online/blog/how-edge-workers-work</loc>');
  });

  it('generates llms.txt containing markdown site index and summary', () => {
    const res = renderSite(mockSiteData, '/llms.txt');
    expect(res.status).toBe(200);
    expect(res.type).toBe('text');
    expect(res.body).toContain('# Dev Portfolio');
    expect(res.body).toContain('Canonical URL: https://devlead.mndo.online');
    expect(res.body).toContain('## Core Skills & Technologies');
    expect(res.body).toContain('JavaScript, Rust');
    expect(res.body).toContain('## Site Index');
    expect(res.body).toContain('- [Home](https://devlead.mndo.online/)');
    expect(res.body).toContain('- [About Me](https://devlead.mndo.online/about)');
  });

  it('generates valid JSON manifest for PWA bookmarks', () => {
    const res = renderSite(mockSiteData, '/manifest.webmanifest');
    expect(res.status).toBe(200);
    expect(res.type).toBe('json');
    const parsed = JSON.parse(res.body);
    expect(parsed.name).toBe('Dev Portfolio');
    expect(parsed.short_name).toBe('devlead');
    expect(parsed.start_url).toBe('/');
  });

  it('generates valid RSS feed (feed.xml) for published blog articles', () => {
    const res = renderSite(mockSiteData, '/feed.xml');
    expect(res.status).toBe(200);
    expect(res.type).toBe('xml');
    expect(res.body).toContain('<rss version="2.0"');
    expect(res.body).toContain('<title>How Edge Workers Work</title>');
    expect(res.body).toContain('https://devlead.mndo.online/blog/how-edge-workers-work');
  });
});
