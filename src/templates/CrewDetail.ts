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

  // Render Page Title Bar with Back Button & Manage Preview
  const titleBar = document.createElement('div');
  titleBar.className = 'page-header-bar';
  titleBar.innerHTML = `
    <div>
      <button class="btn btn-tertiary btn-sm" id="btn-back-to-directory" style="margin-bottom: 8px;">
        &larr; Back to Crew Directory
      </button>
      <div class="page-title-group">
        ${renderBreadcrumbs([
          { label: 'Workspace', path: '/executive-overview' },
          { label: 'Crew Directory', path: '/crew-directory' },
          { label: crew.name }
        ])}
        <div style="display: flex; align-items: center; gap: 14px;">
          <div class="avatar" style="width: 44px; height: 44px; font-size: 16px; font-weight: bold; background: var(--color-accent); color: #FFFFFF;">
            ${crew.avatarInitials}
          </div>
          <div>
            <h1 style="margin: 0;">
              ${crew.name}
              <span class="badge badge-orange"><span class="badge-dot"></span>${crew.status}</span>
            </h1>
            <div class="page-title-description">${crew.role} &bull; ID: ${crew.id}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-secondary btn-sm" id="btn-manage-preview" title="Open Stage Badge & Pass Preview">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        Manage Preview
      </button>
      <button class="btn btn-primary btn-sm" id="btn-edit-crew-detail">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        Edit Crew Data
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  // 1. CONTACT & DOMICILE INFORMATION CARD
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

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); padding: var(--space-5); background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Phone Number</div>
        <div class="font-mono" style="font-size: var(--text-base); font-weight: 600; color: var(--color-foreground); margin-top: 4px;">${crew.phone}</div>
      </div>

      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Email Address</div>
        <div style="font-size: var(--text-base); font-weight: 600; color: var(--color-foreground); margin-top: 4px;">${crew.email}</div>
      </div>

      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Home / Domicile Address</div>
        <div style="font-size: var(--text-sm); font-weight: 500; color: var(--color-foreground); margin-top: 4px;">${crew.address}</div>
      </div>
    </div>
  `;
  container.appendChild(contactCard);

  // 2. ASSIGNED PROJECTS & GEAR CARD
  const projectsCard = document.createElement('div');
  projectsCard.className = 'card';

  projectsCard.innerHTML = `
    <div class="card-header">
      <div class="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        Assigned Production Events (${crew.assignedProjects.length})
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: var(--space-3);">
      ${crew.assignedProjects
        .map(
          (projName) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
          <div>
            <div style="font-size: var(--text-base); font-weight: 600; color: var(--color-foreground);">${projName}</div>
            <div style="font-size: var(--text-xs); color: var(--color-foreground-muted); margin-top: 2px;">Role: ${crew.role} &bull; Primary Crew Member</div>
          </div>
          <span class="badge badge-orange"><span class="badge-dot"></span>Active Deployment</span>
        </div>
      `
        )
        .join('')}
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
}

function openManagePreviewModal(crew: CrewMember): void {
  const previewHtml = `
    <div style="display: flex; flex-direction: column; align-items: center; padding: 20px 10px;">
      <!-- OFFICIAL CREW STAGE PASS / BADGE PREVIEW -->
      <div style="width: 280px; padding: 24px; background: linear-gradient(135deg, #111111 0%, #1a1a1a 100%); border: 2px solid var(--color-accent); border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,0.5); text-align: center; color: #FFFFFF;">
        <div style="font-size: 10px; font-weight: bold; letter-spacing: 0.15em; color: var(--color-accent); text-transform: uppercase;">SOENRECT LIVE CREW PASS</div>
        <div style="width: 72px; height: 72px; margin: 16px auto 12px; border-radius: 50%; background: var(--color-accent); color: #FFFFFF; font-size: 26px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 3px solid #FFFFFF;">
          ${crew.avatarInitials}
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
