/* ==========================================================================
   CALENDAR & AGENDA MANAGEMENT COMPONENT
   Left Side: Agenda List & Detail Trigger
   Right Side: Interactive Calendar Widget
   ========================================================================== */

import { AgendaItem } from '../../types/database';
import { ModalDialog } from '../overlays/ModalDialog';

export function renderCalendarAgenda(container: HTMLElement, agendas: AgendaItem[]): void {
  let activeCategory: string = 'ALL';
  let selectedDate: string = '2026-08-20'; // Default selected date
  let selectedAgenda: AgendaItem | null = agendas[0] || null;

  // Filter helper
  const getFilteredAgendas = () => {
    return agendas.filter((item) => {
      const matchCategory = activeCategory === 'ALL' || item.category === activeCategory;
      return matchCategory;
    });
  };

  const renderComponent = () => {
    const filteredAgendas = getFilteredAgendas();

    container.innerHTML = `
      <div class="calendar-agenda-grid">
        <!-- LEFT SIDE: AGENDA LIST -->
        <div class="card agenda-list-card">
          <div class="card-header" style="margin-bottom: var(--space-4);">
            <div>
              <div class="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Workspace Agendas & Schedule
              </div>
              <div class="card-subtitle">Upcoming architecture reviews, security audits, and deployment syncs</div>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-add-agenda">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Agenda
            </button>
          </div>

          <!-- CATEGORY FILTER CHIPS -->
          <div class="agenda-filter-chips">
            ${['ALL', 'Architecture', 'Security Audit', 'Deployment', 'Team Sync']
              .map(
                (cat) => `
              <button class="chip ${activeCategory === cat ? 'is-active' : ''}" data-category="${cat}">
                ${cat}
              </button>
            `
              )
              .join('')}
          </div>

          <!-- AGENDA ITEMS LIST -->
          <div class="agenda-items-list">
            ${
              filteredAgendas.length === 0
                ? `<div class="empty-state-card" style="padding: var(--space-8); text-align: center;">No scheduled agendas match the selected filter.</div>`
                : filteredAgendas
                    .map((item) => {
                      const isToday = item.date === '2026-08-20';
                      const statusClass =
                        item.status === 'In Progress'
                          ? 'badge-orange'
                          : item.status === 'Completed'
                          ? 'badge-success'
                          : 'badge-neutral';

                      return `
                  <div class="agenda-item-card ${selectedAgenda?.id === item.id ? 'is-selected' : ''}" data-id="${item.id}">
                    <div class="agenda-item-header">
                      <div class="agenda-time-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>${isToday ? 'Today, ' : ''}${item.startTime} - ${item.endTime}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="badge ${statusClass}">${item.status}</span>
                        <span class="badge badge-neutral">${item.category}</span>
                      </div>
                    </div>

                    <div class="agenda-title">${item.title}</div>
                    <div class="agenda-description">${item.description}</div>

                    <div class="agenda-item-footer">
                      <div class="agenda-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>${item.location}</span>
                      </div>

                      <div class="attendee-avatars">
                        ${item.attendees
                          .slice(0, 3)
                          .map((att) => `<div class="avatar-mini" title="${att.name} (${att.role})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`)
                          .join('')}
                        ${item.attendees.length > 3 ? `<div class="avatar-mini count">+${item.attendees.length - 3}</div>` : ''}
                      </div>
                    </div>
                  </div>
                `;
                    })
                    .join('')
            }
          </div>
        </div>

        <!-- RIGHT SIDE: MINI CALENDAR WIDGET -->
        <div class="card calendar-widget-card">
          <div class="calendar-widget-header">
            <div class="calendar-month-title">August 2026</div>
            <div class="btn-group">
              <button class="btn btn-tertiary btn-icon btn-sm" id="cal-prev" title="Previous Month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button class="btn btn-tertiary btn-icon btn-sm" id="cal-next" title="Next Month">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <!-- DAY NAME HEADERS -->
          <div class="calendar-grid-header">
            <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
          </div>

          <!-- CALENDAR DAYS GRID (AUGUST 2026: AUG 1 STARTS ON SATURDAY) -->
          <div class="calendar-grid-days">
            <!-- Empty offset days for Aug 1 starting Saturday (5 empty slots for Mon-Fri) -->
            <div class="calendar-day other-month">27</div>
            <div class="calendar-day other-month">28</div>
            <div class="calendar-day other-month">29</div>
            <div class="calendar-day other-month">30</div>
            <div class="calendar-day other-month">31</div>
            
            ${Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-08-${dayNum.toString().padStart(2, '0')}`;
              const isToday = dayNum === 20;
              const isSelected = dateStr === selectedDate;
              const hasAgenda = agendas.some((a) => a.date === dateStr);

              return `
                <button class="calendar-day ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${
                hasAgenda ? 'has-event' : ''
              }" data-date="${dateStr}">
                  <span class="day-number">${dayNum}</span>
                  ${hasAgenda ? `<span class="calendar-event-dot"></span>` : ''}
                </button>
              `;
            }).join('')}
          </div>

          <!-- QUICK SELECTED DATE SUMMARY -->
          <div class="calendar-date-info">
            <div class="info-title">Selected Date: <span>${selectedDate}</span></div>
            <div class="info-count">
              ${agendas.filter((a) => a.date === selectedDate).length} Agenda(s) Scheduled
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach Event Listeners
    // Filter chips
    container.querySelectorAll('.agenda-filter-chips .chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).getAttribute('data-category');
        if (cat) {
          activeCategory = cat;
          renderComponent();
        }
      });
    });

    // Calendar day clicks
    container.querySelectorAll('.calendar-day[data-date]').forEach((dayBtn) => {
      dayBtn.addEventListener('click', (e) => {
        const dStr = (e.currentTarget as HTMLElement).getAttribute('data-date');
        if (dStr) {
          selectedDate = dStr;
          const matched = agendas.find((a) => a.date === dStr);
          if (matched) {
            openAgendaDetailModal(matched);
          } else {
            renderComponent();
          }
        }
      });
    });

    // Agenda card clicks -> Open Detail Modal
    container.querySelectorAll('.agenda-item-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const found = agendas.find((a) => a.id === id);
        if (found) {
          selectedAgenda = found;
          openAgendaDetailModal(found);
        }
      });
    });

    // Add Agenda Button
    container.querySelector('#btn-add-agenda')?.addEventListener('click', () => {
      new ModalDialog({
        title: 'Schedule New Workspace Agenda',
        contentHtml: `
          <div class="form-group" style="margin-bottom: var(--space-4);">
            <label class="form-label">Agenda Title</label>
            <input type="text" class="form-control" placeholder="e.g. Q3 System Infrastructure Scaling Sync" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-control">
                <option>Architecture</option>
                <option>Security Audit</option>
                <option>Deployment</option>
                <option>Team Sync</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select class="form-control">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description & Meeting Link</label>
            <textarea class="form-control" rows="3" placeholder="Enter session objectives and Google Meet link..."></textarea>
          </div>
        `,
        confirmText: 'Schedule Agenda',
        cancelText: 'Cancel',
        onConfirm: () => {}
      }).open();
    });
  };

  renderComponent();
}

