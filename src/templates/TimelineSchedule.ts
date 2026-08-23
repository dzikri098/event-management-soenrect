/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — TIMELINE SCHEDULE & CALENDAR DEADLINES
   Features: Calendar schedule for dates, milestones, and deadlines.
   Additional Description field for context, Google Calendar integration,
   and project association modal.
   ========================================================================== */

import { ApplicationViewState } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { TimelineScheduleEvent, ProjectRecord } from '../types/database';
import { ModalDialog } from '../components/overlays/ModalDialog';
import { StrictDeleteModal } from '../components/overlays/StrictDeleteModal';
import { CategoryStoreService } from '../services/categoryStore';
import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';

/**
 * Generate Google Calendar Event URL
 */
function getGoogleCalendarUrl(evt: TimelineScheduleEvent): string {
  const cleanDate = evt.date.replace(/-/g, '');
  const datesParam = `${cleanDate}/${cleanDate}`;
  const title = `[Soenrect Ops] ${evt.title}`;
  const desc = evt.additionalDescription ? `\nNotes: ${evt.additionalDescription}` : '';
  const details = `Event: ${evt.projectName || 'General Timeline'}\nType: ${evt.type}\nPriority: ${evt.priority}${desc}\nManaged via Soenrect Management Suite.`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${datesParam}&details=${encodeURIComponent(details)}`;
}

function isDateInEvent(targetDate: string, eventDateStr: string): boolean {
  if (!eventDateStr) return false;
  if (eventDateStr === targetDate) return true;
  if (eventDateStr.includes(' to ')) {
    const [start, end] = eventDateStr.split(' to ').map((s) => s.trim());
    if (start && end) {
      return targetDate >= start && targetDate <= end;
    }
  }
  return eventDateStr.includes(targetDate);
}

export async function renderTimelineSchedule(
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
        { label: 'Timeline Schedule & Deadlines' }
      ])}
      <h1>
        Timeline Schedule & Event Deadlines
        <span class="badge badge-orange"><span class="badge-dot"></span>Production Calendar</span>
      </h1>
      <div class="page-title-description">Place dates, load-in milestones, equipment audits, connect deadlines to events, and sync directly to Google Calendar.</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary btn-sm" id="btn-add-deadline">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Deadline / Schedule
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') {
    return;
  }

  const [timelineEvents, projects] = await Promise.all([
    DataService.getTimelineEvents(),
    DataService.getProjects()
  ]);

  let selectedFilterDate: string | null = null;

  // Main Split Grid: Timeline List (Left) & Interactive Calendar View (Right)
  const mainGrid = document.createElement('div');
  mainGrid.className = 'calendar-agenda-grid';
  container.appendChild(mainGrid);

  const renderTimelineContent = () => {
    mainGrid.innerHTML = '';

    const filteredEvents = selectedFilterDate
      ? timelineEvents.filter((evt) => isDateInEvent(selectedFilterDate!, evt.date))
      : timelineEvents;

    // Timeline List Card (Left)
    const timelineCard = document.createElement('div');
    timelineCard.className = 'card';
    timelineCard.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Scheduled Deadlines & Event Milestones (${filteredEvents.length}${selectedFilterDate ? ` of ${timelineEvents.length}` : ''})
            ${
              selectedFilterDate
                ? `<span class="badge badge-accent" style="font-size: 11px;">Filtered Date: ${selectedFilterDate}</span>`
                : ''
            }
          </div>
          <div class="card-subtitle">
            ${
              selectedFilterDate
                ? `Showing events for date: <strong>${selectedFilterDate}</strong>. Click the date again on the calendar or click Clear Filter to view all dates.`
                : `Click any calendar date on the right to filter timeline events by date.`
            }
          </div>
        </div>
        ${
          selectedFilterDate
            ? `<button class="btn btn-secondary btn-sm" id="btn-clear-date-filter" style="margin-left: auto;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Clear Filter
              </button>`
            : ''
        }
      </div>

      <div class="timeline-items-list" style="display: flex; flex-direction: column; gap: var(--space-4);">
        ${
          filteredEvents.length === 0
            ? `
              <div style="padding: 36px 20px; text-align: center; color: var(--color-foreground-muted); background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                <div style="font-size: 15px; font-weight: 600; color: var(--color-foreground); margin-bottom: 4px;">No Scheduled Events for ${selectedFilterDate}</div>
                <div style="font-size: 12px; color: var(--color-foreground-subtle); margin-bottom: 16px;">There are no deadlines, milestones, or project events scheduled on this specific date.</div>
                <button class="btn btn-secondary btn-sm" id="btn-empty-clear-filter">Show All Events</button>
              </div>
            `
            : filteredEvents
                .map((evt) => {
                  const typeBadge =
                    evt.type === 'Deadline'
                      ? 'badge-warning'
                      : evt.type === 'Event Day'
                      ? 'badge-orange'
                      : 'badge-neutral';

                  const gcalUrl = getGoogleCalendarUrl(evt);

                  const defaultDesc =
                    evt.additionalDescription ||
                    (evt.type === 'Equipment Audit'
                      ? 'Complete sensor calibration, optical coating check, and wireless mic frequency scan.'
                      : evt.type === 'Deadline'
                      ? 'Final render delivery and QMG certificate sign-off required prior to doors open.'
                      : 'On-site technical setup and signal feed routing with OB Van.');

                  return `
                    <div class="agenda-item-card timeline-block" data-id="${evt.id}" style="border-left-width: 4px; padding: 14px; background: var(--color-surface-elevated); border-radius: var(--radius-lg); border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
                      
                      <!-- HEADER ROW: DATE & BADGES -->
                      <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                          <div class="agenda-time-pill font-mono" style="font-size: 11.5px; font-weight: 700; color: var(--color-accent); display: inline-flex; align-items: center; gap: 6px;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <span>${evt.date}</span>
                          </div>
                          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            ${evt.isAutoCreated ? `<span class="badge badge-accent" style="font-size: 10px; font-weight: 600;">Auto: Project</span>` : ''}
                            <span class="badge ${typeBadge}"><span class="badge-dot"></span>${evt.type}</span>
                            <span class="badge badge-neutral" style="font-size: 10px;">Priority: ${evt.priority}</span>
                          </div>
                        </div>
                      </div>

                      <!-- EVENT TITLE -->
                      <div class="agenda-title" style="font-size: 15px; font-weight: 700; color: var(--color-foreground); line-height: 1.3; word-break: break-word;">${evt.title}</div>

                      <!-- ADDITIONAL DESCRIPTION -->
                      <div style="font-size: 11.5px; color: var(--color-foreground-muted); margin-top: 8px; line-height: 1.45; background: var(--color-surface); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle); word-break: break-word;">
                        <strong style="color: var(--color-foreground-subtle);">Description / Notes:</strong> ${defaultDesc}
                      </div>

                      <!-- FOOTER: CONNECTED EVENT & ACTION BUTTONS -->
                      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--color-border-subtle); display: flex; flex-direction: column; gap: 8px; width: 100%;">
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--color-accent); font-weight: 600; word-break: break-word;">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                          <span>Connected Event: <strong>${evt.projectName || 'Unassociated'}</strong></span>
                        </div>

                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; width: 100%;">
                          <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 5px 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;" title="Add to Google Calendar">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                            + Google Calendar
                          </a>
                          ${
                            evt.isAutoCreated
                              ? `<span class="badge badge-neutral" style="font-size: 11px; padding: 5px 10px; cursor: not-allowed; font-weight: 600;" title="Edit date in Project Data page">🔒 Project Event</span>`
                              : `<button class="btn btn-tertiary btn-sm associate-evt-btn" data-id="${evt.id}" style="font-size: 11px; padding: 5px 10px; font-weight: 600;">
                                  Associate &rarr;
                                </button>
                                <button class="btn btn-destructive btn-sm delete-evt-btn" data-id="${evt.id}" style="font-size: 11px; padding: 5px 10px;" title="Delete Timeline Schedule">
                                  Delete
                                </button>`
                          }
                        </div>
                      </div>
                    </div>
                  `;
                })
                .join('')
        }
      </div>
    `;

    // Calendar Widget Card (Right)
    const calWidget = document.createElement('div');
    calWidget.className = 'card calendar-widget-card';
    calWidget.innerHTML = `
      <div class="calendar-widget-header">
        <div class="calendar-month-title">August 2026 Timeline</div>
        ${
          selectedFilterDate
            ? `<div style="font-size: 11px; color: var(--color-accent); font-weight: 600;">Active Filter: ${selectedFilterDate}</div>`
            : `<div style="font-size: 11px; color: var(--color-foreground-subtle);">Click date to filter</div>`
        }
      </div>
      <div class="calendar-grid-header">
        <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
      </div>
      <div class="calendar-grid-days">
        <div class="calendar-day other-month">27</div>
        <div class="calendar-day other-month">28</div>
        <div class="calendar-day other-month">29</div>
        <div class="calendar-day other-month">30</div>
        <div class="calendar-day other-month">31</div>
        ${Array.from({ length: 31 }, (_, i) => {
          const dayNum = i + 1;
          const dStr = `2026-08-${dayNum.toString().padStart(2, '0')}`;
          const hasEvt = timelineEvents.some((e) => isDateInEvent(dStr, e.date));
          const isToday = dayNum === 20;
          const isSelected = selectedFilterDate === dStr;

          return `
            <button type="button" class="calendar-day ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${hasEvt ? 'has-event' : ''}" data-date="${dStr}" style="cursor: pointer;" title="${hasEvt ? `Events exist on ${dStr}. Click to filter.` : `Click to filter date ${dStr}`}">
              <span>${dayNum}</span>
              ${hasEvt ? `<span class="calendar-event-dot"></span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;

    mainGrid.appendChild(timelineCard);
    mainGrid.appendChild(calWidget);

    // Attach Click Event Listener to Calendar Days
    calWidget.querySelectorAll('.calendar-day[data-date]').forEach((dayBtn) => {
      dayBtn.addEventListener('click', (e) => {
        const targetDate = (e.currentTarget as HTMLElement).getAttribute('data-date');
        if (targetDate) {
          if (selectedFilterDate === targetDate) {
            selectedFilterDate = null; // Toggle OFF filter if clicked again!
          } else {
            selectedFilterDate = targetDate; // Filter to clicked date!
          }
          renderTimelineContent();
        }
      });
    });

    // Clear Filter handlers
    timelineCard.querySelector('#btn-clear-date-filter')?.addEventListener('click', () => {
      selectedFilterDate = null;
      renderTimelineContent();
    });

    timelineCard.querySelector('#btn-empty-clear-filter')?.addEventListener('click', () => {
      selectedFilterDate = null;
      renderTimelineContent();
    });

    // Attach Event Listener to Click Associate Buttons
    timelineCard.querySelectorAll('.associate-evt-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const found = timelineEvents.find((evt) => evt.id === id);
        if (found) {
          openAssociateProjectModal(found, projects);
        }
      });
    });

    // Attach Event Listener to Click Delete Buttons
    timelineCard.querySelectorAll('.delete-evt-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const found = timelineEvents.find((evt) => evt.id === id);
        if (found) {
          new StrictDeleteModal({
            itemName: found.title,
            itemType: 'timeline deadline',
            onConfirmDelete: async () => {
              await DataService.deleteTimelineEvent(id!);
              renderTimelineSchedule(container, viewState);
            }
          }).open();
        }
      });
    });
  };

  renderTimelineContent();

  // Add Deadline Handler
  titleBar.querySelector('#btn-add-deadline')?.addEventListener('click', () => {
    openAddTimelineModal(projects, async (newEvent) => {
      await DataService.createTimelineEvent(newEvent);
      container.innerHTML = '';
      renderTimelineSchedule(container, viewState);
    });
  });
}

function openAddTimelineModal(projects: ProjectRecord[], onAdded: (event: TimelineScheduleEvent) => void): void {
  const todayStr = new Date().toISOString().split('T')[0];

  const modalHtml = `
    <div>
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Schedule / Deadline Title</label>
        <input type="text" class="form-control" id="add-evt-title" placeholder="e.g. Final Cable Packdown & Equipment Audit" />
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Date Selection Mode</label>
        <select class="form-control" id="add-evt-date-mode">
          <option value="single">Single Date (1 Hari)</option>
          <option value="range">Date Range (Multi-Hari / Event Range)</option>
        </select>
      </div>

      <div id="single-date-container" style="margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Target Date</label>
          <input type="date" class="form-control" id="add-evt-date-single" value="${todayStr}" />
        </div>
      </div>

      <div id="range-date-container" style="display: none; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="date" class="form-control" id="add-evt-date-start" value="${todayStr}" />
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input type="date" class="form-control" id="add-evt-date-end" value="${todayStr}" />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Event Type</label>
          <select class="form-control" id="add-evt-type">
            ${CategoryStoreService.getCategories('timeline')
              .map((cat) => `<option>${cat}</option>`)
              .join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Priority Level</label>
          <select class="form-control" id="add-evt-priority">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Associated Production Project</label>
        <select class="form-control" id="add-evt-proj">
          <option value="">-- Unassociated --</option>
          ${projects
            .map((p) => `<option value="${p.id}">${p.projectName} (${p.clientName})</option>`)
            .join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Additional Description & Context</label>
        <textarea class="form-control" id="add-evt-desc" rows="3" placeholder="Enter detailed background, logistics notes, or equipment checklist..."></textarea>
      </div>
    </div>
  `;

  const dialog = new ModalDialog({
    title: 'Add New Timeline Deadline or Milestone',
    contentHtml: modalHtml,
    confirmText: 'Add to Timeline',
    cancelText: 'Cancel',
    onConfirm: () => {
      const titleEl = document.getElementById('add-evt-title') as HTMLInputElement;
      const modeSelect = document.getElementById('add-evt-date-mode') as HTMLSelectElement;
      const singleDateEl = document.getElementById('add-evt-date-single') as HTMLInputElement;
      const startDateEl = document.getElementById('add-evt-date-start') as HTMLInputElement;
      const endDateEl = document.getElementById('add-evt-date-end') as HTMLInputElement;
      const typeEl = document.getElementById('add-evt-type') as HTMLSelectElement;
      const priorityEl = document.getElementById('add-evt-priority') as HTMLSelectElement;
      const projEl = document.getElementById('add-evt-proj') as HTMLSelectElement;
      const descEl = document.getElementById('add-evt-desc') as HTMLTextAreaElement;

      const title = titleEl?.value.trim() || 'New Scheduled Milestone';
      
      let date = singleDateEl?.value || todayStr;
      if (modeSelect?.value === 'range') {
        const start = startDateEl?.value || date;
        const end = endDateEl?.value || start;
        if (end && end !== start) {
          date = `${start} to ${end}`;
        } else {
          date = start;
        }
      }

      const type = (typeEl?.value || 'Deadline') as any;
      const priority = (priorityEl?.value || 'Medium') as any;
      const projectId = projEl?.value || undefined;
      const foundProj = projects.find((p) => p.id === projectId);
      const projectName = foundProj ? foundProj.projectName : undefined;
      const additionalDescription = descEl?.value.trim() || 'Schedule item created via Timeline Manager.';

      const newEvent: TimelineScheduleEvent = {
        id: `evt-${Date.now()}`,
        date,
        title,
        type,
        priority,
        status: 'Pending',
        projectId,
        projectName,
        additionalDescription
      };

      onAdded(newEvent);
    }
  });

  dialog.open();

  setTimeout(() => {
    const modeSelect = document.getElementById('add-evt-date-mode') as HTMLSelectElement;
    const singleContainer = document.getElementById('single-date-container') as HTMLElement;
    const rangeContainer = document.getElementById('range-date-container') as HTMLElement;

    modeSelect?.addEventListener('change', () => {
      if (modeSelect.value === 'range') {
        singleContainer.style.display = 'none';
        rangeContainer.style.display = 'grid';
      } else {
        singleContainer.style.display = 'block';
        rangeContainer.style.display = 'none';
      }
    });
  }, 50);
}

function openAssociateProjectModal(evt: TimelineScheduleEvent, projects: ProjectRecord[]): void {
  const modalHtml = `
    <div>
      <div style="font-size: var(--text-sm); color: var(--color-foreground-muted); margin-bottom: var(--space-4);">
        Associate timeline item <strong>"${evt.title}"</strong> (${evt.date}) with an active production event:
      </div>

      <div class="form-group" style="margin-bottom: var(--space-5);">
        <label class="form-label">Select Associated Project / Event</label>
        <select class="form-control" id="select-associate-proj">
          ${projects
            .map(
              (p) => `
            <option value="${p.id}" ${evt.projectId === p.id ? 'selected' : ''}>
              ${p.projectName} (${p.clientName})
            </option>
          `
            )
            .join('')}
        </select>
      </div>

      <div style="padding: var(--space-4); background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
        <div style="font-size: var(--text-xs); font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); margin-bottom: 4px;">Current Status</div>
        <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-foreground);">Priority: ${evt.priority} &bull; Type: ${evt.type}</div>
      </div>
    </div>
  `;

  new ModalDialog({
    title: 'Associate Timeline Schedule to Event',
    contentHtml: modalHtml,
    confirmText: 'Save Association',
    cancelText: 'Cancel'
  }).open();
}
