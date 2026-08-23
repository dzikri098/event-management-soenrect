/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — DEDICATED CREW MEMBER DETAIL PAGE
   Features: Crew member contact details, address, assigned projects,
   edit action button, and "Manage Preview" stage pass modal preview.
   ========================================================================== */

import { ApplicationViewState, ActivePageTemplate } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { CrewMember } from '../types/database';
import { ModalDialog } from '../components/overlays/ModalDialog';
import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';

export async function renderCrewDetail(
  container: HTMLElement,
  viewState: ApplicationViewState,
  onNavigate?: (template: ActivePageTemplate, id?: string) => void,
  crewId?: string
): Promise<void> {
  container.className = 'template-executive-overview';

  if (viewState === 'loading') {
    return;
  }

  const crewMembers = await DataService.getCrewMembers();
  const crew: CrewMember = crewMembers.find((c) => c.id === crewId) || crewMembers[0];

  // Fetch all projects to match crew assignments across both crewList & assignedProjects
  const allProjects = await DataService.getProjects();
  const assignedProjects = allProjects.filter((p) => {
    const isInCrewList =
      p.crewList &&
      p.crewList.some(
        (c) => c.crewId === crew.id || (c.name && c.name.toLowerCase() === crew.name.toLowerCase())
      );
    const isInAssignedArray =
      crew.assignedProjects &&
      crew.assignedProjects.some(
        (ap) => ap.toLowerCase() === p.projectName.toLowerCase() || ap.toLowerCase() === p.id.toLowerCase()
      );
    return isInCrewList || isInAssignedArray;
  });

  // Render Page Title Bar with Back Button & Action Buttons
  const titleBar = document.createElement('div');
  titleBar.className = 'page-header-bar';
  titleBar.style.cssText = 'display: flex; flex-direction: column; gap: 14px; width: 100%; margin-bottom: var(--space-6);';
  titleBar.innerHTML = `
    <!-- 1. BREADCRUMBS & BACK BUTTON -->
    <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
      <div>
        <button class="btn btn-tertiary btn-sm" id="btn-back-to-directory" style="font-size: 12px; font-weight: 600; padding: 4px 8px;">
          &larr; Back to Crew Directory
        </button>
      </div>
      <div style="font-size: 11px;">
        ${renderBreadcrumbs([
          { label: 'Workspace', path: '/executive-overview' },
          { label: 'Crew Directory', path: '/crew-directory' },
          { label: crew.name }
        ])}
      </div>
    </div>

    <!-- 2. CREW AVATAR & NAME HEADER BLOCK -->
    <div style="display: flex; align-items: flex-start; gap: 14px; width: 100%;">
      <div class="avatar" style="width: 48px; height: 48px; min-width: 48px; flex-shrink: 0; font-size: 16px; font-weight: bold; background: var(--color-accent); color: #FFFFFF; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 2px;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: var(--color-foreground); line-height: 1.3; word-break: normal; overflow-wrap: break-word;">
            ${crew.name}
          </h1>
          <span class="badge badge-orange" style="font-size: 10.5px; padding: 2px 7px; flex-shrink: 0;"><span class="badge-dot"></span>${crew.status}</span>
        </div>
        <div style="font-size: 12px; color: var(--color-foreground-muted); line-height: 1.4; word-break: normal; overflow-wrap: break-word;">
          <strong style="color: var(--color-foreground-subtle);">${crew.role}</strong> &bull; <span class="font-mono">ID: ${crew.id}</span>
        </div>
      </div>
    </div>

    <!-- 3. ACTION BUTTONS ROW (FULL-WIDTH EVEN GRID ON MOBILE) -->
    <div style="display: flex; align-items: center; gap: 8px; width: 100%; flex-wrap: wrap;">
      <button class="btn btn-secondary btn-sm" id="btn-manage-preview" title="Open Stage Badge & Pass Preview" style="flex: 1; min-width: 130px; justify-content: center; font-size: 12px; padding: 8px 12px; font-weight: 600;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        Manage Preview
      </button>
      <button class="btn btn-primary btn-sm" id="btn-edit-crew-detail" style="flex: 1; min-width: 130px; justify-content: center; font-size: 12px; padding: 8px 12px; font-weight: 600;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        Edit Crew Data
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  // 1. CONTACT & DOMICILE INFORMATION CARD (RESPONSIVE GRID)
  const contactCard = document.createElement('div');
  contactCard.className = 'card';
  contactCard.style.marginBottom = 'var(--space-6)';

  contactCard.innerHTML = `
    <div class="card-header" style="margin-bottom: var(--space-4);">
      <div class="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Crew Member Personal & Domicile Details
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); padding: var(--space-5); background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Phone Number</div>
        <div class="font-mono" style="font-size: var(--text-base); font-weight: 600; color: var(--color-foreground); margin-top: 4px; word-break: break-word;">${crew.phone}</div>
      </div>

      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Email Address</div>
        <div style="font-size: var(--text-base); font-weight: 600; color: var(--color-foreground); margin-top: 4px; word-break: break-all;">${crew.email}</div>
      </div>

      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Home / Domicile Address</div>
        <div style="font-size: var(--text-sm); font-weight: 500; color: var(--color-foreground); margin-top: 4px; word-break: break-word;">${crew.address || '-'}</div>
      </div>
    </div>
  `;
  container.appendChild(contactCard);

  // 2. ASSIGNED PRODUCTION EVENTS & GEAR CARD
  const projectsCard = document.createElement('div');
  projectsCard.className = 'card';

  projectsCard.innerHTML = `
    <div class="card-header" style="margin-bottom: var(--space-4);">
      <div class="card-title" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          Assigned Production Events (${assignedProjects.length})
        </div>
        <span class="badge badge-neutral font-mono">${assignedProjects.length} Active Deployments</span>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      ${
        assignedProjects.length > 0
          ? assignedProjects
              .map((proj) => {
                const crewItem =
                  proj.crewList &&
                  proj.crewList.find(
                    (c) => c.crewId === crew.id || (c.name && c.name.toLowerCase() === crew.name.toLowerCase())
                  );
                const roleText = crewItem ? crewItem.role : crew.role;
                const statusBadge =
                  proj.status === 'In Production' || proj.status === 'Live Show' ? 'badge-orange' : 'badge-neutral';

                return `
              <div style="padding: 16px; background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow-sm);">
                
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 15px; font-weight: 700; color: var(--color-foreground); line-height: 1.3; word-break: break-word;">${proj.projectName}</div>
                    <div style="font-size: 11.5px; color: var(--color-accent); font-weight: 600; margin-top: 2px;">
                      Client: ${proj.clientName} &bull; Contact: ${proj.clientContact || 'N/A'}
                    </div>
                  </div>
                  <span class="badge ${statusBadge}" style="flex-shrink: 0; font-size: 11px;"><span class="badge-dot"></span>${proj.status}</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; padding: 10px 12px; background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); font-size: 11.5px; color: var(--color-foreground-muted);">
                  <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${proj.venueName}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); min-width: 0;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>${proj.eventDate}</span>
                  </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding-top: 6px; border-top: 1px solid var(--color-border-subtle);">
                  <div style="font-size: 12px; color: var(--color-foreground-subtle); display: flex; align-items: center; gap: 6px;">
                    <span>Deployment Role:</span>
                    <span class="badge badge-neutral" style="font-size: 11px; font-weight: 600;">${roleText}</span>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm view-project-btn" data-project-id="${proj.id}" style="font-size: 12px; font-weight: 600; padding: 6px 12px; display: inline-flex; align-items: center; gap: 4px;">
                    Manage Event &rarr;
                  </button>
                </div>

              </div>
            `;
              })
              .join('')
          : `
            <div style="text-align: center; padding: 32px 16px; background: var(--color-surface-elevated); border: 1px dashed var(--color-border); border-radius: var(--radius-lg); color: var(--color-foreground-muted);">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.6;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <div style="font-size: 14px; font-weight: 600; color: var(--color-foreground);">No Production Events Assigned</div>
              <div style="font-size: 12px; margin-top: 4px; color: var(--color-foreground-subtle);">This crew member is currently available and not assigned to any active production events.</div>
            </div>
          `
      }
    </div>
  `;
  container.appendChild(projectsCard);

  // Attach Event Listeners
  titleBar.querySelector('#btn-back-to-directory')?.addEventListener('click', () => {
    if (onNavigate) onNavigate('crew-directory');
  });

  // Manage Preview Handler
  titleBar.querySelector('#btn-manage-preview')?.addEventListener('click', () => {
    openManagePreviewModal(crew);
  });

  // Edit Crew Data Handler
  titleBar.querySelector('#btn-edit-crew-detail')?.addEventListener('click', () => {
    openEditCrewModal(crew, () => renderCrewDetail(container, viewState, onNavigate, crewId));
  });

  // Manage Project Event Handler
  projectsCard.querySelectorAll('.view-project-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const pId = (e.currentTarget as HTMLElement).getAttribute('data-project-id');
      if (pId && onNavigate) {
        onNavigate('project-crew-detail', pId);
      }
    });
  });
}

function openManagePreviewModal(crew: CrewMember): void {
  const previewHtml = `
    <div style="display: flex; flex-direction: column; align-items: center; padding: 20px 10px;">
      <!-- OFFICIAL CREW STAGE PASS / BADGE PREVIEW -->
      <div style="width: 280px; padding: 24px; background: linear-gradient(135deg, #111111 0%, #1a1a1a 100%); border: 2px solid var(--color-accent); border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,0.5); text-align: center; color: #FFFFFF;">
        <div style="font-size: 10px; font-weight: bold; letter-spacing: 0.15em; color: var(--color-accent); text-transform: uppercase;">SOENRECT LIVE CREW PASS</div>
        <div style="width: 72px; height: 72px; margin: 16px auto 12px; border-radius: 50%; background: var(--color-accent); color: #FFFFFF; font-size: 26px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 3px solid #FFFFFF;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div style="font-size: 18px; font-weight: bold; color: #FFFFFF; margin-bottom: 2px;">${crew.name}</div>
        <div style="font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">${crew.role}</div>

        <div style="padding: 8px; background: rgba(255,255,255,0.08); border-radius: 8px; font-size: 11px; margin-bottom: 16px;">
          <div>ACCESS: ALL STAGE AREAS</div>
          <div style="font-size: 10px; color: var(--color-accent); margin-top: 2px;">ID: ${crew.id}</div>
        </div>

        <div class="font-mono" style="font-size: 10px; color: rgba(255,255,255,0.5);">
          Emergency: ${crew.phone}
        </div>
      </div>
      <div style="font-size: var(--text-xs); color: var(--color-foreground-muted); margin-top: 16px;">
        Live Preview of Stage Accreditation & Print Pass Badge
      </div>
    </div>
  `;

  new ModalDialog({
    title: `Manage Preview: Official Crew Badge & Pass`,
    contentHtml: previewHtml,
    confirmText: 'Print / Download Pass',
    cancelText: 'Close Preview'
  }).open();
}

function openEditCrewModal(crew: CrewMember, onSaved: () => void): void {
  const modalHtml = `
    <div>
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Full Name</label>
        <input type="text" class="form-control" id="edit-crew-name" value="${crew.name}" />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Role</label>
          <input type="text" class="form-control" id="edit-crew-role" value="${crew.role}" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="text" class="form-control" id="edit-crew-phone" value="${crew.phone}" />
        </div>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-control" id="edit-crew-email" value="${crew.email}" />
      </div>

      <div class="form-group">
        <label class="form-label">Home Address</label>
        <input type="text" class="form-control" id="edit-crew-address" value="${crew.address}" />
      </div>
    </div>
  `;

  new ModalDialog({
    title: `Edit Crew Member: ${crew.name}`,
    contentHtml: modalHtml,
    confirmText: 'Save Crew Changes',
    cancelText: 'Cancel',
    onConfirm: () => {
      if (onSaved) onSaved();
    }
  }).open();
}
