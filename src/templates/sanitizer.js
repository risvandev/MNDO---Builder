// ==============================================================================
// MNDO BUILDER - HTML SANITIZATION & SAFE RENDERING UTILITIES
// ==============================================================================

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string|any} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  const matchHtmlRegExp = /["'&<>]/;
  if (!matchHtmlRegExp.test(s)) {
    return s;
  }
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitize URLs to prevent javascript:, data:, and vbscript: execution.
 * Only permits http:, https:, mailto:, tel:, or relative paths (#, /).
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '#') return '#';
  if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return escapeHtml(trimmed);
  }
  try {
    const parsed = new URL(trimmed, 'https://dummy.local');
    const protocol = parsed.protocol.toLowerCase();
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
      return escapeHtml(trimmed);
    }
  } catch (e) {
    // Fallback rejection
  }
  return '#';
}

/**
 * Safe, restricted Markdown-to-HTML parser.
 * Supports headings, bold, italic, links, lists, code blocks, blockquotes.
 * Escapes raw HTML to prevent script injection.
 * @param {string} markdown
 * @returns {string}
 */
export function renderSafeMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') return '';

  // Step 1: Escape all existing HTML first
  let html = escapeHtml(markdown);

  // Step 2: Code blocks (```language ... ```)
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="code-block"><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Step 3: Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Step 4: Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Step 5: Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Step 6: Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Step 7: Links [text](url) with safe URL validation
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, rawUrl) => {
    const safe = sanitizeUrl(rawUrl);
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // Step 8: Unordered lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Step 9: Paragraphs (double newlines)
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (/^<(h1|h2|h3|pre|ul|li|blockquote)/.test(trimmed)) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return html;
}

/**
 * Strict color validation to prevent CSS injection.
 * Only allows 3, 4, 6, or 8-digit hex colors or safe rgb/rgba/hsl/hsla format.
 * Disallows any semicolon, quotes, angle brackets, or curly braces.
 * @param {string} color
 * @param {string} fallback
 * @returns {string}
 */
export function sanitizeColor(color, fallback = '#111827') {
  if (!color || typeof color !== 'string') return fallback;
  const trimmed = color.trim();
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  if (hexRegex.test(trimmed)) {
    return trimmed;
  }
  const funcRegex = /^(rgb|hsl)a?\(\s*[\d.%\s,+-]+\s*\)$/i;
  if (funcRegex.test(trimmed) && !/[;{}"'<>\\]/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

