// ==============================================================================
// MNDO BUILDER - ACCESSIBLE MODAL DIALOG COMPONENT
// ==============================================================================

/**
 * Open a modal dialog with custom HTML content or confirmation controls.
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.contentHtml
 * @param {string} [options.confirmText]
 * @param {string} [options.cancelText]
 * @param {boolean} [options.isDanger]
 * @param {Function} [options.onConfirm]
 * @param {Function} [options.onCancel]
 * @returns {{ close: Function }}
 */
export function openModal({
  title,
  contentHtml,
  confirmText = null,
  cancelText = 'Close',
  isDanger = false,
  onConfirm = null,
  onCancel = null
}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');

  backdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 style="font-size:18px; font-weight:700;">${escapeText(title)}</h3>
        <button class="modal-close" aria-label="Close dialog">&times;</button>
      </div>
      <div class="modal-content" style="margin-bottom:24px; color:var(--text-muted); font-size:14px; line-height:1.6;">
        ${contentHtml}
      </div>
      <div class="modal-actions" style="display:flex; justify-content:flex-end; gap:12px;">
        <button class="btn btn-secondary modal-cancel-btn">${escapeText(cancelText)}</button>
        ${confirmText ? `<button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} modal-confirm-btn">${escapeText(confirmText)}</button>` : ''}
      </div>
    </div>
  `;

  const close = () => {
    backdrop.style.opacity = '0';
    backdrop.style.transition = 'opacity 0.15s ease';
    setTimeout(() => {
      if (backdrop.parentElement) backdrop.parentElement.removeChild(backdrop);
    }, 150);
  };

  backdrop.querySelector('.modal-close').addEventListener('click', () => {
    if (onCancel) onCancel();
    close();
  });

  backdrop.querySelector('.modal-cancel-btn').addEventListener('click', () => {
    if (onCancel) onCancel();
    close();
  });

  const confirmBtn = backdrop.querySelector('.modal-confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (onConfirm) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Processing...';
        try {
          await onConfirm();
        } finally {
          close();
        }
      } else {
        close();
      }
    });
  }

  // Click outside to close
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      if (onCancel) onCancel();
      close();
    }
  });

  // ESC key to close
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      if (onCancel) onCancel();
      close();
      window.removeEventListener('keydown', handleKeydown);
    }
  };
  window.addEventListener('keydown', handleKeydown);

  document.body.appendChild(backdrop);
  return { close };
}

function escapeText(str) {
  const p = document.createElement('p');
  p.textContent = str || '';
  return p.innerHTML;
}
