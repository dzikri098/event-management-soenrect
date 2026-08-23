/* ==========================================================================
   MASTER APPLICATION LAUNCHER — ROUTER & PAGE COMPOSITION CONTROLLER
   Features: Clean HTML5 History API Routing (no hash # symbol in URLs),
   supports paths like /project-management, /project-crew-detail?id=proj-1,
   native browser back/forward buttons, and breadcrumbs above Page Titles.
   ========================================================================== */

import { ApplicationViewState, ActivePageTemplate } from './types/ui';
import { renderSidebar } from './components/shell/Sidebar';
import { renderHeader } from './components/shell/Header';
import { CommandPalette } from './components/overlays/CommandPalette';
import { renderExecutiveOverview } from './templates/ExecutiveOverview';
import { renderAnalyticsDetail } from './templates/AnalyticsDetail';
import { renderEquipmentManagement } from './templates/EquipmentManagement';
import { renderProjectManagement } from './templates/ProjectManagement';
import { renderProjectCrewDetail } from './templates/ProjectCrewDetail';
import { renderCrewDetail } from './templates/CrewDetail';
import { renderTimelineSchedule } from './templates/TimelineSchedule';
import { renderCrewChecklistSop } from './templates/CrewChecklistSop';
import { renderCrewDirectory } from './templates/CrewDirectory';
import { renderCategorySettings } from './templates/CategorySettings';
import { renderWelcomeSetup } from './templates/WelcomeSetup';
import { renderDashboardLogin } from './templates/DashboardLogin';
import { renderCrewPortalLogin } from './templates/CrewPortalLogin';
import { renderCrewPortal } from './templates/CrewPortal';
import { CategoryStoreService } from './services/categoryStore';
import { AuthService } from './services/authService';

interface ParsedRoute {
  template: ActivePageTemplate;
  id?: string;
}

class DashboardApp {
  private activeTemplate: ActivePageTemplate = 'executive-overview';
  private currentRouteId?: string;
  private viewState: ApplicationViewState = 'loaded';
  private isSidebarCollapsed = false;
  private isMobileSidebarOpen = false;
  private isDarkTheme = true;

  private sidebarRoot = document.getElementById('app-sidebar-root') as HTMLElement;
  private headerRoot = document.getElementById('app-header-root') as HTMLElement;
  private contentRoot = document.getElementById('app-content-root') as HTMLElement;
  private backdropRoot = document.getElementById('app-sidebar-backdrop') as HTMLElement;

  private commandPalette: CommandPalette;

  constructor() {
    this.commandPalette = new CommandPalette((newRoute) => {
      this.navigate(newRoute as ActivePageTemplate);
    });

    this.initKeyboardShortcuts();
    this.initMobileBackdrop();
    this.initGlobalLinkInterception();
    this.initRouter();
  }

