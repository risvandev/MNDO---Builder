// ==============================================================================
// MNDO BUILDER - MINIMAL USER DASHBOARD
// ==============================================================================
import { getCurrentUser, getUserProfile, getUserSites, deleteSite, getContactMessages } from './supabase.js';
import { isUserVerified, signOut } from './auth.js';
import { openModal } from './components/modal.js';
import { showToast } from './components/toast.js';
import { unpublishSite } from './publishing.js';
import { CONFIG } from './config.js';

export async function renderDashboard(container) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '#/auth';
    return;
  }

  container.innerHTML = `
    <div class="app-container" style="padding-top:40px; padding-bottom:60px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:28px; font-weight:800; margin-bottom:6px;">My Websites</h1>
          <p style="color:var(--text-muted); font-size:14px;">Manage, edit, and publish your personal portfolios and sites.</p>
        </div>
        <div style="display:flex; gap:12px;">
          <a href="#/create" class="btn btn-primary" id="btnCreateNewSite">+ Create New Website</a>
        </div>
      </div>

      <!-- Quota & Verification Banner -->
      <div id="quotaBanner" style="margin-bottom:28px;"></div>

      <!-- Sites Grid -->
      <div id="sitesList" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:24px;">
        <div style="padding:40px; text-align:center; color:var(--text-muted); grid-column:1/-1;">Loading your websites...</div>
      </div>
    </div>
  `;

  await loadDashboardData(container, user);
}

