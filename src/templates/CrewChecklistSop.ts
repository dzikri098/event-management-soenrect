/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — CREW EVENT DAY CHECKLIST & SOP MANAGER
   Features: Crew member SOP checklist for event day tasks.
   Dynamic checklist step boxes with + Add Step button, and completion progress tracking.
   ========================================================================== */

import { ApplicationViewState } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { CrewSopChecklist, SopTask } from '../types/database';
import { ModalDialog } from '../components/overlays/ModalDialog';
import { CategoryStoreService } from '../services/categoryStore';

import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';

export async function renderCrewChecklistSop(
  container: HTMLElement,
  viewState: ApplicationViewState
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
        { label: 'Crew SOP Checklist & Manager' }
      ])}
      <h1>
        Crew Event Day Checklist & SOP Manager
        <span class="badge badge-orange"><span class="badge-dot"></span>Field Compliance</span>
      </h1>
      <div class="page-title-description">Standard Operating Procedures (SOP), pre-event equipment calibration, and safety sign-off checklists.</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary btn-sm" id="btn-create-sop">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Create SOP Template
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') {
    return;
  }

  const sopChecklists = await DataService.getSopChecklists();

  // Render Checklist Cards for Each Crew Member Assigned
  const checklistGrid = document.createElement('div');
  checklistGrid.style.display = 'flex';
  checklistGrid.style.flexDirection = 'column';
  checklistGrid.style.gap = 'var(--space-6)';

  sopChecklists.forEach((sop: CrewSopChecklist) => {
    const completedCount = sop.tasks.filter((t: SopTask) => t.isCompleted).length;
    const progressPercent = Math.round((completedCount / (sop.tasks.length || 1)) * 100);

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-header" style="margin-bottom: var(--space-4);">
        <div>
          <h2 style="font-size: var(--text-lg); font-weight: bold; color: var(--color-foreground); margin: 0;">
            ${sop.projectName || sop.crewName || 'SOP Template'}
          </h2>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--color-foreground-subtle);">Completion Progress</div>
            <div class="font-mono" style="font-size: var(--text-base); font-weight: bold; color: var(--color-accent);">${progressPercent}% (${completedCount}/${sop.tasks.length})</div>
          </div>
          <div class="btn-group">
            <button class="btn btn-tertiary btn-sm edit-sop-rules-btn" data-id="${sop.id}">Manage SOP &rarr;</button>
            <button class="btn btn-destructive btn-sm delete-sop-btn" data-id="${sop.id}" title="Delete SOP Template">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- PROGRESS BAR -->
      <div style="width: 100%; height: 6px; background-color: var(--color-surface-elevated); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-5);">
        <div style="width: ${progressPercent}%; height: 100%; background-color: var(--color-accent); transition: width var(--duration-fast) var(--ease-standard);"></div>
      </div>

      <!-- TASK CHECKLIST LIST -->
      <div style="display: flex; flex-direction: column; gap: var(--space-2-5);">
        ${
          sop.tasks.length === 0
            ? `<div style="font-size: 12px; color: var(--color-foreground-muted); padding: 12px; text-align: center;">No checklist steps defined yet. Click "Manage SOP" to add steps.</div>`
            : sop.tasks
                .map(
                  (task: SopTask) => `
                <label style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <input type="checkbox" class="checkbox-input sop-task-checkbox" data-sop-id="${sop.id}" data-task-id="${task.id}" ${task.isCompleted ? 'checked' : ''} />
                    <div>
                      <div style="font-size: var(--text-sm); font-weight: 500; color: var(--color-foreground); ${task.isCompleted ? 'text-decoration: line-through; opacity: 0.7;' : ''}">&bull; ${task.title}</div>
                    </div>
                  </div>
                  <span class="badge ${task.category === 'Pre-Event' ? 'badge-neutral' : task.category === 'Showtime' ? 'badge-orange' : 'badge-warning'}">${task.category}</span>
                </label>
              `
                )
                .join('')
        }
      </div>
    `;

    checklistGrid.appendChild(card);
  });

  container.appendChild(checklistGrid);

  // Attach Checkbox Handlers with Supabase Persistence
  checklistGrid.querySelectorAll('.sop-task-checkbox').forEach((cb) => {
    cb.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const sopId = target.getAttribute('data-sop-id');
      const taskId = target.getAttribute('data-task-id');
      const foundSop = sopChecklists.find((s) => s.id === sopId);
      if (foundSop) {
        const t = foundSop.tasks.find((tk: SopTask) => tk.id === taskId);
        if (t) {
          t.isCompleted = target.checked;
          await DataService.updateSopChecklist(foundSop);
          renderCrewChecklistSop(container, viewState);
        }
      }
    });
  });

  // Attach Edit SOP Rules Button Handler
  checklistGrid.querySelectorAll('.edit-sop-rules-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const sopId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      const foundSop = sopChecklists.find((s) => s.id === sopId);
      if (foundSop) {
        openSopFormModal(foundSop, () => renderCrewChecklistSop(container, viewState));
      }
    });
  });

  // Attach Delete SOP Handler
  checklistGrid.querySelectorAll('.delete-sop-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const sopId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      if (sopId) {
        new ModalDialog({
          title: 'Confirm Delete SOP Template',
          contentHtml: '<p style="color: var(--color-foreground-muted);">Are you sure you want to permanently delete this SOP template and its checklist steps?</p>',
          confirmText: 'Delete Permanently',
          cancelText: 'Cancel',
          onConfirm: async () => {
            await DataService.deleteSopChecklist(sopId);
            renderCrewChecklistSop(container, viewState);
          }
        }).open();
      }
    });
  });

  // Create SOP Handler Trigger
  titleBar.querySelector('#btn-create-sop')?.addEventListener('click', () => {
    openSopFormModal(undefined, () => renderCrewChecklistSop(container, viewState));
  });
}

/**
 * Open SOP Creation / Editing Modal with Dynamic Checklist Step Boxes
 */
function openSopFormModal(existingSop?: CrewSopChecklist, onSaved?: () => void): void {
  const tasksList = existingSop?.tasks || [
    { id: 't1', title: 'Verify sensor cleanliness & optical calibration', category: 'Pre-Event', isCompleted: false },
    { id: 't2', title: 'Confirm wireless video signal feed with switcher', category: 'Showtime', isCompleted: false }
  ];

  const modalHtml = `
    <div style="max-height: 75vh; overflow-y: auto; padding-right: 4px;">
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">SOP Title / Template Name</label>
        <input type="text" class="form-control" id="sop-title-input" value="${existingSop ? (existingSop.projectName || existingSop.crewName) : 'Soenrect Live Event SOP Template'}" placeholder="e.g. Broadcast & Live Stream SOP" />
      </div>

      <!-- DYNAMIC CHECKLIST STEP BOXES -->
      <div class="form-group">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <label class="form-label" style="margin: 0;">Checklist Steps (Individual Step Input Boxes)</label>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-add-step-box" style="font-size: 11px;">
            + Add Step Box
          </button>
        </div>

        <div id="sop-steps-container" style="display: flex; flex-direction: column; gap: 10px;">
          ${tasksList
            .map(
              (tk, idx) => `
            <div class="sop-step-box-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
              <span class="font-mono" style="font-size: 11px; color: var(--color-foreground-subtle); min-width: 20px;">#${idx + 1}</span>
              <input type="text" class="form-control sop-step-title-field" value="${tk.title}" placeholder="Enter checklist step description..." style="flex: 1;" />
              <select class="form-control sop-step-cat-field" style="width: 140px;">
                ${CategoryStoreService.getCategories('sop')
                  .map((cat) => `<option ${tk.category === cat ? 'selected' : ''}>${cat}</option>`)
                  .join('')}
              </select>
              <button type="button" class="btn btn-tertiary btn-sm remove-step-box-btn" style="color: var(--color-danger); padding: 4px 8px;" title="Remove Step">
                &times;
              </button>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  const dialog = new ModalDialog({
    title: existingSop ? `Edit SOP: ${existingSop.projectName || existingSop.crewName}` : `Create Dynamic SOP Template`,
    contentHtml: modalHtml,
    confirmText: 'Save SOP Template',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const titleInput = document.getElementById('sop-title-input') as HTMLInputElement;
      const containerEl = document.getElementById('sop-steps-container');

      const projectName = titleInput?.value.trim() || 'Soenrect Event SOP Template';
      const crewName = projectName;
      const crewRole = 'General';

      const stepBoxes = containerEl?.querySelectorAll('.sop-step-box-item') || [];
      const tasks: SopTask[] = [];

      stepBoxes.forEach((box, idx) => {
        const titleField = box.querySelector('.sop-step-title-field') as HTMLInputElement;
        const catField = box.querySelector('.sop-step-cat-field') as HTMLSelectElement;
        const stepTitle = titleField?.value.trim();

        if (stepTitle) {
          tasks.push({
            id: `t-${Date.now()}-${idx + 1}`,
            title: stepTitle,
            category: (catField?.value || 'Pre-Event') as any,
            isCompleted: false
          });
        }
      });

      if (existingSop) {
        await DataService.updateSopChecklist({
          id: existingSop.id,
          projectName,
          crewName,
          crewRole,
          targetRoles: [crewRole],
          tasks: tasks.length > 0 ? tasks : existingSop.tasks
        });
      } else {
        await DataService.createSopChecklist({
          id: `sop-${Date.now()}`,
          projectName,
          crewName,
          crewRole,
          targetRoles: [crewRole],
          tasks: tasks.length > 0 ? tasks : [
            { id: 't1', title: 'Verify sensor cleanliness & optical calibration', category: 'Pre-Event', isCompleted: false },
            { id: 't2', title: 'Confirm wireless video signal feed with switcher', category: 'Showtime', isCompleted: false }
          ]
        });
      }

      if (onSaved) onSaved();
    }
  });

  dialog.open();

  // Wire up dynamic "+ Add Step Box" button after modal renders
  setTimeout(() => {
    const containerEl = document.getElementById('sop-steps-container');
    const addBtn = document.getElementById('btn-add-step-box');

    addBtn?.addEventListener('click', () => {
      if (containerEl) {
        const count = containerEl.children.length + 1;
        const newStepEl = document.createElement('div');
        newStepEl.className = 'sop-step-box-item';
        newStepEl.style.cssText = 'display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);';
        newStepEl.innerHTML = `
          <span class="font-mono" style="font-size: 11px; color: var(--color-foreground-subtle); min-width: 20px;">#${count}</span>
          <input type="text" class="form-control sop-step-title-field" placeholder="Enter checklist step description..." style="flex: 1;" />
          <select class="form-control sop-step-cat-field" style="width: 140px;">
            ${CategoryStoreService.getCategories('sop')
              .map((cat) => `<option>${cat}</option>`)
              .join('')}
          </select>
          <button type="button" class="btn btn-tertiary btn-sm remove-step-box-btn" style="color: var(--color-danger); padding: 4px 8px;" title="Remove Step">
            &times;
          </button>
        `;
        containerEl.appendChild(newStepEl);

        newStepEl.querySelector('.remove-step-box-btn')?.addEventListener('click', () => {
          newStepEl.remove();
        });
      }
    });

    containerEl?.querySelectorAll('.remove-step-box-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        (e.currentTarget as HTMLElement).closest('.sop-step-box-item')?.remove();
      });
    });
  }, 100);
}