  private parseCurrentRoute(): ParsedRoute {
    // 1. Check if legacy hash exists (#/template) and clean it up
    if (window.location.hash) {
      const rawHash = window.location.hash.replace(/^#\/?/, '');
      const [hashPath, hashQuery] = rawHash.split('?');
      const cleanPath = `/${hashPath}${hashQuery ? '?' + hashQuery : ''}`;
      window.history.replaceState({}, '', cleanPath);
    }

    // 2. Parse clean URL pathname and search params
    const rawPath = window.location.pathname.replace(/^\//, '');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || undefined;

    const validTemplates: ActivePageTemplate[] = [
      'welcome',
      'login',
      'crew-portal-login',
      'crew-portal',
      'executive-overview',
      'analytics-detail',
      'equipment-management',
      'project-management',
      'project-crew-detail',
      'crew-detail',
      'timeline-schedule',
      'crew-checklist-sop',
      'crew-directory',
      'category-settings'
    ];

    const template = validTemplates.includes(rawPath as ActivePageTemplate)
      ? (rawPath as ActivePageTemplate)
      : 'welcome';

    return { template, id };
  }

  private navigate(template: ActivePageTemplate, id?: string): void {
    const targetPath = `/${template}${id ? '?id=' + encodeURIComponent(id) : ''}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (currentPath !== targetPath) {
      window.history.pushState({ template, id }, '', targetPath);
    }
    this.handleRoute();
  }

  private initRouter(): void {
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    this.handleRoute();
  }

  private initGlobalLinkInterception(): void {
    document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('[data-route-link]') as HTMLAnchorElement;
      if (link) {
        const routePath = link.getAttribute('data-route-link') || link.getAttribute('href');
        if (routePath && routePath.startsWith('/')) {
          e.preventDefault();
          const [path, queryString] = routePath.replace(/^\//, '').split('?');
          const params = new URLSearchParams(queryString || '');
          const id = params.get('id') || undefined;
          this.navigate(path as ActivePageTemplate, id);
        }
      }
    });
  }

  private handleRoute(): void {
    const route = this.parseCurrentRoute();
    const isStandalone = ['welcome', 'login', 'crew-portal-login', 'crew-portal'].includes(route.template);

    // Route Protection: Admin Dashboard
    if (!isStandalone && !AuthService.isAdminAuthenticated()) {
      this.navigate('welcome');
      return;
    }

    // Route Protection: Crew Portal
    if (route.template === 'crew-portal' && !AuthService.isCrewAuthenticated()) {
      this.navigate('crew-portal-login');
      return;
    }

    this.activeTemplate = route.template;
    this.currentRouteId = route.id;
    this.closeMobileSidebar();
    this.render();
  }

  private initKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      // Cmd+\ or Ctrl+\ to toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        this.toggleSidebar();
      }
    });
  }

  private initMobileBackdrop(): void {
    if (this.backdropRoot) {
      this.backdropRoot.addEventListener('click', () => {
        this.closeMobileSidebar();
      });
    }
  }

  private toggleSidebar(): void {
    if (window.innerWidth <= 1024) {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
    this.updateBackdropState();
    this.renderShell();
  }

  private toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    this.updateBackdropState();
    this.renderShell();
  }

  private closeMobileSidebar(): void {
    if (this.isMobileSidebarOpen) {
      this.isMobileSidebarOpen = false;
      this.updateBackdropState();
      this.renderShell();
    }
  }

  private updateBackdropState(): void {
    if (this.backdropRoot) {
      if (this.isMobileSidebarOpen) {
        this.backdropRoot.classList.add('is-active');
      } else {
        this.backdropRoot.classList.remove('is-active');
      }
    }
  }

  private toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    this.renderHeaderOnly();
  }

  private setViewState(newState: ApplicationViewState): void {
    this.viewState = newState;
    this.renderContentOnly();
    this.renderHeaderOnly();
  }

  private renderShell(): void {
    const isStandalone = ['welcome', 'login', 'crew-portal-login', 'crew-portal'].includes(this.activeTemplate);

    if (isStandalone) {
      if (this.sidebarRoot) this.sidebarRoot.style.display = 'none';
      if (this.headerRoot) this.headerRoot.style.display = 'none';
      return;
    }

    if (this.sidebarRoot) {
      this.sidebarRoot.style.display = 'flex';
      renderSidebar(this.sidebarRoot, {
        activeTemplate: this.activeTemplate,
        isCollapsed: this.isSidebarCollapsed,
        isMobileOpen: this.isMobileSidebarOpen,
        onToggleCollapse: () => this.toggleSidebar(),
        onCloseMobile: () => this.closeMobileSidebar(),
        onNavigate: (tmpl) => this.navigate(tmpl)
      });
    }

    if (this.headerRoot) {
      this.headerRoot.style.display = 'flex';
      this.renderHeaderOnly();
    }
  }

  private renderHeaderOnly(): void {
    if (this.headerRoot) {
      renderHeader(this.headerRoot, {
        activeTemplate: this.activeTemplate,
        viewState: this.viewState,
        onOpenCommandPalette: () => this.commandPalette.open(),
        onViewStateChange: (state) => this.setViewState(state),
        onToggleTheme: () => this.toggleTheme(),
        onToggleMobileSidebar: () => this.toggleMobileSidebar(),
        onLogoutAdmin: () => {
          AuthService.logoutAdmin();
          this.navigate('welcome');
        }
      });
    }
  }

  private async renderContentOnly(): Promise<void> {
    if (!this.contentRoot) return;
    this.contentRoot.innerHTML = '';
    this.contentRoot.removeAttribute('style');
    this.contentRoot.className = 'app-content';

    const onRetry = () => this.setViewState('loaded');
    const handleNav = (tmpl: ActivePageTemplate, id?: string) => this.navigate(tmpl, id);

    if (this.activeTemplate === 'welcome') {
      renderWelcomeSetup(this.contentRoot, handleNav);
    } else if (this.activeTemplate === 'login') {
      renderDashboardLogin(this.contentRoot, handleNav);
    } else if (this.activeTemplate === 'crew-portal-login') {
      await renderCrewPortalLogin(this.contentRoot, handleNav);
    } else if (this.activeTemplate === 'crew-portal') {
      await renderCrewPortal(this.contentRoot, this.viewState, handleNav);
    } else if (this.activeTemplate === 'executive-overview') {
      await renderExecutiveOverview(this.contentRoot, this.viewState, onRetry, handleNav);
    } else if (this.activeTemplate === 'analytics-detail') {
      await renderAnalyticsDetail(this.contentRoot, this.viewState, onRetry);
    } else if (this.activeTemplate === 'equipment-management') {
      await renderEquipmentManagement(this.contentRoot, this.viewState);
    } else if (this.activeTemplate === 'project-management') {
      await renderProjectManagement(this.contentRoot, this.viewState, handleNav);
    } else if (this.activeTemplate === 'project-crew-detail') {
      await renderProjectCrewDetail(this.contentRoot, this.viewState, handleNav, this.currentRouteId);
    } else if (this.activeTemplate === 'crew-detail') {
      await renderCrewDetail(this.contentRoot, this.viewState, handleNav, this.currentRouteId);
    } else if (this.activeTemplate === 'timeline-schedule') {
      await renderTimelineSchedule(this.contentRoot, this.viewState);
    } else if (this.activeTemplate === 'crew-checklist-sop') {
      await renderCrewChecklistSop(this.contentRoot, this.viewState);
    } else if (this.activeTemplate === 'crew-directory') {
      await renderCrewDirectory(this.contentRoot, this.viewState, handleNav);
    } else if (this.activeTemplate === 'category-settings') {
      await renderCategorySettings(this.contentRoot, this.viewState);
    }
  }

  public render(): void {
    const isStandalone = ['welcome', 'login', 'crew-portal-login', 'crew-portal'].includes(this.activeTemplate);

    if (!isStandalone) {
      // Ensure shell elements are fully visible before render to avoid layout glitch
      if (this.sidebarRoot) this.sidebarRoot.style.display = 'flex';
      if (this.headerRoot) this.headerRoot.style.display = 'flex';
    }

    this.renderShell();
    this.renderContentOnly();
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await CategoryStoreService.initialize();
  new DashboardApp();
});
