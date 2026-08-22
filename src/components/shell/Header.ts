/* ==========================================================================
   APPLICATION SHELL — TOP NAVIGATION HEADER & STATE CONTROLLER
   ========================================================================== */

import { ApplicationViewState, ActivePageTemplate } from '../../types/ui';

export interface HeaderOptions {
  activeTemplate: ActivePageTemplate;
  viewState: ApplicationViewState;
  onOpenCommandPalette: () => void;
  onViewStateChange: (newState: ApplicationViewState) => void;
  onToggleTheme: () => void;
  onToggleMobileSidebar: () => void;
  onLogoutAdmin?: () => void;
}

export function renderHeader(container: HTMLElement, options: HeaderOptions): void {
  container.className = 'app-header';

  container.innerHTML = `
    <div class="header-left">
      <!-- MOBILE MENU HAMBURGER BUTTON -->
      <button class="btn btn-tertiary btn-icon btn-sm mobile-menu-btn" id="mobile-menu-btn" title="Open Navigation Menu" aria-label="Open Navigation Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    </div>

    <div class="header-right">
      <!-- REAL-TIME RESPONSIVE CLOCK & DATE WIDGET -->
      <div class="header-clock-widget" title="Live System Time & Date">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent); flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span id="header-date-text" class="header-date-text" style="color: var(--color-foreground-muted); font-weight: 500;">-</span>
        <span class="header-clock-dot" style="color: var(--color-border-strong);">&bull;</span>
        <span id="header-time-text" class="font-mono" style="color: var(--color-accent); font-weight: bold; font-size: 12px; flex-shrink: 0;">--:--:--</span>
      </div>

      <!-- THEME ACCENT / MODE TOGGLE -->
      <button class="btn btn-tertiary btn-icon btn-sm" id="btn-toggle-theme" title="Toggle Light/Dark Theme">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line></svg>
      </button>

      <!-- LOGOUT DASHBOARD BUTTON -->
      <button class="btn btn-tertiary btn-sm" id="btn-admin-logout" style="color: var(--color-danger); font-size: 11px;" title="Logout Dashboard">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        Logout
      </button>
    </div>
  `;

  // Start Real-time Clock Timer
  startLiveClockTimer(container);

  // Attach Event Listeners
  container.querySelector('#btn-admin-logout')?.addEventListener('click', () => {
    if (options.onLogoutAdmin) options.onLogoutAdmin();
  });

  const mobileMenuBtn = container.querySelector('#mobile-menu-btn');
  mobileMenuBtn?.addEventListener('click', options.onToggleMobileSidebar);

  const themeBtn = container.querySelector('#btn-toggle-theme');
  themeBtn?.addEventListener('click', options.onToggleTheme);
}

/**
 * Real-Time Clock & Date Updater
 */
function startLiveClockTimer(container: HTMLElement): void {
  const updateClock = () => {
    const dateEl = container.querySelector('#header-date-text');
    const timeEl = container.querySelector('#header-time-text');
    if (!dateEl || !timeEl) return;

    const now = new Date();

    // Format Hari, Tanggal Bulan Tahun (id-ID)
    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Format Jam:Menit:Detik
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    dateEl.textContent = dateStr;
    timeEl.textContent = `${timeStr} WIB`;
  };

  updateClock();
  setInterval(updateClock, 1000);
}
