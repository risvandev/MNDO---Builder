// ==============================================================================
// MNDO BUILDER - FORM-BASED STUDIO EDITOR & LIVE PREVIEW CONTROLLER
// Contextual tabs based on website type:
// - Blog / Writing: [Content] [Design]
// - Portfolio / Landing: [Content] [Pages] [Design]
// ==============================================================================
import {
  getSiteById,
  saveSiteDraft,
  saveSitePosts,
  saveSitePages,
  deleteSite
} from './supabase.js';
import { renderSite, TEMPLATES, isBlogMode, getTemplateEditorMode } from '../templates/index.js';
import { checkSubdomainAvailability, normalizeSlug, validatePagePath, validatePrimaryColor } from './validation.js';
import { publishSite, unpublishSite } from './publishing.js';
import { uploadAsset } from './uploads.js';
import { showToast } from './components/toast.js';
import { openModal } from './components/modal.js';
import { CONFIG } from './config.js';

let activeSiteData = null; // { site, pages, posts }
let activeTab = 'content'; // 'content' | 'pages' | 'design'
let activeDevice = 'desktop'; // 'desktop' | 'tablet' | 'mobile'
let previewPath = '/';
let debounceTimer = null;
let saveStatus = 'saved'; // 'saved' | 'saving' | 'failed'

function resetEditorState() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  activeSiteData = null;
  activeTab = 'content';
  activeDevice = 'desktop';
  previewPath = '/';
  saveStatus = 'saved';
}

function getTabsHtml(site) {
  const isBlog = isBlogMode(site);
  if (isBlog && activeTab === 'pages') {
    activeTab = 'content';
  }
  return isBlog ? `
    <div class="editor-tabs">
      <button class="editor-tab-item ${activeTab === 'content' ? 'active' : ''}" data-tab="content">Content</button>
      <button class="editor-tab-item ${activeTab === 'design' ? 'active' : ''}" data-tab="design">Design</button>
    </div>
  ` : `
    <div class="editor-tabs">
      <button class="editor-tab-item ${activeTab === 'content' ? 'active' : ''}" data-tab="content">Content</button>
      <button class="editor-tab-item ${activeTab === 'pages' ? 'active' : ''}" data-tab="pages">Pages</button>
      <button class="editor-tab-item ${activeTab === 'design' ? 'active' : ''}" data-tab="design">Design</button>
    </div>
  `;
}

export function refreshEditorTabs(container) {
  const root = container || document;
  const wrap = root.querySelector('#editorTabsWrap');
  if (wrap && activeSiteData?.site) {
    wrap.innerHTML = getTabsHtml(activeSiteData.site);
    setupTabListeners(root);
    renderActiveTabContent(root);
  }
}

