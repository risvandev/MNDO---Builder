import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeUrl, renderSafeMarkdown } from '../src/templates/sanitizer.js';

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
});
