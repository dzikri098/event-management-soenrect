/* ==========================================================================
   SYSTEM ERROR STATE COMPONENT
   ========================================================================== */

export interface ErrorStateOptions {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function createErrorState(options: ErrorStateOptions): HTMLElement {
  const container = document.createElement('div');
  container.className = 'state-container';
  container.style.borderColor = 'var(--color-error-border)';

  container.innerHTML = `
    <div class="state-icon" style="color: var(--color-error); background: var(--color-error-subtle); border-color: var(--color-error-border);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <div class="state-title">${options.title || 'Failed to sync live telemetry'}</div>
    <div class="state-description">${options.message || 'An unexpected connection error occurred while querying Supabase backend services.'}</div>
    <button class="btn btn-destructive btn-sm" id="error-state-retry">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
      Retry Telemetry Sync
    </button>
  `;

  if (options.onRetry) {
    const btn = container.querySelector('#error-state-retry');
    btn?.addEventListener('click', options.onRetry);
  }

  return container;
}
