// ==============================================================================
// TEMPLATE 16: DIGITAL GARDEN & THOUGHT STREAM (QUARTZ & OBSIDIAN INSPIRED)
// Designed for thinkers, researchers, and builders publishing living notes & ideas.
// ==============================================================================
import { escapeHtml, sanitizeUrl, renderSafeMarkdown, sanitizeColor } from './sanitizer.js';
import { renderHead, renderClientScript, FONT_PAIRS } from './common.js';

export function renderDigitalGarden(siteData, currentPath = '/') {
  const site = siteData.site || {};
  const pages = siteData.pages || [];
  const posts = siteData.posts || [];
  const content = site.content || {};
  const hero = content.hero || {};
  const primaryColor = sanitizeColor(site.theme_config?.primaryColor, '#059669'); // Emerald botanical
  const fontPair = FONT_PAIRS['inter-outfit'];

  // Check if viewing an individual garden note: /blog/:slug
  const postMatch = (currentPath || '/').match(/^\/blog\/([a-z0-9-]+)\/?$/i);
  let activePost = null;

  if (postMatch) {
    const slug = postMatch[1];
    activePost = posts.find(p => p.slug === slug);
  }

  // Helper for growth stage
  const getGrowthStage = (idx) => {
    const stages = [
      { label: 'Evergreen', icon: '🌲', desc: 'Mature, well-researched thesis' },
      { label: 'Budding', icon: '🌿', desc: 'Developing line of thought' },
      { label: 'Seedling', icon: '🌰', desc: 'Early working note' }
    ];
    return stages[idx % stages.length];
  };

  // -------------------------------------------------------------
  // NOTE READER VIEW
  // -------------------------------------------------------------
  if (activePost) {
    const stage = getGrowthStage(0);
    const pubDate = activePost.published_at 
      ? new Date(activePost.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recently updated';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, activePost.title, activePost.excerpt, currentPath)}
  <style>
    :root {
      --bg: #fbfbf9;
      --card-bg: #ffffff;
      --text: #27272a;
      --heading: #18181b;
      --muted: #71717a;
      --border: #e4e4e7;
      --accent: ${primaryColor};
      --accent-soft: rgba(5, 150, 105, 0.08);
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.8; font-size: 16px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 740px; margin: 0 auto; padding: 40px 24px 80px; }

    .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
    .back-link { font-size: 14px; font-weight: 600; color: var(--muted); }
    .back-link:hover { color: var(--heading); }

    .note-stage-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      background: var(--accent-soft);
      color: var(--accent);
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    .note-title { font-family: var(--font-heading); font-size: 36px; font-weight: 800; color: var(--heading); margin-bottom: 12px; line-height: 1.25; }
    .note-meta { font-size: 13px; color: var(--muted); margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }

    .prose p { margin-bottom: 20px; }
    .prose h1, .prose h2, .prose h3 { font-family: var(--font-heading); color: var(--heading); margin: 32px 0 16px; }
    .prose blockquote { border-left: 3px solid var(--accent); background: var(--accent-soft); padding: 12px 18px; margin: 24px 0; border-radius: 0 6px 6px 0; }
    .prose pre { background: #18181b; color: #fafafa; padding: 16px; border-radius: 8px; margin: 20px 0; overflow-x: auto; font-family: monospace; font-size: 13px; }
    .prose ul, .prose ol { margin: 0 0 20px 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav-bar">
      <a href="/" class="back-link">&larr; Return to Garden</a>
      <span style="font-size:12px; color:var(--muted); font-family:monospace;">DIGITAL GARDEN</span>
    </div>

    <article>
      <div class="note-stage-badge">
        <span>${stage.icon}</span>
        <span>${stage.label} Note</span>
      </div>
      <h1 class="note-title">${escapeHtml(activePost.title)}</h1>
      <div class="note-meta">Planted: ${pubDate} &bull; Growing in public</div>

      <div class="prose">
        ${renderSafeMarkdown(activePost.body_markdown)}
      </div>
    </article>
  </div>
  ${renderClientScript()}
</body>
</html>`;
  }

  // -------------------------------------------------------------
  // GARDEN OVERVIEW / EXPLORER (HOMEPAGE)
  // -------------------------------------------------------------
  const publishedNotes = posts.filter(p => p.status === 'published');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${renderHead(site, null, null, currentPath)}
  <style>
    :root {
      --bg: #fbfbf9;
      --card-bg: #ffffff;
      --text: #27272a;
      --heading: #18181b;
      --muted: #71717a;
      --border: #e4e4e7;
      --accent: ${primaryColor};
      --accent-soft: rgba(5, 150, 105, 0.08);
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); line-height: 1.7; font-size: 16px; }
    a { color: var(--accent); text-decoration: none; }
    .container { max-width: 820px; margin: 0 auto; padding: 48px 24px 80px; }

    /* Garden Header */
    .garden-header { margin-bottom: 40px; }
    .garden-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px; }
    .garden-title { font-family: var(--font-heading); font-size: clamp(32px, 5vw, 44px); font-weight: 800; color: var(--heading); line-height: 1.2; margin-bottom: 12px; }
    .garden-bio { font-size: 17px; color: var(--muted); line-height: 1.6; max-width: 660px; }

    /* Filter & Search Bar */
    .garden-search {
      margin: 32px 0 36px;
      position: relative;
    }
    .search-input {
      width: 100%;
      padding: 12px 16px 12px 40px;
      font-size: 15px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      outline: none;
      transition: border-color 0.15s;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-icon { position: absolute; left: 14px; top: 13px; color: var(--muted); font-size: 14px; }

    /* Growth Legend */
    .legend-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 28px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); font-weight: 500; }

    /* Notes Grid */
    .notes-grid { display: flex; flex-direction: column; gap: 16px; }
    .note-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: transform 0.15s, border-color 0.15s;
    }
    .note-card:hover { transform: translateX(3px); border-color: var(--accent); text-decoration: none; }
    .note-card-title { font-family: var(--font-heading); font-size: 17px; font-weight: 700; color: var(--heading); margin-bottom: 4px; }
    .note-card-excerpt { font-size: 13px; color: var(--muted); line-height: 1.5; }
    .note-card-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); white-space: nowrap; margin-left: 20px; }

    /* Footer */
    .garden-footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid var(--border); font-size: 13px; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <header class="garden-header">
      <div class="garden-tag"><span>🌱</span> Digital Garden &bull; Public Notes</div>
      <h1 class="garden-title">${escapeHtml(site.title)}</h1>
      <p class="garden-bio">${escapeHtml(hero.bio || site.description || 'A living collection of ideas, research notes, and creative explorations.')}</p>
    </header>

    <div class="garden-search">
      <span class="search-icon">&telrec;</span>
      <input type="text" class="search-input" id="gardenSearchInput" placeholder="Filter notes by title or idea...">
    </div>

    <div class="legend-bar">
      <div class="legend-item"><span>🌲</span> <strong>Evergreen:</strong> Polished &amp; mature</div>
      <div class="legend-item"><span>🌿</span> <strong>Budding:</strong> Developing idea</div>
      <div class="legend-item"><span>🌰</span> <strong>Seedling:</strong> Rough spark</div>
    </div>

    <div class="notes-grid" id="notesGrid">
      ${publishedNotes.length > 0 ? publishedNotes.map((note, idx) => {
        const stage = getGrowthStage(idx);
        return `
          <a href="/blog/${note.slug}" class="note-card" data-title="${escapeHtml(note.title.toLowerCase())}">
            <div>
              <div class="note-card-title">${escapeHtml(note.title)}</div>
              <div class="note-card-excerpt">${escapeHtml(note.excerpt || 'Exploring this topic in public.')}</div>
            </div>
            <div class="note-card-badge">
              <span>${stage.icon}</span>
              <span>${stage.label}</span>
            </div>
          </a>
        `;
      }).join('') : `
        <div class="note-card" data-title="welcome to the digital garden">
          <div>
            <div class="note-card-title">Welcome to the Digital Garden</div>
            <div class="note-card-excerpt">Unlike a traditional chronological blog, a garden grows continuously over time.</div>
          </div>
          <div class="note-card-badge">
            <span>🌲</span>
            <span>Evergreen</span>
          </div>
        </div>
      `}
    </div>

    <footer class="garden-footer">
      <div>&copy; ${new Date().getFullYear()} ${escapeHtml(site.title)} &bull; Cultivated in public with MNDO Builder.</div>
    </footer>
  </div>

  <script>
    var searchInput = document.getElementById('gardenSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        var q = e.target.value.toLowerCase().trim();
        var cards = document.querySelectorAll('#notesGrid .note-card');
        cards.forEach(function(card) {
          var t = card.getAttribute('data-title') || '';
          if (!q || t.indexOf(q) !== -1) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    }
  </script>
  ${renderClientScript()}
</body>
</html>`;
}
