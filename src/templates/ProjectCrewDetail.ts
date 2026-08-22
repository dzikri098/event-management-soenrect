/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — DEDICATED PROJECT DETAIL PAGE WITH SUBTABS
   Features: Direct Logistics & Venue Card at top, followed by Subtabs Navigation
   switching between Content Production Assets and Crew & Equipment Allocation per Person.
   Includes Sign QMG modal, Edit Revision connected to Crew Directory, Add Media Asset,
   and Revision History modal.
   ========================================================================== */

import { ApplicationViewState, ActivePageTemplate } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { ProjectRecord, ProjectCrewAssignment, EquipmentItem, ContentProductionItem, ContentRevisionHistory, CrewMember } from '../types/database';
import { ModalDialog } from '../components/overlays/ModalDialog';
import { StrictDeleteModal } from '../components/overlays/StrictDeleteModal';
import { CategoryStoreService } from '../services/categoryStore';

import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';

export async function renderProjectCrewDetail(
  container: HTMLElement,
  viewState: ApplicationViewState,
  onNavigate?: (template: ActivePageTemplate, id?: string) => void,
  projectId?: string
): Promise<void> {
  container.className = 'template-executive-overview';

  const [projects, equipmentList, crewDirectory] = await Promise.all([
    DataService.getProjects(),
    DataService.getEquipmentList(),
    DataService.getCrewMembers()
  ]);

  const currentProject: ProjectRecord =
    projects.find((p) => p.id === projectId) || projects[0];

  let activeSubtab: 'content-production' | 'crew-gear' = 'content-production';

  // Helper function to resolve equipment details
  const getEquipmentInfo = (eqId: string): EquipmentItem | undefined => {
    return equipmentList.find((e) => e.id === eqId);
  };

  // Render Page Header Bar with Back Button
  const titleBar = document.createElement('div');
  titleBar.className = 'page-header-bar';
  titleBar.innerHTML = `
    <div>
      <button class="btn btn-tertiary btn-sm" id="btn-back-to-projects" style="margin-bottom: 8px;">
        &larr; Back to All Projects
      </button>
      <div class="page-title-group">
        ${renderBreadcrumbs([
    { label: 'Workspace', path: '/executive-overview' },
    { label: 'Manage Project & Crew', path: '/project-management' },
    { label: currentProject.projectName }
  ])}
        <h1 style="margin: 0;">
          ${currentProject.projectName}
        </h1>
        <div style="font-size: var(--text-base); font-weight: 600; color: var(--color-accent); margin-top: 4px;">
          Client: ${currentProject.clientName} &bull; ${currentProject.clientContact}
        </div>
        <div class="page-title-description" style="margin-top: 4px;">Detailed Event Management, Crew Equipment Assignments, & Content Production Assets</div>
      </div>
    </div>
    <div class="btn-group">
      <button class="btn btn-secondary btn-sm" id="btn-export-manifest">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Download Manifest
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') {
    return;
  }

  // 1. LOGISTICS & VENUE OVERVIEW CARD (DIRECTLY AT TOP OF PAGE)
  const logisticsCard = document.createElement('div');
  logisticsCard.className = 'card';
  logisticsCard.style.marginBottom = 'var(--space-6)';

  logisticsCard.innerHTML = `
    <div class="card-header" style="margin-bottom: var(--space-4);">
      <div class="card-title" style="display: flex; align-items: center; gap: 12px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        Event Venue & Logistics Overview
      </div>
      <div class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground-muted);">
        Project ID: ${currentProject.id}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); padding: var(--space-5); background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Venue Name & Location</div>
        <div style="font-size: var(--text-base); font-weight: 600; color: var(--color-foreground); margin-top: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          ${currentProject.venueName}
          ${currentProject.eventLinkMaps
      ? `<a href="${currentProject.eventLinkMaps}" target="_blank" rel="noopener" class="btn-maps-link" title="Open Google Maps Location">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>Google Maps</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity: 0.75;"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </a>`
      : ''
    }
        </div>
        <div style="font-size: var(--text-xs); color: var(--color-foreground-muted); margin-top: 2px;">${currentProject.venueAddress}</div>
      </div>

      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Event Date & Showtime</div>
        <div class="font-mono" style="font-size: var(--text-base); font-weight: bold; color: var(--color-accent); margin-top: 4px;">${currentProject.eventDate}</div>
        <div style="font-size: var(--text-xs); color: var(--color-foreground-muted);">${currentProject.startTime} &ndash; ${currentProject.endTime} WIB</div>
      </div>

      <div>
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Person In Charge (PIC) & Call Time</div>
        <div style="font-size: var(--text-base); font-weight: 600; color: var(--color-foreground); margin-top: 4px;">${currentProject.picName || 'Devon Takahashi'}</div>
        <div class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground-muted);">${currentProject.picPhone || '+62 812-3456-7890'} &bull; Call Time: 10:00 AM</div>
      </div>
    </div>
  `;
  container.appendChild(logisticsCard);

  // 2. SUBTABS NAVIGATION BAR FOR CONTENT PRODUCTION & CREW GEAR ALLOCATION
  const navTabsContainer = document.createElement('div');
  navTabsContainer.className = 'project-subtabs-nav';
  navTabsContainer.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); padding-bottom: 12px;';

  const renderSubtabsNav = () => {
    navTabsContainer.innerHTML = `
      <button class="btn ${activeSubtab === 'content-production' ? 'btn-primary' : 'btn-tertiary'} btn-sm subtab-trigger" data-tab="content-production">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        Content Production Assets
      </button>
      <button class="btn ${activeSubtab === 'crew-gear' ? 'btn-primary' : 'btn-tertiary'} btn-sm subtab-trigger" data-tab="crew-gear">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
        Crew Equipment Allocation per Person
      </button>
    `;

    navTabsContainer.querySelectorAll('.subtab-trigger').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeSubtab = (e.currentTarget as HTMLElement).getAttribute('data-tab') as any;
        renderSubtabsNav();
        renderActiveSubtabContent();
      });
    });
  };

  container.appendChild(navTabsContainer);

  const subtabContentRoot = document.createElement('div');
  container.appendChild(subtabContentRoot);

  const contentProds = currentProject.contentProductions || [
    {
      id: 'cp-1',
      title: 'Main Stage Opening 3D Motion Graphics & Countdown',
      type: '3D Motion Graphics',
      resolution: '1920 x 1080 (FHD)',
      status: 'Approved',
      editorName: 'Marcus Wright',
      qmgSignedOff: true,
      qmgSignerName: 'Devon Takahashi (Director)',
      qmgSignDate: '2026-08-20',
      revisions: [
        {
          id: 'rev-1',
          version: 'v2.0 (Final Cut)',
          updatedAt: '2026-08-19',
          editorName: 'Marcus Wright',
          notes: 'Color grading matched to main LED wall color profile. Approved by Director.',
          fileSize: '1.4 GB (ProRes 4444 XQ)'
        }
      ]
    }
  ];

  const renderActiveSubtabContent = () => {
    subtabContentRoot.innerHTML = '';

    if (activeSubtab === 'content-production') {
      // SUBTAB 1: CONTENT PRODUCTION ASSETS
      const contentCard = document.createElement('div');
      contentCard.className = 'card';

      contentCard.innerHTML = `
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            Content Production Assets (${contentProds.length})
          </div>
          <div class="btn-group">
            <button class="btn btn-secondary btn-sm" id="btn-sign-qmg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Sign QMG (Quality Guarantee)
            </button>
            <button class="btn btn-tertiary btn-sm" id="btn-add-content-prod">+ Add Media Asset</button>
          </div>
        </div>

        <div class="table-wrapper desktop-table-view">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 45%; min-width: 340px;">CONTENT PRODUCTION TITLE</th>
                <th>TYPE</th>
                <th>RESOLUTION</th>
                <th>STATUS & QMG SIGN-OFF</th>
                <th>ASSIGNED EDITOR (CREW DIRECTORY)</th>
                <th style="width: 340px; min-width: 340px;">ACTIONS & REVISION LOG</th>
              </tr>
            </thead>
            <tbody>
              ${contentProds
          .map((cp: ContentProductionItem) => {
            const cpBadge =
              cp.status === 'Approved'
                ? 'badge-success'
                : cp.status === 'Implemented'
                  ? 'badge-success'
                  : cp.status === 'Revision'
                    ? 'badge-warning'
                    : cp.status === 'In Rendering'
                      ? 'badge-orange'
                      : 'badge-warning';

            const statusLabel =
              cp.status === 'Revision'
                ? 'Revision Pending'
                : cp.status;

            const revCount = cp.revisions ? cp.revisions.length : 1;

            const initialNotes = cp.revisions && cp.revisions.length > 0
              ? cp.revisions[cp.revisions.length - 1].notes
              : 'No instructions provided.';

            const latestNotes = cp.revisions && cp.revisions.length > 1
              ? cp.revisions[0].notes
              : null;

            return `
                    <tr>
                      <td>
                        <div style="font-weight: 600; color: var(--color-foreground);">${cp.title}</div>
                        <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 4px; line-height: 1.3;">
                          <span style="color: var(--color-accent); font-weight: 500;">Initial Instructions:</span> "${initialNotes}"
                        </div>
                        ${latestNotes ? `
                        <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px; line-height: 1.3;">
                          <span style="color: var(--color-warning); font-weight: 500;">Latest Notes:</span> "${latestNotes}"
                        </div>` : ''}
                        ${cp.qmgSignedOff
                ? `<div style="font-size: 11px; color: var(--color-success); font-weight: 500; margin-top: 4px;">
                                &check; QMG Signed off by ${cp.qmgSignerName || 'Director'} (${cp.qmgSignDate || 'Recent'})
                              </div>`
                : ''
              }
                      </td>
                      <td><span class="badge badge-neutral">${cp.type}</span></td>
                      <td class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground-muted);">${cp.resolution}</td>
                      <td>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                          <span class="badge ${cpBadge}"><span class="badge-dot"></span>${statusLabel}</span>
                        </div>
                      </td>
                      <td style="font-size: var(--text-xs); color: var(--color-foreground); font-weight: 500;">${cp.editorName}</td>
                      <td>
                        <div class="btn-group">
                          ${cp.fileUrl ? `<a href="${cp.fileUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" title="Open Media File Link">🔗 Open File ↗</a>` : ''}
                          <button class="btn btn-secondary btn-sm edit-media-asset-btn" data-cp-id="${cp.id}">
                            Edit
                          </button>
                          <button class="btn btn-secondary btn-sm add-revision-btn" data-cp-id="${cp.id}">
                            Add Revision
                          </button>
                          <button class="btn btn-tertiary btn-sm view-revisions-btn" data-cp-id="${cp.id}">
                            Revisions (${revCount}) &rarr;
                          </button>
                          <button class="btn btn-destructive btn-sm delete-media-btn" data-cp-id="${cp.id}" title="Delete Media Asset">
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
      `;

      subtabContentRoot.appendChild(contentCard);

      // Attach Revision History Modal Handler
      contentCard.querySelectorAll('.view-revisions-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const cpId = (e.currentTarget as HTMLElement).getAttribute('data-cp-id');
          const foundCp = contentProds.find((c) => c.id === cpId);
          if (foundCp) {
            openRevisionHistoryModal(foundCp, async () => {
              await DataService.updateProject(currentProject.id, currentProject);
              renderActiveSubtabContent();
            });
          }
        });
      });

      // Attach Edit Media Asset Button Handler
      contentCard.querySelectorAll('.edit-media-asset-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const cpId = (e.currentTarget as HTMLElement).getAttribute('data-cp-id');
          const foundCp = contentProds.find((c) => c.id === cpId);
          if (foundCp) {
            openEditMediaAssetModal(foundCp, crewDirectory, async () => {
              await DataService.updateProject(currentProject.id, currentProject);
              renderActiveSubtabContent();
            });
          }
        });
      });

      // Attach Add Revision Modal Handler
      contentCard.querySelectorAll('.add-revision-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const cpId = (e.currentTarget as HTMLElement).getAttribute('data-cp-id');
          const foundCp = contentProds.find((c) => c.id === cpId);
          if (foundCp) {
            openAddRevisionModal(foundCp, async () => {
              await DataService.updateProject(currentProject.id, currentProject);
              renderActiveSubtabContent();
            });
          }
        });
      });

      // Attach Delete Media Asset Modal Handler
      contentCard.querySelectorAll('.delete-media-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const cpId = (e.currentTarget as HTMLElement).getAttribute('data-cp-id');
          const foundCp = contentProds.find((c) => c.id === cpId);
          if (foundCp) {
            new StrictDeleteModal({
              itemName: foundCp.title,
              itemType: 'media asset',
              onConfirmDelete: async () => {
                currentProject.contentProductions = (currentProject.contentProductions || []).filter((c) => c.id !== cpId);
                await DataService.updateProject(currentProject.id, currentProject);
                renderActiveSubtabContent();
              }
            }).open();
          }
        });
      });

      // Attach Add Media Asset Modal Handler
      contentCard.querySelector('#btn-add-content-prod')?.addEventListener('click', () => {
        openAddMediaAssetModal(crewDirectory, async (newAsset) => {
          if (!currentProject.contentProductions) {
            currentProject.contentProductions = [];
          }
          currentProject.contentProductions.unshift(newAsset);
          await DataService.updateProject(currentProject.id, currentProject);
          renderActiveSubtabContent();
        });
      });

      // Attach Sign QMG Modal Handler
      contentCard.querySelector('#btn-sign-qmg')?.addEventListener('click', () => {
        openSignQmgModal(contentProds, crewDirectory, async () => {
          await DataService.updateProject(currentProject.id, currentProject);
          renderActiveSubtabContent();
        });
      });
    } else if (activeSubtab === 'crew-gear') {
      // SUBTAB 2: CREW & EQUIPMENT ALLOCATION PER PERSON
      const crewCard = document.createElement('div');
      crewCard.className = 'card';

      crewCard.innerHTML = `
        <div class="card-header">
          <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            Crew Equipment Allocation per Person (${currentProject.crewList.length})
          </div>
          <button class="btn btn-primary btn-sm" id="btn-card-assign-crew">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            + Assign Crew & Gear
          </button>
        </div>

        <div class="table-wrapper desktop-table-view">
          <table class="data-table">
            <thead>
              <tr>
                <th>CREW MEMBER RESPONSIBLE</th>
                <th>ROLE</th>
                <th>PHONE NUMBER</th>
                <th>ASSIGNED EQUIPMENT PER PERSON</th>
                <th style="width: 320px; min-width: 320px;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${currentProject.crewList.length === 0
          ? `
                    <tr>
                      <td colspan="5" style="text-align: center; padding: 24px; color: var(--color-foreground-muted);">
                        No crew members assigned to this project yet. Click "+ Assign Crew & Gear" above to assign crew and allocate gear.
                      </td>
                    </tr>
                  `
          : currentProject.crewList
            .map((crew: ProjectCrewAssignment) => {
              return `
                          <tr>
                            <td>
                              <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="avatar-mini" style="width: 32px; height: 32px; min-width: 32px; font-weight: bold; background: var(--color-accent); color: #FFFFFF;">
                                  ${crew.name.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div>
                                  <div style="font-weight: 600; color: var(--color-foreground);">${crew.name}</div>
                                  <div style="font-size: 11px; color: var(--color-foreground-subtle);">ID: ${crew.crewId}</div>
                                </div>
                              </div>
                            </td>
                            <td><span class="badge badge-neutral">${crew.role}</span></td>
                            <td class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground); font-weight: 500;">${crew.phone}</td>
                            <td>
                              <div style="display: flex; flex-direction: column; gap: 6px;">
                                ${crew.assignedEquipmentIds.length === 0
                  ? `<span style="font-size: 11px; color: var(--color-foreground-subtle);">No gear allocated</span>`
                  : crew.assignedEquipmentIds
                    .map((eqId: string) => {
                      const eq = getEquipmentInfo(eqId);
                      return `
                                            <div style="display: flex; align-items: center; gap: 8px; padding: 4px 8px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                              <span style="font-size: 11.5px; color: var(--color-accent); font-weight: 600;">
                                                ${eq ? eq.name : eqId}
                                              </span>
                                              ${eq ? `<span class="font-mono" style="font-size: 10px; color: var(--color-foreground-muted);">(${eq.serialNumber} &bull; Qty: ${eq.quantity || 1} Units)</span>` : ''}
                                            </div>
                                          `;
                    })
                    .join('')
                }
                              </div>
                            </td>
                            <td>
                              <div class="btn-group">
                                <button class="btn btn-tertiary btn-sm edit-crew-assignment-btn" data-crew-id="${crew.crewId}">
                                  Manage Gear &rarr;
                                </button>
                                <button class="btn btn-destructive btn-sm remove-crew-btn" data-crew-id="${crew.crewId}" title="Remove Crew from Project">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
            })
            .join('')
        }
            </tbody>
          </table>
        </div>
      `;
      subtabContentRoot.appendChild(crewCard);

      // Attach Card Assign Crew Handler
      crewCard.querySelector('#btn-card-assign-crew')?.addEventListener('click', () => {
        openAssignCrewModal(currentProject, crewDirectory, equipmentList, projects, () => {
          renderActiveSubtabContent();
        });
      });

      // Attach Manage Gear Handlers
      crewCard.querySelectorAll('.edit-crew-assignment-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const crewId = (e.currentTarget as HTMLElement).getAttribute('data-crew-id');
          const foundCrew = currentProject.crewList.find((c) => c.crewId === crewId);
          if (foundCrew) {
            openManageGearModal(currentProject, foundCrew, equipmentList, projects, () => {
              renderActiveSubtabContent();
            });
          }
        });
      });

      // Attach Remove Crew Handlers
      crewCard.querySelectorAll('.remove-crew-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const crewId = (e.currentTarget as HTMLElement).getAttribute('data-crew-id');
          const foundCrew = currentProject.crewList.find((c) => c.crewId === crewId);
          if (foundCrew) {
            new ModalDialog({
              title: 'Confirm Remove Crew Member',
              contentHtml: `<p style="color: var(--color-foreground-muted);">Are you sure you want to remove <strong>${foundCrew.name}</strong> from project <strong>"${currentProject.projectName}"</strong>?</p>`,
              confirmText: 'Remove Crew',
              cancelText: 'Cancel',
              onConfirm: async () => {
                currentProject.crewList = currentProject.crewList.filter((c) => c.crewId !== crewId);
                await DataService.updateProject(currentProject.id, currentProject);
                renderActiveSubtabContent();
              }
            }).open();
          }
        });
      });
    }
  };

  renderSubtabsNav();
  renderActiveSubtabContent();

  // Attach Event Listeners
  titleBar.querySelector('#btn-back-to-projects')?.addEventListener('click', () => {
    if (onNavigate) onNavigate('project-management');
  });
}

/**
 * SIGN QMG MODAL (Quality & Media Guarantee)
 */
function openSignQmgModal(contentProds: ContentProductionItem[], crewDirectory: CrewMember[], onSigned: () => void): void {
  const modalHtml = `
    <div>
      <div style="font-size: var(--text-sm); color: var(--color-foreground-muted); margin-bottom: var(--space-4);">
        Official Quality & Media Guarantee (QMG) Verification for Production Media Assets.
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Select Media Asset for QMG Sign-Off</label>
        <select class="form-control" id="qmg-asset-select">
          ${contentProds
      .map(
        (cp) => `
            <option value="${cp.id}">${cp.title} (${cp.status})</option>
          `
      )
      .join('')}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Signer / Auditor Name (From Crew Directory)</label>
          <select class="form-control" id="qmg-signer-select">
            ${crewDirectory
      .map(
        (crew) => `
              <option value="${crew.name}">${crew.name} (${crew.role})</option>
            `
      )
      .join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Sign Date</label>
          <input type="date" class="form-control" id="qmg-date-input" value="${new Date().toISOString().split('T')[0]}" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">QMG Quality Assessment & Approval Notes</label>
        <textarea class="form-control" id="qmg-notes-input" rows="3" placeholder="e.g. Master ProRes video verified on 8K LED test wall. No frame drops, color profile 100% compliant."></textarea>
      </div>
    </div>
  `;

  new ModalDialog({
    title: 'Sign Quality & Media Guarantee (QMG)',
    contentHtml: modalHtml,
    confirmText: 'Sign & Issue QMG Certificate',
    cancelText: 'Cancel',
    onConfirm: () => {
      const assetSelect = document.getElementById('qmg-asset-select') as HTMLSelectElement;
      const signerSelect = document.getElementById('qmg-signer-select') as HTMLSelectElement;
      const dateInput = document.getElementById('qmg-date-input') as HTMLInputElement;

      const assetId = assetSelect?.value;
      const signerName = signerSelect?.value || 'Devon Takahashi';
      const signDate = dateInput?.value || new Date().toISOString().split('T')[0];

      const foundCp = contentProds.find((c) => c.id === assetId);
      if (foundCp) {
        foundCp.qmgSignedOff = true;
        foundCp.qmgSignerName = signerName;
        foundCp.qmgSignDate = signDate;
        foundCp.status = 'Approved';
      }

      onSigned();
    }
  }).open();
}

/**
 * ADD REVISION MODAL (Focus only on revision notes / feedback)
 */
function openAddRevisionModal(cp: ContentProductionItem, onUpdated: () => void): void {
  const modalHtml = `
    <div>
      <div style="font-size: var(--text-sm); color: var(--color-foreground-muted); margin-bottom: var(--space-4);">
        Submit a new revision note / feedback for <strong>${cp.title}</strong>.
      </div>

      <div class="form-group">
        <label class="form-label">Revision Change Notes / Feedback Details</label>
        <textarea class="form-control" id="add-rev-notes" rows="4" placeholder="Describe revisions, color adjustments, or feedback..."></textarea>
      </div>
    </div>
  `;

  new ModalDialog({
    title: `Add Revision: ${cp.title}`,
    contentHtml: modalHtml,
    confirmText: 'Save Revision Note',
    cancelText: 'Cancel',
    onConfirm: () => {
      const notesEl = document.getElementById('add-rev-notes') as HTMLTextAreaElement;
      const notes = notesEl?.value.trim() || 'Revision update submitted.';

      if (!cp.revisions) {
        cp.revisions = [];
      }

      const nextVerNum = cp.revisions.length + 1;
      const version = `v1.${nextVerNum}`;
      const today = new Date().toISOString().split('T')[0];

      // Add revision entry at the beginning (unshift)
      cp.revisions.unshift({
        id: `rev-${Date.now()}`,
        version,
        updatedAt: today,
        editorName: cp.editorName,
        notes,
        fileSize: cp.revisions[0]?.fileSize || '1.2 GB'
      });

      // Change status to Revision automatically so workflow is clear
      cp.status = 'Revision';

      onUpdated();
    }
  }).open();
}

function openRevisionHistoryModal(cp: ContentProductionItem, onStatusChanged: () => void): void {
  const revisionsList = cp.revisions || [
    {
      id: 'rev-1',
      version: 'v1.0 (Initial Render)',
      updatedAt: '2026-08-18',
      editorName: cp.editorName,
      notes: 'Initial export approved for master playback.',
      fileSize: '1.2 GB'
    }
  ];

  const modalHtml = `
    <div>
      <div style="font-size: var(--text-sm); color: var(--color-foreground-muted); margin-bottom: var(--space-4);">
        Revision and version changes history for <strong>${cp.title}</strong> (${cp.resolution})
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 12px; align-items: center; flex-wrap: wrap;">
        ${cp.fileUrl ? `<a href="${cp.fileUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="text-decoration: none;">🔗 Open Active Media File Link ↗</a>` : ''}
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${revisionsList
      .map(
        (rev: ContentRevisionHistory, idx: number) => `
          <div style="padding: 16px 18px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-left: 4px solid ${idx === 0 ? 'var(--color-accent)' : 'var(--color-border-strong)'}; border-radius: var(--radius-md);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="font-mono" style="font-size: var(--text-sm); font-weight: bold; color: var(--color-foreground);">${rev.version}</span>
                ${idx === 0 ? `<span class="badge badge-orange"><span class="badge-dot"></span>Latest</span>` : ''}
                ${rev.isImplemented
            ? `<span class="badge badge-success" style="font-size: 10px; font-weight: bold; padding: 2px 8px;"><span class="badge-dot"></span>Implemented</span>`
            : `<button class="btn btn-secondary btn-xs mark-rev-implemented-btn" data-rev-id="${rev.id}" style="font-size: 10px; padding: 2px 8px; font-weight: 600;">Mark Implemented</button>`
          }
              </div>
              <div class="font-mono" style="font-size: 11px; color: var(--color-foreground-subtle);">${rev.updatedAt}</div>
            </div>

            <div style="font-size: var(--text-xs); color: var(--color-foreground-muted); margin-bottom: 6px;">
              <strong>Editor:</strong> ${rev.editorName} ${rev.fileSize ? `&bull; <strong>File Size:</strong> <span class="font-mono">${rev.fileSize}</span>` : ''}
            </div>

            <div style="font-size: var(--text-xs); color: var(--color-foreground); padding: 8px 12px; background: var(--color-bg); border-radius: var(--radius-sm); border-left: 2px solid var(--color-border-strong);">
              "${rev.notes}"
            </div>
          </div>
        `
      )
      .join('')}
      </div>
    </div>
  `;

  const dialog = new ModalDialog({
    title: `Revision History: ${cp.title}`,
    contentHtml: modalHtml,
    confirmText: 'Close Revisions'
  });
  dialog.open();

  document.querySelectorAll('.mark-rev-implemented-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const revId = (e.currentTarget as HTMLElement).getAttribute('data-rev-id');
      const foundRev = revisionsList.find((r) => r.id === revId);
      if (foundRev) {
        foundRev.isImplemented = true;
        // Automatically mark the main production item status as Implemented too
        cp.status = 'Implemented';
        onStatusChanged();
        dialog.close();
      }
    });
  });
}

function openAddMediaAssetModal(crewDirectory: CrewMember[], onAdded: (asset: ContentProductionItem) => void): void {
  const modalHtml = `
    <div>
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Content Production Title</label>
        <input type="text" class="form-control" id="new-media-title" placeholder="e.g. Stage Opening 3D Motion Intro Reel" />
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">External File Link / URL (Optional)</label>
        <input type="url" class="form-control" id="new-media-file-url" placeholder="e.g. https://drive.google.com/file/d/..." />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Asset Type</label>
          <select class="form-control" id="new-media-type">
            ${CategoryStoreService.getCategories('content')
      .map((cat) => `<option>${cat}</option>`)
      .join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Target Resolution</label>
          <input type="text" class="form-control" id="new-media-res" value="1920 x 1080 (FHD)" placeholder="e.g. 1920 x 1080 (FHD)" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Assigned Lead Editor (Crew Directory)</label>
          <select class="form-control" id="new-media-editor">
            ${crewDirectory
      .map((crew) => `<option value="${crew.name}">${crew.name} (${crew.role})</option>`)
      .join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Initial Status</label>
          <select class="form-control" id="new-media-status">
            <option>On-Progress</option>
            <option>Revision</option>
            <option>In Rendering</option>
            <option>Approved</option>
            <option>Revision Needed</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Initial Revision Version & File Size</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <input type="text" class="form-control" id="new-media-ver" placeholder="e.g. v1.0" />
          <input type="text" class="form-control" id="new-media-size" placeholder="e.g. 1.2 GB" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Initial Change Notes / Director Instructions</label>
        <textarea class="form-control" id="new-media-notes" rows="3" placeholder="Enter notes or render specs..."></textarea>
      </div>
    </div>
  `;

  new ModalDialog({
    title: 'Add New Content Production Media Asset',
    contentHtml: modalHtml,
    confirmText: 'Save Media Asset',
    cancelText: 'Cancel',
    onConfirm: () => {
      const titleEl = document.getElementById('new-media-title') as HTMLInputElement;
      const fileUrlEl = document.getElementById('new-media-file-url') as HTMLInputElement;
      const typeEl = document.getElementById('new-media-type') as HTMLSelectElement;
      const resEl = document.getElementById('new-media-res') as HTMLInputElement;
      const editorEl = document.getElementById('new-media-editor') as HTMLSelectElement;
      const statusEl = document.getElementById('new-media-status') as HTMLSelectElement;
      const verEl = document.getElementById('new-media-ver') as HTMLInputElement;
      const sizeEl = document.getElementById('new-media-size') as HTMLInputElement;
      const notesEl = document.getElementById('new-media-notes') as HTMLTextAreaElement;

      const title = titleEl?.value.trim() || 'New Content Production Asset';
      const fileUrl = fileUrlEl?.value.trim() || undefined;
      const type = (typeEl?.value || '3D Motion Graphics') as any;
      const resolution = resEl?.value.trim() || '1920 x 1080 (FHD)';
      const editorName = editorEl?.value || 'Marcus Wright';
      const status = (statusEl?.value || 'Revision') as any;
      const version = verEl?.value.trim() || 'v1.0 (Initial Render)';
      const fileSize = sizeEl?.value.trim() || '1.2 GB';
      const notes = notesEl?.value.trim() || 'Initial render export created.';

      const today = new Date().toISOString().split('T')[0];

      const newAsset: ContentProductionItem = {
        id: `cp-${Date.now()}`,
        title,
        type,
        resolution,
        status,
        editorName,
        fileUrl,
        revisions: [
          {
            id: `rev-${Date.now()}`,
            version,
            updatedAt: today,
            editorName,
            notes,
            fileSize
          }
        ]
      };

      onAdded(newAsset);
    }
  }).open();
}

/**
 * EDIT MEDIA ASSET MODAL
 */
function openEditMediaAssetModal(
  cp: ContentProductionItem,
  crewDirectory: CrewMember[],
  onSaved: () => void
): void {
  const modalHtml = `
    <div>
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Content Production Title</label>
        <input type="text" class="form-control" id="edit-media-asset-title" value="${cp.title}" placeholder="e.g. Stage Opening 3D Motion Intro Reel" />
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">External File Link / URL (Optional)</label>
        <input type="url" class="form-control" id="edit-media-asset-file-url" value="${cp.fileUrl || ''}" placeholder="e.g. https://drive.google.com/file/d/..." />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Asset Type</label>
          <select class="form-control" id="edit-media-asset-type">
            ${CategoryStoreService.getCategories('content')
      .map((cat) => `<option ${cp.type === cat ? 'selected' : ''}>${cat}</option>`)
      .join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Resolution / Aspect Ratio</label>
          <input type="text" class="form-control" id="edit-media-asset-res" value="${cp.resolution}" placeholder="e.g. 1920 x 1080 (FHD)" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Assigned Lead Editor (Crew Directory)</label>
          <select class="form-control" id="edit-media-asset-editor">
            ${crewDirectory
      .map((crew) => `<option value="${crew.name}" ${cp.editorName === crew.name ? 'selected' : ''}>${crew.name} (${crew.role})</option>`)
      .join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Asset Status</label>
          <select class="form-control" id="edit-media-asset-status">
            ${['On-Progress', 'Revision', 'In Rendering', 'Approved', 'Revision Needed', 'Implemented']
      .map((st) => `<option ${cp.status === st ? 'selected' : ''}>${st}</option>`)
      .join('')}
          </select>
        </div>
      </div>
    </div>
  `;

  new ModalDialog({
    title: 'Edit Content Production Media Asset',
    contentHtml: modalHtml,
    confirmText: 'Save Changes',
    cancelText: 'Cancel',
    onConfirm: () => {
      const titleEl = document.getElementById('edit-media-asset-title') as HTMLInputElement;
      const fileUrlEl = document.getElementById('edit-media-asset-file-url') as HTMLInputElement;
      const typeEl = document.getElementById('edit-media-asset-type') as HTMLSelectElement;
      const resEl = document.getElementById('edit-media-asset-res') as HTMLInputElement;
      const editorEl = document.getElementById('edit-media-asset-editor') as HTMLSelectElement;
      const statusEl = document.getElementById('edit-media-asset-status') as HTMLSelectElement;

      cp.title = titleEl?.value.trim() || cp.title;
      cp.fileUrl = fileUrlEl?.value.trim() || undefined;
      cp.type = (typeEl?.value || cp.type) as any;
      cp.resolution = resEl?.value.trim() || cp.resolution;
      cp.editorName = editorEl?.value || cp.editorName;
      cp.status = (statusEl?.value || cp.status) as any;

      onSaved();
    }
  }).open();
}

/**
 * ASSIGN CREW & GEAR MODAL
 */
function openAssignCrewModal(
  project: ProjectRecord,
  crewDirectory: CrewMember[],
  equipmentList: EquipmentItem[],
  projects: ProjectRecord[],
  onSaved: () => void
): void {
  const getEqAllocatedCount = (eqId: string): number => {
    let count = 0;
    projects.forEach((p) => {
      if (p.status !== 'Completed') {
        p.crewList?.forEach((crew) => {
          if (crew.assignedEquipmentIds?.includes(eqId)) {
            count++;
          }
        });
      }
    });
    return count;
  };

  const modalHtml = `
    <div>
      <div style="font-size: var(--text-sm); color: var(--color-foreground-muted); margin-bottom: var(--space-4);">
        Assign a crew member from Data Crew Directory to <strong>"${project.projectName}"</strong> and allocate their equipment gear.
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Select Crew Member (From Data Crew Directory)</label>
        <select class="form-control" id="assign-crew-member-select">
          ${crewDirectory.length === 0
      ? `<option value="">No crew members found in directory</option>`
      : crewDirectory
        .map(
          (c) => `<option value="${c.id}" data-name="${c.name}" data-role="${c.role}" data-phone="${c.phone}">${c.name} &mdash; ${c.role} (${c.phone})</option>`
        )
        .join('')
    }
        </select>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Assignment Role for this Project</label>
        <input type="text" class="form-control" id="assign-crew-role-input" value="${crewDirectory[0] ? crewDirectory[0].role : 'Camera Operator'}" placeholder="e.g. Lead Camera Operator / Tech" />
      </div>

      <div class="form-group">
        <label class="form-label" style="margin-bottom: 8px;">Select Equipment Gear to Allocate (Check all that apply)</label>
        <div style="max-height: 250px; overflow-y: auto; padding: 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px;">
          ${equipmentList.length === 0
      ? `<div style="font-size: 12px; color: var(--color-foreground-subtle); padding: 8px; text-align: center;">No equipment gear items in inventory</div>`
      : equipmentList
        .map((eq) => {
          const allocated = getEqAllocatedCount(eq.id);
          const remaining = Math.max(0, eq.quantity - allocated);
          const isAvailable = (eq.status === 'Available' || eq.status === 'In Use') && remaining > 0;

          return `
            <div class="premium-gear-card ${isAvailable ? '' : 'disabled'}" 
                 data-eq-id="${eq.id}" 
                 style="display: flex; gap: 14px; padding: 14px 16px; background: var(--color-surface-elevated, #18181b); border: 1px solid var(--color-border, rgba(255,255,255,0.08)); border-radius: 12px; cursor: ${isAvailable ? 'pointer' : 'not-allowed'}; opacity: ${isAvailable ? 1 : 0.55}; transition: all 0.2s ease-in-out; position: relative;"
                 onclick="const cb = this.querySelector('input'); if (cb && !cb.disabled) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); this.classList.toggle('selected', cb.checked); }"
            >
              <div style="display: flex; align-items: center; height: 20px;">
                <input type="checkbox" class="assign-gear-checkbox" value="${eq.id}" 
                       ${!isAvailable ? 'disabled' : ''} 
                       style="width: 18px; height: 18px; cursor: ${isAvailable ? 'pointer' : 'not-allowed'}; accent-color: var(--color-accent, #3b82f6);"
                       onclick="event.stopPropagation();"
                       onchange="this.closest('.premium-gear-card').classList.toggle('selected', this.checked);"
                />
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; width: 100%;">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <strong style="color: var(--color-foreground, #ffffff); font-size: 13.5px;">${eq.name}</strong>
                    <span style="font-size: 10px; color: var(--color-foreground-muted, #a1a1aa); background: var(--color-surface, rgba(255,255,255,0.04)); padding: 2px 8px; border-radius: 99px; font-weight: 600; border: 1px solid rgba(255,255,255,0.04);">${eq.category}</span>
                  </div>
                  <div>
                    ${isAvailable 
                      ? `<span class="badge badge-success" style="font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px;">
                           <span class="badge-dot"></span> ${remaining} of ${eq.quantity} Available
                         </span>`
                      : `<span class="badge badge-destructive" style="font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px;">
                           <span class="badge-dot" style="background-color: var(--color-destructive);"></span> ${eq.status === 'Maintenance' ? 'In Maintenance' : eq.status === 'Retired' ? 'Retired' : 'Out of Stock'}
                         </span>`
                    }
                  </div>
                </div>

                <div style="font-size: 11px; color: var(--color-foreground-muted, #a1a1aa); display: flex; flex-direction: column; gap: 4px; line-height: 1.4;">
                  <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <span><strong>S/N:</strong> <span class="font-mono" style="color: var(--color-foreground-strong, #ffffff);">${eq.serialNumber}</span></span>
                    <span><strong>Status:</strong> <span style="color: ${eq.status === 'Available' ? 'var(--color-success)' : 'var(--color-warning)'}">${eq.status}</span></span>
                  </div>
                  ${eq.bundledTools && eq.bundledTools.length > 0 
                    ? `<div style="background: rgba(0,0,0,0.15); padding: 6px 10px; border-radius: 6px; border-left: 3px solid var(--color-border-strong, #3f3f46); margin-top: 4px;">
                         <strong style="color: var(--color-foreground-strong, #ffffff);">Included Accessories:</strong> ${eq.bundledTools.join(', ')}
                       </div>` 
                    : ''
                  }
                  ${eq.additionalNotes 
                    ? `<div style="font-style: italic; color: var(--color-foreground-subtle, #71717a); font-size: 11px;">"${eq.additionalNotes}"</div>` 
                    : ''
                  }
                </div>
              </div>
            </div>
          `;
        })
        .join('')
    }
        </div>
      </div>
    </div>
    
    <style>
      .premium-gear-card:hover:not(.disabled) {
        border-color: var(--color-accent-strong, #2563eb) !important;
        background: var(--color-surface-hover, #242427) !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .premium-gear-card.selected {
        border-color: var(--color-accent, #3b82f6) !important;
        background: linear-gradient(145deg, var(--color-surface-elevated, #18181b), rgba(59, 130, 246, 0.06)) !important;
        box-shadow: 0 0 0 1px var(--color-accent, #3b82f6);
      }
    </style>
  `;

  const dialog = new ModalDialog({
    title: `Assign Crew Member & Equipment Gear`,
    contentHtml: modalHtml,
    confirmText: 'Assign to Project',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const selectEl = document.getElementById('assign-crew-member-select') as HTMLSelectElement;
      const roleInput = document.getElementById('assign-crew-role-input') as HTMLInputElement;
      const checkboxes = document.querySelectorAll('.assign-gear-checkbox:checked') as NodeListOf<HTMLInputElement>;

      const selectedOption = selectEl?.options[selectEl.selectedIndex];
      if (!selectedOption || !selectedOption.value) return;

      const crewId = selectedOption.value;
      const name = selectedOption.getAttribute('data-name') || selectedOption.text.split(' — ')[0];
      const role = roleInput?.value.trim() || selectedOption.getAttribute('data-role') || 'Crew Member';
      const phone = selectedOption.getAttribute('data-phone') || '';

      const assignedEquipmentIds: string[] = [];
      checkboxes.forEach((cb) => {
        if (cb.value) assignedEquipmentIds.push(cb.value);
      });

      if (!project.crewList) project.crewList = [];

      const existingIndex = project.crewList.findIndex((c) => c.crewId === crewId);
      if (existingIndex !== -1) {
        project.crewList[existingIndex].role = role;
        project.crewList[existingIndex].assignedEquipmentIds = assignedEquipmentIds;
      } else {
        project.crewList.push({
          crewId,
          name,
          role,
          phone,
          assignedEquipmentIds,
          sopCompleted: false
        });
      }

      await DataService.updateProject(project.id, project);
      onSaved();
    }
  });

  dialog.open();

  setTimeout(() => {
    const selectEl = document.getElementById('assign-crew-member-select') as HTMLSelectElement;
    const roleInput = document.getElementById('assign-crew-role-input') as HTMLInputElement;

    selectEl?.addEventListener('change', () => {
      const opt = selectEl.options[selectEl.selectedIndex];
      if (opt && roleInput) {
        const defaultRole = opt.getAttribute('data-role');
        if (defaultRole) roleInput.value = defaultRole;
      }
    });
  }, 50);
}

/**
 * MANAGE GEAR MODAL
 */
function openManageGearModal(
  project: ProjectRecord,
  crewAssignment: ProjectCrewAssignment,
  equipmentList: EquipmentItem[],
  projects: ProjectRecord[],
  onSaved: () => void
): void {
  const getEqAllocatedCount = (eqId: string): number => {
    let count = 0;
    projects.forEach((p) => {
      if (p.status !== 'Completed') {
        p.crewList?.forEach((crew) => {
          if (crew.assignedEquipmentIds?.includes(eqId)) {
            count++;
          }
        });
      }
    });
    return count;
  };

  const modalHtml = `
    <div>
      <div style="font-size: var(--text-sm); color: var(--color-foreground-muted); margin-bottom: var(--space-4);">
        Update assigned equipment gear for <strong>${crewAssignment.name}</strong> (${crewAssignment.phone}).
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Role for this Project</label>
        <input type="text" class="form-control" id="manage-crew-role-input" value="${crewAssignment.role}" />
      </div>

      <div class="form-group">
        <label class="form-label" style="margin-bottom: 8px;">Allocated Equipment Gear List</label>
        <div style="max-height: 250px; overflow-y: auto; padding: 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px;">
          ${equipmentList.length === 0
      ? `<div style="font-size: 12px; color: var(--color-foreground-subtle); padding: 8px; text-align: center;">No equipment gear items in inventory</div>`
      : equipmentList
        .map((eq) => {
          const isCurrentlyAssigned = crewAssignment.assignedEquipmentIds.includes(eq.id);
          const allocated = getEqAllocatedCount(eq.id);
          const remaining = Math.max(0, eq.quantity - allocated);
          const adjustedRemaining = remaining + (isCurrentlyAssigned ? 1 : 0);
          const isAvailable = (eq.status === 'Available' || eq.status === 'In Use') && adjustedRemaining > 0;

          return `
            <div class="premium-gear-card ${isAvailable ? '' : 'disabled'} ${isCurrentlyAssigned ? 'selected' : ''}" 
                 data-eq-id="${eq.id}" 
                 style="display: flex; gap: 14px; padding: 14px 16px; background: var(--color-surface-elevated, #18181b); border: 1px solid var(--color-border, rgba(255,255,255,0.08)); border-radius: 12px; cursor: ${isAvailable ? 'pointer' : 'not-allowed'}; opacity: ${isAvailable ? 1 : 0.55}; transition: all 0.2s ease-in-out; position: relative;"
                 onclick="const cb = this.querySelector('input'); if (cb && !cb.disabled) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); this.classList.toggle('selected', cb.checked); }"
            >
              <div style="display: flex; align-items: center; height: 20px;">
                <input type="checkbox" class="manage-gear-checkbox" value="${eq.id}" ${isCurrentlyAssigned ? 'checked' : ''} 
                       ${!isAvailable ? 'disabled' : ''} 
                       style="width: 18px; height: 18px; cursor: ${isAvailable ? 'pointer' : 'not-allowed'}; accent-color: var(--color-accent, #3b82f6);"
                       onclick="event.stopPropagation();"
                       onchange="this.closest('.premium-gear-card').classList.toggle('selected', this.checked);"
                />
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; width: 100%;">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <strong style="color: var(--color-foreground, #ffffff); font-size: 13.5px;">${eq.name}</strong>
                    <span style="font-size: 10px; color: var(--color-foreground-muted, #a1a1aa); background: var(--color-surface, rgba(255,255,255,0.04)); padding: 2px 8px; border-radius: 99px; font-weight: 600; border: 1px solid rgba(255,255,255,0.04);">${eq.category}</span>
                  </div>
                  <div>
                    ${isAvailable 
                      ? `<span class="badge badge-success" style="font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px;">
                           <span class="badge-dot"></span> ${adjustedRemaining} of ${eq.quantity} Available
                         </span>`
                      : `<span class="badge badge-destructive" style="font-size: 10.5px; font-weight: 600; padding: 3px 10px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px;">
                           <span class="badge-dot" style="background-color: var(--color-destructive);"></span> ${eq.status === 'Maintenance' ? 'In Maintenance' : eq.status === 'Retired' ? 'Retired' : 'Out of Stock'}
                         </span>`
                    }
                  </div>
                </div>

                <div style="font-size: 11px; color: var(--color-foreground-muted, #a1a1aa); display: flex; flex-direction: column; gap: 4px; line-height: 1.4;">
                  <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <span><strong>S/N:</strong> <span class="font-mono" style="color: var(--color-foreground-strong, #ffffff);">${eq.serialNumber}</span></span>
                    <span><strong>Status:</strong> <span style="color: ${eq.status === 'Available' ? 'var(--color-success)' : 'var(--color-warning)'}">${eq.status}</span></span>
                  </div>
                  ${eq.bundledTools && eq.bundledTools.length > 0 
                    ? `<div style="background: rgba(0,0,0,0.15); padding: 6px 10px; border-radius: 6px; border-left: 3px solid var(--color-border-strong, #3f3f46); margin-top: 4px;">
                         <strong style="color: var(--color-foreground-strong, #ffffff);">Included Accessories:</strong> ${eq.bundledTools.join(', ')}
                       </div>` 
                    : ''
                  }
                  ${eq.additionalNotes 
                    ? `<div style="font-style: italic; color: var(--color-foreground-subtle, #71717a); font-size: 11px;">"${eq.additionalNotes}"</div>` 
                    : ''
                  }
                </div>
              </div>
            </div>
          `;
        })
        .join('')
    }
        </div>
      </div>
    </div>
    
    <style>
      .premium-gear-card:hover:not(.disabled) {
        border-color: var(--color-accent-strong, #2563eb) !important;
        background: var(--color-surface-hover, #242427) !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .premium-gear-card.selected {
        border-color: var(--color-accent, #3b82f6) !important;
        background: linear-gradient(145deg, var(--color-surface-elevated, #18181b), rgba(59, 130, 246, 0.06)) !important;
        box-shadow: 0 0 0 1px var(--color-accent, #3b82f6);
      }
    </style>
  `;

  const dialog = new ModalDialog({
    title: `Manage Gear & Role: ${crewAssignment.name}`,
    contentHtml: modalHtml,
    confirmText: 'Save Gear Changes',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const roleInput = document.getElementById('manage-crew-role-input') as HTMLInputElement;
      const checkboxes = document.querySelectorAll('.manage-gear-checkbox:checked') as NodeListOf<HTMLInputElement>;

      const role = roleInput?.value.trim() || crewAssignment.role;

      const assignedEquipmentIds: string[] = [];
      checkboxes.forEach((cb) => {
        if (cb.value) assignedEquipmentIds.push(cb.value);
      });

      crewAssignment.role = role;
      crewAssignment.assignedEquipmentIds = assignedEquipmentIds;

      await DataService.updateProject(project.id, project);
      onSaved();
    }
  });

  dialog.open();
}
