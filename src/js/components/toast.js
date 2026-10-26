// ==============================================================================
// MNDO BUILDER - ACCESSIBLE TOAST NOTIFICATION SYSTEM
// ==============================================================================

let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('role', 'region');
    toastContainer.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} durationMs
 */
export function showToast(message, type = 'info', durationMs = 4000) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  toast.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-weight:700;">${icons[type] || 'ℹ'}</span>
      <span>${escapeMessage(message)}</span>
    </div>
    <button style="background:none; border:none; color:inherit; cursor:pointer; font-size:16px; opacity:0.6;" aria-label="Close">&times;</button>
  `;

  const closeBtn = toast.querySelector('button');
  const remove = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px) scale(0.96)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 200);
  };

  closeBtn.addEventListener('click', remove);
  setTimeout(remove, durationMs);

  container.appendChild(toast);
}

function escapeMessage(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}
