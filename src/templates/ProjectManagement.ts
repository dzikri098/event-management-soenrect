/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — PROJECT DATA & CREW OVERVIEW TABLE
   Features: Simple overview data table showing Project Name, Assigned Crew,
   Event Date, Event Venue, and Person in Charge (PIC) at a glance.
   Clicking any row navigates directly to full Project Detail view.
   ========================================================================== */

import { ApplicationViewState, ActivePageTemplate } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { ProjectRecord, ProjectCrewAssignment } from '../types/database';
import { ModalDialog } from '../components/overlays/ModalDialog';
import { StrictDeleteModal } from '../components/overlays/StrictDeleteModal';

import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';

export async function renderProjectManagement(
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
        { label: 'Manage Project & Crew' }
      ])}
      <h1>
        Project Data & Production Overview
        <span class="badge badge-orange"><span class="badge-dot"></span>Live Event Ops</span>
      </h1>
      <div class="page-title-description">Quick overview at a glance — project titles, assigned crew, event dates, venues, and Person in Charge (PIC).</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary btn-sm" id="btn-create-project">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Production Project
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') {
    container.appendChild(createProjectSkeleton());
    return;
  }

  const projects = await DataService.getProjects();

  // Primary Simple Overview Data Table Card
  const tableCard = document.createElement('div');
  tableCard.className = 'card';

  tableCard.innerHTML = `
    <div class="card-header">
      <div class="card-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        Active Projects Overview (${projects.length})
      </div>
      <div class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground-muted);">
        Click any row to open complete Project Detail view
      </div>
    </div>

    <div class="table-wrapper desktop-table-view">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32%; min-width: 300px;">PROJECT NAME & CLIENT</th>
            <th>PERSON IN CHARGE (PIC)</th>
            <th>ASSIGNED CREW</th>
            <th>EVENT DATE & TIME</th>
            <th style="min-width: 300px; width: 300px;">EVENT VENUE</th>
            <th style="width: 320px; min-width: 320px;">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          ${projects
            .map((proj: ProjectRecord) => {
              const picName = proj.picName || (proj.crewList[0] ? proj.crewList[0].name : 'Unassigned PIC');
              const picPhone = proj.picPhone || (proj.crewList[0] ? proj.crewList[0].phone : '');

              const crewNamesText = proj.crewList.map((c: ProjectCrewAssignment) => c.name).join(', ');

              return `
                <tr class="clickable-project-row" data-id="${proj.id}" style="cursor: pointer;">
                  <td style="width: 32%; min-width: 300px;">
                    <div>
                      <div style="font-weight: bold; color: var(--color-foreground); font-size: var(--text-base); line-height: 1.35;">${proj.projectName}</div>
                      <div style="font-size: var(--text-xs); color: var(--color-accent); font-weight: 600; margin-top: 4px;">Client: ${proj.clientName}</div>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--color-foreground);">${picName}</div>
                    <div class="font-mono" style="font-size: 11px; color: var(--color-foreground-subtle);">${picPhone}</div>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="display: flex; margin-right: -4px;">
                        ${proj.crewList
                          .slice(0, 3)
                          .map(
                            (c: ProjectCrewAssignment) => `
                          <div class="avatar-mini" style="width: 28px; height: 28px; min-width: 28px; font-size: 11px; font-weight: bold; margin-left: -6px; border: 2px solid var(--color-surface); background-color: var(--color-accent); color: #FFFFFF;" title="${c.name} (${c.role})">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          </div>
                        `
                          )
                          .join('')}
                      </div>
                      <div>
                        <div style="font-size: var(--text-xs); font-weight: 500; color: var(--color-foreground); max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                          ${crewNamesText}
                        </div>
                        <div style="font-size: 11px; color: var(--color-foreground-subtle);">${proj.crewList.length} Assigned Crew</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="font-mono" style="font-size: var(--text-xs); font-weight: bold; color: var(--color-foreground);">${proj.eventDate}</div>
                    <div style="font-size: 11px; color: var(--color-foreground-muted);">${proj.startTime} &ndash; ${proj.endTime} WIB</div>
                  </td>
                  <td style="min-width: 300px; width: 300px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                      <span style="font-weight: 600; color: var(--color-foreground); font-size: var(--text-sm);">${proj.venueName}</span>
                      ${
                        proj.eventLinkMaps
                          ? `<a href="${proj.eventLinkMaps}" target="_blank" rel="noopener" onclick="event.stopPropagation();" class="btn-maps-link" title="Open Google Maps Location">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              <span>Google Maps</span>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.75;"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                            </a>`
                          : ''
                      }
                    </div>
                    <div style="font-size: 11px; color: var(--color-foreground-subtle); max-width: 290px; line-height: 1.4; margin-top: 4px; word-break: break-word;">${proj.venueAddress}</div>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-tertiary btn-sm edit-proj-data-btn" data-id="${proj.id}" title="Edit Project Details">
                        Edit
                      </button>
                      <button class="btn btn-secondary btn-sm open-proj-detail-btn" data-id="${proj.id}">
                        View Details &rarr;
                      </button>
                      <button class="btn btn-destructive btn-sm delete-proj-data-btn" data-id="${proj.id}" title="Delete Project">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            })
            .join('')}
      </table>
    </div>

    <!-- MOBILE PROJECTS CARD LIST VIEW -->
    <div class="table-card-list">
      ${projects
        .map((proj: ProjectRecord) => {
          const picName = proj.picName || (proj.crewList[0] ? proj.crewList[0].name : 'Unassigned PIC');
          const picPhone = proj.picPhone || (proj.crewList[0] ? proj.crewList[0].phone : '');

          return `
            <div class="table-card-item clickable-project-row" data-id="${proj.id}" style="cursor: pointer; padding: 16px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 12px; transition: all var(--duration-fast) var(--ease-standard);">
              
              <!-- CARD TOP HEADER: CLIENT & CREW COUNT BADGES -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                <span class="badge badge-orange" style="font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: var(--radius-full);">
                  Client: ${proj.clientName}
                </span>
                <span style="font-size: 11px; font-weight: 600; color: var(--color-foreground-subtle); display: inline-flex; align-items: center; gap: 5px; background: var(--color-surface); padding: 3px 10px; border-radius: var(--radius-full); border: 1px solid var(--color-border);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                  ${proj.crewList.length} Assigned Crew
                </span>
              </div>

              <!-- PROJECT TITLE -->
              <h4 style="font-size: 16px; font-weight: 700; color: var(--color-foreground); margin: 0; line-height: 1.35; word-break: break-word;">
                ${proj.projectName}
              </h4>

              <!-- INFORMATION ROWS LIST -->
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12.5px; color: var(--color-foreground-muted);">
                
                <!-- ROW 1: PIC -->
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <div style="width: 26px; height: 26px; min-width: 26px; border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; color: var(--color-foreground-subtle);">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div style="flex: 1; min-width: 0; padding-top: 2px;">
                    <span style="color: var(--color-foreground-subtle);">PIC:</span> 
                    <strong style="color: var(--color-foreground); font-weight: 600;">${picName}</strong>
                    ${picPhone ? `<span class="font-mono" style="font-size: 11px; color: var(--color-foreground-subtle); margin-left: 4px;">(${picPhone})</span>` : ''}
                  </div>
                </div>

                <!-- ROW 2: EVENT DATE & TIME -->
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <div style="width: 26px; height: 26px; min-width: 26px; border-radius: var(--radius-md); background: rgba(255, 85, 0, 0.1); border: 1px solid rgba(255, 85, 0, 0.25); display: flex; align-items: center; justify-content: center; color: var(--color-accent);">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div style="flex: 1; min-width: 0; padding-top: 2px;">
                    <span style="color: var(--color-foreground-subtle);">Date:</span> 
                    <strong class="font-mono" style="color: var(--color-foreground); font-weight: 600;">${proj.eventDate}</strong>
                    <div style="font-size: 11px; color: var(--color-accent); font-weight: 500; margin-top: 2px;">${proj.startTime} &ndash; ${proj.endTime} WIB</div>
                  </div>
                </div>

                <!-- ROW 3: VENUE & GOOGLE MAPS LINK -->
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <div style="width: 26px; height: 26px; min-width: 26px; border-radius: var(--radius-md); background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.25); display: flex; align-items: center; justify-content: center; color: #f97316; margin-top: 2px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; color: var(--color-foreground); font-size: 13px;">${proj.venueName}</div>
                    <div style="font-size: 11px; color: var(--color-foreground-subtle); line-height: 1.4; margin-top: 2px; word-break: break-word;">${proj.venueAddress}</div>
                    ${
                      proj.eventLinkMaps
                        ? `<div style="margin-top: 8px;">
                            <a href="${proj.eventLinkMaps}" target="_blank" rel="noopener" onclick="event.stopPropagation();" class="btn-maps-link" title="Open Google Maps Location">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              <span>Google Maps</span>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.75;"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                            </a>
                          </div>`
                        : ''
                    }
                  </div>
                </div>

              </div>

              <!-- ACTION BUTTONS FOOTER -->
              <div style="display: flex; align-items: center; gap: 8px; padding-top: 10px; border-top: 1px solid var(--color-border); margin-top: 4px;">
                <button class="btn btn-secondary btn-sm open-proj-detail-btn" data-id="${proj.id}" style="flex: 1; justify-content: center; font-weight: 600;">
                  View Details &rarr;
                </button>
                <button class="btn btn-tertiary btn-sm edit-proj-data-btn" data-id="${proj.id}" title="Edit Project Details" style="padding: 6px 12px;">
                  Edit
                </button>
                <button class="btn btn-destructive btn-sm delete-proj-data-btn" data-id="${proj.id}" title="Delete Project" style="padding: 6px 10px;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>

            </div>
          `;
        })
        .join('')}
    </div>
  `;

  container.appendChild(tableCard);

  // Attach Row Click Navigation Handlers
  tableCard.querySelectorAll('.clickable-project-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.btn-group') || (e.target as HTMLElement).tagName === 'BUTTON') {
        return;
      }
      const pId = (row as HTMLElement).getAttribute('data-id') || undefined;
      if (onNavigate) {
        onNavigate('project-crew-detail', pId);
      }
    });
  });

  tableCard.querySelectorAll('.open-proj-detail-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = (btn as HTMLElement).getAttribute('data-id') || undefined;
      if (onNavigate) {
        onNavigate('project-crew-detail', pId);
      }
    });
  });

  // Attach Edit Project Data button handler
  tableCard.querySelectorAll('.edit-proj-data-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      const found = projects.find((p) => p.id === pId);
      if (found) {
        openEditProjectModal(found, () => renderProjectManagement(container, viewState, onNavigate));
      }
    });
  });

  // Attach Delete Project Data button handler
  tableCard.querySelectorAll('.delete-proj-data-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      const found = projects.find((p) => p.id === pId);
      if (found) {
        openStrictDeleteProjectModal(found, () => renderProjectManagement(container, viewState, onNavigate));
      }
    });
  });

  // New Project Trigger
  titleBar.querySelector('#btn-create-project')?.addEventListener('click', () => {
    openCreateProjectModal(container, viewState, onNavigate);
  });
}

async function openCreateProjectModal(
  container: HTMLElement,
  viewState: ApplicationViewState,
  onNavigate?: (template: ActivePageTemplate, id?: string) => void
): Promise<void> {
  const crewList = await DataService.getCrewMembers();

  const modalHtml = `
    <div class="form-group" style="margin-bottom: var(--space-4);">
      <label class="form-label">Project / Event Name</label>
      <input type="text" id="new-proj-name" class="form-control" placeholder="e.g. National Esports Championship Final 2026" />
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
      <div class="form-group">
        <label class="form-label">Person In Charge (PIC)</label>
        <select id="new-proj-pic" class="form-control">
          <option value="">-- Select PIC from Crew Directory --</option>
          ${
            crewList.length > 0
              ? crewList.map((c) => `<option value="${c.name}" data-phone="${c.phone || ''}">${c.name} (${c.role})</option>`).join('')
              : `<option value="" disabled>No registered crew members</option>`
          }
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">PIC Phone Number</label>
        <input type="text" id="new-proj-pic-phone" class="form-control" placeholder="+62 812-3456-7890" />
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
      <div class="form-group">
        <label class="form-label">Client Name</label>
        <input type="text" id="new-proj-client" class="form-control" placeholder="PT Gaming Indonesia" />
      </div>
      <div class="form-group">
        <label class="form-label">Client Contact Email / Phone</label>
        <input type="text" id="new-proj-contact" class="form-control" placeholder="contact@gaming.co.id" />
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
      <div class="form-group">
        <label class="form-label">Venue / Location Name</label>
        <input type="text" id="new-proj-venue-name" class="form-control" placeholder="e.g. Istora Senayan Main Arena" />
      </div>
      <div class="form-group">
        <label class="form-label">Venue Full Address</label>
        <input type="text" id="new-proj-venue-address" class="form-control" placeholder="e.g. Jl. Pintu Satu Senayan, Gelora, Jakarta Pusat" />
      </div>
    </div>
    <div class="form-group" style="margin-bottom: var(--space-4);">
      <label class="form-label">Event Link Maps (Optional)</label>
      <input type="url" id="new-proj-maps" class="form-control" placeholder="e.g. https://maps.google.com/?q=..." />
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
      <div class="form-group">
        <label class="form-label">Event Start Date</label>
        <input type="date" id="new-proj-start-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label class="form-label">Event End Date</label>
        <input type="date" id="new-proj-end-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
      <div class="form-group">
        <label class="form-label">Start Time (24h Mask)</label>
        <input type="text" id="new-proj-start" class="form-control" placeholder="14:00" />
      </div>
      <div class="form-group">
        <label class="form-label">End Time (24h Mask)</label>
        <input type="text" id="new-proj-end" class="form-control" placeholder="23:30" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Additional Notes (Optional - Auto-synced to Timeline)</label>
      <textarea id="new-proj-notes" class="form-control" rows="2" placeholder="e.g. Loading dock access details or briefing instructions..."></textarea>
    </div>
  `;

  const dialog = new ModalDialog({
    title: 'Initialize New Production Project',
    contentHtml: modalHtml,
    confirmText: 'Create Project',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const name = (document.getElementById('new-proj-name') as HTMLInputElement)?.value;
      const picSelect = document.getElementById('new-proj-pic') as HTMLSelectElement;
      const pic = picSelect?.value;
      const picPhone = (document.getElementById('new-proj-pic-phone') as HTMLInputElement)?.value;
      const client = (document.getElementById('new-proj-client') as HTMLInputElement)?.value;
      const contact = (document.getElementById('new-proj-contact') as HTMLInputElement)?.value;
      const venueName = (document.getElementById('new-proj-venue-name') as HTMLInputElement)?.value;
      const venueAddress = (document.getElementById('new-proj-venue-address') as HTMLInputElement)?.value;
      const mapsLink = (document.getElementById('new-proj-maps') as HTMLInputElement)?.value;
      const startDate = (document.getElementById('new-proj-start-date') as HTMLInputElement)?.value;
      const endDate = (document.getElementById('new-proj-end-date') as HTMLInputElement)?.value;
      const start = (document.getElementById('new-proj-start') as HTMLInputElement)?.value;
      const end = (document.getElementById('new-proj-end') as HTMLInputElement)?.value;
      const addNotes = (document.getElementById('new-proj-notes') as HTMLTextAreaElement)?.value;

      let dateRangeStr = startDate || new Date().toISOString().split('T')[0];
      if (endDate && endDate !== startDate) {
        dateRangeStr = `${startDate} to ${endDate}`;
      }

      if (name) {
        await DataService.createProject({
          projectName: name,
          picName: pic || '',
          picPhone: picPhone || '',
          clientName: client || '',
          clientContact: contact || '',
          venueName: venueName || '',
          venueAddress: venueAddress || '',
          eventLinkMaps: mapsLink || '',
          eventDate: dateRangeStr,
          startTime: start || '',
          endTime: end || '',
          status: 'Planning',
          additionalNotes: addNotes || ''
        });
        renderProjectManagement(container, viewState, onNavigate);
      }
    }
  });

  dialog.open();

  setTimeout(() => {
    const startTimeInput = document.getElementById('new-proj-start') as HTMLInputElement;
    const endTimeInput = document.getElementById('new-proj-end') as HTMLInputElement;
    attachTimeInputMask(startTimeInput);
    attachTimeInputMask(endTimeInput);

    const picSelect = document.getElementById('new-proj-pic') as HTMLSelectElement;
    const picPhoneInput = document.getElementById('new-proj-pic-phone') as HTMLInputElement;

    picSelect?.addEventListener('change', () => {
      const selectedOpt = picSelect.options[picSelect.selectedIndex];
      const phone = selectedOpt?.getAttribute('data-phone');
      if (phone && picPhoneInput) {
        picPhoneInput.value = phone;
      }
    });
  }, 50);
}

async function openEditProjectModal(proj: ProjectRecord, onSaved?: () => void): Promise<void> {
  const crewList = await DataService.getCrewMembers();
  const isExistingInCrew = crewList.some((c) => c.name === proj.picName);

  let startDateVal = new Date().toISOString().split('T')[0];
  let endDateVal = new Date().toISOString().split('T')[0];

  if (proj.eventDate) {
    if (proj.eventDate.includes(' to ')) {
      const parts = proj.eventDate.split(' to ');
      startDateVal = parts[0].trim();
      endDateVal = parts[1].trim();
    } else {
      startDateVal = proj.eventDate.trim();
      endDateVal = proj.eventDate.trim();
    }
  }

  const modalHtml = `
    <div>
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Project / Event Name</label>
        <input type="text" class="form-control" id="edit-proj-name" value="${proj.projectName}" />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Person In Charge (PIC)</label>
          <select class="form-control" id="edit-proj-pic">
            <option value="">-- Select PIC from Crew Directory --</option>
            ${!isExistingInCrew && proj.picName ? `<option value="${proj.picName}" selected>${proj.picName} (Current)</option>` : ''}
            ${crewList.map((c) => `<option value="${c.name}" data-phone="${c.phone || ''}" ${c.name === proj.picName ? 'selected' : ''}>${c.name} (${c.role})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">PIC Phone</label>
          <input type="text" class="form-control" id="edit-proj-pic-phone" value="${proj.picPhone || ''}" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Client Name</label>
          <input type="text" class="form-control" id="edit-proj-client" value="${proj.clientName}" />
        </div>
        <div class="form-group">
          <label class="form-label">Client Contact</label>
          <input type="text" class="form-control" id="edit-proj-contact" value="${proj.clientContact}" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Venue / Location Name</label>
          <input type="text" class="form-control" id="edit-proj-venue" value="${proj.venueName}" placeholder="e.g. Istora Senayan Main Arena" />
        </div>
        <div class="form-group">
          <label class="form-label">Venue Full Address</label>
          <input type="text" class="form-control" id="edit-proj-address" value="${proj.venueAddress}" placeholder="e.g. Jl. Pintu Satu Senayan, Gelora, Jakarta Pusat" />
        </div>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Event Link Maps (Optional)</label>
        <input type="url" class="form-control" id="edit-proj-maps" value="${proj.eventLinkMaps || ''}" placeholder="e.g. https://maps.google.com/?q=..." />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Event Start Date</label>
          <input type="date" class="form-control" id="edit-proj-start-date" value="${startDateVal}" />
        </div>
        <div class="form-group">
          <label class="form-label">Event End Date</label>
          <input type="date" class="form-control" id="edit-proj-end-date" value="${endDateVal}" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Start Time (24h Mask)</label>
          <input type="text" class="form-control" id="edit-proj-start" value="${proj.startTime || ''}" placeholder="14:00" />
        </div>
        <div class="form-group">
          <label class="form-label">End Time (24h Mask)</label>
          <input type="text" class="form-control" id="edit-proj-end" value="${proj.endTime || ''}" placeholder="23:30" />
        </div>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Additional Notes (Optional - Auto-synced to Timeline)</label>
        <textarea class="form-control" id="edit-proj-notes" rows="2" placeholder="Describe notes or special instructions...">${proj.additionalNotes || ''}</textarea>
      </div>

      <div style="padding-top: 12px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end;">
        <button type="button" class="btn btn-destructive btn-sm" id="btn-delete-proj-action">
          Delete Project Record
        </button>
      </div>
    </div>
  `;

  const dialog = new ModalDialog({
    title: `Edit Production Project: ${proj.projectName}`,
    contentHtml: modalHtml,
    confirmText: 'Save Project Changes',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const name = (document.getElementById('edit-proj-name') as HTMLInputElement)?.value;
      const picSelect = document.getElementById('edit-proj-pic') as HTMLSelectElement;
      const pic = picSelect?.value;
      const picPhone = (document.getElementById('edit-proj-pic-phone') as HTMLInputElement)?.value;
      const client = (document.getElementById('edit-proj-client') as HTMLInputElement)?.value;
      const contact = (document.getElementById('edit-proj-contact') as HTMLInputElement)?.value;
      const venue = (document.getElementById('edit-proj-venue') as HTMLInputElement)?.value;
      const address = (document.getElementById('edit-proj-address') as HTMLInputElement)?.value;
      const mapsLink = (document.getElementById('edit-proj-maps') as HTMLInputElement)?.value;
      const startDate = (document.getElementById('edit-proj-start-date') as HTMLInputElement)?.value;
      const endDate = (document.getElementById('edit-proj-end-date') as HTMLInputElement)?.value;
      const start = (document.getElementById('edit-proj-start') as HTMLInputElement)?.value;
      const end = (document.getElementById('edit-proj-end') as HTMLInputElement)?.value;
      const addNotes = (document.getElementById('edit-proj-notes') as HTMLTextAreaElement)?.value;

      let dateRangeStr = startDate || new Date().toISOString().split('T')[0];
      if (endDate && endDate !== startDate) {
        dateRangeStr = `${startDate} to ${endDate}`;
      }

      await DataService.updateProject(proj.id, {
        projectName: name,
        picName: pic,
        picPhone: picPhone,
        clientName: client,
        clientContact: contact,
        venueName: venue,
        venueAddress: address,
        eventLinkMaps: mapsLink,
        eventDate: dateRangeStr,
        startTime: start,
        endTime: end,
        additionalNotes: addNotes
      });

      if (onSaved) onSaved();
    }
  });

  dialog.open();

  setTimeout(() => {
    const startTimeInput = document.getElementById('edit-proj-start') as HTMLInputElement;
    const endTimeInput = document.getElementById('edit-proj-end') as HTMLInputElement;
    attachTimeInputMask(startTimeInput);
    attachTimeInputMask(endTimeInput);

    const editPicSelect = document.getElementById('edit-proj-pic') as HTMLSelectElement;
    const editPicPhoneInput = document.getElementById('edit-proj-pic-phone') as HTMLInputElement;

    editPicSelect?.addEventListener('change', () => {
      const selectedOpt = editPicSelect.options[editPicSelect.selectedIndex];
      const phone = selectedOpt?.getAttribute('data-phone');
      if (phone && editPicPhoneInput) {
        editPicPhoneInput.value = phone;
      }
    });

    document.getElementById('btn-delete-proj-action')?.addEventListener('click', () => {
      dialog.close();
      openStrictDeleteProjectModal(proj, () => {
        if (onSaved) onSaved();
      });
    });
  }, 50);
}