export async function renderEditor(container, siteId) {
  resetEditorState();

  container.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; height:calc(100vh - 68px); color:var(--text-muted);">
      Loading Studio Editor...
    </div>
  `;

  try {
    activeSiteData = await getSiteById(siteId);
  } catch (err) {
    container.innerHTML = `
      <div class="app-container" style="padding:60px 0; text-align:center;">
        <h2>Website Not Found</h2>
        <p style="color:var(--text-muted); margin:12px 0 24px;">The requested website could not be found or you do not have permission to edit it.</p>
        <a href="/dashboard" class="btn btn-primary">Return to Dashboard</a>
      </div>
    `;
    return;
  }

  const site = activeSiteData.site;
  const tabsHtml = getTabsHtml(site);

  container.innerHTML = `
    <div class="studio-container">
      <!-- Left: Form-Based Studio Sidebar -->
      <aside class="editor-sidebar">
        <div class="editor-header">
          <div style="display:flex; align-items:center; gap:12px;">
            <a href="/dashboard" class="icon-btn" title="Back to Dashboard">&larr;</a>
            <div>
              <div class="editor-site-title" id="siteTitleDisplay">${escapeHtml(site.title)}</div>
              <div style="font-size:11px; color:var(--text-dim); font-family:var(--font-mono);">
                ${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <!-- Autosave Status Indicator (A6) -->
            <div id="editorSaveStatus" style="font-size:11.5px; font-weight:500; color:var(--text-muted); padding:3px 8px; border-radius:12px; background:var(--paper-soft); border:1px solid var(--line-subtle); display:flex; align-items:center; gap:5px;">
              <span style="color:#10b981;">✓</span> <span>Saved</span>
            </div>
            <button class="icon-btn" id="btnOpenSettings" title="Site Settings & SEO">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button class="btn btn-primary btn-sm" id="btnQuickPublish">
              ${site.status === 'published' ? 'Republish' : 'Publish'}
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div id="editorTabsWrap" style="padding:14px 24px 0;">
          ${tabsHtml}
        </div>

        <!-- Editor Tab Content Panels -->
        <div class="editor-body" id="editorTabContent">
          <!-- Populated dynamically -->
        </div>
      </aside>

      <!-- Right: Isolated Live Preview -->
      <main class="editor-preview">
        <div class="preview-toolbar">
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="device-switcher">
              <button class="device-btn active" data-device="desktop">🖥 Desktop</button>
              <button class="device-btn" data-device="tablet">📱 Tablet</button>
              <button class="device-btn" data-device="mobile">📱 Mobile</button>
            </div>
            <button class="icon-btn" id="btnPreviewHome" title="Back to Homepage" style="${previewPath === '/' ? 'display:none;' : 'display:inline-flex;'}; font-size:12px; font-weight:600; padding:4px 10px; background:var(--paper-soft); border:1px solid var(--line); border-radius:var(--radius-full);">
              ← Home
            </button>
          </div>
          <div class="preview-address-bar">
            <span>🔒</span>
            <span id="previewAddress">https://${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}${previewPath === '/' ? '' : previewPath}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button class="icon-btn" id="btnOpenPreviewTab" title="Open Isolated Preview in New Tab" style="font-size:13px; font-weight:700;">↗</button>
            <button class="icon-btn" id="btnReloadPreview" title="Refresh Canvas">🔄</button>
          </div>
        </div>
        <div class="preview-viewport-wrap">
          <iframe id="previewFrame" class="preview-frame desktop" title="Website Live Preview" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
        </div>
      </main>
    </div>
  `;

  setupTabListeners(container);
  setupPreviewListeners(container);
  setupHeaderListeners(container);
  renderActiveTabContent(container);
  updateLivePreview();
}


// ------------------------------------------------------------------------------
// TAB SWITCHING & LISTENER SETUP
// ------------------------------------------------------------------------------
function setupTabListeners(container) {
  const tabs = container.querySelectorAll('.editor-tab-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.getAttribute('data-tab');
      renderActiveTabContent(container);
    });
  });
}

function setupHeaderListeners(container) {
  // Quick publish modal trigger
  container.querySelector('#btnQuickPublish')?.addEventListener('click', () => {
    openPublishModal(container);
  });

  // Settings & SEO modal trigger
  container.querySelector('#btnOpenSettings')?.addEventListener('click', () => {
    openSettingsModal(container);
  });
}

function setupPreviewListeners(container) {
  const deviceButtons = container.querySelectorAll('.device-btn');
  const iframe = container.querySelector('#previewFrame');

  deviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      deviceButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDevice = btn.getAttribute('data-device');
      iframe.className = `preview-frame ${activeDevice}`;
    });
  });

  // Refresh canvas button
  container.querySelector('#btnReloadPreview')?.addEventListener('click', () => {
    updateLivePreview();
    showToast('Canvas refreshed', 'info', 1200);
  });

  // Home button inside preview toolbar
  container.querySelector('#btnPreviewHome')?.addEventListener('click', () => {
    previewPath = '/';
    updateLivePreview();
  });

  // Open preview in isolated new tab
  container.querySelector('#btnOpenPreviewTab')?.addEventListener('click', () => {
    const rendered = renderSite(activeSiteData, previewPath);
    const blob = new Blob([rendered.body], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  });

  // Listen to navigation events from inside the isolated preview iframe
  const handleCanvasMessage = (event) => {
    if (event.data && event.data.type === 'MNDO_CANVAS_NAVIGATE') {
      const nextPath = event.data.path || '/';
      if (nextPath !== previewPath) {
        previewPath = nextPath;
        updateLivePreview();
      }
    }
  };
  window.removeEventListener('message', handleCanvasMessage);
  window.addEventListener('message', handleCanvasMessage);
}

// ------------------------------------------------------------------------------
// RENDER TAB PANELS
// ------------------------------------------------------------------------------
function renderActiveTabContent(container) {
  const panel = container.querySelector('#editorTabContent');
  if (!panel) return;

  const site = activeSiteData?.site;
  if (!site) return;
  const isBlog = isBlogMode(site);

  if (activeTab === 'content') {
    if (isBlog) {
      renderBlogContentTab(panel);
    } else {
      renderPortfolioContentTab(panel);
    }
  } else if (activeTab === 'pages') {
    if (isBlog) {
      activeTab = 'content';
      renderBlogContentTab(panel);
    } else {
      renderPagesTab(panel);
    }
  } else if (activeTab === 'design') {
    renderDesignTab(panel);
  }
}

// ------------------------------------------------------------------------------
// 1A. BLOG & WRITING CONTENT TAB (THESIS, STORY, ARTICLES)
// ------------------------------------------------------------------------------
function renderBlogContentTab(panel) {
  const site = activeSiteData.site;
  const content = site.content || {};
  const hero = content.hero || {};
  const posts = activeSiteData.posts || [];

  panel.innerHTML = `
    <!-- Publication & Writer Profile -->
    <div class="section-item">
      <div class="section-item-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="section-item-left">
          <span>✍️</span>
          <span class="section-item-title">Publication & Author</span>
        </div>
        <span class="icon-btn">▼</span>
      </div>
      <div class="section-item-body">
        <div class="form-group">
          <label class="form-label">Publication Title</label>
          <input type="text" class="form-input" id="blogPubTitle" value="${escapeHtml(hero.headline || site.title || '')}" placeholder="e.g. Thesis on Modern Systems or Personal Journal">
        </div>
        <div class="form-group">
          <label class="form-label">Tagline or Theme</label>
          <input type="text" class="form-input" id="blogPubTagline" value="${escapeHtml(hero.tagline || '')}" placeholder="e.g. Explorations in distributed computing & engineering">
        </div>
        <div class="form-group">
          <label class="form-label">About the Writer / Publication</label>
          <textarea class="form-textarea" rows="3" id="blogPubBio" placeholder="A brief description of this publication, research, or writing...">${escapeHtml(hero.bio || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Author Avatar / Portrait URL</label>
          <input type="text" class="form-input" id="blogAvatarUrl" value="${escapeHtml(hero.avatarUrl || '')}" placeholder="https://example.com/avatar.jpg">
        </div>
      </div>
    </div>

    <!-- Writings, Stories & Articles -->
    <div style="margin-top:24px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3 style="font-size:16px; font-weight:700; color:var(--ink); margin-bottom:2px;">Writings & Stories (${posts.length})</h3>
        <p style="font-size:12px; color:var(--muted);">Each story or thesis chapter receives its own URL.</p>
      </div>
      <button class="btn btn-primary btn-sm" id="btnWriteNewPost" style="padding:6px 14px; font-size:12px;">+ Write New</button>
    </div>

    <div class="repeater-list" id="blogPostsList">
      ${posts.length === 0 ? `
        <div style="text-align:center; padding:32px 16px; border:1px dashed var(--line); border-radius:12px; background:#ffffff; color:var(--muted); font-size:13px;">
          <p style="margin-bottom:12px; font-weight:500; color:var(--ink);">No writings published yet.</p>
          <p style="margin-bottom:16px;">Write a thesis chapter, story, essay, or article to share with your audience.</p>
          <button class="btn btn-secondary btn-sm" id="btnWriteFirstPost">+ Write Your First Story</button>
        </div>
      ` : ''}

      ${posts.map((post, idx) => {
        const isPub = post.status === 'published';
        const postUrl = `https://${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}/blog/${post.slug}`;
        return `
          <div class="card" style="margin-bottom:12px; padding:16px; background:#ffffff; border:1px solid var(--line); border-radius:12px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
              <div>
                <span class="badge ${isPub ? 'badge-published' : 'badge-draft'}" style="font-size:10px; padding:2px 7px; margin-bottom:6px;">
                  ${post.status}
                </span>
                <h4 style="font-size:15px; font-weight:700; color:var(--ink); margin:0;">${escapeHtml(post.title)}</h4>
              </div>
              <button class="icon-btn btn-delete-post" data-idx="${idx}" title="Delete story">&times;</button>
            </div>
            
            <div style="margin-bottom:12px;">
              <span style="font-family:var(--font-mono); font-size:11px; color:var(--muted); word-break:break-all;">
                /blog/${escapeHtml(post.slug)}
              </span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary btn-sm btn-edit-post" data-idx="${idx}" style="padding:4px 10px; font-size:12px;">Edit</button>
                <button class="btn btn-outline btn-sm btn-preview-post" data-slug="${post.slug}" style="padding:4px 10px; font-size:12px;">Preview</button>
              </div>
              ${isPub ? `
                <a href="${postUrl}" target="_blank" rel="noopener" style="font-size:12px; color:var(--muted); text-decoration:underline;">Visit ↗</a>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Publication event listeners
  const titleInput = panel.querySelector('#blogPubTitle');
  if (titleInput) {
    titleInput.addEventListener('input', (e) => {
      content.hero = content.hero || {};
      content.hero.headline = e.target.value;
      site.title = e.target.value;
      document.getElementById('siteTitleDisplay').textContent = e.target.value;
      scheduleDraftSave();
    });
  }

  const taglineInput = panel.querySelector('#blogPubTagline');
  if (taglineInput) {
    taglineInput.addEventListener('input', (e) => {
      content.hero = content.hero || {};
      content.hero.tagline = e.target.value;
      scheduleDraftSave();
    });
  }

  const bioInput = panel.querySelector('#blogPubBio');
  if (bioInput) {
    bioInput.addEventListener('input', (e) => {
      content.hero = content.hero || {};
      content.hero.bio = e.target.value;
      scheduleDraftSave();
    });
  }

  const avatarInput = panel.querySelector('#blogAvatarUrl');
  if (avatarInput) {
    avatarInput.addEventListener('input', (e) => {
      content.hero = content.hero || {};
      content.hero.avatarUrl = e.target.value;
      scheduleDraftSave();
    });
  }

  // Create new writing triggers
  const openNew = () => openPostEditor(null, panel);
  panel.querySelector('#btnWriteNewPost')?.addEventListener('click', openNew);
  panel.querySelector('#btnWriteFirstPost')?.addEventListener('click', openNew);

  // Edit writing triggers
  panel.querySelectorAll('.btn-edit-post').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      openPostEditor(idx, panel);
    });
  });

  // Delete writing triggers (A11: with confirmation and await/rollback)
  panel.querySelectorAll('.btn-delete-post').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const postToDelete = activeSiteData.posts[idx];
      if (!postToDelete) return;

      openModal({
        title: 'Delete Story?',
        contentHtml: `<p>Are you sure you want to permanently delete <strong>${escapeHtml(postToDelete.title)}</strong>? This action cannot be undone.</p>`,
        confirmText: 'Delete Story',
        isDanger: true,
        onConfirm: async () => {
          const previousPosts = [...activeSiteData.posts];
          try {
            activeSiteData.posts.splice(idx, 1);
            await saveSitePosts(activeSiteData.site.id, activeSiteData.posts);
            renderBlogContentTab(panel);
            if (previewPath.startsWith(`/blog/${postToDelete.slug}`)) {
              previewPath = '/';
            }
            updateLivePreview();
            showToast('Writing deleted successfully.', 'info');
          } catch (err) {
            activeSiteData.posts = previousPosts;
            renderBlogContentTab(panel);
            showToast('Failed to delete writing: ' + err.message, 'error');
          }
        }
      });
    });
  });

  // Preview writing triggers
  panel.querySelectorAll('.btn-preview-post').forEach(btn => {
    btn.addEventListener('click', () => {
      previewPath = `/blog/${btn.getAttribute('data-slug')}`;
      updateLivePreview();
    });
  });
}

