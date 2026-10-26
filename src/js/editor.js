// ==============================================================================
// MNDO BUILDER - FORM-BASED STUDIO EDITOR & LIVE PREVIEW CONTROLLER
// ==============================================================================
import { getSiteById, saveSiteDraft, getContactMessages, markMessageRead, deleteSite } from './supabase.js';
import { renderSite, TEMPLATES } from '../templates/index.js';
import { validateSubdomainSlug, checkSubdomainAvailability } from './validation.js';
import { publishSite, unpublishSite } from './publishing.js';
import { uploadAsset } from './uploads.js';
import { showToast } from './components/toast.js';
import { openModal } from './components/modal.js';
import { CONFIG } from './config.js';

let activeSiteData = null; // { site, pages, posts }
let activeTab = 'content'; // 'content' | 'pages' | 'blog' | 'design' | 'publish' | 'inbox' | 'settings'
let activeDevice = 'desktop'; // 'desktop' | 'tablet' | 'mobile'
let previewPath = '/';
let debounceTimer = null;
let availabilityTimer = null;

export async function renderEditor(container, siteId) {
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
        <a href="#/dashboard" class="btn btn-primary">Return to Dashboard</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="studio-container">
      <!-- Left: Form-Based Studio Sidebar -->
      <aside class="editor-sidebar">
        <div class="editor-header">
          <div style="display:flex; align-items:center; gap:12px;">
            <a href="#/dashboard" class="icon-btn" title="Back to Dashboard">&larr;</a>
            <div>
              <div class="editor-site-title" id="siteTitleDisplay">${escapeHtml(activeSiteData.site.title)}</div>
              <div style="font-size:11px; color:var(--text-dim); font-family:var(--font-mono);">
                ${activeSiteData.site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" id="btnQuickPublish">
            ${activeSiteData.site.status === 'published' ? 'Republish' : 'Publish'}
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div style="padding:14px 24px 0;">
          <div class="editor-tabs">
            <button class="editor-tab-item active" data-tab="content">Content</button>
            <button class="editor-tab-item" data-tab="pages">Pages</button>
            <button class="editor-tab-item" data-tab="blog">Blog</button>
            <button class="editor-tab-item" data-tab="design">Design</button>
            <button class="editor-tab-item" data-tab="publish">Publish</button>
            <button class="editor-tab-item" data-tab="inbox" id="tabInboxBtn">Inbox</button>
            <button class="editor-tab-item" data-tab="settings">Settings</button>
          </div>
        </div>

        <!-- Editor Tab Content Panels -->
        <div class="editor-body" id="editorTabContent">
          <!-- Populated dynamically -->
        </div>
      </aside>

      <!-- Right: Isolated Live Preview -->
      <main class="editor-preview">
        <div class="preview-toolbar">
          <div class="device-switcher">
            <button class="device-btn active" data-device="desktop">🖥 Desktop</button>
            <button class="device-btn" data-device="tablet">📱 Tablet</button>
            <button class="device-btn" data-device="mobile">📱 Mobile</button>
          </div>
          <div class="preview-address-bar">
            <span>🔒</span>
            <span id="previewAddress">https://${activeSiteData.site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}</span>
          </div>
          <button class="icon-btn" id="btnReloadPreview" title="Refresh Preview">🔄</button>
        </div>
        <div class="preview-viewport-wrap">
          <iframe id="previewFrame" class="preview-frame desktop" title="Website Live Preview" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
        </div>
      </main>
    </div>
  `;

  setupTabListeners(container);
  setupPreviewListeners(container);
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

  container.querySelector('#btnQuickPublish').addEventListener('click', () => {
    // Switch to publish tab directly
    const pubTab = container.querySelector('[data-tab="publish"]');
    if (pubTab) pubTab.click();
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

  container.querySelector('#btnReloadPreview').addEventListener('click', () => {
    updateLivePreview();
    showToast('Preview reloaded', 'info', 1500);
  });
}

// ------------------------------------------------------------------------------
// RENDER TAB PANELS
// ------------------------------------------------------------------------------
function renderActiveTabContent(container) {
  const panel = container.querySelector('#editorTabContent');
  if (!panel) return;

  if (activeTab === 'content') renderContentTab(panel);
  else if (activeTab === 'pages') renderPagesTab(panel);
  else if (activeTab === 'blog') renderBlogTab(panel);
  else if (activeTab === 'design') renderDesignTab(panel);
  else if (activeTab === 'publish') renderPublishTab(panel);
  else if (activeTab === 'inbox') renderInboxTab(panel);
  else if (activeTab === 'settings') renderSettingsTab(panel);
}

// ------------------------------------------------------------------------------
// 1. CONTENT TAB (SECTIONS)
// ------------------------------------------------------------------------------
function renderContentTab(panel) {
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

  attachContentEventListeners(panel);
}

function attachContentEventListeners(panel) {
  const content = activeSiteData.site.content || {};

  // Hero inputs
  const headlineInput = panel.querySelector('#heroHeadline');
  if (headlineInput) {
    headlineInput.addEventListener('input', (e) => {
      content.hero = content.hero || {};
      content.hero.headline = e.target.value;
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

  // Avatar file upload
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
      renderContentTab(panel);
      scheduleDraftSave();
    });
  }

  panel.querySelectorAll('.btn-remove-skill').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      content.skills.splice(idx, 1);
      renderContentTab(panel);
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
      renderContentTab(panel);
      scheduleDraftSave();
    });
  }

  panel.querySelectorAll('.btn-remove-project').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      content.projects.splice(idx, 1);
      renderContentTab(panel);
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
      renderContentTab(panel);
      scheduleDraftSave();
    });
  }

  panel.querySelectorAll('.btn-remove-exp').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      content.experience.splice(idx, 1);
      renderContentTab(panel);
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
      renderContentTab(panel);
      scheduleDraftSave();
    });
  }

  panel.querySelectorAll('.btn-remove-edu').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      content.education.splice(idx, 1);
      renderContentTab(panel);
      scheduleDraftSave();
    });
  });
}

// ------------------------------------------------------------------------------
// 2. PAGES TAB (MULTI-PAGE MANAGEMENT)
// ------------------------------------------------------------------------------
function renderPagesTab(panel) {
  const pages = activeSiteData.pages || [];

  panel.innerHTML = `
    <div style="margin-bottom:20px;">
      <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">Website Pages</h3>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.5;">Sites begin as a clean single-page site. Add distinct pages here when you need structured routes like /about or /projects.</p>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700; font-size:14px;">Home (Single-page root)</span>
        <span class="badge badge-published">Default</span>
      </div>
      <div style="font-size:12px; font-family:var(--font-mono); color:var(--text-dim);">Path: /</div>
    </div>

    <div class="repeater-list" id="pagesList">
      ${pages.map((p, idx) => `
        <div class="card" style="margin-bottom:12px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-weight:700; font-size:14px; color:#fff;">${escapeHtml(p.title)}</span>
            <button class="icon-btn btn-delete-page" data-idx="${idx}">&times;</button>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
            <span style="font-family:var(--font-mono); color:var(--accent-cyan);">${escapeHtml(p.path)}</span>
            <button class="btn btn-outline btn-sm btn-preview-page" data-path="${p.path}">Preview Page</button>
          </div>
        </div>
      `).join('')}
    </div>

    <button class="btn btn-primary btn-sm" id="btnModalAddPage" style="width:100%;">+ Add Page</button>
  `;

  // Add Page Modal
  panel.querySelector('#btnModalAddPage').addEventListener('click', () => {
    openModal({
      title: 'Add Predefined Page',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Predefined Page Type</label>
          <select class="form-select" id="modalPageType">
            <option value="about">About (/about)</option>
            <option value="projects">Projects Showcase (/projects)</option>
            <option value="services">Services (/services)</option>
            <option value="contact">Contact (/contact)</option>
            <option value="custom">Custom Page</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Page Title</label>
          <input type="text" class="form-input" id="modalPageTitle" value="About Me">
        </div>
        <div class="form-group">
          <label class="form-label">URL Path</label>
          <input type="text" class="form-input" id="modalPagePath" value="/about" placeholder="/about">
        </div>
      `,
      confirmText: 'Create Page',
      onConfirm: async () => {
        const type = document.getElementById('modalPageType').value;
        const title = document.getElementById('modalPageTitle').value.trim();
        let path = document.getElementById('modalPagePath').value.trim();
        if (!path.startsWith('/')) path = '/' + path;

        activeSiteData.pages = activeSiteData.pages || [];
        activeSiteData.pages.push({
          id: `page-${Date.now()}`,
          site_id: activeSiteData.site.id,
          page_type: type,
          title: title,
          path: path,
          is_in_nav: true,
          is_published: true
        });

        renderPagesTab(panel);
        updateLivePreview();
        showToast(`Created page ${path}`, 'success');
      }
    });

    // Auto-fill path based on type
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
  });

  // Delete page handler
  panel.querySelectorAll('.btn-delete-page').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      activeSiteData.pages.splice(idx, 1);
      renderPagesTab(panel);
      updateLivePreview();
      showToast('Page removed.', 'info');
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

