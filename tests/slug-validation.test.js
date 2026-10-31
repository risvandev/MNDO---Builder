import { describe, it, expect } from 'vitest';
import {
  validateSubdomainSlug,
  normalizeSlug,
  validatePagePath,
  validatePrimaryColor
} from '../src/js/validation.js';
import { parseSubdomain, RESERVED_SUBDOMAINS } from '../worker/src/hostname.js';

describe('Subdomain Validation & Reserved Names', () => {
  it('accepts valid alphanumeric subdomains between 3 and 32 chars', () => {
    const validNames = ['risvan', 'myportfolio', 'blog123', 'john-doe', 'dev-portfolio-2026'];
    for (const name of validNames) {
      const res = validateSubdomainSlug(name);
      expect(res.valid, `Expected "${name}" to be valid`).toBe(true);
      expect(res.normalized).toBe(name);
    }
  });

  it('rejects subdomains with invalid lengths', () => {
    expect(validateSubdomainSlug('').valid).toBe(false);
    expect(validateSubdomainSlug('a').valid).toBe(false);
    expect(validateSubdomainSlug('ab').valid).toBe(false);
    expect(validateSubdomainSlug('a'.repeat(33)).valid).toBe(false);
  });

  it('rejects invalid characters, leading/trailing hyphens, and consecutive hyphens', () => {
    expect(validateSubdomainSlug('-risvan').valid).toBe(false);
    expect(validateSubdomainSlug('risvan-').valid).toBe(false);
    expect(validateSubdomainSlug('ris--van').valid).toBe(false);
    expect(validateSubdomainSlug('ris_van').valid).toBe(false);
    expect(validateSubdomainSlug('ris.van').valid).toBe(false);
    expect(validateSubdomainSlug('risvan!').valid).toBe(false);
    expect(validateSubdomainSlug('ris van').valid).toBe(false);
  });

  it('rejects platform and infrastructure reserved subdomains', () => {
    const reservedSamples = ['www', 'api', 'admin', 'builder', 'app', 'dashboard', 'mail', 'smtp', 'login', 'billing', 'status'];
    for (const name of reservedSamples) {
      const res = validateSubdomainSlug(name);
      expect(res.valid, `Expected reserved name "${name}" to be rejected`).toBe(false);
      expect(res.error).toContain('reserved');
    }
  });

  it('hostname parser correctly identifies apex mndo.online and does not route it as a portfolio', () => {
    const apexRes = parseSubdomain('mndo.online', 'mndo.online');
    expect(apexRes.valid).toBe(false);
    expect(apexRes.isApex).toBe(true);

    const wwwRes = parseSubdomain('www.mndo.online', 'mndo.online');
    expect(wwwRes.valid).toBe(false);
    expect(wwwRes.isApex).toBe(true);
  });

  it('hostname parser extracts candidate username from user subdomain', () => {
    const userRes = parseSubdomain('risvan.mndo.online', 'mndo.online');
    expect(userRes.valid).toBe(true);
    expect(userRes.slug).toBe('risvan');
  });
});

describe('Blog Post Slug Normalization & Collision Handling (A10)', () => {
  it('converts title to lowercase and replaces special characters/spaces with hyphens', () => {
    expect(normalizeSlug('My First Post!')).toBe('my-first-post');
    expect(normalizeSlug('Hello & World -- 2026')).toBe('hello-world-2026');
    expect(normalizeSlug('   Spaces   Around   ')).toBe('spaces-around');
    expect(normalizeSlug('___under___scores___')).toBe('under-scores');
  });

  it('falls back to post when string has no valid alphanumeric characters', () => {
    expect(normalizeSlug('!@#$%^&*()')).toBe('post');
    expect(normalizeSlug('')).toBe('post');
  });

  it('automatically deduplicates against existing slugs with suffix numbers', () => {
    const existing = ['hello-world', 'hello-world-2', 'my-post'];
    expect(normalizeSlug('Hello World', existing)).toBe('hello-world-3');
    expect(normalizeSlug('My Post', existing)).toBe('my-post-2');
    expect(normalizeSlug('New Article', existing)).toBe('new-article');
  });
});

describe('Custom Page Path Validation (A7)', () => {
  it('accepts clean normalized paths beginning with /', () => {
    expect(validatePagePath('/about').valid).toBe(true);
    expect(validatePagePath('/projects/showcase').valid).toBe(true);
    expect(validatePagePath('contact').normalized).toBe('/contact');
  });

  it('rejects the root homepage path', () => {
    const res = validatePagePath('/');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('homepage');
  });

  it('rejects reserved platform paths', () => {
    expect(validatePagePath('/api').valid).toBe(false);
    expect(validatePagePath('/admin').valid).toBe(false);
    expect(validatePagePath('/dashboard').valid).toBe(false);
    expect(validatePagePath('/preview').valid).toBe(false);
    expect(validatePagePath('/login').valid).toBe(false);
  });

  it('rejects paths with invalid characters, query strings, or fragments', () => {
    expect(validatePagePath('/about?lang=en').valid).toBe(false);
    expect(validatePagePath('/about#team').valid).toBe(false);
    expect(validatePagePath('/hello world').valid).toBe(false);
  });

  it('detects duplicate paths within the site', () => {
    const existing = ['/about', '/projects'];
    expect(validatePagePath('/about', existing).valid).toBe(false);
    expect(validatePagePath('/about', existing, '/about').valid).toBe(true); // editing current path is allowed
    expect(validatePagePath('/contact', existing).valid).toBe(true);
  });
});

describe('Primary Color Validation (A13)', () => {
  it('accepts valid 6-digit and 3-digit hex colors', () => {
    expect(validatePrimaryColor('#2563eb').valid).toBe(true);
    expect(validatePrimaryColor('#fff').valid).toBe(true);
    expect(validatePrimaryColor('10b981').valid).toBe(true);
    expect(validatePrimaryColor('10b981').normalized).toBe('#10b981');
  });

  it('rejects invalid or unsafe colors', () => {
    expect(validatePrimaryColor('red; background: blue;').valid).toBe(false);
    expect(validatePrimaryColor('#12345').valid).toBe(false);
    expect(validatePrimaryColor('not-a-color').valid).toBe(false);
  });
});

