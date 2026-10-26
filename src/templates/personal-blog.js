// ==============================================================================
// TEMPLATE 7: PERSONAL BLOG
// Editorial reading experience, article archive, reading time, author card.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown } from './sanitizer.js';
import { renderHead, renderNav, renderContactForm, renderFooter, renderClientScript, FONT_PAIRS } from './common.js';

export function renderPersonalBlog(siteData, currentPath = '/') {
  const site = siteData.site;
  const pages = siteData.pages || [];
  const posts = siteData.posts || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const social = content.social || {};
  const primaryColor = site.theme_config?.primaryColor || '#b45309'; // Warm Amber / Editorial
  const fontPair = FONT_PAIRS['merriweather-roboto'];

  // Check if viewing an individual article: /blog/:slug
  const blogPostMatch = currentPath.match(/^\/blog\/([a-z0-9-]+)\/?$/i);
  let activePost = null;
  if (blogPostMatch) {
    const slug = blogPostMatch[1];
    activePost = posts.find(p => p.slug === slug && p.status === 'published');
  }

  // Calculate reading time helper
  const getReadTime = (text) => {
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  };

  // -------------------------------------------------------------
  // VIEW: INDIVIDUAL BLOG POST READER
  // -------------------------------------------------------------
  if (activePost) {
    const pubDate = activePost.published_at ? new Date(activePost.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
    const readTime = getReadTime(activePost.body_markdown);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, activePost.title, activePost.excerpt, currentPath)}
  <style>
    :root {
      --bg: #fffdf9;
      --card-bg: #ffffff;
      --text: #292524;
      --heading: #1c1917;
      --muted: #78716c;
      --border: #e7e5e4;
      --accent: ${primaryColor};
      --font-serif: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.8; font-size: 18px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 760px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .site-header { border-bottom: 1px solid var(--border); background: rgba(255, 253, 249, 0.95); position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 760px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-serif); font-size: 22px; font-weight: 700; color: var(--heading); }
    .nav-menu { display: flex; gap: 20px; }
    .nav-link { font-size: 14px; font-weight: 600; color: var(--muted); }
    .nav-link:hover { color: var(--accent); }
    .nav-toggle { display: none; background: none; border: none; font-size: 22px; cursor: pointer; }

    /* Article Reader */
    .article-wrap { padding: 48px 0 64px; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: var(--muted); margin-bottom: 24px; }
    .article-title { font-family: var(--font-serif); font-size: clamp(32px, 5vw, 48px); font-weight: 700; color: var(--heading); line-height: 1.25; margin-bottom: 16px; }
    .article-meta { display: flex; gap: 16px; font-size: 14px; color: var(--muted); margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
    .cover-image { width: 100%; border-radius: 8px; margin-bottom: 32px; max-height: 400px; object-fit: cover; }
    .article-body { font-family: var(--font-serif); font-size: 19px; line-height: 1.85; color: var(--text); }
    .article-body p { margin-bottom: 24px; }
    .article-body h1, .article-body h2, .article-body h3 { font-family: var(--font-serif); color: var(--heading); margin: 36px 0 16px; }
    .article-body blockquote { border-left: 4px solid var(--accent); padding-left: 20px; font-style: italic; color: var(--muted); margin: 24px 0; }

    /* Tags */
    .article-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); }
    .tag-badge { font-size: 13px; background: #f5f5f4; color: #57534e; padding: 4px 12px; border-radius: 9999px; }

    /* Author Card */
    .author-card { margin-top: 48px; padding: 28px; background: #fff; border: 1px solid var(--border); border-radius: 8px; display: flex; gap: 20px; align-items: center; }
    .author-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; }
    .author-name { font-family: var(--font-serif); font-weight: 700; color: var(--heading); font-size: 16px; margin-bottom: 4px; }
    .author-bio { font-size: 14px; color: var(--muted); line-height: 1.5; }

    /* Footer */
    .site-footer { border-top: 1px solid var(--border); padding: 40px 0; font-size: 13px; color: var(--muted); }
    .footer-container { max-width: 760px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }

    @media (max-width: 768px) {
      .nav-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); padding: 20px; border-bottom: 1px solid var(--border); }
      .nav-menu.open { display: flex; }
      .nav-toggle { display: block; }
    }
  </style>