// ------------------------------------------------------------------------------
// 3. BLOG TAB
// ------------------------------------------------------------------------------
function renderBlogTab(panel) {
  const posts = activeSiteData.posts || [];

  panel.innerHTML = `
    <div style="margin-bottom:20px;">
      <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">Articles & Blog Posts</h3>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.5;">Publish articles at /blog and /blog/[post-slug].</p>
    </div>

    <div class="repeater-list" id="postsList">
      ${posts.length === 0 ? '<div style="color:var(--text-dim); font-size:13px; padding:16px 0;">No blog posts created yet.</div>' : ''}
      ${posts.map((post, idx) => `
        <div class="card" style="margin-bottom:12px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <span class="badge ${post.status === 'published' ? 'badge-published' : 'badge-draft'}" style="margin-bottom:4px;">${post.status}</span>
              <h4 style="font-size:15px; font-weight:700; color:#fff;">${escapeHtml(post.title)}</h4>
            </div>
            <button class="icon-btn btn-delete-post" data-idx="${idx}">&times;</button>
          </div>
          <div style="font-family:var(--font-mono); font-size:12px; color:var(--text-dim); margin-bottom:12px;">/blog/${escapeHtml(post.slug)}</div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm btn-edit-post" data-idx="${idx}">Edit Article</button>
            <button class="btn btn-outline btn-sm btn-view-post" data-slug="${post.slug}">Preview</button>
          </div>
        </div>
      `).join('')}
    </div>

    <button class="btn btn-primary btn-sm" id="btnCreatePost" style="width:100%;">+ Write New Article</button>
  `;

  // Create article button
  panel.querySelector('#btnCreatePost').addEventListener('click', () => {
    openPostEditor(null, panel);
  });

  // Edit article button
  panel.querySelectorAll('.btn-edit-post').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      openPostEditor(idx, panel);
    });
  });

  // Delete article button
  panel.querySelectorAll('.btn-delete-post').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      activeSiteData.posts.splice(idx, 1);
      renderBlogTab(panel);
      updateLivePreview();
      showToast('Article deleted.', 'info');
    });
  });

  // Preview article button
  panel.querySelectorAll('.btn-view-post').forEach(btn => {
    btn.addEventListener('click', () => {
      previewPath = `/blog/${btn.getAttribute('data-slug')}`;
      updateLivePreview();
    });
  });
}

