/* ==========================================================================
   MODAL & OVERLAY SYSTEM — ACCESSIBLE BACKDROP DIALOGS & DRAWERS
   ========================================================================== */

export interface ModalOptions {
  title: string;
  contentHtml: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export class ModalDialog {
  private backdrop: HTMLElement;

  constructor(options: ModalOptions) {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'dialog-backdrop';

    this.backdrop.innerHTML = `
      <div class="dialog-content" role="dialog" aria-modal="true">
        <div class="dialog-header">
          <div style="font-weight: var(--font-weight-semibold); color: var(--color-foreground); font-size: var(--text-base);">${options.title}</div>
          <button class="btn btn-tertiary btn-icon btn-sm" id="modal-close-btn" aria-label="Close dialog">✕</button>
        </div>
        <div class="dialog-body">
          ${options.contentHtml}
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary btn-sm" id="modal-cancel-btn">${options.cancelText || 'Cancel'}</button>
          <button class="btn btn-primary btn-sm" id="modal-confirm-btn">${options.confirmText || 'Confirm'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.backdrop);

    // Event listeners
    const closeBtn = this.backdrop.querySelector('#modal-close-btn');
    const cancelBtn = this.backdrop.querySelector('#modal-cancel-btn');
    const confirmBtn = this.backdrop.querySelector('#modal-confirm-btn');

    closeBtn?.addEventListener('click', () => this.close());
    cancelBtn?.addEventListener('click', () => {
      if (options.onCancel) options.onCancel();
      this.close();
    });

    confirmBtn?.addEventListener('click', () => {
      if (options.onConfirm) options.onConfirm();
      this.close();
    });

    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // Handle Escape Key
    const escListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
        window.removeEventListener('keydown', escListener);
      }
    };
    window.addEventListener('keydown', escListener);
  }

  public open(): void {
    requestAnimationFrame(() => {
      this.backdrop.classList.add('is-open');
    });
  }

  public close(): void {
    this.backdrop.classList.remove('is-open');
    setTimeout(() => {
      if (this.backdrop.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
      }
    }, 200);
  }
}
