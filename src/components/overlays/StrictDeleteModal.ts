/* ==========================================================================
   STRICT DELETE VERIFICATION MODAL COMPONENT
   Reusable confirmation modal requiring exact phrase typing ("I Know I Am Deleting The Data").
   Features 100% English copywriting, responsive padding/margins, and real-time validation error alerts.
   ========================================================================== */

export interface StrictDeleteModalOptions {
  title?: string;
  itemName: string;
  itemType?: string; // e.g. "project record", "crew member", "equipment asset"
  requiredPhrase?: string; // defaults to "I Know I Am Deleting The Data"
  onConfirmDelete: () => Promise<void> | void;
  onCancel?: () => void;
}

export class StrictDeleteModal {
  private backdrop: HTMLElement;
  private options: StrictDeleteModalOptions;
  private requiredPhrase: string;

  constructor(options: StrictDeleteModalOptions) {
    this.options = options;
    this.requiredPhrase = options.requiredPhrase || 'I Know I Am Deleting The Data';

    const itemCategory = options.itemType || 'item';
    const modalTitle = options.title || `Delete ${itemCategory}: ${options.itemName}`;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'dialog-backdrop';

    this.backdrop.innerHTML = `
      <div class="dialog-content" role="dialog" aria-modal="true" style="max-width: 520px; border-radius: var(--radius-lg); overflow: hidden;">
        <div class="dialog-header">
          <div style="font-weight: 700; color: var(--color-foreground); font-size: 15px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: var(--radius-sm); background: rgba(239, 68, 68, 0.12); color: #ef4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </div>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px;">${modalTitle}</span>
          </div>
          <button class="btn btn-tertiary btn-icon btn-sm" id="strict-modal-close-btn" aria-label="Close dialog">✕</button>
        </div>

        <div class="dialog-body">
          <!-- PROMINENT ERROR ALERT BANNER (Triggered on submit with incorrect input) -->
          <div id="strict-delete-error-banner" style="display: none; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px; color: #f87171; font-size: 13px; font-weight: 500;">
            <div style="font-weight: 700; color: #ef4444; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              Verification Failed
            </div>
            <span id="strict-delete-error-text">Verification phrase does not match. Please type <strong>"${this.requiredPhrase}"</strong> exactly.</span>
          </div>

          <!-- WARNING CARD -->
          <div style="background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 16px; font-size: 13px; line-height: 1.5; color: var(--color-foreground-muted);">
            You are about to permanently delete <strong style="color: var(--color-foreground);">${options.itemName}</strong>. This action is irreversible and all associated data will be permanently removed.
          </div>

          <!-- INPUT FORM GROUP -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 600; color: var(--color-foreground); margin-bottom: 8px; display: block; font-size: 13px;">
              To confirm deletion, please type the exact phrase below:
            </label>

            <div class="font-mono" style="background: rgba(239, 68, 68, 0.08); border: 1px dashed rgba(239, 68, 68, 0.35); border-radius: var(--radius-md); padding: 10px 14px; text-align: center; color: #ef4444; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; margin-bottom: 12px; user-select: all;">
              ${this.requiredPhrase}
            </div>

            <input
              type="text"
              id="strict-delete-input-field"
              class="form-control"
              placeholder="Type &quot;${this.requiredPhrase}&quot;"
              autocomplete="off"
              style="font-weight: 600; font-size: 13px; padding: 10px 14px; transition: all 0.2s ease;"
            />

            <div id="strict-delete-feedback-hint" style="font-size: 12px; margin-top: 8px; font-weight: 500; color: var(--color-foreground-subtle); display: flex; align-items: center; gap: 6px; min-height: 18px;">
              <span>Enter the exact phrase above to confirm deletion.</span>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary btn-sm" id="strict-modal-cancel-btn">Cancel</button>
          <button class="btn btn-destructive btn-sm" id="strict-modal-confirm-btn" style="background-color: #dc2626; color: #ffffff; font-weight: 600; padding: 8px 16px; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Delete Permanently
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.backdrop);
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const closeBtn = this.backdrop.querySelector('#strict-modal-close-btn');
    const cancelBtn = this.backdrop.querySelector('#strict-modal-cancel-btn');
    const confirmBtn = this.backdrop.querySelector('#strict-modal-confirm-btn') as HTMLButtonElement;
    const inputField = this.backdrop.querySelector('#strict-delete-input-field') as HTMLInputElement;
    const errorBanner = this.backdrop.querySelector('#strict-delete-error-banner') as HTMLElement;
    const errorText = this.backdrop.querySelector('#strict-delete-error-text') as HTMLElement;
    const feedbackHint = this.backdrop.querySelector('#strict-delete-feedback-hint') as HTMLElement;

    closeBtn?.addEventListener('click', () => this.close());
    cancelBtn?.addEventListener('click', () => {
      if (this.options.onCancel) this.options.onCancel();
      this.close();
    });

    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    // Handle typing verification feedback
    inputField?.addEventListener('input', () => {
      const typedValue = inputField.value.trim();

      if (typedValue === this.requiredPhrase) {
        // MATCHED SUCCESS
        inputField.style.borderColor = '#10b981';
        inputField.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
        errorBanner.style.display = 'none';

        if (feedbackHint) {
          feedbackHint.style.color = '#10b981';
          feedbackHint.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Verification phrase matched. Ready to delete.`;
        }
      } else if (typedValue.length > 0) {
        // TYPING MISMATCH
        inputField.style.borderColor = '#ef4444';
        inputField.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';

        if (feedbackHint) {
          feedbackHint.style.color = '#ef4444';
          feedbackHint.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> Incorrect phrase! Must match "${this.requiredPhrase}" exactly.`;
        }
      } else {
        // RESET INITIAL STATE
        inputField.style.borderColor = '';
        inputField.style.boxShadow = '';
        errorBanner.style.display = 'none';

        if (feedbackHint) {
          feedbackHint.style.color = 'var(--color-foreground-subtle)';
          feedbackHint.innerHTML = `Enter the exact phrase above to confirm deletion.`;
        }
      }
    });

    // Handle Confirm Click
    confirmBtn?.addEventListener('click', async () => {
      const typedValue = inputField.value.trim();

      if (typedValue !== this.requiredPhrase) {
        // SHOW PROMINENT ERROR ALERT BANNER & SHAKE INPUT
        errorBanner.style.display = 'block';
        errorText.innerHTML = `Verification phrase does not match! You typed: "<strong>${typedValue || '(empty)'}</strong>". You must type: "<strong>${this.requiredPhrase}</strong>".`;

        inputField.style.borderColor = '#ef4444';
        inputField.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.3)';
        inputField.focus();

        // Shake effect on input
        inputField.style.transform = 'translateX(-6px)';
        setTimeout(() => (inputField.style.transform = 'translateX(6px)'), 60);
        setTimeout(() => (inputField.style.transform = 'translateX(-4px)'), 120);
        setTimeout(() => (inputField.style.transform = 'translateX(4px)'), 180);
        setTimeout(() => (inputField.style.transform = 'none'), 240);

        return; // PREVENT DELETION AND DO NOT CLOSE MODAL
      }

      // MATCH SUCCESSFUL — EXECUTE DELETION
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `Deleting...`;

      try {
        await this.options.onConfirmDelete();
        this.close();
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `Delete Permanently`;
        errorBanner.style.display = 'block';
        errorText.textContent = `Deletion error: ${err instanceof Error ? err.message : 'System error occurred'}`;
      }
    });

    // Handle Escape key
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
      const inputField = this.backdrop.querySelector('#strict-delete-input-field') as HTMLInputElement;
      if (inputField) inputField.focus();
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