function openPostEditor(postIdx, parentPanel) {
  const isNew = postIdx === null;
  const post = !isNew ? activeSiteData.posts[postIdx] : {
    title: 'My New Article',
    slug: 'my-new-article',
    excerpt: 'A brief summary of this article.',
    body_markdown: '# My Article\n\nWrite your thoughts here...',
    status: 'draft'
  };

  openModal({
    title: isNew ? 'Create New Article' : 'Edit Article',
    contentHtml: `
      <div class="form-group">
        <label class="form-label">Article Title</label>
        <input type="text" class="form-input" id="postModalTitle" value="${escapeHtml(post.title)}">
      </div>
      <div class="form-group">
        <label class="form-label">Slug (URL identifier)</label>
        <input type="text" class="form-input" id="postModalSlug" value="${escapeHtml(post.slug)}">
      </div>
      <div class="form-group">
        <label class="form-label">Excerpt / Summary</label>
        <textarea class="form-textarea" rows="2" id="postModalExcerpt">${escapeHtml(post.excerpt || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Article Body (Markdown)</label>
        <textarea class="form-textarea" rows="8" id="postModalBody">${escapeHtml(post.body_markdown || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Publication Status</label>
        <select class="form-select" id="postModalStatus">
          <option value="draft" ${post.status === 'draft' ? 'selected' : ''}>Draft (Private)</option>
          <option value="published" ${post.status === 'published' ? 'selected' : ''}>Published</option>
        </select>
      </div>
    `,
    confirmText: isNew ? 'Save Article' : 'Update Article',
    onConfirm: async () => {
      const title = document.getElementById('postModalTitle').value.trim();
      const slug = document.getElementById('postModalSlug').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const excerpt = document.getElementById('postModalExcerpt').value.trim();
      const body = document.getElementById('postModalBody').value;
      const status = document.getElementById('postModalStatus').value;

      activeSiteData.posts = activeSiteData.posts || [];
      if (isNew) {
        activeSiteData.posts.unshift({
          id: `post-${Date.now()}`,
          site_id: activeSiteData.site.id,
          title,
          slug,
          excerpt,
          body_markdown: body,
          status,
          published_at: status === 'published' ? new Date().toISOString() : null
        });
      } else {
        activeSiteData.posts[postIdx] = {
          ...activeSiteData.posts[postIdx],
          title,
          slug,
          excerpt,
          body_markdown: body,
          status,
          published_at: status === 'published' ? (activeSiteData.posts[postIdx].published_at || new Date().toISOString()) : null
        };
      }

      renderBlogTab(parentPanel);
      updateLivePreview();
      showToast('Article saved.', 'success');
    }
  });
}