function openPostEditor(postIdx, parentPanel) {
  const isNew = postIdx === null;
  const post = !isNew ? activeSiteData.posts[postIdx] : {
    title: 'New Story / Article',
    slug: 'new-story',
    excerpt: '',
    body_markdown: '# Title\n\nStart writing your story, thesis chapter, essay, or thoughts here...',
    tags: ['writing'],
    status: 'draft' // A9: Default all newly created posts to draft!
  };

  openModal({
    title: isNew ? 'Write New Story / Article' : 'Edit Story / Article',
    contentHtml: `
      <div class="form-group">
        <label class="form-label">Title / Chapter Name</label>
        <input type="text" class="form-input" id="postModalTitle" value="${escapeHtml(post.title)}">
      </div>

      <div class="form-group">
        <label class="form-label">URL Slug</label>
        <div class="subdomain-input-group">
          <span class="subdomain-prefix">/blog/</span>
          <input type="text" class="subdomain-input" id="postModalSlug" value="${escapeHtml(post.slug)}" placeholder="story-slug">
        </div>
        <div class="form-hint">Address: https://${activeSiteData.site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}/blog/<span id="slugMirror">${post.slug}</span></div>
      </div>

      <div class="form-group">
        <label class="form-label">Excerpt / Short Summary</label>
        <textarea class="form-textarea" rows="2" id="postModalExcerpt" placeholder="1-2 sentences summarizing this piece...">${escapeHtml(post.excerpt || '')}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Writing Content (Markdown Supported)</label>
        <textarea class="form-textarea" rows="12" id="postModalBody" style="font-family:var(--font-mono); font-size:13px; line-height:1.6;" placeholder="Write your full story or thesis here...">${escapeHtml(post.body_markdown || '')}</textarea>
        <div class="form-hint">Supports **bold**, *italic*, headers (#, ##), quotes (>), lists, and images.</div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Tags (comma-separated)</label>
          <input type="text" class="form-input" id="postModalTags" value="${escapeHtml(Array.isArray(post.tags) ? post.tags.join(', ') : '')}" placeholder="thesis, science, essays">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-select" id="postModalStatus">
            <option value="draft" ${post.status === 'draft' ? 'selected' : ''}>Draft (Private)</option>
            <option value="published" ${post.status === 'published' ? 'selected' : ''}>Published (Live URL)</option>
          </select>
        </div>
      </div>
    `,
    confirmText: isNew ? 'Save & Preview' : 'Update Story',
    onConfirm: async () => {
      const title = document.getElementById('postModalTitle').value.trim() || 'Untitled Story';
      const rawSlug = document.getElementById('postModalSlug').value.trim();
      const slug = normalizeSlug(rawSlug || title, activeSiteData.posts, post.id);
      const excerpt = document.getElementById('postModalExcerpt').value.trim();
      const body = document.getElementById('postModalBody').value;
      const tags = document.getElementById('postModalTags').value.split(',').map(t => t.trim()).filter(Boolean);
      const status = document.getElementById('postModalStatus').value;

      activeSiteData.posts = activeSiteData.posts || [];
      const updatedPost = {
        id: post.id || `post-${Date.now()}`,
        site_id: activeSiteData.site.id,
        title,
        slug,
        excerpt,
        body_markdown: body,
        tags,
        status,
        published_at: status === 'published' ? (post.published_at || new Date().toISOString()) : null
      };

      if (isNew) {
        activeSiteData.posts.unshift(updatedPost);
      } else {
        activeSiteData.posts[postIdx] = updatedPost;
      }

      try {
        await saveSitePosts(activeSiteData.site.id, activeSiteData.posts);
        renderBlogContentTab(parentPanel);
        previewPath = `/blog/${slug}`;
        updateLivePreview();
        showToast('Story saved and preview loaded.', 'success');
      } catch (err) {
        showToast('Failed to save story: ' + err.message, 'error');
      }
    }
  });

  // Auto-slug generator on title input (A10)
  setTimeout(() => {
    const titleInp = document.getElementById('postModalTitle');
    const slugInp = document.getElementById('postModalSlug');
    const mirror = document.getElementById('slugMirror');
    if (titleInp && slugInp) {
      if (isNew) {
        titleInp.addEventListener('input', () => {
          const s = normalizeSlug(titleInp.value, activeSiteData.posts, post.id);
          slugInp.value = s;
          if (mirror) mirror.textContent = s;
        });
      }
      slugInp.addEventListener('input', () => {
        if (mirror) mirror.textContent = slugInp.value;
      });
    }
  }, 50);
}

