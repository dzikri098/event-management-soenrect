/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — CREW ROSTER & DIRECTORY PAGE
   Features: Crew list containing Name, Role, Phone Number, Email, Address,
   Photo avatar, availability status, Edit action, and click-to-detail navigation.
   ========================================================================== */

import { ApplicationViewState, ActivePageTemplate } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { CrewMember } from '../types/database';
import { ModalDialog } from '../components/overlays/ModalDialog';
import { StrictDeleteModal } from '../components/overlays/StrictDeleteModal';
import { CategoryStoreService } from '../services/categoryStore';

import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';

export async function renderCrewDirectory(
  container: HTMLElement,
  viewState: ApplicationViewState,
  onNavigate?: (template: ActivePageTemplate, id?: string) => void
): Promise<void> {
  container.className = 'template-executive-overview';
  container.innerHTML = '';

  // Render Page Title Bar
  const titleBar = document.createElement('div');
  titleBar.className = 'page-header-bar';
  titleBar.innerHTML = `
    <div class="page-title-group">
      ${renderBreadcrumbs([
        { label: 'Workspace', path: '/executive-overview' },
        { label: 'Crew Directory & Roster' }
      ])}
      <h1>
        Event Crew Roster & Directory
        <span class="badge badge-orange"><span class="badge-dot"></span>Team Directory</span>
      </h1>
      <div class="page-title-description">Full crew member directory with contact details, addresses, phone numbers, and active project assignments.</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary btn-sm" id="btn-add-crew">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Register New Crew Member
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') {
    return;
  }

  const crewMembers = await DataService.getCrewMembers();

  // Primary Crew Directory Table Card
  const tableCard = document.createElement('div');
  tableCard.className = 'card';

  tableCard.innerHTML = `
    <div class="card-header">
      <div class="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Active Crew Roster (${crewMembers.length})
      </div>
      <div class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground-muted);">
        Click any row to open full detail view & Manage Preview
      </div>
    </div>

    <div class="table-wrapper desktop-table-view">
      <table class="data-table">
        <thead>
          <tr>
            <th style="min-width: 200px;">CREW MEMBER & PHOTO</th>
            <th>ROLE</th>
            <th>PHONE NUMBER</th>
            <th>EMAIL ADDRESS</th>
            <th style="min-width: 220px;">HOME / DOMICILE ADDRESS</th>
            <th>PORTAL PASSCODE</th>
            <th>STATUS</th>
            <th>ASSIGNED PROJECTS</th>
            <th style="width: 320px; min-width: 320px;">ACTIONS</th>
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
                <tr class="clickable-crew-row" data-crew-id="${crew.id}" style="cursor: pointer;">
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div class="avatar-mini" style="width: 34px; height: 34px; min-width: 34px; font-size: 13px; font-weight: bold; background-color: var(--color-accent); color: #FFFFFF;">
                        ${crew.avatarInitials}
                      </div>
                      <div>
                        <div style="font-weight: 600; color: var(--color-foreground);">${crew.name}</div>
                        <div style="font-size: 11px; color: var(--color-foreground-subtle);">ID: ${crew.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-neutral">${crew.role}</span></td>
                  <td class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground); font-weight: 500;">${crew.phone}</td>
                  <td style="font-size: var(--text-xs); color: var(--color-foreground-muted);">${crew.email}</td>
                  <td style="font-size: var(--text-xs); color: var(--color-foreground-muted); max-width: 220px;">${crew.address}</td>
                  <td><span class="badge badge-orange font-mono" style="font-weight: bold;">${crew.passcode || 'crew1234'}</span></td>
                  <td><span class="badge ${statusBadge}"><span class="badge-dot"></span>${crew.status}</span></td>
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      ${crew.assignedProjects
                        .map((p: string) => `<span style="font-size: 11px; color: var(--color-accent); font-weight: 500;">&bull; ${p}</span>`)
                        .join('')}
                    </div>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-tertiary btn-sm edit-crew-btn" data-crew-id="${crew.id}" title="Edit Crew Details">
                        Edit
                      </button>
                      <button class="btn btn-secondary btn-sm view-crew-btn" data-crew-id="${crew.id}">
                        View &rarr;
                      </button>
                      <button class="btn btn-destructive btn-sm delete-crew-btn" data-crew-id="${crew.id}" title="Delete Crew Member">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- MOBILE CREW CARD LIST VIEW -->
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
            <div class="table-card-item clickable-crew-row" data-crew-id="${crew.id}" style="cursor: pointer; padding: 14px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                  <div class="avatar-mini" style="width: 36px; height: 36px; min-width: 36px; font-size: 13px; font-weight: bold; background-color: var(--color-accent); color: #FFFFFF;">
                    ${crew.avatarInitials}
                  </div>
                  <div style="min-width: 0;">
                    <div style="font-weight: 600; color: var(--color-foreground); font-size: 14px;">${crew.name}</div>
                    <div style="font-size: 11px; color: var(--color-foreground-subtle);">${crew.email}</div>
                  </div>
                </div>
                <span class="badge ${statusBadge}"><span class="badge-dot"></span>${crew.status}</span>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; font-size: 11px;">
                <span class="badge badge-neutral">${crew.role}</span>
                <span class="badge badge-orange font-mono">PIN: ${crew.passcode || 'crew1234'}</span>
                <span style="color: var(--color-foreground-muted); display: inline-flex; align-items: center; gap: 4px; margin-top: 2px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  ${crew.phone}
                </span>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--color-border); gap: 8px; flex-wrap: wrap;">
                <div style="font-size: 11px; color: var(--color-foreground-muted); max-width: 100%; word-break: break-word; display: inline-flex; align-items: center; gap: 4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  ${crew.address}
                </div>
                <div class="btn-group" style="margin-left: auto;">
                  <button class="btn btn-tertiary btn-sm edit-crew-btn" data-crew-id="${crew.id}">Edit</button>
                  <button class="btn btn-secondary btn-sm view-crew-btn" data-crew-id="${crew.id}">View &rarr;</button>
                  <button class="btn btn-destructive btn-sm delete-crew-btn" data-crew-id="${crew.id}">Delete</button>
                </div>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;

  container.appendChild(tableCard);

  // Attach Row Click Navigation Handlers
  tableCard.querySelectorAll('.clickable-crew-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      // Avoid triggering when clicking action buttons directly
      if ((e.target as HTMLElement).closest('.btn-group') || (e.target as HTMLElement).tagName === 'BUTTON') {
        return;
      }
      const cId = (row as HTMLElement).getAttribute('data-crew-id') || undefined;
      if (onNavigate) {
        onNavigate('crew-detail', cId);
      }
    });
  });

  tableCard.querySelectorAll('.view-crew-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cId = (btn as HTMLElement).getAttribute('data-crew-id') || undefined;
      if (onNavigate) {
        onNavigate('crew-detail', cId);
      }
    });
  });

  tableCard.querySelectorAll('.edit-crew-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cId = (e.currentTarget as HTMLElement).getAttribute('data-crew-id');
      const found = crewMembers.find((c) => c.id === cId);
      if (found) {
        openEditCrewModal(found, () => renderCrewDirectory(container, viewState, onNavigate));
      }
    });
  });

  tableCard.querySelectorAll('.delete-crew-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cId = (e.currentTarget as HTMLElement).getAttribute('data-crew-id');
      const found = crewMembers.find((c) => c.id === cId);
      if (found) {
        openStrictDeleteCrewModal(found, () => renderCrewDirectory(container, viewState, onNavigate));
      }
    });
  });

  // Add Crew Handler
  titleBar.querySelector('#btn-add-crew')?.addEventListener('click', () => {
    new ModalDialog({
      title: 'Register New Crew Member',
      contentHtml: `
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Full Name</label>
          <input type="text" id="new-crew-name" class="form-control" placeholder="e.g. Michael Thorne" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          <div class="form-group">
            <label class="form-label">Role / Specialization</label>
            <select id="new-crew-role" class="form-control">
              ${CategoryStoreService.getCategories('crew')
                .map((cat) => `<option>${cat}</option>`)
                .join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" id="new-crew-phone" class="form-control" placeholder="+62 812-0000-1111" />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="new-crew-email" class="form-control" placeholder="m.thorne@soenrect.io" />
          </div>
          <div class="form-group">
            <label class="form-label">Portal Passcode PIN</label>
            <input type="text" id="new-crew-passcode" class="form-control" placeholder="e.g. crew1234" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Home Address</label>
          <input type="text" id="new-crew-address" class="form-control" placeholder="Jakarta, Indonesia" />
        </div>
      `,
      confirmText: 'Register Crew',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const name = (document.getElementById('new-crew-name') as HTMLInputElement)?.value;
        const role = (document.getElementById('new-crew-role') as HTMLSelectElement)?.value;
        const phone = (document.getElementById('new-crew-phone') as HTMLInputElement)?.value;
        const email = (document.getElementById('new-crew-email') as HTMLInputElement)?.value;
        const passcode = (document.getElementById('new-crew-passcode') as HTMLInputElement)?.value;
        const address = (document.getElementById('new-crew-address') as HTMLInputElement)?.value;

        if (name) {
          await DataService.createCrewMember({
            name,
            role: role || '',
            phone: phone || '',
            email: email || '',
            passcode: passcode || 'crew1234',
            address: address || '',
            status: 'Available'
          });
          renderCrewDirectory(container, viewState, onNavigate);
        }
      }
    }).open();
  });
}

