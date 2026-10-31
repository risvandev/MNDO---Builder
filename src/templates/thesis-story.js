// ==============================================================================
// TEMPLATE 9: THESIS & LONG-FORM STORY (HUGO BLOX NOTES / ASTRO PAPER INSPIRED)
// Designed for long-form thesis research, serialized stories, essays, and deep reading.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown } from './sanitizer.js';
import { renderHead, renderNav, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderThesisStory(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const posts = siteData.posts || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const primaryColor = site.theme_config?.primaryColor || '#854d0e'; // Warm literary amber
  const fontPair = FONT_PAIRS['merriweather-roboto'];

  // Helper for reading time
  const getReadTime = (text) => {
    if (!text) return '2 min read';
    const words = text.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  // Check if viewing an individual story / thesis chapter: /blog/:slug
  const postMatch = currentPath.match(/^\/blog\/([a-z0-9-]+)\/?$/i);
  let activePost = null;
  let activePostIdx = -1;

  if (postMatch) {
    const slug = postMatch[1];
    activePostIdx = posts.findIndex(p => p.slug === slug);
    if (activePostIdx !== -1) {
      activePost = posts[activePostIdx];
    }
  }

  // -------------------------------------------------------------
  // VIEW: INDIVIDUAL CHAPTER / STORY READER
  // -------------------------------------------------------------
  if (activePost) {
    const pubDate = activePost.published_at 
      ? new Date(activePost.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '';
    const readTime = getReadTime(activePost.body_markdown);
    const prevPost = activePostIdx > 0 ? posts[activePostIdx - 1] : null;
    const nextPost = activePostIdx < posts.length - 1 ? posts[activePostIdx + 1] : null;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, activePost.title, activePost.excerpt, currentPath)}
  <style>
    :root {
      --bg: #fcfbf9;
      --paper: #ffffff;
      --text: #262626;
      --heading: #171717;
      --muted: #737373;
      --border: #e5e5e5;
      --accent: ${primaryColor};
      --font-serif: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.85; font-size: 18px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 740px; margin: 0 auto; padding: 0 24px; }

    /* Reading Progress Bar */
    .reading-progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: var(--accent); width: 0%; z-index: 1000; transition: width 0.1s ease; }

    /* Top Sticky Navigation */
    .reader-header { background: rgba(252, 251, 249, 0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 99; }
    .reader-nav { max-width: 740px; margin: 0 auto; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
    .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--muted); }
    .back-btn:hover { color: var(--heading); }
    .nav-title { font-size: 14px; font-weight: 600; color: var(--heading); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px; }

    /* Article Reader Layout */
    .article-wrap { padding: 48px 0 72px; }
    .chapter-tag { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 12px; }
    .article-title { font-family: var(--font-serif); font-size: clamp(32px, 5vw, 46px); font-weight: 700; color: var(--heading); line-height: 1.25; margin-bottom: 16px; }
    .article-meta { display: flex; gap: 14px; font-size: 14px; color: var(--muted); margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 16px; flex-wrap: wrap; }
    .cover-image { width: 100%; border-radius: 8px; margin-bottom: 36px; max-height: 420px; object-fit: cover; }
    
    /* Prose Typography */
    .article-body { font-family: var(--font-serif); font-size: 19px; line-height: 1.9; color: var(--text); }
    .article-body p { margin-bottom: 24px; }
    .article-body h1, .article-body h2, .article-body h3 { font-family: var(--font-serif); color: var(--heading); margin: 40px 0 16px; line-height: 1.3; }
    .article-body h2 { font-size: 26px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    .article-body h3 { font-size: 21px; }
    .article-body blockquote { border-left: 3px solid var(--accent); padding: 12px 20px; margin: 28px 0; font-style: italic; color: #404040; background: rgba(0, 0, 0, 0.02); border-radius: 0 6px 6px 0; }
    .article-body ul, .article-body ol { margin: 0 0 24px 24px; }
    .article-body li { margin-bottom: 8px; }
    .article-body code { font-family: monospace; font-size: 14px; background: #f3f3f0; padding: 2px 6px; border-radius: 4px; }

    /* Chapter Navigation Links */
    .chapter-nav-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 48px; padding-top: 28px; border-top: 1px solid var(--border); }
    .chapter-nav-card { padding: 18px; border: 1px solid var(--border); border-radius: 8px; background: var(--paper); transition: border-color 0.15s; }
    .chapter-nav-card:hover { border-color: var(--accent); text-decoration: none; }
    .chapter-nav-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 4px; }
    .chapter-nav-title { font-family: var(--font-serif); font-size: 16px; font-weight: 700; color: var(--heading); line-height: 1.3; }

    /* Author Callout */
    .author-card { margin-top: 48px; padding: 24px; background: var(--paper); border: 1px solid var(--border); border-radius: 8px; display: flex; gap: 20px; align-items: center; }
    .author-avatar { width: 68px; height: 68px; border-radius: 50%; object-fit: cover; }
    .author-name { font-family: var(--font-serif); font-weight: 700; font-size: 17px; color: var(--heading); margin-bottom: 4px; }
    .author-bio { font-size: 14px; color: var(--muted); line-height: 1.5; }

    /* Footer */
    .site-footer { border-top: 1px solid var(--border); padding: 36px 0; font-size: 13px; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="reading-progress-bar" id="readingBar"></div>

  <header class="reader-header">
    <div class="reader-nav">
      <a href="/" class="back-btn">&larr; Contents</a>
      <span class="nav-title">${escapeHtml(activePost.title)}</span>
      <span style="font-size:12px; color:var(--muted);">${readTime}</span>
    </div>
  </header>

  <main class="container">
    <article class="article-wrap">
      <div class="chapter-tag">Chapter &bull; Story</div>
      <h1 class="article-title">${escapeHtml(activePost.title)}</h1>
      <div class="article-meta">
        ${pubDate ? `<span>Published ${pubDate}</span>` : ''}
        <span>&bull;</span>
        <span>${readTime}</span>
      </div>

      ${activePost.cover_asset_url ? `<img src="${sanitizeUrl(activePost.cover_asset_url)}" alt="${escapeHtml(activePost.title)}" class="cover-image">` : ''}

      <div class="article-body">
        ${renderSafeMarkdown(activePost.body_markdown)}
      </div>

      <!-- Previous / Next Chapter Navigator -->
      <div class="chapter-nav-grid">
        ${prevPost ? `
          <a href="/blog/${prevPost.slug}" class="chapter-nav-card" style="text-align:left;">
            <div class="chapter-nav-label">&larr; Previous</div>
            <div class="chapter-nav-title">${escapeHtml(prevPost.title)}</div>
          </a>
        ` : '<div></div>'}

        ${nextPost ? `
          <a href="/blog/${nextPost.slug}" class="chapter-nav-card" style="text-align:right;">
            <div class="chapter-nav-label">Next &rarr;</div>
            <div class="chapter-nav-title">${escapeHtml(nextPost.title)}</div>
          </a>
        ` : '<div></div>'}
      </div>

      <!-- Author Card -->
      <div class="author-card">
        ${hero.avatarUrl ? `<img src="${sanitizeUrl(hero.avatarUrl)}" alt="${escapeHtml(hero.headline || 'Author')}" class="author-avatar">` : ''}
        <div>
          <div class="author-name">${escapeHtml(hero.headline || site.title)}</div>
          <div class="author-bio">${escapeHtml(hero.bio || site.description || 'Writer & researcher.')}</div>
        </div>
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <div class="container">
      &copy; ${new Date().getFullYear()} ${escapeHtml(site.title)}. All rights reserved.
    </div>
  </footer>

  <script>
    window.addEventListener('scroll', function() {
      var h = document.documentElement;
      var b = document.body;
      var st = 'scrollTop';
      var sh = 'scrollHeight';
      var percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100;
      var bar = document.getElementById('readingBar');
      if (bar) bar.style.width = percent + '%';
    });
  </script>
  ${renderClientScript()}
</body>
</html>`;
  }

  // -------------------------------------------------------------
  // VIEW: TABLE OF CONTENTS & WRITING OVERVIEW (HOMEPAGE)
  // -------------------------------------------------------------
  const publishedPosts = posts.filter(p => p.status === 'published');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #fcfbf9;
      --paper: #ffffff;
      --text: #262626;
      --heading: #171717;
      --muted: #737373;
      --border: #e5e5e5;
      --accent: ${primaryColor};
      --font-serif: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.8; font-size: 17px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 760px; margin: 0 auto; padding: 0 24px; }

    /* Header */
    .site-header { border-bottom: 1px solid var(--border); background: var(--bg); padding: 24px 0; }
    .header-inner { display: flex; justify-content: space-between; align-items: center; }
    .site-title { font-family: var(--font-serif); font-size: 22px; font-weight: 700; color: var(--heading); }

    /* Publication Hero */
    .pub-hero { padding: 64px 0 44px; border-bottom: 1px solid var(--border); }
    .pub-badge { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 12px; }
    .pub-headline { font-family: var(--font-serif); font-size: clamp(34px, 5vw, 48px); font-weight: 700; color: var(--heading); line-height: 1.2; margin-bottom: 16px; }
    .pub-tagline { font-size: 19px; color: var(--muted); line-height: 1.6; margin-bottom: 24px; }
    .pub-bio { font-size: 16px; color: var(--text); line-height: 1.7; max-width: 680px; }

    /* Chapters & Stories Table of Contents */
    .section-title { font-family: var(--font-serif); font-size: 24px; font-weight: 700; color: var(--heading); margin: 48px 0 24px; }
    .toc-list { display: flex; flex-direction: column; gap: 16px; }
    .toc-item { padding: 22px 24px; background: var(--paper); border: 1px solid var(--border); border-radius: 10px; transition: all 0.15s ease; display: block; }
    .toc-item:hover { border-color: var(--accent); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); text-decoration: none; }
    .toc-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .toc-title { font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--heading); line-height: 1.3; }
    .toc-readtime { font-size: 13px; color: var(--muted); white-space: nowrap; margin-left: 12px; }
    .toc-excerpt { font-size: 15px; color: var(--muted); line-height: 1.6; margin-bottom: 12px; }
    .toc-footer { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
    .toc-path { font-family: monospace; font-size: 12px; color: var(--muted); }
    .toc-read-link { font-weight: 600; color: var(--accent); }

    /* About Section */
    .about-box { margin-top: 48px; padding: 32px; background: var(--paper); border: 1px solid var(--border); border-radius: 10px; }
    .about-heading { font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--heading); margin-bottom: 12px; }
    .about-text { font-size: 15px; line-height: 1.7; color: var(--text); }

    /* Footer */
    .site-footer { border-top: 1px solid var(--border); padding: 40px 0; font-size: 13px; color: var(--muted); text-align: center; margin-top: 64px; }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="site-title">${escapeHtml(site.title)}</a>
      <span style="font-size:13px; color:var(--muted); font-family:monospace;">${publishedPosts.length} ${publishedPosts.length === 1 ? 'Entry' : 'Entries'}</span>
    </div>
  </header>

  <main class="container">
    <section class="pub-hero">
      <span class="pub-badge">Thesis &bull; Long-form Writings</span>
      <h1 class="pub-headline">${escapeHtml(hero.headline || site.title)}</h1>
      <p class="pub-tagline">${escapeHtml(hero.tagline || 'Collected writings, research chapters, and serialized stories.')}</p>
      ${hero.bio ? `<p class="pub-bio">${escapeHtml(hero.bio)}</p>` : ''}
    </section>

    <section>
      <h2 class="section-title">Table of Contents</h2>
      <div class="toc-list">
        ${publishedPosts.length === 0 ? `
          <div style="padding:48px 20px; text-align:center; color:var(--muted); background:var(--paper); border:1px dashed var(--border); border-radius:10px;">
            No chapters or stories published yet.
          </div>
        ` : ''}

        ${publishedPosts.map((post, idx) => {
          const readTime = getReadTime(post.body_markdown);
          return `
            <a href="/blog/${post.slug}" class="toc-item">
              <div class="toc-header">
                <h3 class="toc-title">${idx + 1}. ${escapeHtml(post.title)}</h3>
                <span class="toc-readtime">${readTime}</span>
              </div>
              ${post.excerpt ? `<p class="toc-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
              <div class="toc-footer">
                <span class="toc-path">/blog/${escapeHtml(post.slug)}</span>
                <span class="toc-read-link">Read Chapter &rarr;</span>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </section>

    ${about.body ? `
      <section class="about-box">
        <h3 class="about-heading">About the Author & Research</h3>
        <div class="about-text">${renderSafeMarkdown(about.body)}</div>
      </section>
    ` : ''}
  </main>

  <footer class="site-footer">
    <div class="container">
      &copy; ${new Date().getFullYear()} ${escapeHtml(site.title)}. All rights reserved.
    </div>
  </footer>

  ${renderClientScript()}
</body>
</html>`;
}
