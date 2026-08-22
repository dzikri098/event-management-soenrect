/* ==========================================================================
   UI STATE & COMPONENT TYPES
   ========================================================================== */

export type ApplicationViewState = 'loaded' | 'loading' | 'empty' | 'error';

export type ActivePageTemplate =
  | 'executive-overview'
  | 'analytics-detail'
  | 'equipment-management'
  | 'project-management'
  | 'project-crew-detail'
  | 'crew-detail'
  | 'timeline-schedule'
  | 'crew-checklist-sop'
  | 'crew-directory'
  | 'category-settings'
  | 'welcome'
  | 'login'
  | 'crew-portal-login'
  | 'crew-portal';

export interface TableFilterParams {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
