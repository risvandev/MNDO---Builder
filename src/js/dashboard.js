// ==============================================================================
// MNDO BUILDER - MINIMAL USER DASHBOARD
// ==============================================================================
import { getCurrentUser, getUserProfile, getUserSites, deleteSite } from './supabase.js';
import { signOut } from './auth.js';
import { openModal } from './components/modal.js';
import { showToast } from './components/toast.js';
import { unpublishSite } from './publishing.js';
import { CONFIG } from './config.js';

export async function renderDashboard(container) {
  const user = await getCurrentUser();
  if (!user) {
    window.history.pushState(null, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
    return;
  }

  container.innerHTML = `
    <div class="app-container" style="max-width:960px; padding-top:48px; padding-bottom:80px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding-bottom:20px; border-bottom:1px solid var(--line);">
        <div>
          <h1 style="font-size:24px; font-weight:600; letter-spacing:-0.03em; color:var(--ink); margin:0;">Websites</h1>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <button class="btn btn-outline btn-sm" id="btnSignOut" style="padding:6px 14px; font-size:13px;">Sign Out</button>
          <a href="/create" class="btn btn-primary btn-sm" id="btnCreateNewSite" style="padding:6px 16px; font-size:13px;">+ New Site</a>
        </div>
      </div>

      <!-- Sites Grid -->
      <div id="sitesList" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
        <div style="padding:48px; text-align:center; color:var(--muted); font-size:14px; grid-column:1/-1;">Loading...</div>
      </div>
    </div>
  `;

  // Attach sign out event
  container.querySelector('#btnSignOut')?.addEventListener('click', () => {
    signOut();
  });

  await loadDashboardData(container, user);
}

async function loadDashboardData(container, user) {
  try {
    const profile = await getUserProfile(user.id);
    const sites = await getUserSites(user.id);
    const sitesList = container.querySelector('#sitesList');
    const btnCreate = container.querySelector('#btnCreateNewSite');

    const maxSites = profile?.max_sites || CONFIG.LIMITS.MAX_SITES_PER_ACCOUNT;
    const sitesCount = sites.length;

    if (btnCreate && sitesCount >= maxSites) {
      btnCreate.classList.add('disabled');
      btnCreate.style.opacity = '0.5';
      btnCreate.style.pointerEvents = 'none';
      btnCreate.title = `Site limit reached (${maxSites} max)`;
    }

    if (sites.length === 0) {
      sitesList.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:72px 24px; border:1px dashed var(--line); border-radius:16px; background:#ffffff;">
          <p style="font-size:15px; font-weight:500; color:var(--ink); margin-bottom:6px;">No websites yet</p>
          <p style="font-size:13px; color:var(--muted); margin-bottom:20px;">Create your personal site or portfolio and publish it on mndo.online.</p>
          <a href="/create" class="btn btn-primary btn-sm">+ Create Website</a>
        </div>
      `;
      return;
    }

    sitesList.innerHTML = '';
    for (const site of sites) {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = 'padding:22px 24px; background:#ffffff; border:1px solid var(--line); border-radius:14px; display:flex; flex-direction:column; justify-content:space-between; gap:18px; transition:border-color 0.15s ease; box-shadow:0 1px 3px rgba(0,0,0,0.02);';

      const isPub = site.status === 'published';
      const pubUrl = `https://${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}`;

      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <a href="/editor/${site.id}" style="font-size:16px; font-weight:600; color:var(--ink); text-decoration:none; letter-spacing:-0.01em;">
              ${escapeHtml(site.title || 'Untitled Site')}
            </a>
            <span class="badge ${isPub ? 'badge-published' : 'badge-draft'}" style="font-size:11px; padding:2px 8px; font-weight:500;">
              <span class="badge-dot"></span>
              ${isPub ? 'Live' : 'Draft'}
            </span>
          </div>

          <div>
            ${isPub 
              ? `<a href="${pubUrl}" target="_blank" rel="noopener" style="font-family:var(--font-mono); font-size:13px; color:var(--muted); text-decoration:none; display:inline-flex; align-items:center; gap:4px; word-break:break-all;">
                   <span>${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}</span>
                   <span style="font-size:11px; opacity:0.7;">↗</span>
                 </a>`
              : `<span style="font-family:var(--font-mono); font-size:13px; color:var(--muted); word-break:break-all;">${site.subdomain_slug}.${CONFIG.PLATFORM_DOMAIN}</span>`
            }
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:14px; border-top:1px solid var(--line-subtle);">
          <div style="display:flex; gap:8px;">
            <a href="/editor/${site.id}" class="btn btn-secondary btn-sm" style="padding:4px 12px; font-size:12px;">Edit</a>
            ${isPub ? `<a href="${pubUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="padding:4px 10px; font-size:12px;">Visit</a>` : ''}
          </div>
          <div style="display:flex; gap:6px;">
            ${isPub ? `<button class="btn btn-outline btn-sm btn-unpublish" data-id="${site.id}" style="padding:4px 10px; font-size:12px; color:var(--muted);" title="Unpublish">Unpublish</button>` : ''}
            <button class="btn btn-outline btn-sm btn-delete" data-id="${site.id}" style="padding:4px 10px; font-size:12px; color:var(--muted);" title="Delete">Delete</button>
          </div>
        </div>
      `;

      // Unpublish action
      const unpubBtn = card.querySelector('.btn-unpublish');
      if (unpubBtn) {
        unpubBtn.addEventListener('click', async () => {
          openModal({
            title: 'Unpublish Website?',
            contentHtml: `<p>Your website will be taken offline immediately. You can re-publish it at any time.</p>`,
            confirmText: 'Unpublish',
            isDanger: true,
            onConfirm: async () => {
              try {
                await unpublishSite(site.id);
                showToast('Website unpublished.', 'info');
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
          contentHtml: `<p>Permanently delete <strong>${escapeHtml(site.title)}</strong>? This cannot be undone.</p>`,
          confirmText: 'Delete',
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
