/* ==========================================================================
   PAGE COMPOSITION TEMPLATE 1 — EXECUTIVE OVERVIEW DASHBOARD
   Features: High-impact executive operational dashboard synthesizing live data
   from Projects, Crew Roster, Equipment Inventory, Timeline Deadlines, and SOP Compliance.
   ========================================================================== */

import { ApplicationViewState, ActivePageTemplate } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { CategoryStoreService } from '../services/categoryStore';
import { renderKpiSkeleton } from '../components/dashboard/SkeletonLoader';
import { createEmptyState } from '../components/dashboard/EmptyState';
import { createErrorState } from '../components/dashboard/ErrorState';
import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';
import { ProjectRecord, CrewMember } from '../types/database';

export async function renderExecutiveOverview(
  container: HTMLElement,
  viewState: ApplicationViewState,
  onStateRetry: () => void,
  onNavigate?: (template: ActivePageTemplate, id?: string) => void
): Promise<void> {
  container.className = 'template-executive-overview';

  // Render Page Title Bar
  const titleBar = document.createElement('div');
  titleBar.className = 'page-header-bar';
  titleBar.innerHTML = `
    <div class="page-title-group">
      ${renderBreadcrumbs([
        { label: 'Workspace', path: '/executive-overview' },
        { label: 'Executive Overview' }
      ])}
      <h1>
        Executive Operations Overview
        <span class="badge badge-orange"><span class="badge-dot"></span>Production Command</span>
      </h1>
      <div class="page-title-description">Master operational overview — project schedules, crew roster, equipment availability, and upcoming milestones.</div>
    </div>
    <div class="btn-group">
      <a href="/project-management" class="btn btn-secondary btn-sm" data-route-link="/project-management">
        Manage Projects &rarr;
      </a>
      <a href="/equipment-management" class="btn btn-primary btn-sm" data-route-link="/equipment-management">
        Equipment Control &rarr;
      </a>
    </div>
  `;
  container.appendChild(titleBar);

  // HANDLE STATES: Skeleton Loading
  if (viewState === 'loading') {
    const kpiGrid = document.createElement('div');
    kpiGrid.className = 'kpi-grid-4';
    kpiGrid.innerHTML = renderKpiSkeleton() + renderKpiSkeleton() + renderKpiSkeleton() + renderKpiSkeleton();
    container.appendChild(kpiGrid);
    return;
  }

  // HANDLE STATES: Empty
  if (viewState === 'empty') {
    const emptyState = createEmptyState({
      title: 'No Executive Operational Data Found',
      description: 'Your workspace has not initialized any production records yet. Connect your database or initialize sample operational data.',
      actionText: 'Initialize Sample Data',
      onAction: onStateRetry
    });
    container.appendChild(emptyState);
    return;
  }

  // HANDLE STATES: Error
  if (viewState === 'error') {
    const errorState = createErrorState({
      title: 'Executive Database Timeout',
      message: 'Failed to establish real-time operational database connection.',
      onRetry: onStateRetry
    });
    container.appendChild(errorState);
    return;
  }

  // LOAD LIVE DATA FROM SERVICES
  const [projects, equipmentList, crewMembers, timelineEvents, sopChecklists] = await Promise.all([
    DataService.getProjects(),
    DataService.getEquipmentList(),
    DataService.getCrewMembers(),
    DataService.getTimelineEvents(),
    DataService.getSopChecklists()
  ]);

  const activeProjectsCount = projects.filter((p) => p.status === 'In Production' || p.status === 'Live Show').length;
  const totalEquipmentQty = equipmentList.reduce((sum, e) => sum + (e.quantity || 1), 0);
  const equipmentInUseQty = equipmentList.filter((e) => e.status === 'In Use').reduce((sum, e) => sum + (e.quantity || 1), 0);
  const equipmentAvailableQty = equipmentList.filter((e) => e.status === 'Available').reduce((sum, e) => sum + (e.quantity || 1), 0);
  const equipmentMaintenanceQty = equipmentList.filter((e) => e.status === 'Maintenance').reduce((sum, e) => sum + (e.quantity || 1), 0);

  // 1. EXECUTIVE KPI METRICS (4 CARDS GRID)
  const kpiGrid = document.createElement('div');
  kpiGrid.className = 'kpi-grid-4';
  kpiGrid.innerHTML = `
    <!-- KPI CARD 1: PRODUCTION PROJECTS -->
    <div class="card kpi-card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Production Events</span>
        <span class="badge badge-orange"><span class="badge-dot"></span>${activeProjectsCount} Active</span>
      </div>
      <div>
        <div class="font-mono" style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-foreground);">${projects.length} Total Projects</div>
        <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px;">${activeProjectsCount} Live Shows / In Production</div>
      </div>
      <a href="/project-management" data-route-link="/project-management" style="font-size: 11px; color: var(--color-accent); text-decoration: none; font-weight: 600;">
        View All Projects &rarr;
      </a>
    </div>

    <!-- KPI CARD 2: EQUIPMENT INVENTORY -->
    <div class="card kpi-card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Equipment Inventory</span>
        <span class="badge badge-success"><span class="badge-dot"></span>${equipmentAvailableQty} Units Ready</span>
      </div>
      <div>
        <div class="font-mono" style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-foreground);">${totalEquipmentQty} Stock Units</div>
        <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px;">${equipmentInUseQty} Deployed &bull; ${equipmentMaintenanceQty} Maintenance</div>
      </div>
      <a href="/equipment-management" data-route-link="/equipment-management" style="font-size: 11px; color: var(--color-accent); text-decoration: none; font-weight: 600;">
        Equipment Control &rarr;
      </a>
    </div>

    <!-- KPI CARD 3: CREW ROSTER -->
    <div class="card kpi-card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Crew Roster</span>
        <span class="badge badge-neutral">On Duty</span>
      </div>
      <div>
        <div class="font-mono" style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-foreground);">${crewMembers.length} Active Personnel</div>
        <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px;">Directors, Engineers & Technicians</div>
      </div>
      <a href="/crew-directory" data-route-link="/crew-directory" style="font-size: 11px; color: var(--color-accent); text-decoration: none; font-weight: 600;">
        Crew Roster Directory &rarr;
      </a>
    </div>

    <!-- KPI CARD 4: TIMELINE DEADLINES -->
    <div class="card kpi-card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Upcoming Milestones</span>
        <span class="badge badge-warning"><span class="badge-dot"></span>Calendar</span>
      </div>
      <div>
        <div class="font-mono" style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-warning);">${timelineEvents.length} Scheduled Items</div>
        <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px;">Load-in dates & equipment audits</div>
      </div>
      <a href="/timeline-schedule" data-route-link="/timeline-schedule" style="font-size: 11px; color: var(--color-accent); text-decoration: none; font-weight: 600;">
        Production Calendar &rarr;
      </a>
    </div>
  `;
  container.appendChild(kpiGrid);

  // 2. MAIN EXECUTIVE DASHBOARD GRID (2 BALANCED COLUMNS ON DESKTOP, 1 COLUMN ON MOBILE)
  const dashboardGrid = document.createElement('div');
  dashboardGrid.className = 'executive-main-grid';

  // LEFT COLUMN: ACTIVE PROJECTS & CREW ROSTER TABLES
  const leftCol = document.createElement('div');
  leftCol.style.display = 'flex';
  leftCol.style.flexDirection = 'column';
  leftCol.style.gap = 'var(--space-6)';

  // CARD 1: ACTIVE PROJECTS TABLE OVERVIEW
  const projectsCard = document.createElement('div');
  projectsCard.className = 'card';
  projectsCard.innerHTML = `
    <div class="card-header">
      <div>
        <div class="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          Active Production Events (${projects.length})
        </div>
        <div class="card-subtitle">Current production events, assigned PICs, venues, and crew allocations</div>
      </div>
      <a href="/project-management" data-route-link="/project-management" class="btn btn-tertiary btn-sm">
        View All Projects &rarr;
      </a>
    </div>

    <div class="table-wrapper desktop-table-view">
      <table class="data-table">
        <thead>
          <tr>
            <th>PROJECT NAME & CLIENT</th>
            <th>PERSON IN CHARGE (PIC)</th>
            <th style="min-width: 300px; width: 300px;">EVENT DATE & VENUE</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          ${projects
            .map((proj: ProjectRecord) => {
              const statusBadge =
                proj.status === 'Live Show'
                  ? 'badge-orange'
                  : proj.status === 'In Production'
                  ? 'badge-success'
                  : 'badge-neutral';

              return `
                <tr class="clickable-project-row" data-id="${proj.id}" style="cursor: pointer;">
                  <td>
                    <div style="font-weight: 600; color: var(--color-foreground); font-size: 13.5px;">${proj.projectName}</div>
                    <div style="font-size: 11px; color: var(--color-accent); font-weight: 500;">Client: ${proj.clientName}</div>
                  </td>
                  <td>
                    <div style="font-weight: 500; color: var(--color-foreground);">${proj.picName || 'Devon Takahashi'}</div>
                    <div class="font-mono" style="font-size: 11px; color: var(--color-foreground-subtle);">${proj.picPhone || '+62 812-3456-7890'}</div>
                  </td>
                  <td>
                    <div class="font-mono" style="font-size: var(--text-xs); font-weight: bold; color: var(--color-foreground);">${proj.eventDate}</div>
                    <div style="font-size: 11px; color: var(--color-foreground-muted);">${proj.venueName}</div>
                  </td>
                  <td><span class="badge ${statusBadge}"><span class="badge-dot"></span>${proj.status}</span></td>
                  <td>
                    <a href="/project-crew-detail?id=${proj.id}" data-route-link="/project-crew-detail?id=${proj.id}" class="btn btn-secondary btn-sm">
                      Details &rarr;
                    </a>
                  </td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- MOBILE ACTIVE PROJECTS CARD LIST VIEW -->
    <div class="table-card-list">
      ${projects.map((proj: ProjectRecord) => {
        const statusBadge = proj.status === 'Live Show' ? 'badge-orange' : proj.status === 'In Production' ? 'badge-success' : 'badge-neutral';
        return `
          <div class="table-card-item clickable-project-row" data-id="${proj.id}" style="cursor: pointer; padding: 14px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span class="badge ${statusBadge}"><span class="badge-dot"></span>${proj.status}</span>
              <span style="font-size: 11px; color: var(--color-accent); font-weight: 600;">Client: ${proj.clientName}</span>
            </div>
            <h4 style="font-size: 15px; font-weight: 700; color: var(--color-foreground); margin: 0; word-break: break-word;">${proj.projectName}</h4>
            <div style="font-size: 12px; color: var(--color-foreground-muted); display: flex; flex-direction: column; gap: 4px;">
              <div>PIC: <strong style="color: var(--color-foreground);">${proj.picName || 'Devon Takahashi'}</strong></div>
              <div>Date & Venue: <strong class="font-mono" style="color: var(--color-foreground);">${proj.eventDate}</strong> (${proj.venueName})</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: flex-end; padding-top: 6px; border-top: 1px solid var(--color-border);">
              <a href="/project-crew-detail?id=${proj.id}" data-route-link="/project-crew-detail?id=${proj.id}" class="btn btn-secondary btn-sm">
                Details &rarr;
              </a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  leftCol.appendChild(projectsCard);

  // Attach click handlers to project rows
  projectsCard.querySelectorAll('.clickable-project-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.btn') || (e.target as HTMLElement).tagName === 'A') return;
      const pId = (row as HTMLElement).getAttribute('data-id');
      if (pId && onNavigate) {
        onNavigate('project-crew-detail', pId);
      }
    });
  });

  // CARD 2: ACTIVE CREW ROSTER OVERVIEW TABLE
  const crewCard = document.createElement('div');
  crewCard.className = 'card';
  crewCard.innerHTML = `
    <div class="card-header">
      <div>
        <div class="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          Active Crew Roster Overview (${crewMembers.length})
        </div>
        <div class="card-subtitle">Technical officers, contact phone numbers, and status</div>
      </div>
      <a href="/crew-directory" data-route-link="/crew-directory" class="btn btn-tertiary btn-sm">
        View Roster &rarr;
      </a>
    </div>

    <div class="table-wrapper desktop-table-view">
      <table class="data-table">
        <thead>
          <tr>
            <th>CREW MEMBER</th>
            <th>ROLE</th>
            <th>PHONE</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          ${crewMembers
            .map((crew: CrewMember) => {
              const statusBadge =
                crew.status === 'On Assignment'
                  ? 'badge-orange'
                  : crew.status === 'Available'
                  ? 'badge-success'
                  : 'badge-neutral';

              return `
                <tr class="clickable-crew-row" data-id="${crew.id}" style="cursor: pointer;">
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div class="avatar-mini" style="width: 28px; height: 28px; font-size: 11px; font-weight: bold; background: var(--color-accent); color: #FFFFFF;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <div>
                        <div style="font-weight: 600; color: var(--color-foreground);">${crew.name}</div>
                        <div style="font-size: 11px; color: var(--color-foreground-subtle);">${crew.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-neutral">${crew.role}</span></td>
                  <td class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground); font-weight: 500;">${crew.phone || '+62 812-3456-7890'}</td>
                  <td><span class="badge ${statusBadge}"><span class="badge-dot"></span>${crew.status}</span></td>
                  <td>
                    <a href="/crew-detail?id=${crew.id}" data-route-link="/crew-detail?id=${crew.id}" class="btn btn-tertiary btn-sm">
                      Profile &rarr;
                    </a>
                  </td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- MOBILE CREW ROSTER CARD LIST VIEW -->
    <div class="table-card-list">
      ${crewMembers
        .map((crew: CrewMember) => {
          const statusBadge =
            crew.status === 'On Assignment'
              ? 'badge-orange'
              : crew.status === 'Available'
              ? 'badge-success'
              : 'badge-neutral';
          return `
          <div class="table-card-item clickable-crew-row" data-id="${crew.id}" style="cursor: pointer; padding: 14px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
              <div class="avatar-mini" style="width: 36px; height: 36px; min-width: 36px; flex-shrink: 0; font-size: 12px; font-weight: bold; background: var(--color-accent); color: #FFFFFF;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 700; color: var(--color-foreground); font-size: 14px; line-height: 1.3; word-break: break-word;">${crew.name}</div>
                <div style="font-size: 11.5px; color: var(--color-foreground-subtle); margin-top: 2px; word-break: break-word;">${crew.role}</div>
                <div class="font-mono" style="font-size: 11px; color: var(--color-accent); font-weight: 500; margin-top: 2px;">${crew.phone || '+62 812-3456-7890'}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 8px; border-top: 1px solid var(--color-border-subtle); width: 100%;">
              <span class="badge ${statusBadge}"><span class="badge-dot"></span>${crew.status}</span>
              <a href="/crew-detail?id=${crew.id}" data-route-link="/crew-detail?id=${crew.id}" class="btn btn-tertiary btn-sm" style="font-size: 12px; padding: 4px 10px; font-weight: 600;">
                View Profile &rarr;
              </a>
            </div>
          </div>
        `;
        })
        .join('')}
    </div>
  `;
  leftCol.appendChild(crewCard);

  // Attach click handlers to crew rows
  crewCard.querySelectorAll('.clickable-crew-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.btn') || (e.target as HTMLElement).tagName === 'A') return;
      const cId = (row as HTMLElement).getAttribute('data-id');
      if (cId && onNavigate) {
        onNavigate('crew-detail', cId);
      }
    });
  });

  dashboardGrid.appendChild(leftCol);

  // RIGHT COLUMN: EQUIPMENT SNAPSHOT, TIMELINE WIDGET, SOP COMPLIANCE
  const rightCol = document.createElement('div');
  rightCol.style.display = 'flex';
  rightCol.style.flexDirection = 'column';
  rightCol.style.gap = 'var(--space-6)';

  // CARD 1: EQUIPMENT CATEGORY SNAPSHOT
  const eqSnapshotCard = document.createElement('div');
  eqSnapshotCard.className = 'card';

  const categoriesList = CategoryStoreService.getCategories('equipment');

  eqSnapshotCard.innerHTML = `
    <div class="card-header" style="margin-bottom: var(--space-4);">
      <div>
        <div class="card-title">Equipment Inventory Status</div>
        <div class="card-subtitle">Availability across key categories</div>
      </div>
      <a href="/equipment-management" data-route-link="/equipment-management" class="btn btn-tertiary btn-sm">View All &rarr;</a>
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${categoriesList
        .map((cat) => {
          const catItems = equipmentList.filter((e) => e.category === cat);
          const totalUnits = catItems.reduce((sum, e) => sum + (e.quantity || 1), 0) || 1;
          const readyUnits = catItems.filter((e) => e.status === 'Available').reduce((sum, e) => sum + (e.quantity || 1), 0);
          const pct = Math.round((readyUnits / totalUnits) * 100);

          return `
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 4px;">
                <span style="font-weight: 500; color: var(--color-foreground);">${cat}</span>
                <span class="font-mono" style="color: var(--color-foreground-muted);">${readyUnits}/${totalUnits} Units Ready</span>
              </div>
              <div style="width: 100%; height: 6px; background: var(--color-surface-elevated); border-radius: var(--radius-full); overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: ${pct === 100 ? 'var(--color-success)' : 'var(--color-accent)'};"></div>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
  rightCol.appendChild(eqSnapshotCard);

  // CARD 2: UPCOMING MILESTONES & DEADLINES WIDGET
  const timelineWidgetCard = document.createElement('div');
  timelineWidgetCard.className = 'card';
  timelineWidgetCard.innerHTML = `
    <div class="card-header" style="margin-bottom: var(--space-4);">
      <div>
        <div class="card-title">Upcoming Milestones</div>
        <div class="card-subtitle">Next scheduled deadlines</div>
      </div>
      <a href="/timeline-schedule" data-route-link="/timeline-schedule" class="btn btn-tertiary btn-sm">Calendar &rarr;</a>
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${timelineEvents
        .slice(0, 3)
        .map((evt) => {
          const typeBadge =
            evt.type === 'Deadline'
              ? 'badge-warning'
              : evt.type === 'Event Day'
              ? 'badge-orange'
              : 'badge-neutral';

          return `
            <div style="padding: 10px 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span class="font-mono" style="font-size: 11px; font-weight: bold; color: var(--color-accent);">${evt.date}</span>
                <span class="badge ${typeBadge}">${evt.type}</span>
              </div>
              <div style="font-size: var(--text-xs); font-weight: 600; color: var(--color-foreground);">${evt.title}</div>
              <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px;">Event: ${evt.projectName || 'General Timeline'}</div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
  rightCol.appendChild(timelineWidgetCard);

  // CARD 3: CREW FIELD COMPLIANCE & SOP TRACKER
  const sopWidgetCard = document.createElement('div');
  sopWidgetCard.className = 'card';

  const totalSopTasks = sopChecklists.reduce((acc, s) => acc + s.tasks.length, 0);
  const completedSopTasks = sopChecklists.reduce((acc, s) => acc + s.tasks.filter((t) => t.isCompleted).length, 0);
  const sopPct = Math.round((completedSopTasks / (totalSopTasks || 1)) * 100);

  sopWidgetCard.innerHTML = `
    <div class="card-header" style="margin-bottom: var(--space-4);">
      <div>
        <div class="card-title">Field SOP Compliance</div>
        <div class="card-subtitle">Safety & calibration sign-offs</div>
      </div>
      <a href="/crew-checklist-sop" data-route-link="/crew-checklist-sop" class="btn btn-tertiary btn-sm">SOPs &rarr;</a>
    </div>

    <div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-size: var(--text-xs); color: var(--color-foreground-muted);">Overall Compliance Rate</span>
        <span class="font-mono" style="font-size: var(--text-sm); font-weight: bold; color: var(--color-accent);">${sopPct}% (${completedSopTasks}/${totalSopTasks})</span>
      </div>
      <div style="width: 100%; height: 8px; background: var(--color-surface-elevated); border-radius: var(--radius-full); overflow: hidden;">
        <div style="width: ${sopPct}%; height: 100%; background: var(--color-accent);"></div>
      </div>
      <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 8px;">
        Pre-event equipment calibrations and on-site stage safety checklists.
      </div>
    </div>
  `;
  rightCol.appendChild(sopWidgetCard);

  dashboardGrid.appendChild(rightCol);
  container.appendChild(dashboardGrid);
}
