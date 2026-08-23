/* ==========================================================================
   DATA TABLE SYSTEM — DESKTOP TABLE, MOBILE CARD VIEW, SORTING & SELECTION
   ========================================================================== */

import { ManagementRecord } from '../../types/database';
import { PaginatedResult } from '../../types/ui';

export interface DataTableOptions {
  container: HTMLElement;
  dataResult: PaginatedResult<ManagementRecord>;
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onSort: (column: string) => void;
  onPageChange: (newPage: number) => void;
  onBulkDelete?: () => void;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
}

export function renderDataTable(options: DataTableOptions): void {
  const { container, dataResult, selectedIds, currentSortBy, currentSortOrder } = options;

  const isAllSelected =
    dataResult.data.length > 0 && dataResult.data.every((item) => selectedIds.has(item.id));
  const hasBulkSelection = selectedIds.size > 0;

  const getSortIcon = (col: string) => {
    if (currentSortBy !== col) return '';
    return currentSortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  container.innerHTML = `
    ${
      hasBulkSelection
        ? `
      <div class="bulk-actions-bar">
        <div style="font-size: var(--text-xs); font-weight: var(--font-weight-semibold); color: var(--color-accent);">
          ${selectedIds.size} record${selectedIds.size > 1 ? 's' : ''} selected
        </div>
        <div style="display: flex; gap: var(--space-2);">
          <button class="btn btn-secondary btn-sm" id="btn-bulk-export">Export Selection</button>
          <button class="btn btn-destructive btn-sm" id="btn-bulk-delete">Delete Selected</button>
        </div>
      </div>
    `
        : ''
    }

    <!-- DESKTOP TABLE VIEW -->
    <div class="table-wrapper desktop-table-view">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 40px;">
              <input type="checkbox" class="checkbox-input" id="table-select-all" ${isAllSelected ? 'checked' : ''} />
            </th>
            <th class="sortable" data-sort="name">Account / Email ${getSortIcon('name')}</th>
            <th class="sortable" data-sort="role">Role ${getSortIcon('role')}</th>
            <th class="sortable" data-sort="status">Status ${getSortIcon('status')}</th>
            <th class="sortable" data-sort="volume">Volume ${getSortIcon('volume')}</th>
            <th class="sortable" data-sort="healthScore">Health Score ${getSortIcon('healthScore')}</th>
            <th class="sortable" data-sort="lastActive">Last Active ${getSortIcon('lastActive')}</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${
            dataResult.data.length === 0
              ? `<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--color-foreground-muted);">No records matched your search filters.</td></tr>`
              : dataResult.data
                  .map((row) => {
                    const isChecked = selectedIds.has(row.id);
                    const statusBadgeClass =
                      row.status === 'Active'
                        ? 'badge-success'
                        : row.status === 'Pending'
                        ? 'badge-warning'
                        : row.status === 'Suspended'
                        ? 'badge-error'
                        : 'badge-neutral';

                    return `
              <tr class="${isChecked ? 'is-selected' : ''}">
                <td>
                  <input type="checkbox" class="checkbox-input row-checkbox" data-id="${row.id}" ${isChecked ? 'checked' : ''} />
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                    <div>
                      <div style="font-weight: var(--font-weight-medium); color: var(--color-foreground);">${row.name}</div>
                      <div style="font-size: var(--text-xs); color: var(--color-foreground-muted);">${row.email}</div>
                    </div>
                  </div>
                </td>
                <td><span class="badge badge-neutral">${row.role}</span></td>
                <td><span class="badge ${statusBadgeClass}"><span class="badge-dot"></span>${row.status}</span></td>
                <td><span class="font-mono">${row.formattedVolume}</span></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 60px; height: 6px; background: var(--color-surface-elevated); border-radius: 4px; overflow: hidden;">
                      <div style="width: ${row.healthScore}%; height: 100%; background: ${
                      row.healthScore > 80 ? 'var(--color-success)' : row.healthScore > 50 ? 'var(--color-warning)' : 'var(--color-error)'
                    }"></div>
                    </div>
                    <span class="font-mono text-xs">${row.healthScore}%</span>
                  </div>
                </td>
                <td><span class="text-caption">${row.lastActive}</span></td>
                <td style="text-align: right;">
                  <button class="btn btn-tertiary btn-icon btn-sm" title="Row Options">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                </td>
              </tr>
            `;
                  })
                  .join('')
          }
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARD LIST VIEW -->
    <div class="table-card-list">
      ${
        dataResult.data.map((row) => `
        <div class="table-card-item">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="12" r="4"></circle></svg></div>
              <div>
                <div style="font-weight: var(--font-weight-medium);">${row.name}</div>
                <div style="font-size: var(--text-xs); color: var(--color-foreground-muted);">${row.email}</div>
              </div>
            </div>
            <span class="badge badge-neutral">${row.role}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: var(--text-xs);">
            <span style="color: var(--color-foreground-muted);">Volume: <strong class="font-mono" style="color: var(--color-foreground);">${row.formattedVolume}</strong></span>
            <span class="badge badge-success">${row.status}</span>
          </div>
        </div>
      `).join('')
      }
    </div>

    <!-- PAGINATION BAR -->
    <div class="table-pagination">
      <div>Showing ${(dataResult.page - 1) * dataResult.pageSize + 1} - ${Math.min(
    dataResult.page * dataResult.pageSize,
    dataResult.totalRecords
  )} of ${dataResult.totalRecords} records</div>

      <div class="btn-group">
        <button class="btn btn-secondary btn-sm" id="btn-prev-page" ${dataResult.page <= 1 ? 'disabled' : ''}>Previous</button>
        <button class="btn btn-secondary btn-sm" id="btn-next-page" ${dataResult.page >= dataResult.totalPages ? 'disabled' : ''}>Next</button>
      </div>
    </div>
  `;

  // Attach Event Listeners
  const selectAllCb = container.querySelector('#table-select-all') as HTMLInputElement;
  selectAllCb?.addEventListener('change', (e) => {
    options.onSelectAll((e.target as HTMLInputElement).checked);
  });

  const rowCbs = container.querySelectorAll('.row-checkbox');
  rowCbs.forEach((cb) => {
    cb.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const id = target.getAttribute('data-id');
      if (id) options.onSelectRow(id, target.checked);
    });
  });

  const sortHeaders = container.querySelectorAll('.sortable');
  sortHeaders.forEach((th) => {
    th.addEventListener('click', (e) => {
      const col = (e.currentTarget as HTMLElement).getAttribute('data-sort');
      if (col) options.onSort(col);
    });
  });

  const prevBtn = container.querySelector('#btn-prev-page');
  prevBtn?.addEventListener('click', () => {
    if (dataResult.page > 1) options.onPageChange(dataResult.page - 1);
  });

  const nextBtn = container.querySelector('#btn-next-page');
  nextBtn?.addEventListener('click', () => {
    if (dataResult.page < dataResult.totalPages) options.onPageChange(dataResult.page + 1);
  });

  if (options.onBulkDelete) {
    const delBtn = container.querySelector('#btn-bulk-delete');
    delBtn?.addEventListener('click', options.onBulkDelete);
  }
}
