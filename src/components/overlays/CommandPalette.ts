/* ==========================================================================
   COMMAND PALETTE SYSTEM — CMD+K SEARCH MENU
   ========================================================================== */

export class CommandPalette {
  private backdrop: HTMLElement;
  private isVisible = false;

  constructor(onNavigate: (route: string) => void) {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'dialog-backdrop';

    this.backdrop.innerHTML = `
      <div class="dialog-content" style="max-width: 600px; padding: 0; overflow: hidden;">
        <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; gap: 10px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground-muted)" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="cmd-palette-input" placeholder="Type a command or search workspace..." style="width: 100%; background: transparent; border: none; font-size: 14px; color: var(--color-foreground); outline: none;" />
          <span style="font-size: 10px; font-family: var(--font-mono); color: var(--color-foreground-subtle); background: var(--color-surface-elevated); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-border);">ESC</span>
        </div>
        <div style="max-height: 320px; overflow-y: auto; padding: 8px;" id="cmd-palette-list">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); padding: 6px 12px;">Navigation Templates</div>
          <div class="cmd-item" data-route="executive-overview" style="padding: 10px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--color-foreground);">
            <span>Executive Overview Template</span>
            <span style="font-size: 11px; color: var(--color-accent);">View Template</span>
          </div>
          <div class="cmd-item" data-route="analytics-detail" style="padding: 10px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--color-foreground);">
            <span>Analytics & Telemetry Split Template</span>
            <span style="font-size: 11px; color: var(--color-accent);">View Template</span>
          </div>
          <div class="cmd-item" data-route="data-management" style="padding: 10px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--color-foreground);">
            <span>Operations & Data Management Template</span>
            <span style="font-size: 11px; color: var(--color-accent);">View Template</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.backdrop);

    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) this.close();
    });

    const items = this.backdrop.querySelectorAll('.cmd-item');
    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        const route = (e.currentTarget as HTMLElement).getAttribute('data-route');
        if (route) {
          onNavigate(route);
          this.close();
        }
      });
    });

    // Global Cmd+K / Ctrl+K listener
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.isVisible) {
        this.close();
      }
    });
  }

  public toggle(): void {
    if (this.isVisible) this.close();
    else this.open();
  }

  public open(): void {
    this.isVisible = true;
    this.backdrop.classList.add('is-open');
    setTimeout(() => {
      const input = this.backdrop.querySelector('#cmd-palette-input') as HTMLInputElement;
      input?.focus();
    }, 50);
  }

  public close(): void {
    this.isVisible = false;
    this.backdrop.classList.remove('is-open');
  }
}
