/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — CATEGORY SETTINGS & FORM CONTROL
   Features: Add, remove, and manage dropdown category options dynamically
   for Equipment, Content Assets, Crew Roles, SOP Checklists, and Timeline Events.
   ========================================================================== */

import { ApplicationViewState } from '../types/ui';
import { CategoryStoreService, MasterCategoryGroup } from '../services/categoryStore';
import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';

export async function renderCategorySettings(
  container: HTMLElement,
  viewState: ApplicationViewState
): Promise<void> {
  container.className = 'template-executive-overview';

  // Render Page Title Bar
  const titleBar = document.createElement('div');
  titleBar.className = 'page-header-bar';
  titleBar.innerHTML = `
    <div class="page-title-group">
      ${renderBreadcrumbs([
        { label: 'Workspace', path: '/executive-overview' },
        { label: 'Category Settings & Form Control' }
      ])}
      <h1>
        Category Settings & Form Control
        <span class="badge badge-orange"><span class="badge-dot"></span>Dropdown Control</span>
      </h1>
      <div class="page-title-description">Manage dropdown categories for input forms across Equipment, Content Assets, Crew Roles, SOPs, and Timelines.</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-tertiary btn-sm" id="btn-reset-categories">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        Reset Default Categories
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') {
    return;
  }

  const renderCategoryCards = () => {
    // Remove existing container if re-rendering
    const existing = container.querySelector('.category-settings-grid');
    if (existing) existing.remove();

    const groups: MasterCategoryGroup[] = CategoryStoreService.getCategoryGroups();

    const grid = document.createElement('div');
    grid.className = 'category-settings-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(360px, 1fr))';
    grid.style.gap = 'var(--space-6)';

    groups.forEach((group) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';

      card.innerHTML = `
        <div>
          <div class="card-header" style="margin-bottom: var(--space-3);">
            <div>
              <div class="card-title">${group.name}</div>
              <div class="card-subtitle">${group.description}</div>
            </div>
            <span class="badge badge-neutral font-mono">${group.items.length} Items</span>
          </div>

          <!-- CATEGORY BADGES LIST -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: var(--space-5); min-height: 80px; align-content: flex-start; padding: 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            ${group.items
              .map(
                (item) => `
              <div class="badge badge-neutral" style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; font-size: 12px;">
                <span>${item}</span>
                <button type="button" class="remove-cat-item-btn" data-module="${group.moduleKey}" data-item="${item}" style="background: none; border: none; color: var(--color-foreground-subtle); cursor: pointer; padding: 0 2px; font-size: 14px; font-weight: bold; line-height: 1; display: flex; align-items: center;" title="Remove Category">
                  &times;
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- ADD NEW CATEGORY INPUT FORM -->
        <div style="display: flex; gap: 8px; margin-top: var(--space-2);">
          <input type="text" class="form-control add-cat-input" data-module="${group.moduleKey}" placeholder="Add new category option..." style="font-size: 12px; flex: 1;" />
          <button type="button" class="btn btn-primary btn-sm add-cat-btn" data-module="${group.moduleKey}">
            + Add
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    container.appendChild(grid);

    // Attach Handlers
    grid.querySelectorAll('.remove-cat-item-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const modKey = (e.currentTarget as HTMLElement).getAttribute('data-module') as any;
        const itemVal = (e.currentTarget as HTMLElement).getAttribute('data-item');
        if (modKey && itemVal) {
          CategoryStoreService.removeCategory(modKey, itemVal);
          renderCategoryCards();
        }
      });
    });

    grid.querySelectorAll('.add-cat-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const modKey = (e.currentTarget as HTMLElement).getAttribute('data-module') as any;
        const inputEl = grid.querySelector(`.add-cat-input[data-module="${modKey}"]`) as HTMLInputElement;
        if (modKey && inputEl && inputEl.value.trim()) {
          const added = CategoryStoreService.addCategory(modKey, inputEl.value.trim());
          if (added) {
            inputEl.value = '';
            renderCategoryCards();
          }
        }
      });
    });

    grid.querySelectorAll('.add-cat-input').forEach((input) => {
      input.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter') {
          const modKey = (input as HTMLElement).getAttribute('data-module') as any;
          const inputEl = input as HTMLInputElement;
          if (modKey && inputEl && inputEl.value.trim()) {
            const added = CategoryStoreService.addCategory(modKey, inputEl.value.trim());
            if (added) {
              inputEl.value = '';
              renderCategoryCards();
            }
          }
        }
      });
    });
  };

  renderCategoryCards();

  // Reset to Defaults Handler
  titleBar.querySelector('#btn-reset-categories')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all categories to default settings?')) {
      CategoryStoreService.resetDefaults();
      renderCategoryCards();
    }
  });
}
