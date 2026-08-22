/* ==========================================================================
   SYSTEM EMPTY STATE COMPONENT
   ========================================================================== */

export interface EmptyStateOptions {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function createEmptyState(options: EmptyStateOptions): HTMLElement {
  const container = document.createElement('div');
  container.className = 'state-container';

  container.innerHTML = `
    <div class="state-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
      </svg>
    </div>
    <div class="state-title">${options.title}</div>
    <div class="state-description">${options.description}</div>
    ${options.actionText ? `<button class="btn btn-secondary btn-sm" id="empty-state-cta">${options.actionText}</button>` : ''}
  `;

  if (options.actionText && options.onAction) {
    const btn = container.querySelector('#empty-state-cta');
    btn?.addEventListener('click', options.onAction);
  }

  return container;
}