function openEditCrewModal(crew: CrewMember, onSaved?: () => void): void {
  const modalHtml = `
    <div>
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Full Name</label>
        <input type="text" class="form-control" id="edit-crew-name" value="${crew.name}" />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Role / Specialization</label>
          <select id="edit-crew-role" class="form-control">
            ${CategoryStoreService.getCategories('crew')
              .map((cat) => `<option ${cat === crew.role ? 'selected' : ''}>${cat}</option>`)
              .join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="text" class="form-control" id="edit-crew-phone" value="${crew.phone}" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-control" id="edit-crew-email" value="${crew.email}" />
        </div>
        <div class="form-group">
          <label class="form-label">Portal Passcode PIN</label>
          <input type="text" class="form-control" id="edit-crew-passcode" value="${crew.passcode || 'crew1234'}" />
        </div>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Home Address</label>
        <input type="text" class="form-control" id="edit-crew-address" value="${crew.address}" />
      </div>

      <div style="padding-top: 12px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end;">
        <button type="button" class="btn btn-destructive btn-sm" id="btn-delete-crew-action">
          Delete Crew Record
        </button>
      </div>
    </div>
  `;

  const dialog = new ModalDialog({
    title: `Edit Crew Member: ${crew.name}`,
    contentHtml: modalHtml,
    confirmText: 'Save Crew Changes',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const name = (document.getElementById('edit-crew-name') as HTMLInputElement)?.value;
      const role = (document.getElementById('edit-crew-role') as HTMLSelectElement)?.value;
      const phone = (document.getElementById('edit-crew-phone') as HTMLInputElement)?.value;
      const email = (document.getElementById('edit-crew-email') as HTMLInputElement)?.value;
      const passcode = (document.getElementById('edit-crew-passcode') as HTMLInputElement)?.value;
      const address = (document.getElementById('edit-crew-address') as HTMLInputElement)?.value;

      await DataService.updateCrewMember(crew.id, {
        name,
        role,
        phone,
        email,
        passcode,
        address
      });

      if (onSaved) onSaved();
    }
  });

  dialog.open();

  // Attach Delete Crew Handler
  setTimeout(() => {
    document.getElementById('btn-delete-crew-action')?.addEventListener('click', () => {
      dialog.close();
      openStrictDeleteCrewModal(crew, () => {
        if (onSaved) onSaved();
      });
    });
  }, 50);
}

function openStrictDeleteCrewModal(crew: CrewMember, onDeleted?: () => void): void {
  new StrictDeleteModal({
    itemName: crew.name,
    itemType: 'crew member',
    onConfirmDelete: async () => {
      await DataService.deleteCrewMember(crew.id);
      if (onDeleted) onDeleted();
    }
  }).open();
}