// ------------------------------------------------------------------------------
// 4. DESIGN & THEME TAB
// ------------------------------------------------------------------------------
function renderDesignTab(panel) {
  const site = activeSiteData.site;
  const theme = site.theme_config || {};
  const currentAccent = theme.primaryColor || '#2563eb';
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
        ${['#2563eb', '#10b981', '#1e3a8a', '#0f766e', '#ec4899', '#6366f1', '#b45309', '#0284c7', '#111827'].map(c => `
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

  // Template change
  panel.querySelector('#templatePicker').addEventListener('change', (e) => {
    site.template_id = e.target.value;
    scheduleDraftSave();
    updateLivePreview();
  });

  // Color picker
  const colPicker = panel.querySelector('#primaryColorPicker');
  const colText = panel.querySelector('#primaryColorText');
  const updateColor = (color) => {
    colPicker.value = color;
    colText.value = color;
    site.theme_config = site.theme_config || {};
    site.theme_config.primaryColor = color;
    scheduleDraftSave();
    updateLivePreview();
  };
  colPicker.addEventListener('input', (e) => updateColor(e.target.value));
  colText.addEventListener('input', (e) => updateColor(e.target.value));
  panel.querySelectorAll('.color-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => updateColor(btn.getAttribute('data-color')));
  });

  // Font change
  panel.querySelector('#fontPairPicker').addEventListener('change', (e) => {
    site.theme_config = site.theme_config || {};
    site.theme_config.fontPair = e.target.value;
    scheduleDraftSave();
    updateLivePreview();
  });

  // Logo upload
  panel.querySelector('#logoUploadFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      showToast('Uploading logo...', 'info');
      const res = await uploadAsset(file, site.id, 'logo');
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

// ------------------------------------------------------------------------------
// 5. SUBDOMAIN & PUBLISH TAB
// ------------------------------------------------------------------------------
function renderPublishTab(panel) {
  const site = activeSiteData.site;
  const isPub = site.status === 'published';
  const pubUrl = `https://${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}`;

  panel.innerHTML = `
    <div style="margin-bottom:20px;">
      <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">Subdomain & Publishing</h3>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.5;">Every website receives its own unique subdomain under ${CONFIG.PLATFORM_DOMAIN}.</p>
    </div>

    <!-- Subdomain Selector -->
    <div class="form-group">
      <label class="form-label">Choose Your Subdomain</label>
      <div class="subdomain-input-group">
        <span class="subdomain-prefix">https://</span>
        <input type="text" class="subdomain-input" id="subdomainSlugInput" value="${escapeHtml(site.subdomain_slug)}" maxlength="32">
        <span class="subdomain-suffix">.${CONFIG.PLATFORM_DOMAIN}</span>
      </div>
      <div class="status-badge" id="subdomainStatusIndicator">
        <span class="status-available">✓ Valid format</span>
      </div>
    </div>

    <!-- Publication Status Box -->
    <div class="card" style="margin-bottom:24px; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-weight:700;">Status</span>
        <span class="badge ${isPub ? 'badge-published' : 'badge-draft'}">
          <span class="badge-dot"></span>
          ${site.status}
        </span>
      </div>

      ${isPub ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:12px; color:var(--text-dim); margin-bottom:4px;">Live URL:</div>
          <a href="${pubUrl}" target="_blank" rel="noopener" style="font-family:var(--font-mono); font-size:14px; color:var(--accent-cyan); word-break:break-all;">
            ${pubUrl} ↗
          </a>
        </div>
      ` : `
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">
          Your website is currently in draft mode. Click Publish below to make it visible to the world.
        </p>
      `}

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-primary" id="btnPublishSite" style="flex:1;">
          ${isPub ? 'Republish Changes' : 'Publish Website Now'}
        </button>
        ${isPub ? `<button class="btn btn-outline" id="btnUnpublishSite">Unpublish</button>` : ''}
      </div>
    </div>

    <!-- Pre-publish Checklist -->
    <div style="font-size:13px; color:var(--text-muted); line-height:1.6;">
      <div style="font-weight:700; color:#fff; margin-bottom:8px;">Pre-Publish Verification:</div>
      <div>✓ Subdomain uniqueness enforced</div>
      <div>✓ Standalone semantic HTML (zero React runtime)</div>
      <div>✓ Automatic /robots.txt, /sitemap.xml, and /llms.txt included</div>
    </div>
  `;

  // Subdomain live availability check
  const slugInput = panel.querySelector('#subdomainSlugInput');
  const statusEl = panel.querySelector('#subdomainStatusIndicator');

  slugInput.addEventListener('input', (e) => {
    clearTimeout(availabilityTimer);
    const rawVal = e.target.value.toLowerCase().trim();
    statusEl.innerHTML = `<span class="status-checking">Checking availability...</span>`;

    availabilityTimer = setTimeout(async () => {
      const avail = await checkSubdomainAvailability(rawVal, site.id);
      if (avail.available) {
        statusEl.innerHTML = `<span class="status-available">✓ <strong>${avail.slug}.${CONFIG.PLATFORM_DOMAIN}</strong> is available</span>`;
        site.subdomain_slug = avail.slug;
        scheduleDraftSave();
      } else {
        statusEl.innerHTML = `<span class="status-taken">✕ ${avail.reason}</span>`;
      }
    }, 400);
  });

  // Publish button
  panel.querySelector('#btnPublishSite').addEventListener('click', async () => {
    const btn = panel.querySelector('#btnPublishSite');
    btn.disabled = true;
    btn.textContent = 'Publishing...';
    try {
      const res = await publishSite(site.id, slugInput.value);
      site.status = 'published';
      site.subdomain_slug = res.subdomain;
      showToast('Website published successfully!', 'success');
      renderPublishTab(panel);
      updateLivePreview();
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = isPub ? 'Republish Changes' : 'Publish Website Now';
    }
  });

  // Unpublish button
  const unpubBtn = panel.querySelector('#btnUnpublishSite');
  if (unpubBtn) {
    unpubBtn.addEventListener('click', async () => {
      openModal({
        title: 'Unpublish Website?',
        contentHtml: `<p>Your website will be immediately taken offline. Your saved content and drafts will remain intact.</p>`,
        confirmText: 'Unpublish',
        isDanger: true,
        onConfirm: async () => {
          try {
            await unpublishSite(site.id);
            site.status = 'unpublished';
            showToast('Website unpublished.', 'info');
            renderPublishTab(panel);
            updateLivePreview();
          } catch (err) {
            showToast(err.message, 'error');
          }
        }
      });
    });
  }
}

// ------------------------------------------------------------------------------
// 6. INBOX TAB (CONTACT MESSAGES)
// ------------------------------------------------------------------------------
async function renderInboxTab(panel) {
  panel.innerHTML = `<div style="color:var(--text-muted); font-size:13px;">Loading messages...</div>`;

  try {
    const messages = await getContactMessages(activeSiteData.site.id);

    panel.innerHTML = `
      <div style="margin-bottom:20px;">
        <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">Contact Form Inbox (${messages.length})</h3>
        <p style="font-size:13px; color:var(--text-muted); line-height:1.5;">Messages submitted by public visitors through your website's contact form.</p>
      </div>

      <div class="repeater-list">
        ${messages.length === 0 ? '<div class="card" style="text-align:center; padding:32px; color:var(--text-muted);">No messages received yet.</div>' : ''}
        ${messages.map(m => {
          const dateStr = new Date(m.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          });
          return `
            <div class="card" style="margin-bottom:14px; padding:18px;">
              <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
                <span style="font-weight:700; color:#fff; font-size:15px;">${escapeHtml(m.sender_name)}</span>
                <span style="font-size:12px; color:var(--text-dim);">${dateStr}</span>
              </div>
              <div style="font-size:13px; color:var(--accent-cyan); margin-bottom:10px;">
                <a href="mailto:${escapeHtml(m.sender_email)}">${escapeHtml(m.sender_email)}</a>
              </div>
              <p style="font-size:14px; color:var(--text-main); line-height:1.6; background:rgba(0,0,0,0.25); padding:12px; border-radius:6px;">
                ${escapeHtml(m.message)}
              </p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    panel.innerHTML = `<div style="color:var(--accent-rose);">Failed loading inbox messages.</div>`;
  }
}

// ------------------------------------------------------------------------------
// 7. SETTINGS & SEO TAB
// ------------------------------------------------------------------------------
function renderSettingsTab(panel) {
  const site = activeSiteData.site;
  const seo = site.seo_config || {};

  panel.innerHTML = `
    <div style="margin-bottom:20px;">
      <h3 style="font-size:16px; font-weight:700; margin-bottom:4px;">Settings & SEO</h3>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.5;">Configure search engine metadata, social share previews, and general settings.</p>
    </div>

    <div class="form-group">
      <label class="form-label">Website Title</label>
      <input type="text" class="form-input" id="settingSiteTitle" value="${escapeHtml(site.title)}">
    </div>

    <div class="form-group">
      <label class="form-label">SEO Meta Description</label>
      <textarea class="form-textarea" rows="3" id="settingMetaDesc" placeholder="Brief summary for Google search results...">${escapeHtml(seo.metaDescription || site.description || '')}</textarea>
    </div>

    <div class="form-group" style="display:flex; align-items:center; gap:10px; margin-top:20px;">
      <input type="checkbox" id="settingDiscourage" ${seo.discourageSearch ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;">
      <label for="settingDiscourage" style="font-size:13px; font-weight:600; cursor:pointer;">
        Discourage search engine indexing (adds noindex directive)
      </label>
    </div>

    <!-- Danger Zone: Delete Site -->
    <div style="margin-top:40px; padding-top:24px; border-top:1px solid rgba(244, 63, 94, 0.3);">
      <h4 style="color:#fda4af; font-size:14px; font-weight:700; margin-bottom:8px;">Danger Zone</h4>
      <p style="font-size:12px; color:var(--text-dim); margin-bottom:14px;">Deleting this website will permanently remove all pages, blog posts, and associated files.</p>
      <button class="btn btn-danger btn-sm" id="btnDeleteSiteStudio">Delete This Website</button>
    </div>
  `;

  panel.querySelector('#settingSiteTitle').addEventListener('input', (e) => {
    site.title = e.target.value;
    document.getElementById('siteTitleDisplay').textContent = e.target.value;
    scheduleDraftSave();
    updateLivePreview();
  });

  panel.querySelector('#settingMetaDesc').addEventListener('input', (e) => {
    site.seo_config = site.seo_config || {};
    site.seo_config.metaDescription = e.target.value;
    scheduleDraftSave();
  });

  panel.querySelector('#settingDiscourage').addEventListener('change', (e) => {
    site.seo_config = site.seo_config || {};
    site.seo_config.discourageSearch = e.target.checked;
    scheduleDraftSave();
    updateLivePreview();
  });

  panel.querySelector('#btnDeleteSiteStudio').addEventListener('click', () => {
    openModal({
      title: 'Delete Website Permanently?',
      contentHtml: `<p>Are you sure you want to delete <strong>${escapeHtml(site.title)}</strong>? This action cannot be reversed.</p>`,
      confirmText: 'Delete Permanently',
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteSite(site.id);
          showToast('Website deleted.', 'success');
          window.location.hash = '#/dashboard';
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
  if (!iframe || !activeSiteData) return;

  const site = activeSiteData.site;
  if (addressSpan) {
    addressSpan.textContent = `https://${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}${previewPath === '/' ? '' : previewPath}`;
  }

  // Render using shared template engine
  const rendered = renderSite(activeSiteData, previewPath);
  iframe.srcdoc = rendered.body;
}

function scheduleDraftSave() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      await saveSiteDraft(activeSiteData.site.id, {
        title: activeSiteData.site.title,
        description: activeSiteData.site.description,
        template_id: activeSiteData.site.template_id,
        theme_config: activeSiteData.site.theme_config,
        seo_config: activeSiteData.site.seo_config,
        content: activeSiteData.site.content
      });
      updateLivePreview();
    } catch (err) {
      console.warn('Failed auto-saving draft:', err);
    }
  }, 400);
}

function escapeHtml(str) {
  const p = document.createElement('p');
  p.textContent = str || '';
  return p.innerHTML;
}