/**
 * Open Detailed Agenda Information Modal Dialog
 */
function openAgendaDetailModal(agenda: AgendaItem): void {
  const statusBadge =
    agenda.status === 'In Progress' ? 'badge-orange' : agenda.status === 'Completed' ? 'badge-success' : 'badge-neutral';

  const modalHtml = `
    <div class="agenda-detail-modal">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge ${statusBadge}"><span class="badge-dot"></span>${agenda.status}</span>
          <span class="badge badge-neutral">${agenda.category}</span>
          <span class="badge badge-neutral" style="color: var(--color-accent); border-color: var(--color-accent-border);">Priority: ${agenda.priority}</span>
        </div>
        <div class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground-muted);">${agenda.date}</div>
      </div>

      <h2 style="font-size: var(--text-lg); font-weight: bold; color: var(--color-foreground); margin-bottom: var(--space-2);">
        ${agenda.title}
      </h2>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: var(--space-5); padding: var(--space-3) var(--space-4); background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
        <div style="display: flex; align-items: center; gap: 10px; font-size: var(--text-sm); color: var(--color-foreground-muted);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <strong style="color: var(--color-foreground);">Time:</strong> ${agenda.startTime} - ${agenda.endTime}
        </div>
        <div style="display: flex; align-items: center; gap: 10px; font-size: var(--text-sm); color: var(--color-foreground-muted);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <strong style="color: var(--color-foreground);">Location:</strong> ${agenda.location}
        </div>
      </div>

      <div style="margin-bottom: var(--space-5);">
        <div style="font-size: var(--text-xs); font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em; margin-bottom: 6px;">Agenda Overview & Objectives</div>
        <p style="font-size: var(--text-sm); color: var(--color-foreground-muted); line-height: 1.6;">${agenda.description}</p>
      </div>

      <div>
        <div style="font-size: var(--text-xs); font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em; margin-bottom: 10px;">Required Attendees & Team Lead</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${agenda.attendees
            .map(
              (att) => `
            <div style="display: flex; align-items: center; gap: 12px; padding: 6px 10px; border-radius: var(--radius-md); background: var(--color-bg); border: 1px solid var(--color-border);">
              <div class="avatar-mini" style="width: 28px; height: 28px; min-width: 28px; font-size: 11px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
              <div>
                <div style="font-size: var(--text-sm); font-weight: 600; color: var(--color-foreground);">${att.name}</div>
                <div style="font-size: 11px; color: var(--color-foreground-subtle);">${att.role}</div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  new ModalDialog({
    title: 'Agenda Detail Breakdown',
    contentHtml: modalHtml,
    confirmText: agenda.meetingLink ? 'Join Google Meet' : 'Close Detail',
    cancelText: 'Edit Agenda',
    onConfirm: () => {
      if (agenda.meetingLink) {
        window.open(agenda.meetingLink, '_blank');
      }
    }
  }).open();
}