</head>
<body>
  ${renderNav(site, pages, currentPath)}
  <main class="container">
    <article class="article-wrap">
      <a href="/" class="back-link">&larr; Back to all articles</a>
      <h1 class="article-title">${escapeHtml(activePost.title)}</h1>
      <div class="article-meta">
        <span>${pubDate}</span>
        <span>&bull;</span>
        <span>${readTime}</span>
      </div>
      ${activePost.cover_asset_url ? `<img src="${sanitizeUrl(activePost.cover_asset_url)}" alt="${escapeHtml(activePost.title)}" class="cover-image">` : ''}
      <div class="article-body">
        ${renderSafeMarkdown(activePost.body_markdown)}
      </div>
      ${Array.isArray(activePost.tags) && activePost.tags.length > 0 ? `
        <div class="article-tags">
          ${activePost.tags.map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join('')}
        </div>
      ` : ''}
      <div class="author-card">
        ${hero.avatarUrl ? `<img src="${sanitizeUrl(hero.avatarUrl)}" alt="${escapeHtml(hero.headline || 'Author')}" class="author-avatar">` : ''}
        <div>
          <div class="author-name">Written by ${escapeHtml(hero.headline || site.title)}</div>
          <div class="author-bio">${escapeHtml(hero.bio || site.description || '')}</div>
        </div>
      </div>
    </article>
  </main>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
  }

  // -------------------------------------------------------------
  // VIEW: BLOG ARCHIVE / HOMEPAGE
  // -------------------------------------------------------------
  const publishedPosts = posts.filter(p => p.status === 'published');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #fffdf9;
      --card-bg: #ffffff;
      --text: #292524;
      --heading: #1c1917;
      --muted: #78716c;
      --border: #e7e5e4;
      --accent: ${primaryColor};
      --font-serif: ${fontPair.heading};
      --font-sans: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.7; font-size: 17px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 760px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .site-header { border-bottom: 1px solid var(--border); background: rgba(255, 253, 249, 0.95); position: sticky; top: 0; z-index: 100; }
    .nav-container { max-width: 760px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand-link { font-family: var(--font-serif); font-size: 22px; font-weight: 700; color: var(--heading); }
    .nav-menu { display: flex; gap: 20px; }
    .nav-link { font-size: 14px; font-weight: 600; color: var(--muted); }
    .nav-link:hover { color: var(--accent); }
    .nav-toggle { display: none; background: none; border: none; font-size: 22px; cursor: pointer; }

    /* Hero / Intro */
    .blog-hero { padding: 64px 0 40px; border-bottom: 1px solid var(--border); }
    .blog-title { font-family: var(--font-serif); font-size: clamp(34px, 5vw, 44px); font-weight: 700; color: var(--heading); margin-bottom: 12px; }
    .blog-desc { font-size: 18px; color: var(--muted); margin-bottom: 20px; }
    .rss-link { font-size: 13px; font-weight: 600; color: var(--accent); display: inline-flex; align-items: center; gap: 4px; }

    /* Posts List */
    .posts-section { padding: 48px 0; }
    .posts-list { display: flex; flex-direction: column; gap: 36px; }
    .post-item { border-bottom: 1px solid var(--border); padding-bottom: 32px; }
    .post-meta { font-size: 13px; color: var(--muted); margin-bottom: 6px; }
    .post-item-title { font-family: var(--font-serif); font-size: 24px; font-weight: 700; color: var(--heading); line-height: 1.3; margin-bottom: 10px; }
    .post-item-title a { color: var(--heading); }
    .post-item-title a:hover { color: var(--accent); }
    .post-excerpt { color: var(--text); font-size: 16px; margin-bottom: 14px; line-height: 1.6; }
    .read-more { font-size: 14px; font-weight: 600; color: var(--accent); }

    /* Empty state */
    .empty-state { padding: 40px; text-align: center; color: var(--muted); }

    /* Footer */
    .site-footer { border-top: 1px solid var(--border); padding: 40px 0; font-size: 13px; color: var(--muted); }
    .footer-container { max-width: 760px; margin: 0 auto; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; }

    @media (max-width: 768px) {
      .nav-menu { display: none; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); padding: 20px; border-bottom: 1px solid var(--border); }
      .nav-menu.open { display: flex; }
      .nav-toggle { display: block; }
    }
  </style>
</head>
<body>
  ${renderNav(site, pages, currentPath)}
  <main class="container">
    <section class="blog-hero">
      <h1 class="blog-title">${escapeHtml(hero.headline || site.title)}</h1>
      <p class="blog-desc">${escapeHtml(hero.bio || site.description || 'Essays, observations, and deep dives.')}</p>
      <a href="/feed.xml" class="rss-link" target="_blank">📡 Subscribe via RSS Feed</a>
    </section>

    <section class="posts-section">
      ${publishedPosts.length > 0 ? `
        <div class="posts-list">
          ${publishedPosts.map(p => {
            const dateStr = p.published_at ? new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            return `
              <article class="post-item">
                <div class="post-meta">${dateStr} &bull; ${getReadTime(p.body_markdown)}</div>
                <h2 class="post-item-title">
                  <a href="/blog/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>
                </h2>
                <p class="post-excerpt">${escapeHtml(p.excerpt || '')}</p>
                <a href="/blog/${escapeHtml(p.slug)}" class="read-more">Read article &rarr;</a>
              </article>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <p>No articles published yet. Check back soon!</p>
        </div>
      `}
    </section>

    ${content.contact?.enableForm ? `
    <section style="padding: 40px 0; border-top: 1px solid var(--border);">
      <h2 style="font-family:var(--font-serif); margin-bottom:20px;">Contact Author</h2>
      ${renderContactForm(site)}
    </section>
    ` : ''}
  </main>
  ${renderFooter(site)}
  ${renderClientScript()}
</body>
</html>`;
}