// ------------------------------------------------------------------------------
// 1B. PORTFOLIO & LANDING CONTENT TAB (SECTIONS)
// ------------------------------------------------------------------------------
function renderPortfolioContentTab(panel) {
  const site = activeSiteData.site;
  const content = site.content || {};
  const hero = content.hero || {};
  const about = content.about || {};
  const skills = content.skills || [];
  const projects = content.projects || [];
  const experience = content.experience || [];
  const education = content.education || [];

  panel.innerHTML = `
    <!-- Section: Hero / Introduction -->
    <div class="section-item">
      <div class="section-item-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="section-item-left">
          <span>✨</span>
          <span class="section-item-title">Hero / Introduction</span>
        </div>
        <span class="icon-btn">▼</span>
      </div>
      <div class="section-item-body">
        <div class="form-group">
          <label class="form-label">Headline / Your Name</label>
          <input type="text" class="form-input" id="heroHeadline" value="${escapeHtml(hero.headline || site.title || '')}" placeholder="Jane Doe">
        </div>
        <div class="form-group">
          <label class="form-label">Tagline / Professional Title</label>
          <input type="text" class="form-input" id="heroTagline" value="${escapeHtml(hero.tagline || '')}" placeholder="Software Engineer & Designer">
        </div>
        <div class="form-group">
          <label class="form-label">Short Bio / Introduction</label>
          <textarea class="form-textarea" rows="3" id="heroBio" placeholder="A brief 1-2 sentence overview...">${escapeHtml(hero.bio || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Primary Action Button</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <input type="text" class="form-input" id="heroCtaText" value="${escapeHtml(hero.primaryCta?.text || '')}" placeholder="Button Text (e.g. Projects)">
            <input type="text" class="form-input" id="heroCtaUrl" value="${escapeHtml(hero.primaryCta?.url || '')}" placeholder="Target (#projects or link)">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Profile Avatar / Photo</label>
          <input type="file" id="heroAvatarFile" accept="image/jpeg,image/png,image/webp" style="margin-bottom:8px; font-size:12px;">
          <input type="text" class="form-input" id="heroAvatarUrl" value="${escapeHtml(hero.avatarUrl || '')}" placeholder="Or paste image URL">
        </div>
      </div>
    </div>

    <!-- Section: About Me -->
    <div class="section-item">
      <div class="section-item-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="section-item-left">
          <span>👤</span>
          <span class="section-item-title">About Me (Bio & Story)</span>
        </div>
        <span class="icon-btn">▼</span>
      </div>
      <div class="section-item-body">
        <div class="form-group">
          <label class="form-label">About Story (Markdown supported)</label>
          <textarea class="form-textarea" rows="6" id="aboutBody" placeholder="Write your background, interests, or mission...">${escapeHtml(about.body || '')}</textarea>
          <div class="form-hint">Supports **bold**, *italic*, bullet lists, and links.</div>
        </div>
      </div>
    </div>

    <!-- Section: Skills & Technologies -->
    <div class="section-item">
      <div class="section-item-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="section-item-left">
          <span>⚡</span>
          <span class="section-item-title">Skills & Technologies (${skills.length})</span>
        </div>
        <span class="icon-btn">▼</span>
      </div>
      <div class="section-item-body">
        <div id="skillsRepeater" class="repeater-list">
          ${skills.map((s, idx) => `
            <div class="repeater-card" data-idx="${idx}">
              <div class="repeater-card-header">
                <span class="repeater-card-title">${escapeHtml(typeof s === 'string' ? s : s.name)}</span>
                <button class="icon-btn btn-remove-skill" data-idx="${idx}">&times;</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" class="form-input" id="newSkillInput" placeholder="Add skill (e.g. React, Rust, Python)">
          <button class="btn btn-secondary btn-sm" id="btnAddSkill">+ Add</button>
        </div>
      </div>
    </div>

    <!-- Section: Featured Projects -->
    <div class="section-item">
      <div class="section-item-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="section-item-left">
          <span>🚀</span>
          <span class="section-item-title">Projects (${projects.length})</span>
        </div>
        <span class="icon-btn">▼</span>
      </div>
      <div class="section-item-body">
        <div id="projectsRepeater" class="repeater-list">
          ${projects.map((p, idx) => `
            <div class="repeater-card" style="margin-bottom:12px;">
              <div class="repeater-card-header">
                <span class="repeater-card-title">${escapeHtml(p.title || `Project #${idx+1}`)}</span>
                <button class="icon-btn btn-remove-project" data-idx="${idx}">&times;</button>
              </div>
              <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" class="form-input p-title-input" data-idx="${idx}" value="${escapeHtml(p.title || '')}">
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea p-desc-input" rows="2" data-idx="${idx}">${escapeHtml(p.description || '')}</textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Tags (comma separated)</label>
                <input type="text" class="form-input p-tags-input" data-idx="${idx}" value="${escapeHtml((p.tags || []).join(', '))}">
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <input type="text" class="form-input p-live-input" data-idx="${idx}" value="${escapeHtml(p.liveUrl || '')}" placeholder="Live Demo URL">
                <input type="text" class="form-input p-repo-input" data-idx="${idx}" value="${escapeHtml(p.githubUrl || '')}" placeholder="GitHub / Repo URL">
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" id="btnAddProject" style="width:100%;">+ Add Project</button>
      </div>
    </div>

    <!-- Section: Experience -->
    <div class="section-item">
      <div class="section-item-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="section-item-left">
          <span>💼</span>
          <span class="section-item-title">Experience & Work History (${experience.length})</span>
        </div>
        <span class="icon-btn">▼</span>
      </div>
      <div class="section-item-body">
        <div id="experienceRepeater" class="repeater-list">
          ${experience.map((e, idx) => `
            <div class="repeater-card" style="margin-bottom:12px;">
              <div class="repeater-card-header">
                <span class="repeater-card-title">${escapeHtml(e.role || 'Role')} @ ${escapeHtml(e.company || '')}</span>
                <button class="icon-btn btn-remove-exp" data-idx="${idx}">&times;</button>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                <input type="text" class="form-input exp-role-input" data-idx="${idx}" value="${escapeHtml(e.role || '')}" placeholder="Role / Position">
                <input type="text" class="form-input exp-comp-input" data-idx="${idx}" value="${escapeHtml(e.company || '')}" placeholder="Company Name">
              </div>
              <input type="text" class="form-input exp-period-input" data-idx="${idx}" value="${escapeHtml(e.period || '')}" placeholder="Period (e.g. 2023 - Present)" style="margin-bottom:8px;">
              <textarea class="form-textarea exp-desc-input" rows="2" data-idx="${idx}" placeholder="Responsibilities & accomplishments...">${escapeHtml(e.description || '')}</textarea>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" id="btnAddExp" style="width:100%;">+ Add Experience Entry</button>
      </div>
    </div>

    <!-- Section: Education -->
    <div class="section-item">
      <div class="section-item-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="section-item-left">
          <span>🎓</span>
          <span class="section-item-title">Education & Credentials (${education.length})</span>
        </div>
        <span class="icon-btn">▼</span>
      </div>
      <div class="section-item-body">
        <div id="eduRepeater" class="repeater-list">
          ${education.map((ed, idx) => `
            <div class="repeater-card" style="margin-bottom:12px;">
              <div class="repeater-card-header">
                <span class="repeater-card-title">${escapeHtml(ed.degree || 'Degree')}</span>
                <button class="icon-btn btn-remove-edu" data-idx="${idx}">&times;</button>
              </div>
              <input type="text" class="form-input edu-degree-input" data-idx="${idx}" value="${escapeHtml(ed.degree || '')}" placeholder="Degree / Major" style="margin-bottom:8px;">
              <input type="text" class="form-input edu-inst-input" data-idx="${idx}" value="${escapeHtml(ed.institution || '')}" placeholder="Institution / University" style="margin-bottom:8px;">
              <input type="text" class="form-input edu-year-input" data-idx="${idx}" value="${escapeHtml(ed.year || '')}" placeholder="Year (e.g. 2020 - 2024)">
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm" id="btnAddEdu" style="width:100%;">+ Add Education Entry</button>
      </div>
    </div>
  `;

  attachPortfolioContentEventListeners(panel);
}

function attachPortfolioContentEventListeners(panel) {
  const content = activeSiteData.site.content || {};

  // Hero inputs
  const headlineInput = panel.querySelector('#heroHeadline');
  if (headlineInput) {
    headlineInput.addEventListener('input', (e) => {
      content.hero = content.hero || {};
      content.hero.headline = e.target.value;
      activeSiteData.site.title = e.target.value;
      document.getElementById('siteTitleDisplay').textContent = e.target.value;
      scheduleDraftSave();
    });
  }

  const taglineInput = panel.querySelector('#heroTagline');
  if (taglineInput) {
    taglineInput.addEventListener('input', (e) => {
      content.hero = content.hero || {};
      content.hero.tagline = e.target.value;
      scheduleDraftSave();
    });
  }

  const bioInput = panel.querySelector('#heroBio');
  if (bioInput) {
    bioInput.addEventListener('input', (e) => {
      content.hero = content.hero || {};
      content.hero.bio = e.target.value;
      scheduleDraftSave();
    });
  }

  const ctaTextInput = panel.querySelector('#heroCtaText');
  const ctaUrlInput = panel.querySelector('#heroCtaUrl');
  if (ctaTextInput && ctaUrlInput) {
    const updateCta = () => {
      content.hero = content.hero || {};
      content.hero.primaryCta = { text: ctaTextInput.value, url: ctaUrlInput.value };
      scheduleDraftSave();
    };
    ctaTextInput.addEventListener('input', updateCta);
    ctaUrlInput.addEventListener('input', updateCta);
  }

  // Avatar upload
  const avatarFile = panel.querySelector('#heroAvatarFile');
  if (avatarFile) {
    avatarFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        showToast('Uploading avatar...', 'info');
        const res = await uploadAsset(file, activeSiteData.site.id, 'image');
        content.hero = content.hero || {};
        content.hero.avatarUrl = res.publicUrl;
        panel.querySelector('#heroAvatarUrl').value = res.publicUrl;
        showToast('Avatar uploaded!', 'success');
        scheduleDraftSave();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // About input
  const aboutInput = panel.querySelector('#aboutBody');
  if (aboutInput) {
    aboutInput.addEventListener('input', (e) => {
      content.about = content.about || {};
      content.about.body = e.target.value;
      scheduleDraftSave();
    });
  }

  // Skills handlers
  const btnAddSkill = panel.querySelector('#btnAddSkill');
  const skillInput = panel.querySelector('#newSkillInput');
  if (btnAddSkill && skillInput) {
    btnAddSkill.addEventListener('click', () => {
      const val = skillInput.value.trim();
      if (!val) return;
      content.skills = content.skills || [];
      content.skills.push({ name: val });
      skillInput.value = '';
      renderPortfolioContentTab(panel);
      scheduleDraftSave();
    });
  }

  panel.querySelectorAll('.btn-remove-skill').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      content.skills.splice(idx, 1);
      renderPortfolioContentTab(panel);
      scheduleDraftSave();
    });
  });

  // Projects handlers
  const btnAddProject = panel.querySelector('#btnAddProject');
  if (btnAddProject) {
    btnAddProject.addEventListener('click', () => {
      content.projects = content.projects || [];
      content.projects.push({
        title: 'New Project',
        description: 'Describe the project and technologies used.',
        tags: ['Vanilla JS', 'CSS'],
        liveUrl: '',
        githubUrl: ''
      });
      renderPortfolioContentTab(panel);
      scheduleDraftSave();
    });
  }

  panel.querySelectorAll('.btn-remove-project').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      content.projects.splice(idx, 1);
      renderPortfolioContentTab(panel);
      scheduleDraftSave();
    });
  });

  panel.querySelectorAll('.p-title-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(inp.getAttribute('data-idx'), 10);
      content.projects[idx].title = e.target.value;
      scheduleDraftSave();
    });
  });

  panel.querySelectorAll('.p-desc-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(inp.getAttribute('data-idx'), 10);
      content.projects[idx].description = e.target.value;
      scheduleDraftSave();
    });
  });

  panel.querySelectorAll('.p-tags-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(inp.getAttribute('data-idx'), 10);
      content.projects[idx].tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
      scheduleDraftSave();
    });
  });

  panel.querySelectorAll('.p-live-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(inp.getAttribute('data-idx'), 10);
      content.projects[idx].liveUrl = e.target.value;
      scheduleDraftSave();
    });
  });

  panel.querySelectorAll('.p-repo-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = parseInt(inp.getAttribute('data-idx'), 10);
      content.projects[idx].githubUrl = e.target.value;
      scheduleDraftSave();
    });
  });

  // Experience handlers
  const btnAddExp = panel.querySelector('#btnAddExp');
  if (btnAddExp) {
    btnAddExp.addEventListener('click', () => {
      content.experience = content.experience || [];
      content.experience.push({
        role: 'Role Title',
        company: 'Company Name',
        period: '2024 - Present',
        description: 'Details about your responsibilities.'
      });
      renderPortfolioContentTab(panel);
      scheduleDraftSave();
    });
  }

  panel.querySelectorAll('.btn-remove-exp').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      content.experience.splice(idx, 1);
      renderPortfolioContentTab(panel);
      scheduleDraftSave();
    });
  });

  // Education handlers
  const btnAddEdu = panel.querySelector('#btnAddEdu');
  if (btnAddEdu) {
    btnAddEdu.addEventListener('click', () => {
      content.education = content.education || [];
      content.education.push({
        degree: 'B.S. in Computer Science',
        institution: 'University Name',
        year: '2020 - 2024',
        details: ''
      });
      renderPortfolioContentTab(panel);
      scheduleDraftSave();
    });
  }

  panel.querySelectorAll('.btn-remove-edu').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      content.education.splice(idx, 1);
      renderPortfolioContentTab(panel);
      scheduleDraftSave();
    });
  });
}

// ------------------------------------------------------------------------------
// 2. PAGES TAB (FOR PORTFOLIO / LANDING WEBSITES)
// ------------------------------------------------------------------------------
function renderPagesTab(panel) {
  const pages = activeSiteData.pages || [];

  panel.innerHTML = `
    <div style="margin-bottom:20px;">
      <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">Website Pages</h3>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.5;">Add distinct pages when you need structured multi-page routes like /about or /projects.</p>
    </div>

    <div class="card" style="margin-bottom:16px; padding:16px; background:#ffffff; border:1px solid var(--line); border-radius:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-weight:700; font-size:14px; color:var(--ink);">Home</span>
        <span class="badge badge-published" style="font-size:10px; padding:2px 7px;">Default</span>
      </div>
      <div style="font-size:12px; font-family:var(--font-mono); color:var(--muted);">Path: /</div>
    </div>

    <div class="repeater-list" id="pagesList">
      ${pages.map((p, idx) => `
        <div class="card" style="margin-bottom:12px; padding:16px; background:#ffffff; border:1px solid var(--line); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div>
              <span style="font-weight:700; font-size:14px; color:var(--ink);">${escapeHtml(p.title)}</span>
              ${p.is_in_nav ? '<span style="margin-left:6px; font-size:10.5px; padding:1px 6px; border-radius:4px; background:var(--paper-soft); color:var(--text-dim); border:1px solid var(--line-subtle);">In Nav</span>' : ''}
            </div>
            <button class="icon-btn btn-delete-page" data-idx="${idx}" title="Delete page">&times;</button>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
            <span style="font-family:var(--font-mono); color:var(--ink); font-weight:600;">${escapeHtml(p.path)}</span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-outline btn-sm btn-edit-page" data-idx="${idx}" style="padding:3px 10px; font-size:11px;">Edit</button>
              <button class="btn btn-outline btn-sm btn-preview-page" data-path="${escapeHtml(p.path)}" style="padding:3px 10px; font-size:11px;">Preview</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <button class="btn btn-primary btn-sm" id="btnAddPage" style="width:100%; margin-top:8px;">+ Add New Page</button>
  `;

  // Add Page handler
  panel.querySelector('#btnAddPage')?.addEventListener('click', () => {
    openPageEditor(null, panel);
  });

  // Edit Page handlers
  panel.querySelectorAll('.btn-edit-page').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      openPageEditor(idx, panel);
    });
  });

  // Delete page handler (A12: Confirmation + Await + Rollback)
  panel.querySelectorAll('.btn-delete-page').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      const pageToDelete = activeSiteData.pages[idx];
      if (!pageToDelete) return;

      openModal({
        title: 'Delete Page?',
        contentHtml: `<p>Are you sure you want to permanently delete <strong>${escapeHtml(pageToDelete.title)}</strong> (<code>${escapeHtml(pageToDelete.path)}</code>)? This action cannot be undone.</p>`,
        confirmText: 'Delete Page',
        isDanger: true,
        onConfirm: async () => {
          const previousPages = [...activeSiteData.pages];
          try {
            activeSiteData.pages.splice(idx, 1);
            await saveSitePages(activeSiteData.site.id, activeSiteData.pages);
            renderPagesTab(panel);
            if (previewPath === pageToDelete.path) {
              previewPath = '/';
            }
            updateLivePreview();
            showToast('Page deleted successfully.', 'info');
          } catch (err) {
            activeSiteData.pages = previousPages;
            renderPagesTab(panel);
            showToast('Failed to delete page: ' + err.message, 'error');
          }
        }
      });
    });
  });

  // Preview page handler
  panel.querySelectorAll('.btn-preview-page').forEach(btn => {
    btn.addEventListener('click', () => {
      previewPath = btn.getAttribute('data-path');
      updateLivePreview();
    });
  });
}