async function loadDashboardData(container, user) {
  try {
    const profile = await getUserProfile(user.id);
    const sites = await getUserSites(user.id);
    const verified = await isUserVerified(user);

    const quotaBanner = container.querySelector('#quotaBanner');
    const sitesList = container.querySelector('#sitesList');
    const btnCreate = container.querySelector('#btnCreateNewSite');

    const maxSites = profile?.max_sites || CONFIG.LIMITS.MAX_SITES_PER_ACCOUNT;
    const sitesCount = sites.length;
    const storageUsedMb = ((profile?.storage_used_bytes || 0) / (1024 * 1024)).toFixed(1);

    // Disable create button if quota reached
    if (sitesCount >= maxSites) {
      btnCreate.classList.add('disabled');
      btnCreate.style.opacity = '0.5';
      btnCreate.style.pointerEvents = 'none';
      btnCreate.title = 'Max websites limit reached';
    }

    quotaBanner.innerHTML = `
      <div class="card" style="padding:16px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
          <div>
            <span style="font-size:12px; color:var(--text-dim); text-transform:uppercase; font-weight:700;">Sites Allowed:</span>
            <span style="font-weight:700; margin-left:6px; color:#fff;">${sitesCount} of ${maxSites}</span>
          </div>
          <div>
            <span style="font-size:12px; color:var(--text-dim); text-transform:uppercase; font-weight:700;">Storage Used:</span>
            <span style="font-weight:700; margin-left:6px; color:#fff;">${storageUsedMb} MB of 20 MB</span>
          </div>
          <div>
            <span style="font-size:12px; color:var(--text-dim); text-transform:uppercase; font-weight:700;">Email Status:</span>
            <span style="margin-left:6px; font-weight:600; color:${verified ? 'var(--accent-emerald)' : 'var(--accent-amber)'}">
              ${verified ? '✓ Verified' : '⚠ Verification Pending (Required to publish)'}
            </span>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" id="btnSignOut">Sign Out</button>
      </div>
    `;

    container.querySelector('#btnSignOut').addEventListener('click', () => {
      signOut();
    });

    if (sites.length === 0) {
      sitesList.innerHTML = `
        <div class="card" style="grid-column:1/-1; text-align:center; padding:64px 24px;">
          <div style="font-size:40px; margin-bottom:16px;">🚀</div>
          <h2 style="font-size:22px; font-weight:700; margin-bottom:8px;">You haven't created any websites yet</h2>
          <p style="color:var(--text-muted); max-width:440px; margin:0 auto 24px;">Choose from our 8 templates and publish your free personal portfolio or blog in minutes.</p>
          <a href="#/create" class="btn btn-primary">+ Create Your First Website</a>
        </div>
      `;
      return;
    }

    // Render sites cards
    sitesList.innerHTML = '';
    for (const site of sites) {
      const card = document.createElement('div');
      card.className = 'card card-hover';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';

      const isPub = site.status === 'published';
      const pubUrl = `https://${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}`;
      const lastUpdated = new Date(site.updated_at || site.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <span class="badge ${isPub ? 'badge-published' : 'badge-draft'}">
              <span class="badge-dot"></span>
              ${site.status}
            </span>
            <span style="font-size:12px; color:var(--text-dim); text-transform:uppercase; font-weight:600;">${site.site_type}</span>
          </div>
          <h3 style="font-size:18px; font-weight:700; margin-bottom:6px; color:#fff;">${escapeHtml(site.title)}</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px; line-height:1.5;">${escapeHtml(site.description || 'No description added yet.')}</p>
          
          <div style="margin-bottom:16px; font-size:13px;">
            <div style="color:var(--text-dim); margin-bottom:4px;">Address:</div>
            ${isPub 
              ? `<a href="${pubUrl}" target="_blank" rel="noopener" style="font-family:var(--font-mono); font-size:13px; color:var(--accent-cyan); display:flex; align-items:center; gap:4px;">
                   <span>${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}</span> ↗
                 </a>`
              : `<span style="font-family:var(--font-mono); color:var(--text-muted); font-size:12px;">${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN} (Draft)</span>`
            }
          </div>
        </div>

        <div>
          <div style="font-size:12px; color:var(--text-dim); margin-bottom:16px; border-top:1px solid var(--border-subtle); padding-top:12px;">
            Template: <strong>${site.template_id}</strong> &bull; Updated ${lastUpdated}
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <a href="#/editor/${site.id}" class="btn btn-primary btn-sm" style="flex:1;">Edit Website</a>
            ${isPub 
              ? `<button class="btn btn-outline btn-sm btn-unpublish" data-id="${site.id}">Unpublish</button>`
              : ''
            }
            <button class="btn btn-danger btn-sm btn-delete" data-id="${site.id}" title="Delete site">&times;</button>
          </div>
        </div>
      `;

      // Unpublish action
      const unpubBtn = card.querySelector('.btn-unpublish');
      if (unpubBtn) {
        unpubBtn.addEventListener('click', async () => {
          openModal({
            title: 'Unpublish Website?',
            contentHtml: `<p>Your website will be immediately taken offline and made inaccessible to the public. Your saved content and draft will remain safely preserved in your dashboard.</p>`,
            confirmText: 'Unpublish Now',
            isDanger: true,
            onConfirm: async () => {
              try {
                await unpublishSite(site.id);
                showToast('Website unpublished successfully.', 'info');
                await loadDashboardData(container, user);
              } catch (e) {
                showToast(e.message, 'error');
              }
            }
          });
        });
      }

      // Delete action
      card.querySelector('.btn-delete').addEventListener('click', () => {
        openModal({
          title: 'Delete Website?',
          contentHtml: `<p>Are you sure you want to delete <strong>${escapeHtml(site.title)}</strong>? All pages, blog posts, and associated assets will be permanently deleted. This cannot be undone.</p>`,
          confirmText: 'Delete Permanently',
          isDanger: true,
          onConfirm: async () => {
            try {
              await deleteSite(site.id);
              showToast('Website deleted.', 'success');
              await loadDashboardData(container, user);
            } catch (e) {
              showToast(e.message, 'error');
            }
          }
        });
      });

      sitesList.appendChild(card);
    }
  } catch (err) {
    console.error('Error loading dashboard:', err);
    showToast(err.message || 'Failed loading websites.', 'error');
  }
}

function escapeHtml(str) {
  const p = document.createElement('p');
  p.textContent = str || '';
  return p.innerHTML;
}
