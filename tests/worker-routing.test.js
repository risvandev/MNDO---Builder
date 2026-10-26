import { describe, it, expect } from 'vitest';
import { parseSubdomain } from '../worker/src/hostname.js';
import { applySecurityHeaders } from '../worker/src/security.js';
import { handleContactSubmission } from '../worker/src/contact-forms.js';

describe('Cloudflare Worker Edge Routing & Security', () => {
  it('correctly maps wildcard subdomains to user slugs', () => {
    expect(parseSubdomain('risvan.mndo.online', 'mndo.online')).toEqual({
      valid: true,
      slug: 'risvan'
    });

    expect(parseSubdomain('my-project.mndo.online', 'mndo.online')).toEqual({
      valid: true,
      slug: 'my-project'
    });

    expect(parseSubdomain('blog123.mndo.online', 'mndo.online')).toEqual({
      valid: true,
      slug: 'blog123'
    });
  });

  it('strictly protects apex domain and reserved infrastructure subdomains', () => {
    const apex = parseSubdomain('mndo.online', 'mndo.online');
    expect(apex.valid).toBe(false);
    expect(apex.isApex).toBe(true);

    const www = parseSubdomain('www.mndo.online', 'mndo.online');
    expect(www.valid).toBe(false);
    expect(www.isApex).toBe(true);

    const api = parseSubdomain('api.mndo.online', 'mndo.online');
    expect(api.valid).toBe(false);
    expect(api.reason).toBe('reserved_subdomain');

    const admin = parseSubdomain('admin.mndo.online', 'mndo.online');
    expect(admin.valid).toBe(false);
    expect(admin.reason).toBe('reserved_subdomain');
  });

  it('applies hardened security headers to worker responses', () => {
    const rawRes = new Response('<h1>Test</h1>', { status: 200 });
    const secured = applySecurityHeaders(rawRes, 'text/html; charset=UTF-8');

    expect(secured.headers.get('Content-Type')).toBe('text/html; charset=UTF-8');
    expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(secured.headers.get('X-Frame-Options')).toBe('DENY');
    expect(secured.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(secured.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(secured.headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
  });

  it('traps bots silently using contact form honeypot', async () => {
    const botReq = new Request('https://risvan.mndo.online/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: '00000000-0000-0000-0000-000000000000',
        name: 'Spam Bot',
        email: 'spammer@botnet.com',
        message: 'Buy cheap watches here!',
        _honeypot: 'I am a bot filling hidden field'
      })
    });

    const res = await handleContactSubmission(botReq, {});
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true); // Returns 200 to confuse bot
  });

  it('validates contact form fields and rejects invalid submissions', async () => {
    const invalidReq = new Request('https://risvan.mndo.online/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: 'test-id',
        name: '', // Empty name
        email: 'invalid-email',
        message: 'Hi'
      })
    });

    const res = await handleContactSubmission(invalidReq, {});
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