function openPageEditor(pageIdx, parentPanel) {
  const isNew = pageIdx === null;
  const page = !isNew ? activeSiteData.pages[pageIdx] : {
    title: 'About Me',
    path: '/about',
    page_type: 'about',
    content: '## About Me\n\nWrite your page story, background, or information here...',
    is_in_nav: true,
    is_published: true
  };

  openModal({
    title: isNew ? 'Create New Page' : 'Edit Page',
    contentHtml: `
      <div class="form-group">
        <label class="form-label">Page Type</label>
        <select class="form-select" id="modalPageType">
          <option value="about" ${page.page_type === 'about' ? 'selected' : ''}>About Me (/about)</option>
          <option value="projects" ${page.page_type === 'projects' ? 'selected' : ''}>Projects Showcase (/projects)</option>
          <option value="services" ${page.page_type === 'services' ? 'selected' : ''}>Services (/services)</option>
          <option value="contact" ${page.page_type === 'contact' ? 'selected' : ''}>Contact (/contact)</option>
          <option value="custom" ${page.page_type === 'custom' ? 'selected' : ''}>Custom Page</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Page Title</label>
        <input type="text" class="form-input" id="modalPageTitle" value="${escapeHtml(page.title)}">
      </div>
      <div class="form-group">
        <label class="form-label">URL Path</label>
        <input type="text" class="form-input" id="modalPagePath" value="${escapeHtml(page.path)}" placeholder="/about">
        <div class="form-hint">Must start with / and be lowercase (e.g. /about, /projects, /services)</div>
      </div>
      <div class="form-group" style="display:flex; align-items:center; gap:8px; margin: 12px 0;">
        <input type="checkbox" id="modalPageInNav" ${page.is_in_nav ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
        <label for="modalPageInNav" style="font-size:13px; cursor:pointer;">Show in site navigation bar</label>
      </div>
      <div class="form-group">
        <label class="form-label">Page Content (Markdown Supported)</label>
        <textarea class="form-textarea" rows="8" id="modalPageContent" style="font-family:var(--font-mono); font-size:13px; line-height:1.6;" placeholder="Write your page markdown content here...">${escapeHtml(page.content || page.body_markdown || '')}</textarea>
        <div class="form-hint">Supports **bold**, *italic*, headers (##), blockquotes (>), code blocks, and bullet points.</div>
      </div>
    `,
    confirmText: isNew ? 'Create Page' : 'Save Page',
    onConfirm: async () => {
      const type = document.getElementById('modalPageType').value;
      const title = document.getElementById('modalPageTitle').value.trim() || 'Untitled Page';
      const rawPath = document.getElementById('modalPagePath').value.trim();
      const inNav = document.getElementById('modalPageInNav').checked;
      const content = document.getElementById('modalPageContent').value;

      const pathValidation = validatePagePath(rawPath, activeSiteData.pages, page.id);
      if (!pathValidation.valid) {
        showToast(pathValidation.error, 'error');
        throw new Error(pathValidation.error); // Keep modal open
      }

      activeSiteData.pages = activeSiteData.pages || [];
      const updatedPage = {
        id: page.id || `page-${Date.now()}`,
        site_id: activeSiteData.site.id,
        page_type: type,
        title: title,
        path: pathValidation.path,
        content: content,
        body_markdown: content,
        is_in_nav: inNav,
        is_published: true
      };

      if (isNew) {
        activeSiteData.pages.push(updatedPage);
      } else {
        activeSiteData.pages[pageIdx] = updatedPage;
      }

      try {
        await saveSitePages(activeSiteData.site.id, activeSiteData.pages);
        renderPagesTab(parentPanel);
        previewPath = pathValidation.path;
        updateLivePreview();
        showToast(isNew ? `Created page ${pathValidation.path}` : `Saved page ${pathValidation.path}`, 'success');
      } catch (err) {
        showToast('Failed to save page: ' + err.message, 'error');
      }
    }
  });

  // Auto-fill path based on type if new
  if (isNew) {
    setTimeout(() => {
      const typeSelect = document.getElementById('modalPageType');
      const titleInput = document.getElementById('modalPageTitle');
      const pathInput = document.getElementById('modalPagePath');
      if (typeSelect && titleInput && pathInput) {
        typeSelect.addEventListener('change', () => {
          const val = typeSelect.value;
          if (val === 'about') { titleInput.value = 'About Me'; pathInput.value = '/about'; }
          else if (val === 'projects') { titleInput.value = 'Projects'; pathInput.value = '/projects'; }
          else if (val === 'services') { titleInput.value = 'Services'; pathInput.value = '/services'; }
          else if (val === 'contact') { titleInput.value = 'Contact'; pathInput.value = '/contact'; }
          else { titleInput.value = 'New Page'; pathInput.value = '/new-page'; }
        });
      }
    }, 50);
  }
}

