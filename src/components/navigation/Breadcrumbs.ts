/* ==========================================================================
   BREADCRUMB NAVIGATION COMPONENT
   Generates responsive breadcrumbs directly above page titles using clean URL paths.
   ========================================================================== */

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function renderBreadcrumbs(items: BreadcrumbItem[]): string {
  return `
    <nav class="breadcrumbs" aria-label="Breadcrumb Navigation" style="margin-bottom: var(--space-2); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: var(--text-xs);">
      ${items
        .map((item, idx) => {
          const isLast = idx === items.length - 1;
          if (isLast) {
            return `
              <span class="breadcrumb-current" style="color: var(--color-foreground); font-weight: 600;">
                ${item.label}
              </span>
            `;
          }
          const link = item.path || '/executive-overview';
          return `
            <a href="${link}" class="breadcrumb-item" data-route-link="${link}" style="color: var(--color-foreground-muted); text-decoration: none; transition: color 0.15s ease;">
              ${item.label}
            </a>
            <span class="breadcrumb-separator" style="color: var(--color-foreground-subtle); user-select: none;">/</span>
          `;
        })
        .join('')}
    </nav>
  `;
}
