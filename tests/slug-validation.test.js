import { describe, it, expect } from 'vitest';
import { validateSubdomainSlug } from '../src/js/validation.js';
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