// ------------------------------------------------------------------------------
// 3. DESIGN & THEME TAB
// ------------------------------------------------------------------------------
function renderDesignTab(panel) {
  const site = activeSiteData.site;
  const theme = site.theme_config || {};
  const currentAccent = theme.primaryColor || '#111827';
  const currentFont = theme.fontPair || 'inter-outfit';

  panel.innerHTML = `
    <div style="margin-bottom:20px;">
      <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">Design & Appearance</h3>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.5;">Customize colors, typography pairs, and layout templates.</p>
    </div>

    <!-- Template Switcher -->
    <div class="form-group">
      <label class="form-label">Active Template</label>
      <select class="form-select" id="templatePicker">
        ${TEMPLATES.map(t => `
          <option value="${t.id}" ${site.template_id === t.id ? 'selected' : ''}>${t.name} (${t.category})</option>
        `).join('')}
      </select>
      <div class="form-hint">You can switch templates at any time without losing your content.</div>
    </div>

    <!-- Primary Accent Color -->
    <div class="form-group">
      <label class="form-label">Primary Brand Accent Color</label>
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
        <input type="color" id="primaryColorPicker" value="${currentAccent}" style="width:44px; height:44px; border:none; border-radius:8px; cursor:pointer; background:none;">
        <input type="text" class="form-input" id="primaryColorText" value="${currentAccent}" style="font-family:var(--font-mono); width:120px;">
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${['#111827', '#2563eb', '#10b981', '#1e3a8a', '#0f766e', '#ec4899', '#6366f1', '#b45309', '#0284c7'].map(c => `
          <button class="color-preset-btn" data-color="${c}" style="width:28px; height:28px; border-radius:50%; background:${c}; border:2px solid ${c === currentAccent ? '#fff' : 'transparent'}; cursor:pointer;"></button>
        `).join('')}
      </div>
    </div>

    <!-- Typography Font Pairs -->
    <div class="form-group">
      <label class="form-label">Font Pair (Typography)</label>
      <select class="form-select" id="fontPairPicker">
        <option value="inter-outfit" ${currentFont === 'inter-outfit' ? 'selected' : ''}>Inter & Outfit (Clean & Modern)</option>
        <option value="jetbrains-inter" ${currentFont === 'jetbrains-inter' ? 'selected' : ''}>JetBrains Mono & Inter (Developer Tech)</option>
        <option value="merriweather-roboto" ${currentFont === 'merriweather-roboto' ? 'selected' : ''}>Merriweather & Roboto (Academic Editorial)</option>
        <option value="playfair-plus" ${currentFont === 'playfair-plus' ? 'selected' : ''}>Playfair Display & Plus Jakarta (Executive)</option>
        <option value="syne-inter" ${currentFont === 'syne-inter' ? 'selected' : ''}>Syne & Inter (Creative Expressive)</option>
      </select>
    </div>

    <!-- Logo / Favicon Upload -->
    <div class="form-group">
      <label class="form-label">Brand Logo Image</label>
      <input type="file" id="logoUploadFile" accept="image/png,image/jpeg,image/webp" style="margin-bottom:8px; font-size:12px;">
      <input type="text" class="form-input" id="logoUrlInput" value="${escapeHtml(theme.logoUrl || '')}" placeholder="Or paste logo URL">
    </div>
  `;

  // Template change (A2: Refresh editor mode and tabs on template switch)
  panel.querySelector('#templatePicker').addEventListener('change', (e) => {
    const oldMode = isBlogMode(site);
    site.template_id = e.target.value;
    const newMode = isBlogMode(site);

    if (newMode !== oldMode) {
      if (newMode && activeTab === 'pages') {
        activeTab = 'content';
      }
      refreshEditorTabs(document.querySelector('.studio-container') || panel.closest('.studio-container'));
    }
    scheduleDraftSave();
    updateLivePreview();
  });

  // Color inputs (A13: Strict validation)
  const colorPicker = panel.querySelector('#primaryColorPicker');
  const colorText = panel.querySelector('#primaryColorText');

  const updateColor = (hex) => {
    if (!validatePrimaryColor(hex)) {
      showToast('Please enter a valid hex color code (e.g. #2563eb).', 'error');
      return;
    }
    site.theme_config = site.theme_config || {};
    site.theme_config.primaryColor = hex;
    colorPicker.value = hex;
    colorText.value = hex;
    scheduleDraftSave();
    updateLivePreview();
  };

  colorPicker.addEventListener('input', (e) => updateColor(e.target.value));
  colorText.addEventListener('change', (e) => updateColor(e.target.value));

  panel.querySelectorAll('.color-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => updateColor(btn.getAttribute('data-color')));
  });

  // Font pair change
  panel.querySelector('#fontPairPicker').addEventListener('change', (e) => {
    site.theme_config = site.theme_config || {};
    site.theme_config.fontPair = e.target.value;
    scheduleDraftSave();
    updateLivePreview();
  });

  // Logo file upload
  const logoFile = panel.querySelector('#logoUploadFile');
  if (logoFile) {
    logoFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        showToast('Uploading logo...', 'info');
        const res = await uploadAsset(file, site.id, 'image');
        site.theme_config = site.theme_config || {};
        site.theme_config.logoUrl = res.publicUrl;
        panel.querySelector('#logoUrlInput').value = res.publicUrl;
        showToast('Logo uploaded!', 'success');
        scheduleDraftSave();
        updateLivePreview();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  const logoUrlInput = panel.querySelector('#logoUrlInput');
  if (logoUrlInput) {
    logoUrlInput.addEventListener('input', (e) => {
      site.theme_config = site.theme_config || {};
      site.theme_config.logoUrl = e.target.value;
      scheduleDraftSave();
      updateLivePreview();
    });
  }
}

