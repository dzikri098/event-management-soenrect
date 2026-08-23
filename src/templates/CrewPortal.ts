/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — REFINED FIELD CREW PORTAL
   Features: Refined layout for field crew portal with quick field metrics bar,
   2-column responsive layout (Assigned Projects Preview on Left, Generalized
   Event Day SOP Checklist on Right with role references removed).
   ========================================================================== */

import { ApplicationViewState, ActivePageTemplate } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { AuthService } from '../services/authService';
import { ProjectRecord, CrewSopChecklist, SopTask } from '../types/database';

export async function renderCrewPortal(
  container: HTMLElement,
  viewState: ApplicationViewState,
  onNavigate: (template: ActivePageTemplate) => void
): Promise<void> {
  container.className = 'template-executive-overview';

  const crewMember = await AuthService.getActiveCrewMember();

  // If unauthenticated crew member, redirect to crew portal login
  if (!crewMember) {
    onNavigate('crew-portal-login');
    return;
  }

  // Render Top Navbar Header (Sticky)
  const titleBar = document.createElement('div');
  titleBar.className = 'crew-portal-top-navbar';
  titleBar.style.position = 'sticky';
  titleBar.style.top = '12px';
  titleBar.style.zIndex = '100';
  titleBar.style.display = 'flex';
  titleBar.style.alignItems = 'center';
  titleBar.style.justifyContent = 'space-between';
  titleBar.style.padding = '12px 16px';
  titleBar.style.backgroundColor = 'rgba(18, 18, 21, 0.92)';
  titleBar.style.backdropFilter = 'blur(16px)';
  titleBar.style.setProperty('-webkit-backdrop-filter', 'blur(16px)');
  titleBar.style.border = '1px solid var(--color-border)';
  titleBar.style.borderRadius = 'var(--radius-lg)';
  titleBar.style.marginBottom = 'var(--space-5)';
  titleBar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
  titleBar.style.gap = '12px';

  titleBar.innerHTML = `
    <!-- LEFT: LOGO + CREW PORTAL BRANDING -->
    <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
      <img src="/logo/LogoArt.png" alt="Soenrect Logo" style="width: 30px; height: 30px; object-fit: contain; flex-shrink: 0;" />
      <div style="min-width: 0;">
        <div style="font-size: 13px; font-weight: bold; color: var(--color-foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px;">
          <span>CREW PORTAL</span>
          <span style="color: var(--color-border-strong);">&bull;</span>
          <span style="color: var(--color-accent); font-weight: 600;">${crewMember.name}</span>
        </div>
        <div style="font-size: 10px; color: var(--color-foreground-subtle);">Field Operations &amp; Event Logistics</div>
      </div>
    </div>

    <!-- RIGHT: EXIT / SWITCH ACCOUNT BUTTON -->
    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
      <button class="btn btn-tertiary btn-sm" id="btn-logout-crew" style="color: var(--color-danger); padding: 5px 12px; font-size: 11px;" title="Exit Crew Portal / Switch Account">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        Exit
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') return;

  // Data Fetching
  const projects = await DataService.getProjects();
  const equipment = await DataService.getEquipmentList();
  const allSops = await DataService.getSopChecklists();
  const timelineEvents = await DataService.getTimelineEvents();

  const assignedProjects = projects.filter(
    (p) => p.crewList.some((c) => c.crewId === crewMember.id || c.name === crewMember.name) || crewMember.assignedProjects.includes(p.projectName)
  );

  // Total allocated gear items
  let totalAllocatedGear = 0;
  assignedProjects.forEach((proj) => {
    const c = proj.crewList.find((c) => c.crewId === crewMember.id || c.name === crewMember.name);
    if (c && c.assignedEquipmentIds) {
      totalAllocatedGear += c.assignedEquipmentIds.length;
    }
  });

  // Calculate overall generalized SOP completion
  const totalSopTasks = allSops.reduce((sum, s) => sum + s.tasks.length, 0);
  const completedSopTasks = allSops.reduce((sum, s) => sum + s.tasks.filter((t) => t.isCompleted).length, 0);
  const overallSopPercent = totalSopTasks > 0 ? Math.round((completedSopTasks / totalSopTasks) * 100) : 100;

  // 1. PROFILE BANNER & QUICK FIELD METRICS BAR
  const profileSection = document.createElement('div');
  profileSection.style.marginBottom = 'var(--space-6)';

  profileSection.innerHTML = `
    <!-- CONCISE COLLAPSIBLE PROFILE BANNER CARD -->
    <div class="card" style="padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); border-color: var(--color-accent-border); background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%);">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <!-- LEFT: AVATAR + NAME + ROLE + STATUS -->
        <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
          <div class="avatar" style="width: 44px; height: 44px; min-width: 44px; font-size: 16px; font-weight: bold; background: var(--color-accent); color: #FFFFFF; box-shadow: var(--shadow-glow-sm);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h2 style="font-size: var(--text-base); font-weight: bold; color: var(--color-foreground); margin: 0;">
                ${crewMember.name}
              </h2>
              <span class="badge badge-orange" style="font-size: 10px; padding: 2px 8px;">${crewMember.role}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span class="badge badge-success" style="padding: 2px 8px; font-size: 10px;">
                <span class="badge-dot"></span>Active Duty: ${crewMember.status}
              </span>
            </div>
          </div>
        </div>

        <!-- RIGHT: TOGGLE DETAILS & STATS BUTTONS -->
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-tertiary btn-sm" id="btn-toggle-field-stats" style="font-size: 11px; padding: 4px 10px; gap: 6px;" title="Toggle Quick Metrics Summary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <span id="label-toggle-field-stats">Hide Stats</span>
          </button>
          <button class="btn btn-tertiary btn-sm" id="btn-toggle-profile-details" style="font-size: 11px; padding: 4px 10px; gap: 6px;" title="Toggle Profile Contact Info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span id="label-toggle-profile-details">Show Info</span>
          </button>
        </div>
      </div>

      <!-- COLLAPSIBLE DETAILS (HIDDEN BY DEFAULT) -->
      <div id="crew-profile-collapsible-details" style="display: none; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border); font-size: 12px; color: var(--color-foreground-muted);">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent); flex-shrink: 0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>Phone: <strong style="color: var(--color-foreground);">${crewMember.phone}</strong></span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent); flex-shrink: 0;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>Email: <strong style="color: var(--color-foreground);">${crewMember.email}</strong></span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent); flex-shrink: 0;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
            <span>Passcode: <span class="badge badge-neutral font-mono">${crewMember.passcode}</span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- QUICK FIELD STATS GRID (TOGGLEABLE) -->
    <div id="crew-portal-stats-grid-container" class="crew-portal-stats-grid">
      <div class="card" style="padding: var(--space-3) var(--space-4);">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Assigned Projects</div>
        <div class="font-mono" style="font-size: var(--text-xl); font-weight: bold; color: var(--color-foreground); margin-top: 2px;">${assignedProjects.length} Active Event${assignedProjects.length !== 1 ? 's' : ''}</div>
      </div>

      <div class="card" style="padding: var(--space-3) var(--space-4);">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Allocated Gear Assets</div>
        <div class="font-mono" style="font-size: var(--text-xl); font-weight: bold; color: var(--color-accent); margin-top: 2px;">${totalAllocatedGear} Assigned Item${totalAllocatedGear !== 1 ? 's' : ''}</div>
      </div>

      <div class="card" style="padding: var(--space-3) var(--space-4);">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">SOP Compliance Rate</div>
        <div class="font-mono" style="font-size: var(--text-xl); font-weight: bold; color: var(--color-success); margin-top: 2px;">${overallSopPercent}% Complete</div>
      </div>
    </div>
  `;
  container.appendChild(profileSection);

  // Attach Profile Details Toggle Handler
  const btnToggle = profileSection.querySelector('#btn-toggle-profile-details');
  const labelToggle = profileSection.querySelector('#label-toggle-profile-details');
  const detailsDiv = profileSection.querySelector('#crew-profile-collapsible-details') as HTMLElement;

  btnToggle?.addEventListener('click', () => {
    if (detailsDiv.style.display === 'none') {
      detailsDiv.style.display = 'block';
      if (labelToggle) labelToggle.textContent = 'Hide Info';
    } else {
      detailsDiv.style.display = 'none';
      if (labelToggle) labelToggle.textContent = 'Show Info';
    }
  });

  // Attach Stats Toggle Handler
  const btnToggleStats = profileSection.querySelector('#btn-toggle-field-stats');
  const labelToggleStats = profileSection.querySelector('#label-toggle-field-stats');
  const statsGrid = profileSection.querySelector('#crew-portal-stats-grid-container') as HTMLElement;

  btnToggleStats?.addEventListener('click', () => {
    if (statsGrid.style.display === 'none') {
      statsGrid.style.display = 'grid';
      if (labelToggleStats) labelToggleStats.textContent = 'Hide Stats';
    } else {
      statsGrid.style.display = 'none';
      if (labelToggleStats) labelToggleStats.textContent = 'Show Stats';
    }
  });

  // 2. MAIN PORTAL CONTENT GRID (3-COLUMN RESPONSIVE LAYOUT)
  container.style.paddingBottom = '90px';

  const portalGrid = document.createElement('div');
  portalGrid.className = 'crew-portal-grid-3';
  portalGrid.style.alignItems = 'start';

  // LEFT COLUMN: MY ASSIGNED PROJECTS PREVIEW
  const leftCol = document.createElement('div');
  leftCol.id = 'crew-portal-events-section';
  leftCol.className = 'crew-portal-section';
  leftCol.style.display = 'flex';
  leftCol.style.flexDirection = 'column';
  leftCol.style.gap = 'var(--space-4)';

  leftCol.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
      <h3 style="font-size: var(--text-lg); font-weight: bold; color: var(--color-foreground); margin: 0; display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        My Assigned Projects Preview (${assignedProjects.length})
      </h3>
    </div>
  `;

  if (assignedProjects.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'card';
    emptyCard.style.padding = '30px';
    emptyCard.style.textAlign = 'center';
    emptyCard.style.color = 'var(--color-foreground-muted)';
    emptyCard.innerHTML = `No active event projects currently assigned to ${crewMember.name}.`;
    leftCol.appendChild(emptyCard);
  } else {
    assignedProjects.forEach((proj: ProjectRecord) => {
      const crewAssigned = proj.crewList.find((c) => c.crewId === crewMember.id || c.name === crewMember.name);
      const assignedGearIds = crewAssigned?.assignedEquipmentIds || [];

      // Group assigned equipment IDs by equipment item ID and calculate allocated quantity
      const assignedMap = new Map<string, number>();
      assignedGearIds.forEach((id) => {
        assignedMap.set(id, (assignedMap.get(id) || 0) + 1);
      });

      const assignedGearItems = Array.from(assignedMap.entries()).map(([eqId, count]) => {
        const eq = equipment.find((e) => e.id === eqId);
        return {
          equipment: eq,
          assignedQty: count
        };
      });

      const projCard = document.createElement('div');
      projCard.className = 'card';

      projCard.innerHTML = `
        <div class="card-header" style="margin-bottom: var(--space-3);">
          <div>
            <div style="font-size: 11px; color: var(--color-foreground-subtle); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
              ${proj.clientName}
            </div>
            <h4 style="font-size: var(--text-base); font-weight: bold; color: var(--color-foreground); margin: 0;">
              ${proj.projectName}
            </h4>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: var(--space-4);">
          <!-- ITEM 1: DATE & SCHEDULE -->
          <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="width: 32px; height: 32px; min-width: 32px; border-radius: var(--radius-sm); background: var(--color-accent-subtle); color: var(--color-accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div style="min-width: 0;">
              <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Date &amp; Schedule</div>
              <div style="font-size: 12px; font-weight: 600; color: var(--color-foreground); margin-top: 2px;">${proj.eventDate}</div>
              <div style="font-size: 11px; color: var(--color-accent); font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${proj.startTime} &ndash; ${proj.endTime} WIB
              </div>
            </div>
          </div>

          <!-- ITEM 2: VENUE LOCATION -->
          <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="width: 32px; height: 32px; min-width: 32px; border-radius: var(--radius-sm); background: rgba(249, 115, 22, 0.15); color: #f97316; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div style="min-width: 0;">
              <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Event Venue</div>
              <div style="font-size: 12px; font-weight: 600; color: var(--color-foreground); margin-top: 2px; word-break: break-word;">${proj.venueName}</div>
              <div style="font-size: 11px; color: var(--color-foreground-subtle); word-break: break-word;">${proj.venueAddress}</div>
            </div>
          </div>

          <!-- ITEM 3: OPERATIONS PIC -->
          <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="width: 32px; height: 32px; min-width: 32px; border-radius: var(--radius-sm); background: var(--color-success-subtle); color: var(--color-success); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div style="min-width: 0;">
              <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Operations PIC</div>
              <div style="font-size: 12px; font-weight: 600; color: var(--color-foreground); margin-top: 2px;">${proj.picName || 'Devon Takahashi'}</div>
              <div class="font-mono" style="font-size: 11px; color: var(--color-success); font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                ${proj.picPhone || '+62 812-3456-7890'}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); margin-bottom: 8px;">
            Allocated Gear & Equipment (${assignedGearIds.length} Unit${assignedGearIds.length !== 1 ? 's' : ''}):
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${
              assignedGearItems.length > 0
                ? assignedGearItems
                    .map(
                      ({ equipment: g, assignedQty }) => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                      <div style="width: 32px; height: 32px; min-width: 32px; border-radius: var(--radius-sm); background: var(--color-accent-subtle); color: var(--color-accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      </div>
                      <div style="min-width: 0;">
                        <div style="font-size: 12px; font-weight: 600; color: var(--color-foreground); word-break: break-word;">${g ? g.name : 'Equipment Asset'}</div>
                        <div style="font-size: 10px; color: var(--color-foreground-subtle); margin-top: 2px;">${g ? g.category : 'Production Gear'} &bull; S/N: ${g ? g.serialNumber : '-'}</div>
                      </div>
                    </div>
                    <span class="badge badge-orange font-mono" style="font-size: 11px; flex-shrink: 0; padding: 4px 8px;">${assignedQty} Unit${assignedQty > 1 ? 's' : ''}</span>
                  </div>
                `
                    )
                    .join('')
                : '<span style="font-size: 11px; color: var(--color-foreground-subtle);">No specific gear allocated</span>'
            }
          </div>
        </div>
      `;

      leftCol.appendChild(projCard);
    });
  }

  // MIDDLE COLUMN: GENERALIZED CREW EVENT DAY CHECKLIST & SOP
  const rightCol = document.createElement('div');
  rightCol.id = 'crew-portal-sop-section';
  rightCol.className = 'crew-portal-section is-hidden-mobile';
  rightCol.style.display = 'flex';
  rightCol.style.flexDirection = 'column';
  rightCol.style.gap = 'var(--space-4)';

  rightCol.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
      <h3 style="font-size: var(--text-lg); font-weight: bold; color: var(--color-foreground); margin: 0; display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        Crew Event Day Checklist & SOP
      </h3>
    </div>
  `;

  const renderSopCards = () => {
    // Clear existing SOP container
    const existing = rightCol.querySelector('.crew-portal-sop-list');
    if (existing) existing.remove();

    const sopList = document.createElement('div');
    sopList.className = 'crew-portal-sop-list';
    sopList.style.display = 'flex';
    sopList.style.flexDirection = 'column';
    sopList.style.gap = 'var(--space-4)';

    allSops.forEach((sop: CrewSopChecklist) => {
      const completedCount = sop.tasks.filter((t: SopTask) => t.isCompleted).length;
      const progressPercent = Math.round((completedCount / (sop.tasks.length || 1)) * 100);

      const card = document.createElement('div');
      card.className = 'card';

      // Generalized Title (No role mentioned!)
      card.innerHTML = `
        <div class="card-header" style="margin-bottom: var(--space-3);">
          <div>
            <h4 style="font-size: var(--text-base); font-weight: bold; color: var(--color-foreground); margin: 0;">
              ${(sop.projectName || 'Event Day Field SOP').replace(/\s*\([^)]*\)/g, '')}
            </h4>
          </div>
          <div>
            <div style="font-size: 11px; color: var(--color-foreground-subtle); text-align: right;">Completion Status</div>
            <div class="font-mono" style="font-size: var(--text-sm); font-weight: bold; color: var(--color-accent);">${progressPercent}% (${completedCount}/${sop.tasks.length})</div>
          </div>
        </div>

        <!-- PROGRESS BAR -->
        <div style="width: 100%; height: 6px; background-color: var(--color-surface-elevated); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-4);">
          <div style="width: ${progressPercent}%; height: 100%; background-color: var(--color-accent); transition: width var(--duration-fast) var(--ease-standard);"></div>
        </div>

        <!-- TASK CHECKLIST LIST -->
        <div style="display: flex; flex-direction: column; gap: var(--space-2-5);">
          ${sop.tasks
          .map(
            (task: SopTask) => `
            <label style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <input type="checkbox" class="checkbox-input portal-task-checkbox" data-sop-id="${sop.id}" data-task-id="${task.id}" ${task.isCompleted ? 'checked' : ''} />
                <div>
                  <div style="font-size: var(--text-sm); font-weight: 500; color: var(--color-foreground); ${task.isCompleted ? 'text-decoration: line-through; opacity: 0.7;' : ''}">&bull; ${task.title}</div>
                </div>
              </div>
              <span class="badge ${task.category === 'Pre-Event' ? 'badge-neutral' : task.category === 'Showtime' ? 'badge-orange' : 'badge-warning'}">${task.category}</span>
            </label>
          `
          )
          .join('')}
        </div>
      `;

      sopList.appendChild(card);
    });

    // Attach Checkbox Handlers
    sopList.querySelectorAll('.portal-task-checkbox').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const sopId = target.getAttribute('data-sop-id');
        const taskId = target.getAttribute('data-task-id');
        const foundSop = allSops.find((s) => s.id === sopId);
        if (foundSop) {
          const t = foundSop.tasks.find((tk: SopTask) => tk.id === taskId);
          if (t) {
            t.isCompleted = target.checked;
            renderSopCards();
          }
        }
      });
    });

    rightCol.appendChild(sopList);
  };

  renderSopCards();

  // RIGHT COLUMN: PRODUCTION CALENDAR & TIMELINE AGENDA
  const calendarCol = document.createElement('div');
  calendarCol.id = 'crew-portal-calendar-section';
  calendarCol.className = 'crew-portal-section is-hidden-mobile';
  calendarCol.style.display = 'flex';
  calendarCol.style.flexDirection = 'column';
  calendarCol.style.gap = 'var(--space-4)';

  calendarCol.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
      <h3 style="font-size: var(--text-lg); font-weight: bold; color: var(--color-foreground); margin: 0; display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        Production Calendar &amp; Deadlines (${timelineEvents.length})
      </h3>
    </div>

    <div class="card">
      <div class="card-header" style="margin-bottom: var(--space-3);">
        <div>
          <h4 style="font-size: var(--text-base); font-weight: bold; color: var(--color-foreground); margin: 0;">
            Timeline Milestones &amp; Schedule
          </h4>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${timelineEvents
          .map((evt) => {
            const typeBadge =
              evt.type === 'Deadline'
                ? 'badge-warning'
                : evt.type === 'Event Day'
                ? 'badge-orange'
                : 'badge-neutral';

            const cleanDate = evt.date.replace(/-/g, '');
            const title = `[Soenrect Ops] ${evt.title}`;
            const desc = evt.additionalDescription ? `\nNotes: ${evt.additionalDescription}` : '';
            const details = `Event: ${evt.projectName || 'General Timeline'}\nType: ${evt.type}\nPriority: ${evt.priority}${desc}\nManaged via Soenrect Management Suite.`;
            const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${cleanDate}/${cleanDate}&details=${encodeURIComponent(details)}`;

            return `
              <div style="padding: 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                  <span class="font-mono" style="font-size: 12px; font-weight: bold; color: var(--color-accent); display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    ${evt.date}
                  </span>
                  <span class="badge ${typeBadge}">${evt.type}</span>
                </div>
                <div style="font-size: 13px; font-weight: bold; color: var(--color-foreground); margin-top: 2px;">${evt.title}</div>
                ${evt.projectName ? `<div style="font-size: 11px; color: var(--color-accent); font-weight: 500; display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>Event: ${evt.projectName}</div>` : ''}
                ${evt.additionalDescription ? `<div style="font-size: 11px; color: var(--color-foreground-muted); line-height: 1.4;">${evt.additionalDescription}</div>` : ''}
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--color-border);">
                  <span style="font-size: 10px; color: var(--color-foreground-subtle);">Priority: ${evt.priority}</span>
                  <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-tertiary btn-sm" style="font-size: 11px; color: var(--color-accent); padding: 2px 8px; text-decoration: none;">
                    Sync Calendar ↗
                  </a>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;

  portalGrid.appendChild(leftCol);
  portalGrid.appendChild(rightCol);
  portalGrid.appendChild(calendarCol);
  container.appendChild(portalGrid);

  // 3. BOTTOM FLOATING NAVBAR (MOBILE SUBTABS CONTROLLER)
  const floatingNav = document.createElement('div');
  floatingNav.id = 'crew-portal-floating-nav';
  floatingNav.className = 'crew-portal-floating-nav';

  floatingNav.innerHTML = `
    <button id="floating-btn-events" class="floating-nav-btn active" title="Tampilkan Detail Acara">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
      <span>Event Detail</span>
    </button>
    <button id="floating-btn-sop" class="floating-nav-btn" title="Tampilkan SOP Checklist">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>SOP Checklist</span>
    </button>
    <button id="floating-btn-calendar" class="floating-nav-btn" title="Tampilkan Production Calendar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      <span>Calendar</span>
    </button>
  `;

  container.appendChild(floatingNav);

  // Floating Nav Subtab Switcher Handlers
  const btnEvents = floatingNav.querySelector('#floating-btn-events');
  const btnSop = floatingNav.querySelector('#floating-btn-sop');
  const btnCalendar = floatingNav.querySelector('#floating-btn-calendar');

  btnEvents?.addEventListener('click', () => {
    btnEvents.classList.add('active');
    btnSop?.classList.remove('active');
    btnCalendar?.classList.remove('active');
    leftCol.classList.remove('is-hidden-mobile');
    rightCol.classList.add('is-hidden-mobile');
    calendarCol.classList.add('is-hidden-mobile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnSop?.addEventListener('click', () => {
    btnSop.classList.add('active');
    btnEvents?.classList.remove('active');
    btnCalendar?.classList.remove('active');
    rightCol.classList.remove('is-hidden-mobile');
    leftCol.classList.add('is-hidden-mobile');
    calendarCol.classList.add('is-hidden-mobile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnCalendar?.addEventListener('click', () => {
    btnCalendar.classList.add('active');
    btnEvents?.classList.remove('active');
    btnSop?.classList.remove('active');
    calendarCol.classList.remove('is-hidden-mobile');
    leftCol.classList.add('is-hidden-mobile');
    rightCol.classList.add('is-hidden-mobile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Logout Handler
  titleBar.querySelector('#btn-logout-crew')?.addEventListener('click', () => {
    AuthService.logoutCrew();
    onNavigate('welcome');
  });
}
