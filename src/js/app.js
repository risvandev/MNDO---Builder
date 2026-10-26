// ==============================================================================
// MNDO BUILDER - APPLICATION BOOTSTRAPPER
// ==============================================================================
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/editor.css';

import { initRouter } from './router.js';
import { showToast } from './components/toast.js';

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  if (event.reason && event.reason.message) {
    showToast(event.reason.message, 'error');
  }
});

// Boot the router on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
});