function openStrictDeleteProjectModal(proj: ProjectRecord, onDeleted?: () => void): void {
  new StrictDeleteModal({
    itemName: proj.projectName,
    itemType: 'project record',
    onConfirmDelete: async () => {
      await DataService.deleteProject(proj.id);
      if (onDeleted) onDeleted();
    }
  }).open();
}

function attachTimeInputMask(input: HTMLInputElement): void {
  if (!input) return;
  input.maxLength = 5;

  input.addEventListener('input', () => {
    let val = input.value.replace(/\D/g, ''); // keep digits only
    if (val.length > 4) val = val.substring(0, 4);

    if (val.length >= 3) {
      let hh = parseInt(val.substring(0, 2), 10);
      if (isNaN(hh)) hh = 0;
      if (hh > 23) hh = 23;
      const hhStr = hh.toString().padStart(2, '0');

      let mm = val.substring(2);
      if (mm.length === 2) {
        let mmNum = parseInt(mm, 10);
        if (isNaN(mmNum)) mmNum = 0;
        if (mmNum > 59) mmNum = 59;
        mm = mmNum.toString().padStart(2, '0');
      }
      input.value = `${hhStr}:${mm}`;
    } else if (val.length >= 2) {
      let hh = parseInt(val.substring(0, 2), 10);
      if (isNaN(hh)) hh = 0;
      if (hh > 23) hh = 23;
      input.value = `${hh.toString().padStart(2, '0')}:`;
    } else {
      input.value = val;
    }
  });

  input.addEventListener('blur', () => {
    let val = input.value.trim();
    if (val && !val.includes(':') && val.length === 4) {
      input.value = `${val.substring(0, 2)}:${val.substring(2, 4)}`;
    }
  });
}

function createProjectSkeleton(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'card';
  div.style.height = '300px';
  div.style.opacity = '0.5';
  div.innerHTML = `<div style="padding: 40px; text-align: center;">Loading project overview data...</div>`;
  return div;
}
