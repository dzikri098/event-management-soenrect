/* ==========================================================================
   APPLICATION SHELL — PRIMARY SIDEBAR COMPONENT
   ========================================================================== */

import { ActivePageTemplate } from '../../types/ui';

export interface SidebarOptions {
  activeTemplate: ActivePageTemplate;
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
  onNavigate: (template: ActivePageTemplate) => void;
}

export function renderSidebar(container: HTMLElement, options: SidebarOptions): void {
  const { activeTemplate, isCollapsed, isMobileOpen } = options;

  container.className = `app-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isMobileOpen ? 'is-mobile-open' : ''}`;

  // Responsive Toggle Icon: Panel Left / Collapse vs Expand
  const toggleIcon = isCollapsed
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><path d="m14 9 3 3-3 3"></path></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><path d="m16 15-3-3 3-3"></path></svg>`;

  container.innerHTML = `
    <!-- BRAND LOGO HEADER -->
    <div class="sidebar-header">
      <a href="#" class="brand-logo" title="Soenrect Platform">
        <img src="/logo/LogoArt.png" class="brand-mark" alt="Soenrect Logo" style="width: 34px; height: 34px; object-fit: contain; background-color: #FFFFFF;" />
        <span class="nav-text">SOENRECT</span>
      </a>
      
      <!-- RESPONSIVE SIDEBAR TOGGLE BUTTON -->
      <button class="btn btn-tertiary btn-icon btn-sm sidebar-toggle-btn" 
              id="sidebar-toggle-btn" 
              title="${isCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'} (Cmd+\\)" 
              aria-label="${isCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Navigation Sidebar'}"
              aria-expanded="${!isCollapsed}">
        ${toggleIcon}
      </button>
    </div>

    <!-- SIDEBAR NAVIGATION LINKS -->
    <div class="sidebar-nav">
      <div>
        <div class="nav-group-title">Production & Operations</div>
        <ul class="nav-list">
          <li>
            <a href="#" class="nav-item-link ${activeTemplate === 'executive-overview' ? 'is-active' : ''}" data-template="executive-overview" title="Executive Overview">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span class="nav-text">Executive Overview</span>
              <span class="nav-badge">Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" class="nav-item-link ${activeTemplate === 'project-management' ? 'is-active' : ''}" data-template="project-management" title="Project & Event Data">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span class="nav-text">Project Data & Crew</span>
              <span class="nav-badge">Events</span>
            </a>
          </li>
          <li>
            <a href="#" class="nav-item-link ${activeTemplate === 'equipment-management' ? 'is-active' : ''}" data-template="equipment-management" title="Equipment Inventory">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <span class="nav-text">Equipment Inventory</span>
              <span class="nav-badge">Assets</span>
            </a>
          </li>
          <li>
            <a href="#" class="nav-item-link ${activeTemplate === 'timeline-schedule' ? 'is-active' : ''}" data-template="timeline-schedule" title="Timeline Schedule">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span class="nav-text">Timeline & Schedule</span>
              <span class="nav-badge">Calendar</span>
            </a>
          </li>
        </ul>
      </div>

      <div>
        <div class="nav-group-title">Field & Crew Management</div>
        <ul class="nav-list">
          <li>
            <a href="#" class="nav-item-link ${activeTemplate === 'crew-checklist-sop' ? 'is-active' : ''}" data-template="crew-checklist-sop" title="Crew SOP Checklist">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <span class="nav-text">Crew SOP Checklist</span>
              <span class="nav-badge">Field</span>
            </a>
          </li>
          <li>
            <a href="#" class="nav-item-link ${activeTemplate === 'crew-directory' ? 'is-active' : ''}" data-template="crew-directory" title="Crew Directory">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <span class="nav-text">Crew Directory</span>
              <span class="nav-badge">Roster</span>
            </a>
          </li>
        </ul>
      </div>

      <div>
        <div class="nav-group-title">System & Settings</div>
        <ul class="nav-list">
          <li>
            <a href="#" class="nav-item-link ${activeTemplate === 'category-settings' ? 'is-active' : ''}" data-template="category-settings" title="Category Settings">
              <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span class="nav-text">Category Settings</span>
              <span class="nav-badge">Admin</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- SIDEBAR FOOTER USER PROFILE -->
    <div class="sidebar-footer">
      <button class="user-profile-button" title="Soenrect (Pasoendan Creative Project)">
        <div class="avatar" style="background: var(--color-accent); color: #FFFFFF;">SP</div>
        <div class="user-info">
          <div style="font-weight: var(--font-weight-medium); font-size: var(--text-xs); color: var(--color-foreground);">Soenrect</div>
          <div style="font-size: 11px; color: var(--color-foreground-muted);">Pasoendan Creative Project</div>
        </div>
      </button>
    </div>
  `;

  // Attach Event Listener for Responsive Sidebar Toggle Button
  const toggleBtn = container.querySelector('#sidebar-toggle-btn');
  toggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Add immediate visual click response animation
    toggleBtn.classList.add('is-active-pulse');
    setTimeout(() => toggleBtn.classList.remove('is-active-pulse'), 200);

    options.onToggleCollapse();
  });

  const links = container.querySelectorAll('.nav-item-link[data-template]');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const template = (e.currentTarget as HTMLElement).getAttribute('data-template') as ActivePageTemplate;
      if (template) {
        options.onNavigate(template);
        if (options.onCloseMobile) options.onCloseMobile();
      }
    });
  });
}
