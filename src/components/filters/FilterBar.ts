/* ==========================================================================
   FILTER & QUERY SYSTEM — SEARCH, MULTI-SELECT DROPDOWNS, CHIPS & PRESETS
   ========================================================================== */

import { TableFilterParams } from '../../types/ui';

export interface FilterBarOptions {
  container: HTMLElement;
  filterParams: TableFilterParams;
  onFilterChange: (newParams: Partial<TableFilterParams>) => void;
  onResetFilters: () => void;
}

export function renderFilterBar(options: FilterBarOptions): void {
  const { container, filterParams } = options;

  const hasActiveFilters =
    filterParams.searchQuery !== '' ||
    filterParams.roleFilter !== 'ALL' ||
    filterParams.statusFilter !== 'ALL';

  container.innerHTML = `
    <div class="table-toolbar">
      <div class="table-search-filter">
        <!-- Search Input -->
        <div class="input-wrapper" style="flex: 1;">
          <svg class="input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="form-control has-left-icon" id="filter-search-input" placeholder="Search by name, email, or account ID..." value="${filterParams.searchQuery}" />
          <span class="input-kbd">/</span>
        </div>

        <!-- Role Filter Select -->
        <select class="form-control" id="filter-role-select" style="width: 170px;">
          <option value="ALL" ${filterParams.roleFilter === 'ALL' ? 'selected' : ''}>All Roles</option>
          <option value="Administrator" ${filterParams.roleFilter === 'Administrator' ? 'selected' : ''}>Administrator</option>
          <option value="Product Architect" ${filterParams.roleFilter === 'Product Architect' ? 'selected' : ''}>Product Architect</option>
          <option value="Data Lead" ${filterParams.roleFilter === 'Data Lead' ? 'selected' : ''}>Data Lead</option>
          <option value="Member" ${filterParams.roleFilter === 'Member' ? 'selected' : ''}>Member</option>
        </select>

        <!-- Status Filter Select -->
        <select class="form-control" id="filter-status-select" style="width: 150px;">
          <option value="ALL" ${filterParams.statusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
          <option value="Active" ${filterParams.statusFilter === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Pending" ${filterParams.statusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Suspended" ${filterParams.statusFilter === 'Suspended' ? 'selected' : ''}>Suspended</option>
          <option value="Archived" ${filterParams.statusFilter === 'Archived' ? 'selected' : ''}>Archived</option>
        </select>
      </div>

      ${hasActiveFilters ? `<button class="btn btn-tertiary btn-sm" id="btn-clear-filters">Clear Filters</button>` : ''}
    </div>

    <!-- Active Filter Chips -->
    ${
      hasActiveFilters
        ? `
      <div class="filter-chips">
        <span class="text-caption">Active filters:</span>
        ${
          filterParams.searchQuery
            ? `<span class="chip">Query: "${filterParams.searchQuery}" <span class="chip-remove" data-clear="search">✕</span></span>`
            : ''
        }
        ${
          filterParams.roleFilter !== 'ALL'
            ? `<span class="chip">Role: ${filterParams.roleFilter} <span class="chip-remove" data-clear="role">✕</span></span>`
            : ''
        }
        ${
          filterParams.statusFilter !== 'ALL'
            ? `<span class="chip">Status: ${filterParams.statusFilter} <span class="chip-remove" data-clear="status">✕</span></span>`
            : ''
        }
      </div>
    `
        : ''
    }
  `;

  // Attach Input Listeners
  const searchInput = container.querySelector('#filter-search-input') as HTMLInputElement;
  searchInput?.addEventListener('input', (e) => {
    options.onFilterChange({ searchQuery: (e.target as HTMLInputElement).value, page: 1 });
  });

  const roleSelect = container.querySelector('#filter-role-select') as HTMLSelectElement;
  roleSelect?.addEventListener('change', (e) => {
    options.onFilterChange({ roleFilter: (e.target as HTMLSelectElement).value, page: 1 });
  });

  const statusSelect = container.querySelector('#filter-status-select') as HTMLSelectElement;
  statusSelect?.addEventListener('change', (e) => {
    options.onFilterChange({ statusFilter: (e.target as HTMLSelectElement).value, page: 1 });
  });

  const clearBtn = container.querySelector('#btn-clear-filters');
  clearBtn?.addEventListener('click', options.onResetFilters);

  const chipRemovers = container.querySelectorAll('.chip-remove');
  chipRemovers.forEach((chip) => {
    chip.addEventListener('click', (e) => {
      const type = (e.currentTarget as HTMLElement).getAttribute('data-clear');
      if (type === 'search') options.onFilterChange({ searchQuery: '', page: 1 });
      if (type === 'role') options.onFilterChange({ roleFilter: 'ALL', page: 1 });
      if (type === 'status') options.onFilterChange({ statusFilter: 'ALL', page: 1 });
    });
  });
}
