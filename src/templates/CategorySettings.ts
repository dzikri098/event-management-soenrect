/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — CATEGORY SETTINGS & FORM CONTROL
   Features: Add, remove, and manage dropdown category options dynamically
   for Equipment, Content Assets, Crew Roles, SOP Checklists, and Timeline Events.
   ========================================================================== */

import { ApplicationViewState } from '../types/ui';
import { CategoryStoreService, MasterCategoryGroup } from '../services/categoryStore';
import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';
import { isSupabaseConfigured } from '../services/supabaseClient';

export async function renderCategorySettings(
  container: HTMLElement,
  viewState: ApplicationViewState
): Promise<void> {
  container.className = 'template-executive-overview';

  const dbStatusBadge = isSupabaseConfigured()
    ? `<span class="badge badge-success" style="font-size: 11.5px; padding: 4px 10px;" title="Connected to Supabase PostgreSQL Database"><span class="badge-dot"></span>Supabase DB Connected</span>`
    : `<span class="badge badge-neutral" style="font-size: 11.5px; padding: 4px 10px;" title="Local Cache Storage Mode"><span class="badge-dot"></span>Local Cache Mode</span>`;

  // Render Page Title Bar
  const titleBar = document.createElement('div');
  titleBar.className = 'page-header-bar';
  titleBar.innerHTML = `
    <div class="page-title-group">
      ${renderBreadcrumbs([
        { label: 'Workspace', path: '/executive-overview' },
        { label: 'Category Settings & Form Control' }
      ])}
      <h1 style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        Category Settings & Form Control
        <span class="badge badge-orange"><span class="badge-dot"></span>Dropdown Control</span>
        ${dbStatusBadge}
      </h1>
      <div class="page-title-description">Manage dropdown categories for input forms across Equipment, Content Assets, Crew Roles, SOPs, and Timelines in real-time.</div>
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

  // Sync latest category data from Supabase before rendering UI cards
  await CategoryStoreService.fetchFromSupabase();

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
      btn.addEventListener('click', async (e) => {
        const modKey = (e.currentTarget as HTMLElement).getAttribute('data-module') as any;
        const itemVal = (e.currentTarget as HTMLElement).getAttribute('data-item');
        if (modKey && itemVal) {
          btn.setAttribute('disabled', 'true');
          await CategoryStoreService.removeCategory(modKey, itemVal);
          renderCategoryCards();
        }
      });
    });

    grid.querySelectorAll('.add-cat-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const modKey = (e.currentTarget as HTMLElement).getAttribute('data-module') as any;
        const inputEl = grid.querySelector(`.add-cat-input[data-module="${modKey}"]`) as HTMLInputElement;
        if (modKey && inputEl && inputEl.value.trim()) {
          (btn as HTMLButtonElement).disabled = true;
          const added = await CategoryStoreService.addCategory(modKey, inputEl.value.trim());
          if (added) {
            inputEl.value = '';
            renderCategoryCards();
          } else {
            (btn as HTMLButtonElement).disabled = false;
          }
        }
      });
    });

    grid.querySelectorAll('.add-cat-input').forEach((input) => {
      input.addEventListener('keydown', async (e) => {
        if ((e as KeyboardEvent).key === 'Enter') {
          const modKey = (input as HTMLElement).getAttribute('data-module') as any;
          const inputEl = input as HTMLInputElement;
          if (modKey && inputEl && inputEl.value.trim()) {
            inputEl.disabled = true;
            const added = await CategoryStoreService.addCategory(modKey, inputEl.value.trim());
            if (added) {
              inputEl.value = '';
              renderCategoryCards();
            } else {
              inputEl.disabled = false;
            }
          }
        }
      });
    });
  };

  renderCategoryCards();

  // Reset to Defaults Handler
  titleBar.querySelector('#btn-reset-categories')?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all categories to default settings in Supabase?')) {
      await CategoryStoreService.resetDefaults();
      renderCategoryCards();
    }
  });
}
