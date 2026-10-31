import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeUrl, renderSafeMarkdown, sanitizeColor } from '../src/templates/sanitizer.js';

describe('HTML Sanitization & Safe Rendering', () => {
  it('escapes dangerous HTML tags and characters', () => {
    const malicious = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&quot;XSS&quot;');

    expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#39;s');
  });

  it('sanitizes unsafe URL protocols while permitting safe links', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
    expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe('#');
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#');

    // Safe links
    expect(sanitizeUrl('https://github.com/myproject')).toBe('https://github.com/myproject');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
    expect(sanitizeUrl('#projects')).toBe('#projects');
    expect(sanitizeUrl('/about')).toBe('/about');
  });

  it('safely renders markdown without permitting executable script injection', () => {
    const markdown = [
      '# Welcome to My Site',
      'This is **bold** text and *italic* text.',
      '<script>alert("hack")</script>',
      '[Click here](javascript:alert("pwned"))',
      '[Safe link](https://mndo.online)'
    ].join('\n\n');

    const rendered = renderSafeMarkdown(markdown);

    expect(rendered).toContain('<h1>Welcome to My Site</h1>');
    expect(rendered).toContain('<strong>bold</strong>');
    expect(rendered).toContain('<em>italic</em>');
    expect(rendered).not.toContain('<script>');
    expect(rendered).toContain('&lt;script&gt;');
    expect(rendered).toContain('href="#"'); // Rejected javascript: scheme
    expect(rendered).toContain('href="https://mndo.online"');
  });

  describe('Color Sanitization (A13)', () => {
    it('accepts valid hex colors and standard color formats', () => {
      expect(sanitizeColor('#2563eb')).toBe('#2563eb');
      expect(sanitizeColor('#fff')).toBe('#fff');
      expect(sanitizeColor('#10b981')).toBe('#10b981');
      expect(sanitizeColor('rgb(37, 99, 235)')).toBe('rgb(37, 99, 235)');
      expect(sanitizeColor('hsl(217, 91%, 60%)')).toBe('hsl(217, 91%, 60%)');
    });

    it('rejects CSS injections and falls back to safe default', () => {
      const fallback = '#2563eb';
      // Attempt to escape CSS property or style tag
      expect(sanitizeColor('red; background: url(javascript:alert(1));', fallback)).toBe(fallback);
      expect(sanitizeColor('blue; } </style><script>alert(1)</script>', fallback)).toBe(fallback);
      expect(sanitizeColor('expression(alert(1))', fallback)).toBe(fallback);
      expect(sanitizeColor('url(https://evil.com/leak)', fallback)).toBe(fallback);
      expect(sanitizeColor('"><script>alert(1)</script>', fallback)).toBe(fallback);
      expect(sanitizeColor('', fallback)).toBe(fallback);
      expect(sanitizeColor(null, fallback)).toBe(fallback);
      expect(sanitizeColor('invalid-color-name')).toBe('#111827');
    });
  });
});