// ------------------------------------------------------------------------------
// 4. PUBLISH MODAL
// ------------------------------------------------------------------------------
function openPublishModal(container) {
  const site = activeSiteData.site;
  const isPub = site.status === 'published';
  let availabilityTimer = null;

  const modal = openModal({
    title: isPub ? 'Republish Website' : 'Publish Website Online',
    contentHtml: `
      <div style="margin-bottom:20px;">
        <p style="font-size:14px; color:var(--muted); line-height:1.5;">
          Your website will be published with instant edge routing on Cloudflare.
        </p>
      </div>

      <div class="form-group">
        <label class="form-label">Subdomain Address</label>
        <div class="subdomain-input-group">
          <span class="subdomain-prefix">https://</span>
          <input type="text" class="subdomain-input" id="modalSubdomainSlug" value="${site.subdomain_slug}" maxlength="32">
          <span class="subdomain-suffix">.${CONFIG.PLATFORM_DOMAIN}</span>
        </div>
        <div id="modalSubdomainStatus" style="font-size:12px; margin-top:8px; color:var(--muted);">
          Letters, numbers, and hyphens only (3-32 characters).
        </div>
      </div>

      ${isPub ? `
        <div style="padding:14px 16px; background:var(--paper-soft); border:1px solid var(--line); border-radius:10px; margin-bottom:20px; font-size:13px;">
          <div style="font-weight:600; color:var(--ink); margin-bottom:4px;">Live URL:</div>
          <a href="https://${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}" target="_blank" rel="noopener" style="font-family:var(--font-mono); color:var(--ink); font-weight:600; text-decoration:underline;">
            https://${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN} ↗
          </a>
        </div>
      ` : ''}

      <div style="font-size:13px; color:var(--muted); line-height:1.6; margin-bottom:24px;">
        <div style="font-weight:700; color:var(--ink); margin-bottom:6px;">Features included:</div>
        <div>✓ Subdomain uniqueness guaranteed</div>
        <div>✓ Standalone semantic HTML (zero framework runtime bloat)</div>
        <div>✓ Automatic /robots.txt, /sitemap.xml, and /llms.txt included</div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
        ${isPub ? `
          <button class="btn btn-outline btn-sm" id="modalBtnUnpublish" style="color:var(--accent-rose);">Unpublish Site</button>
        ` : '<div></div>'}
        <button class="btn btn-primary" id="modalBtnConfirmPublish" style="padding:10px 24px;">
          ${isPub ? 'Republish Changes' : 'Publish Website Now'}
        </button>
      </div>
    `,
    cancelText: 'Close'
  });

  const slugInput = document.getElementById('modalSubdomainSlug');
  const statusEl = document.getElementById('modalSubdomainStatus');
  const publishBtn = document.getElementById('modalBtnConfirmPublish');
  const unpublishBtn = document.getElementById('modalBtnUnpublish');

  if (slugInput) {
    slugInput.addEventListener('input', (e) => {
      clearTimeout(availabilityTimer);
      const rawVal = e.target.value.toLowerCase().trim();
      statusEl.innerHTML = `<span style="color:var(--muted);">Checking availability...</span>`;

      availabilityTimer = setTimeout(async () => {
        const avail = await checkSubdomainAvailability(rawVal, site.id);
        if (avail.available) {
          statusEl.innerHTML = `<span style="color:var(--accent-emerald);">✓ <strong>${avail.slug}.${CONFIG.PLATFORM_DOMAIN}</strong> is available</span>`;
          site.subdomain_slug = avail.slug;
          scheduleDraftSave();
        } else {
          statusEl.innerHTML = `<span style="color:var(--accent-rose);">✕ ${avail.reason}</span>`;
        }
      }, 350);
    });
  }

  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      publishBtn.disabled = true;
      publishBtn.textContent = 'Publishing...';
      try {
        await flushPendingSave();
        const res = await publishSite(site.id, slugInput.value.trim().toLowerCase());
        site.status = 'published';
        site.subdomain_slug = res.subdomain;
        showToast('Website published successfully!', 'success');
        modal.close();
        document.getElementById('btnQuickPublish').textContent = 'Republish';
        updateLivePreview();
      } catch (err) {
        showToast(err.message, 'error');
        publishBtn.disabled = false;
        publishBtn.textContent = isPub ? 'Republish Changes' : 'Publish Website Now';
      }
    });
  }

  if (unpublishBtn) {
    unpublishBtn.addEventListener('click', async () => {
      try {
        await unpublishSite(site.id);
        site.status = 'unpublished';
        showToast('Website unpublished.', 'info');
        modal.close();
        document.getElementById('btnQuickPublish').textContent = 'Publish';
        updateLivePreview();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

// ------------------------------------------------------------------------------
// 5. SETTINGS & SEO MODAL
// ------------------------------------------------------------------------------
function openSettingsModal(container) {
  const site = activeSiteData.site;
  const seo = site.seo_config || {};

  const modal = openModal({
    title: 'Site Settings & SEO',
    contentHtml: `
      <div class="form-group">
        <label class="form-label">Website Title</label>
        <input type="text" class="form-input" id="settingModalTitle" value="${escapeHtml(site.title)}">
      </div>

      <div class="form-group">
        <label class="form-label">Website Type</label>
        <select class="form-select" id="settingModalType">
          <option value="portfolio" ${site.site_type === 'portfolio' ? 'selected' : ''}>Portfolio Website</option>
          <option value="blog" ${site.site_type === 'blog' ? 'selected' : ''}>Writing & Blog (Thesis, Story, Articles)</option>
          <option value="business" ${site.site_type === 'business' ? 'selected' : ''}>Landing Page</option>
        </select>
        <div class="form-hint">Controls the studio tabs: Blog shows Content & Design; Portfolio/Landing shows Content, Pages, and Design.</div>
      </div>

      <div class="form-group">
        <label class="form-label">SEO Meta Description</label>
        <textarea class="form-textarea" rows="2" id="settingModalDesc" placeholder="Brief summary for Google search results...">${escapeHtml(seo.metaDescription || site.description || '')}</textarea>
      </div>

      <div class="form-group" style="display:flex; align-items:center; gap:10px; margin-top:16px;">
        <input type="checkbox" id="settingModalDiscourage" ${seo.discourageSearch ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;">
        <label for="settingModalDiscourage" style="font-size:13px; color:var(--ink); cursor:pointer;">
          Discourage search engines from indexing this site
        </label>
      </div>

      <div style="margin-top:24px; padding-top:18px; border-top:1px solid var(--line-subtle); display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-outline btn-sm" id="settingModalDelete" style="color:var(--accent-rose);">Delete Website</button>
        <button class="btn btn-primary btn-sm" id="settingModalSave">Save Settings</button>
      </div>
    `,
    cancelText: 'Close'
  });

  document.getElementById('settingModalSave')?.addEventListener('click', async () => {
    const newTitle = document.getElementById('settingModalTitle').value.trim();
    const newType = document.getElementById('settingModalType').value;
    const newDesc = document.getElementById('settingModalDesc').value.trim();
    const discourage = document.getElementById('settingModalDiscourage').checked;

    const typeChanged = site.site_type !== newType;
    site.title = newTitle;
    site.site_type = newType;
    site.description = newDesc;
    site.seo_config = site.seo_config || {};
    site.seo_config.metaDescription = newDesc;
    site.seo_config.discourageSearch = discourage;

    await saveSiteDraft(site.id, {
      title: newTitle,
      site_type: newType,
      description: newDesc,
      seo_config: site.seo_config
    });

    document.getElementById('siteTitleDisplay').textContent = newTitle;
    showToast('Settings saved.', 'success');
    modal.close();

    if (typeChanged) {
      renderEditor(container, site.id);
    } else {
      updateLivePreview();
    }
  });

  document.getElementById('settingModalDelete')?.addEventListener('click', () => {
    modal.close();
    openModal({
      title: 'Delete Website Permanently?',
      contentHtml: `<p>Are you sure you want to delete <strong>${escapeHtml(site.title)}</strong>? All content will be permanently removed.</p>`,
      confirmText: 'Delete Permanently',
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteSite(site.id);
          showToast('Website deleted.', 'success');
          window.history.pushState(null, '', '/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  });
}

// ------------------------------------------------------------------------------
// LIVE PREVIEW IFRAME UPDATER
// ------------------------------------------------------------------------------
function updateLivePreview() {
  const iframe = document.getElementById('previewFrame');
  const addressSpan = document.getElementById('previewAddress');
  const homeBtn = document.getElementById('btnPreviewHome');
  if (!iframe || !activeSiteData) return;

  const site = activeSiteData.site;
  const fullPath = previewPath === '/' ? '' : previewPath;
  if (addressSpan) {
    addressSpan.textContent = `https://${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}${fullPath}`;
  }
  if (homeBtn) {
    homeBtn.style.display = previewPath === '/' ? 'none' : 'inline-flex';
  }

  // Preserve scroll position to eliminate jumpiness/flicker while editing
  let scrollY = 0;
  try {
    if (iframe.contentWindow) {
      scrollY = iframe.contentWindow.scrollY || 0;
    }
  } catch (e) {}

  // Render using shared template engine
  const rendered = renderSite(activeSiteData, previewPath);

  // Canvas isolation and internal navigation script (strictly contained inside the canvas)
  const canvasIsolationScript = `
    <script>
      (function() {
        // Intercept all internal navigation to keep preview 100% isolated from MNDO Builder
        document.addEventListener('click', function(e) {
          var a = e.target.closest('a');
          if (!a) return;
          var href = a.getAttribute('href');
          if (!href) return;

          // In-page anchor link (e.g. #projects, #contact)
          if (href.startsWith('#')) {
            e.preventDefault();
            var target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
            return;
          }

          // Internal route navigation (/about, /projects, /blog, /blog/...)
          if (href.startsWith('/')) {
            e.preventDefault();
            window.parent.postMessage({ type: 'MNDO_CANVAS_NAVIGATE', path: href }, '*');
            return;
          }

          // External links (never allow navigating canvas away to external websites)
          if (href.startsWith('http://') || href.startsWith('https://')) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
          }
        }, true);
      })();
    </script>
  `;

  let htmlBody = rendered.body;
  if (htmlBody.includes('</body>')) {
    htmlBody = htmlBody.replace('</body>', `${canvasIsolationScript}</body>`);
  } else {
    htmlBody += canvasIsolationScript;
  }

  iframe.srcdoc = htmlBody;

  // Restore scroll position after document finishes rendering
  iframe.onload = () => {
    try {
      if (iframe.contentWindow && scrollY > 0) {
        iframe.contentWindow.scrollTo(0, scrollY);
      }
    } catch (e) {}
  };
}

function updateSaveStatusUI(status, errorMsg = '') {
  saveStatus = status;
  const el = document.getElementById('editorSaveStatus');
  if (!el) return;

  if (status === 'saving') {
    el.innerHTML = `<span style="display:inline-block; animation:spin 1s linear infinite;">⏳</span> <span>Saving...</span>`;
    el.style.color = 'var(--text-muted)';
  } else if (status === 'saved') {
    el.innerHTML = `<span style="color:#10b981;">✓</span> <span>Saved</span>`;
    el.style.color = 'var(--text-muted)';
  } else if (status === 'failed') {
    el.innerHTML = `<span style="color:#ef4444;">⚠️</span> <span style="color:#ef4444;">Save Failed</span> <button id="btnRetrySave" style="margin-left:4px; padding:1px 6px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #ef4444; border-radius:4px; color:#ef4444;">Retry</button>`;
    el.querySelector('#btnRetrySave')?.addEventListener('click', () => {
      scheduleDraftSave(true);
    });
  }
}

export function scheduleDraftSave(immediate = false) {
  clearTimeout(debounceTimer);
  updateSaveStatusUI('saving');

  const doSave = async () => {
    if (!activeSiteData?.site) return;
    const targetSiteId = activeSiteData.site.id;
    const draftPayload = {
      title: activeSiteData.site.title,
      description: activeSiteData.site.description,
      site_type: activeSiteData.site.site_type,
      template_id: activeSiteData.site.template_id,
      theme_config: activeSiteData.site.theme_config,
      seo_config: activeSiteData.site.seo_config,
      content: activeSiteData.site.content
    };

    try {
      await saveSiteDraft(targetSiteId, draftPayload);
      if (activeSiteData?.site?.id === targetSiteId) {
        updateSaveStatusUI('saved');
        updateLivePreview();
      }
    } catch (err) {
      console.warn('Failed auto-saving draft:', err);
      if (activeSiteData?.site?.id === targetSiteId) {
        updateSaveStatusUI('failed', err.message);
        showToast('Autosave failed: ' + err.message, 'error');
      }
    }
  };

  if (immediate) {
    return doSave();
  } else {
    debounceTimer = setTimeout(doSave, 400);
  }
}

export async function flushPendingSave() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
    await scheduleDraftSave(true);
  }
}

function escapeHtml(str) {
  const p = document.createElement('p');
  p.textContent = str || '';
  return p.innerHTML;
}
