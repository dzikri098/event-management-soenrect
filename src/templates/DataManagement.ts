/* ==========================================================================
   PAGE COMPOSITION TEMPLATE 3 — OPERATIONS & DATA MANAGEMENT PATTERN
   ========================================================================== */

import { ApplicationViewState, TableFilterParams } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { renderTableSkeleton } from '../components/dashboard/SkeletonLoader';
import { createEmptyState } from '../components/dashboard/EmptyState';
import { createErrorState } from '../components/dashboard/ErrorState';
import { renderFilterBar } from '../components/filters/FilterBar';
import { renderDataTable } from '../components/datatable/DataTable';
import { ModalDialog } from '../components/overlays/ModalDialog';

export async function renderDataManagement(
  container: HTMLElement,
  viewState: ApplicationViewState,
  onStateRetry: () => void
): Promise<void> {
  container.className = 'template-data-management';

  let currentFilterParams: TableFilterParams = {
    searchQuery: '',
    roleFilter: 'ALL',
    statusFilter: 'ALL',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    pageSize: 5
  };

  const selectedIds = new Set<string>();

  const titleBar = document.createElement('div');
  titleBar.className = 'page-header-bar';
  titleBar.innerHTML = `
    <div class="page-title-group">
      <h1>Operations & Account Management</h1>
      <div class="page-title-description">Manage workspace team members, roles, statuses, and security clearance.</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary btn-sm" id="btn-create-account">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Provision New Account
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = renderTableSkeleton();
    container.appendChild(card);
    return;
  }

  if (viewState === 'empty') {
    container.appendChild(
      createEmptyState({
        title: 'No Accounts in Database',
        description: 'No accounts have been registered yet.',
        actionText: 'Provision Account',
        onAction: onStateRetry
      })
    );
    return;
  }

  if (viewState === 'error') {
    container.appendChild(createErrorState({ onRetry: onStateRetry }));
    return;
  }

  const filterContainer = document.createElement('div');
  container.appendChild(filterContainer);

  const tableCardContainer = document.createElement('div');
  tableCardContainer.className = 'card';
  tableCardContainer.id = 'management-table-slot';
  container.appendChild(tableCardContainer);

  const updateTableData = async () => {
    const dataResult = await DataService.getManagementRecords(currentFilterParams);

    renderFilterBar({
      container: filterContainer,
      filterParams: currentFilterParams,
      onFilterChange: (newParams) => {
        currentFilterParams = { ...currentFilterParams, ...newParams };
        updateTableData();
      },
      onResetFilters: () => {
        currentFilterParams = {
          searchQuery: '',
          roleFilter: 'ALL',
          statusFilter: 'ALL',
          sortBy: 'name',
          sortOrder: 'asc',
          page: 1,
          pageSize: 5
        };
        updateTableData();
      }
    });

    renderDataTable({
      container: tableCardContainer,
      dataResult,
      selectedIds,
      currentSortBy: currentFilterParams.sortBy,
      currentSortOrder: currentFilterParams.sortOrder,
      onSelectAll: (checked) => {
        if (checked) {
          dataResult.data.forEach((row) => selectedIds.add(row.id));
        } else {
          selectedIds.clear();
        }
        updateTableData();
      },
      onSelectRow: (id, checked) => {
        if (checked) selectedIds.add(id);
        else selectedIds.delete(id);
        updateTableData();
      },
      onSort: (column) => {
        if (currentFilterParams.sortBy === column) {
          currentFilterParams.sortOrder = currentFilterParams.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          currentFilterParams.sortBy = column;
          currentFilterParams.sortOrder = 'asc';
        }
        updateTableData();
      },
      onPageChange: (newPage) => {
        currentFilterParams.page = newPage;
        updateTableData();
      },
      onBulkDelete: () => {
        const dialog = new ModalDialog({
          title: 'Confirm Permanent Deletion',
          contentHtml: `<p style="font-size: 14px; color: var(--color-foreground-muted);">Are you sure you want to permanently delete <strong>${selectedIds.size} selected account(s)</strong> from the Supabase database? This action cannot be undone.</p>`,
          confirmText: 'Delete Permanently',
          cancelText: 'Cancel',
          onConfirm: () => {
            selectedIds.clear();
            updateTableData();
          }
        });
        dialog.open();
      }
    });
  };

  await updateTableData();
}
