/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — EQUIPMENT INVENTORY & CONTROL
   Features: Full equipment asset list with Stock Quantity (Units), category subtabs,
   bundled tools & accessories, dual-mode equipment photo selection (File Upload or URL),
   detailed usage history log modal, and responsive mobile cards.
   ========================================================================== */

import { ApplicationViewState } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { EquipmentItem, EquipmentUsageHistory, ProjectRecord } from '../types/database';
import { ModalDialog } from '../components/overlays/ModalDialog';
import { StrictDeleteModal } from '../components/overlays/StrictDeleteModal';
import { CategoryStoreService } from '../services/categoryStore';

import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';

function renderEquipmentImage(item: EquipmentItem): string {
  if (item.imageUrl) {
    return `
      <div class="equipment-thumb-frame" title="${item.name} (Click to Zoom)">
        <img
          src="${item.imageUrl}"
          alt="${item.name}"
          class="equipment-thumb-img lightbox-trigger"
          data-image-src="${item.imageUrl}"
          data-image-title="${item.name}"
          onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\\'equipment-thumb-dummy\\'><svg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><path d=\\'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\\'></path><circle cx=\\'12\\' cy=\\'13\\' r=\\'4\\'></circle></svg></div>';"
          style="cursor: zoom-in;"
        />
      </div>
    `;
  }
  return `
    <div class="equipment-thumb-frame">
      <div class="equipment-thumb-dummy" title="${item.name} (No Image)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </div>
    </div>
  `;
}

function renderPhotoSelectorHtml(currentImageUrl: string = '', prefix: string = 'eq'): string {
  return `
    <div class="form-group" style="margin-top: var(--space-4);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <label class="form-label" style="margin: 0;">Equipment Photo (Optional)</label>
        <div style="display: flex; gap: 4px; background: var(--color-surface-elevated); padding: 3px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <button type="button" class="btn btn-secondary btn-sm photo-mode-btn is-active" id="${prefix}-mode-file" style="padding: 3px 10px; font-size: 11px; height: 26px;">
            Upload File
          </button>
          <button type="button" class="btn btn-tertiary btn-sm photo-mode-btn" id="${prefix}-mode-url" style="padding: 3px 10px; font-size: 11px; height: 26px;">
            Image URL
          </button>
        </div>
      </div>

      <!-- FILE UPLOAD DROPZONE CONTAINER -->
      <div id="${prefix}-file-container">
        <div id="${prefix}-dropzone" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px 16px; border: 2px dashed var(--color-border-strong); background: var(--color-surface-elevated); border-radius: var(--radius-md); cursor: pointer; text-align: center; transition: all 0.2s ease;">
          <input type="file" id="${prefix}-file-input" accept="image/*" style="position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; z-index: 2;" />
          <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--color-accent-subtle); color: var(--color-accent); display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <div style="font-size: var(--text-xs); font-weight: 600; color: var(--color-foreground);">
            Click to browse photo <span style="color: var(--color-foreground-muted); font-weight: normal;">or drag & drop image here</span>
          </div>
          <div style="font-size: 11px; color: var(--color-foreground-subtle); margin-top: 4px;">
            Supports PNG, JPG, WEBP, or SVG
          </div>
        </div>
      </div>

      <!-- URL CONTAINER -->
      <div id="${prefix}-url-container" style="display: none;">
        <input type="url" id="${prefix}-url-input" class="form-control" value="${currentImageUrl}" placeholder="https://images.unsplash.com/photo-..." />
        <div style="font-size: 11px; color: var(--color-foreground-subtle); margin-top: 4px;">Direct link to public image asset.</div>
      </div>

      <!-- IMAGE PREVIEW CARD BOX -->
      <div id="${prefix}-preview-box" style="margin-top: 10px; display: ${currentImageUrl ? 'flex' : 'none'}; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--color-surface-elevated); border: 1px solid var(--color-accent); border-radius: var(--radius-md);">
        <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
          <img id="${prefix}-preview-img" src="${currentImageUrl}" alt="Photo Preview" style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border);" />
          <div style="min-width: 0;">
            <div style="font-size: 12px; font-weight: 600; color: var(--color-foreground);" id="${prefix}-preview-name">Photo Attached</div>
            <div style="font-size: 11px; color: var(--color-success); font-weight: 500; margin-top: 2px;">&check; Ready for asset record</div>
          </div>
        </div>
        <button type="button" class="btn btn-tertiary btn-sm" id="${prefix}-remove-photo-btn" style="color: var(--color-danger); font-size: 11px; padding: 4px 8px;">
          Remove
        </button>
      </div>
    </div>
  `;
}

function attachPhotoSelectorHandlers(prefix: string, onUrlChanged: (url: string) => void): void {
  const btnFile = document.getElementById(`${prefix}-mode-file`);
  const btnUrl = document.getElementById(`${prefix}-mode-url`);
  const fileContainer = document.getElementById(`${prefix}-file-container`);
  const urlContainer = document.getElementById(`${prefix}-url-container`);
  const dropzone = document.getElementById(`${prefix}-dropzone`);
  const fileInput = document.getElementById(`${prefix}-file-input`) as HTMLInputElement;
  const urlInput = document.getElementById(`${prefix}-url-input`) as HTMLInputElement;
  const previewBox = document.getElementById(`${prefix}-preview-box`);
  const previewImg = document.getElementById(`${prefix}-preview-img`) as HTMLImageElement;
  const previewName = document.getElementById(`${prefix}-preview-name`);
  const removeBtn = document.getElementById(`${prefix}-remove-photo-btn`);

  btnFile?.addEventListener('click', () => {
    if (btnFile) btnFile.className = 'btn btn-secondary btn-sm photo-mode-btn is-active';
    if (btnUrl) btnUrl.className = 'btn btn-tertiary btn-sm photo-mode-btn';
    if (fileContainer) fileContainer.style.display = 'block';
    if (urlContainer) urlContainer.style.display = 'none';
  });

  btnUrl?.addEventListener('click', () => {
    if (btnUrl) btnUrl.className = 'btn btn-secondary btn-sm photo-mode-btn is-active';
    if (btnFile) btnFile.className = 'btn btn-tertiary btn-sm photo-mode-btn';
    if (urlContainer) urlContainer.style.display = 'block';
    if (fileContainer) fileContainer.style.display = 'none';
  });

  // Drag & Drop visual feedback
  if (dropzone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--color-accent)';
        dropzone.style.background = 'var(--color-accent-subtle)';
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--color-border-strong)';
        dropzone.style.background = 'var(--color-surface-elevated)';
      });
    });
  }

  fileInput?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const res = evt.target?.result as string;
        if (res) {
          const compressed = await compressImage(res);
          if (previewImg) previewImg.src = compressed;
          if (previewName) previewName.textContent = `${file.name} (Compressed)`;
          if (previewBox) previewBox.style.display = 'flex';
          onUrlChanged(compressed);
        }
      };
      reader.readAsDataURL(file);
    }
  });

  urlInput?.addEventListener('input', () => {
    const val = urlInput.value.trim();
    if (val) {
      if (previewImg) previewImg.src = val;
      if (previewName) previewName.textContent = 'Image URL Attached';
      if (previewBox) previewBox.style.display = 'flex';
      onUrlChanged(val);
    } else {
      if (previewBox) previewBox.style.display = 'none';
      onUrlChanged('');
    }
  });

  removeBtn?.addEventListener('click', () => {
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
    if (previewBox) previewBox.style.display = 'none';
    if (previewImg) previewImg.src = '';
    onUrlChanged('');
  });
}

function exportAssetAuditCSV(equipmentList: EquipmentItem[]): void {
  const headers = [
    'Asset ID',
    'Equipment Name',
    'Category',
    'Serial Number',
    'Quantity (Units)',
    'Current Status',
    'Bundled Tools & Accessories',
    'Additional Notes',
    'Last Responsible PIC',
    'PIC Role',
    'Assigned Project',
    'Usage Period'
  ];

  const escapeCsv = (val: any): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = equipmentList.map((item) => {
    const recentHistory = item.history && item.history.length > 0 ? item.history[item.history.length - 1] : null;
    const bundled = (item.bundledTools || []).join(', ');
    const usageDates = recentHistory ? `${recentHistory.startDate} to ${recentHistory.endDate}` : '';

    return [
      escapeCsv(item.id),
      escapeCsv(item.name),
      escapeCsv(item.category),
      escapeCsv(item.serialNumber),
      escapeCsv(item.quantity || 1),
      escapeCsv(item.status),
      escapeCsv(bundled || 'None'),
      escapeCsv(item.additionalNotes || 'N/A'),
      escapeCsv(recentHistory ? recentHistory.responsiblePerson : 'Unassigned'),
      escapeCsv(recentHistory ? recentHistory.responsibleRole : 'N/A'),
      escapeCsv(recentHistory ? recentHistory.projectName : 'N/A'),
      escapeCsv(usageDates || 'N/A')
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `Soenrect_Asset_Audit_Export_${dateStr}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function computeEquipmentUsage(item: EquipmentItem, projects: ProjectRecord[]) {
  const projectDeployments: EquipmentUsageHistory[] = [];

  if (projects && Array.isArray(projects)) {
    projects.forEach((proj) => {
      if (proj.crewList && Array.isArray(proj.crewList)) {
        proj.crewList.forEach((crew) => {
          if (crew.assignedEquipmentIds && crew.assignedEquipmentIds.includes(item.id)) {
            const startDate = proj.eventDate
              ? proj.eventDate.includes(' to ')
                ? proj.eventDate.split(' to ')[0]
                : proj.eventDate
              : '2026-08-25';
            const endDate =
              proj.eventDate && proj.eventDate.includes(' to ')
                ? proj.eventDate.split(' to ')[1]
                : proj.eventDate || '2026-08-27';

            projectDeployments.push({
              id: `deploy-${proj.id}-${crew.crewId}`,
              equipmentId: item.id,
              responsiblePerson: crew.name,
              responsibleRole: crew.role,
              responsiblePhone: crew.phone,
              projectName: `${proj.projectName} (${proj.clientName})`,
              startDate: startDate,
              endDate: endDate,
              notes: `Deployed for event at ${proj.venueName}. Status: ${proj.status}`
            });
          }
        });
      }
    });
  }

  const combinedHistory = [...projectDeployments, ...(item.history || [])];
  const isCurrentlyDeployed = projectDeployments.length > 0 || item.status === 'In Use';
  const effectiveStatus: 'Available' | 'In Use' | 'Maintenance' | 'Retired' = isCurrentlyDeployed
    ? 'In Use'
    : item.status;
  const activePIC = combinedHistory[0];

  return {
    effectiveStatus,
    combinedHistory,
    activePIC,
    isCurrentlyDeployed
  };
}

function openReturnEquipmentModal(
  item: EquipmentItem,
  projectsList: ProjectRecord[],
  onComplete: () => void
): void {
  const modalHtml = `
    <div>
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding: 14px 16px; background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
        ${renderEquipmentImage(item)}
        <div>
          <div style="font-size: var(--text-base); font-weight: bold; color: var(--color-foreground);">${item.name}</div>
          <div style="font-size: 11.5px; color: var(--color-foreground-muted); margin-top: 2px;">
            Asset ID: <span class="font-mono">${item.id}</span> &bull; Stock Qty: <strong style="color: var(--color-accent);">${item.quantity || 1} Units</strong>
          </div>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Post-Deployment Inspection Status</label>
        <select class="form-control" id="return-eq-status">
          <option value="Available" selected>Available (Good Condition & Clean)</option>
          <option value="Maintenance">Maintenance (Needs Repair / Servicing)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Return Notes / Inspection Summary</label>
        <textarea class="form-control" id="return-eq-notes" rows="3" placeholder="e.g. Item returned from event deployment in good working condition. Checked by PIC."></textarea>
      </div>
    </div>
  `;

  new ModalDialog({
    title: `Return Equipment: ${item.name}`,
    contentHtml: modalHtml,
    confirmText: 'Confirm Return & Update Stock',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const returnStatus = (document.getElementById('return-eq-status') as HTMLSelectElement).value as any;
      const returnNotes =
        (document.getElementById('return-eq-notes') as HTMLTextAreaElement).value.trim() ||
        'Returned to main inventory.';

      const todayStr = new Date().toISOString().split('T')[0];
      const returnHistoryEntry: EquipmentUsageHistory = {
        id: `return-${Date.now()}`,
        equipmentId: item.id,
        responsiblePerson: 'Warehouse Manager',
        responsibleRole: 'Inventory Check',
        responsiblePhone: '+62 812-3456-7890',
        projectName: 'Returned to Inventory',
        startDate: todayStr,
        endDate: todayStr,
        notes: `[RETURNED] ${returnNotes}`
      };

      const updatedHistory = [returnHistoryEntry, ...(item.history || [])];

      // Update equipment status
      await DataService.updateEquipment(item.id, {
        status: returnStatus,
        history: updatedHistory,
        additionalNotes: returnNotes
      });

      // Unassign this equipment ID from all projects
      for (const proj of projectsList) {
        if (proj.crewList && Array.isArray(proj.crewList)) {
          let updated = false;
          proj.crewList.forEach((c) => {
            if (c.assignedEquipmentIds && c.assignedEquipmentIds.includes(item.id)) {
              c.assignedEquipmentIds = c.assignedEquipmentIds.filter((id) => id !== item.id);
              updated = true;
            }
          });
          if (updated) {
            await DataService.updateProject(proj.id, { crewList: proj.crewList });
          }
        }
      }

      onComplete();
    }
  }).open();
}

export async function renderEquipmentManagement(
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
        { label: 'Equipment Inventory & History' }
      ])}
      <h1>
        Equipment Inventory & Category Control
        <span class="badge badge-orange"><span class="badge-dot"></span>Asset Control</span>
      </h1>
      <div class="page-title-description">Browse gear inventory, stock quantities (units), photo uploads, bundled tools/accessories, and category subtabs.</div>
    </div>
    <div class="btn-group">
      <button class="btn btn-secondary btn-sm" id="btn-export-equipment">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Export Asset Audit
      </button>
      <button class="btn btn-primary btn-sm" id="btn-add-equipment">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add New Equipment
      </button>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') {
    container.appendChild(createEquipmentSkeleton());
    return;
  }
  const equipmentList = await DataService.getEquipmentList();
  const projectsList = await DataService.getProjects();

  // 1. STAT CARDS OVERVIEW (RESPONSIVE GRID WITH QUANTITY UNITS)
  const totalTypes = equipmentList.length;
  const totalQuantity = equipmentList.reduce((sum, e) => sum + (e.quantity || 1), 0);

  let inUseQty = 0;
  let availableQty = 0;
  let maintenanceQty = 0;

  equipmentList.forEach((e) => {
    const usage = computeEquipmentUsage(e, projectsList);
    const qty = e.quantity || 1;
    if (usage.effectiveStatus === 'In Use') inUseQty += qty;
    else if (usage.effectiveStatus === 'Available') availableQty += qty;
    else if (usage.effectiveStatus === 'Maintenance') maintenanceQty += qty;
  });

  const statsGrid = document.createElement('div');
  statsGrid.className = 'equipment-stats-grid';

  statsGrid.innerHTML = `
    <div class="card" style="padding: var(--space-4) var(--space-5);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Total Stock Units</div>
        <span class="badge badge-neutral">Inventory</span>
      </div>
      <div class="font-mono" style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-foreground); margin-top: 6px;">${totalQuantity} Units</div>
      <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px;">${totalTypes} Registered Gear Types</div>
    </div>

    <div class="card" style="padding: var(--space-4) var(--space-5);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">In Use / Deployed</div>
        <span class="badge badge-orange"><span class="badge-dot"></span>Active</span>
      </div>
      <div class="font-mono" style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-accent); margin-top: 6px;">${inUseQty} Units</div>
      <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px;">Deployed on Stage/Events</div>
    </div>

    <div class="card" style="padding: var(--space-4) var(--space-5);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Available</div>
        <span class="badge badge-success"><span class="badge-dot"></span>Ready</span>
      </div>
      <div class="font-mono" style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-success); margin-top: 6px;">${availableQty} Units</div>
      <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px;">In Warehouse / Storage</div>
    </div>

    <div class="card" style="padding: var(--space-4) var(--space-5);">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: var(--color-foreground-subtle); letter-spacing: 0.05em;">Maintenance</div>
        <span class="badge badge-warning"><span class="badge-dot"></span>Servicing</span>
      </div>
      <div class="font-mono" style="font-size: var(--text-2xl); font-weight: bold; color: var(--color-warning); margin-top: 6px;">${maintenanceQty} Units</div>
      <div style="font-size: 11px; color: var(--color-foreground-muted); margin-top: 2px;">Under Repair / Inspection</div>
    </div>
  `;
  container.appendChild(statsGrid);

  // 2. MAIN LAYOUT & FILTERED TABLES
  const layoutContainer = document.createElement('div');
  layoutContainer.className = 'equipment-layout-grid';

  const sidebarSubtabsContainer = document.createElement('div');
  sidebarSubtabsContainer.className = 'equipment-sidebar-subtabs';

  const mainContentArea = document.createElement('div');
  mainContentArea.className = 'equipment-main-content';

  let activeSubtab = 'ALL';

  const renderSidebarSubtabs = () => {
    sidebarSubtabsContainer.innerHTML = `
      <div class="card" style="padding: var(--space-4);">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-foreground-subtle); margin-bottom: var(--space-3);">
          Equipment Categories
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <button class="eq-subtab-btn ${activeSubtab === 'ALL' ? 'active' : ''}" data-subtab="ALL">
            <span>All Categories</span>
            <span class="badge badge-neutral font-mono">${equipmentList.length}</span>
          </button>
          ${CategoryStoreService.getCategories('equipment')
            .map((cat) => {
              const count = equipmentList.filter((e) => e.category === cat).length;
              return `
                <button class="eq-subtab-btn ${activeSubtab === cat ? 'active' : ''}" data-subtab="${cat}">
                  <span>${cat}</span>
                  <span class="badge badge-neutral font-mono">${count}</span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>
    `;

    sidebarSubtabsContainer.querySelectorAll('.eq-subtab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeSubtab = (e.currentTarget as HTMLElement).getAttribute('data-subtab') || 'ALL';
        renderSidebarSubtabs();
        renderFilteredEquipmentTables();
      });
    });
  };

  layoutContainer.appendChild(sidebarSubtabsContainer);

  const renderFilteredEquipmentTables = () => {
    mainContentArea.innerHTML = '';

    const categoriesToDisplay =
      activeSubtab === 'ALL'
        ? CategoryStoreService.getCategories('equipment')
        : [activeSubtab];

    categoriesToDisplay.forEach((catName) => {
      const itemsInCat = equipmentList.filter((e) => e.category === catName);
      if (itemsInCat.length === 0) return;

      const catCard = document.createElement('div');
      catCard.className = 'card';

      catCard.innerHTML = `
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            ${catName} (${itemsInCat.length} Asset${itemsInCat.length > 1 ? 's' : ''})
          </div>
          <span class="badge badge-neutral">${catName}</span>
        </div>

        <!-- DESKTOP DATA TABLE -->
        <div class="table-wrapper desktop-table-view">
          <table class="data-table">
            <thead>
              <tr>
                <th style="min-width: 380px;">EQUIPMENT PHOTO & ASSET NAME</th>
                <th>QTY (UNITS)</th>
                <th>SERIAL NUMBER</th>
                <th>STATUS</th>
                <th>BUNDLED TOOLS & ACCESSORIES</th>
                <th>MOST RECENT RESPONSIBLE PERSON</th>
                <th>USAGE DATE RANGE</th>
                <th>ADDITIONAL NOTES & CONDITION</th>
                <th style="width: 340px; min-width: 340px;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${itemsInCat
                .map((item: EquipmentItem) => {
                  const { effectiveStatus, combinedHistory, activePIC, isCurrentlyDeployed } = computeEquipmentUsage(
                    item,
                    projectsList
                  );

                  const statusBadge =
                    effectiveStatus === 'In Use'
                      ? 'badge-orange'
                      : effectiveStatus === 'Available'
                      ? 'badge-success'
                      : effectiveStatus === 'Maintenance'
                      ? 'badge-warning'
                      : 'badge-neutral';

                  const notesText = item.additionalNotes || (activePIC && activePIC.notes) || 'Clean condition, no damage recorded.';

                  const tools =
                    item.bundledTools && item.bundledTools.length > 0
                      ? item.bundledTools
                      : ['Wireless Remote Control', 'Standard HDMI 10m', 'AC Power Cable'];

                  const returnBtnHtml =
                    isCurrentlyDeployed || effectiveStatus === 'In Use'
                      ? `<button class="btn btn-secondary btn-sm return-equipment-btn" data-id="${item.id}" style="font-size: 11px; padding: 4px 10px; color: var(--color-success); border-color: var(--color-success); font-weight: 600;" title="Return item back to inventory">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l-4 4 4 4"></path><path d="M5 15h11a5 5 0 0 0 5-5v-1"></path></svg> Return
                         </button>`
                      : '';

                  return `
                    <tr>
                      <td style="min-width: 380px;">
                        <div style="display: flex; align-items: center; gap: 14px;">
                          ${renderEquipmentImage(item)}
                          <div>
                            <div style="font-weight: 600; color: var(--color-foreground); font-size: 13.5px; line-height: 1.4;">${item.name}</div>
                            <div style="font-size: 11px; color: var(--color-foreground-subtle); margin-top: 2px;">Asset ID: ${item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-neutral font-mono" style="font-weight: bold; font-size: 12px; padding: 4px 8px;">
                          ${item.quantity || 1} Units
                        </span>
                      </td>
                      <td class="font-mono" style="font-size: var(--text-xs); color: var(--color-foreground-muted);">${item.serialNumber}</td>
                      <td><span class="badge ${statusBadge}"><span class="badge-dot"></span>${effectiveStatus}</span></td>
                      <td style="max-width: 220px;">
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                          ${tools.map((tool) => `<span class="badge badge-neutral font-mono" style="font-size: 10px; padding: 2px 6px;">+ ${tool}</span>`).join('')}
                        </div>
                      </td>
                      <td>
                        ${
                          activePIC
                            ? `<div style="font-weight: 500;">${activePIC.responsiblePerson}</div>
                               <div style="font-size: 11px; color: var(--color-foreground-subtle);">${activePIC.responsibleRole} (${activePIC.responsiblePhone})</div>`
                            : `<span style="color: var(--color-foreground-subtle); font-style: italic;">No active assignment</span>`
                        }
                      </td>
                      <td>
                        ${
                          activePIC
                            ? `<div class="font-mono" style="font-size: var(--text-xs); color: var(--color-accent); font-weight: 500;">
                                ${activePIC.startDate} &rarr; ${activePIC.endDate}
                               </div>
                               <div style="font-size: 11px; color: var(--color-foreground-muted);">${activePIC.projectName}</div>`
                            : `<span style="color: var(--color-foreground-subtle); font-style: italic;">N/A</span>`
                        }
                      </td>
                      <td style="max-width: 200px;">
                        <div style="font-size: 11.5px; color: var(--color-foreground-muted); line-height: 1.4;">
                          <span style="font-weight: 500; color: var(--color-foreground-subtle);">&bull;</span> ${notesText}
                        </div>
                      </td>
                      <td>
                        <div class="btn-group">
                          ${returnBtnHtml}
                          <button class="btn btn-tertiary btn-sm edit-equipment-btn" data-id="${item.id}" title="Edit Equipment Details & Notes">
                            Edit
                          </button>
                          <button class="btn btn-tertiary btn-sm view-history-btn" data-id="${item.id}">
                            Log (${combinedHistory.length})
                          </button>
                          <button class="btn btn-destructive btn-sm delete-equipment-btn" data-id="${item.id}" title="Delete Equipment Asset">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- MOBILE / TABLET CARD LIST VIEW -->
        <div class="table-card-list">
          ${itemsInCat
            .map((item: EquipmentItem) => {
              const { effectiveStatus, combinedHistory, activePIC, isCurrentlyDeployed } = computeEquipmentUsage(
                item,
                projectsList
              );

              const statusBadge =
                effectiveStatus === 'In Use'
                  ? 'badge-orange'
                  : effectiveStatus === 'Available'
                  ? 'badge-success'
                  : effectiveStatus === 'Maintenance'
                  ? 'badge-warning'
                  : 'badge-neutral';

              const notesText = item.additionalNotes || (activePIC && activePIC.notes) || 'Clean condition, no damage recorded.';

              const tools =
                item.bundledTools && item.bundledTools.length > 0
                  ? item.bundledTools
                  : ['Wireless Remote Control', 'Standard HDMI 10m Cable', 'AC Power Cable'];

              const returnBtnHtml =
                isCurrentlyDeployed || effectiveStatus === 'In Use'
                  ? `<button class="btn btn-secondary btn-sm return-equipment-btn" data-id="${item.id}" style="font-size: 11px; padding: 4px 10px; color: var(--color-success); border-color: var(--color-success); font-weight: 600;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l-4 4 4 4"></path><path d="M5 15h11a5 5 0 0 0 5-5v-1"></path></svg> Return Asset
                     </button>`
                  : '';

              return `
                <div class="eq-mobile-card">
                  <!-- CARD HEADER -->
                  <div class="eq-mobile-card-header">
                    ${renderEquipmentImage(item)}
                    <div style="min-width: 0; flex: 1;">
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                        <span class="badge badge-neutral" style="font-size: 10px; padding: 2px 6px;">${item.category}</span>
                        <span class="badge ${statusBadge}"><span class="badge-dot"></span>${effectiveStatus}</span>
                      </div>
                      <div style="font-weight: bold; color: var(--color-foreground); font-size: 14px; margin-top: 4px; line-height: 1.3;">
                        ${item.name}
                      </div>
                    </div>
                  </div>

                  <!-- CARD BODY GRID -->
                  <div class="eq-mobile-card-body">
                    <div class="eq-mobile-card-field">
                      <div class="eq-mobile-card-field-label">Stock Quantity</div>
                      <div class="eq-mobile-card-field-value font-mono" style="color: var(--color-accent); font-weight: bold;">
                        ${item.quantity || 1} Units
                      </div>
                    </div>

                    <div class="eq-mobile-card-field">
                      <div class="eq-mobile-card-field-label">Serial Number</div>
                      <div class="eq-mobile-card-field-value font-mono">
                        ${item.serialNumber}
                      </div>
                    </div>

                    <div class="eq-mobile-card-field">
                      <div class="eq-mobile-card-field-label">Responsible PIC</div>
                      <div class="eq-mobile-card-field-value">
                        ${activePIC ? `${activePIC.responsiblePerson}` : 'Unassigned'}
                      </div>
                    </div>

                    <div class="eq-mobile-card-field">
                      <div class="eq-mobile-card-field-label">Usage Dates & Event</div>
                      <div class="eq-mobile-card-field-value font-mono" style="font-size: 11px;">
                        ${activePIC ? `${activePIC.startDate} &rarr; ${activePIC.endDate}` : 'N/A'}
                      </div>
                    </div>

                    <div class="eq-mobile-card-field-full">
                      <div class="eq-mobile-card-field-label">Bundled Tools & Accessories</div>
                      <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                        ${tools.map((t) => `<span class="badge badge-neutral font-mono" style="font-size: 10px; padding: 2px 6px;">+ ${t}</span>`).join('')}
                      </div>
                    </div>

                    <div class="eq-mobile-card-field-full">
                      <div class="eq-mobile-card-field-label">Condition & Notes</div>
                      <div class="eq-mobile-card-field-value" style="font-size: 11.5px; color: var(--color-foreground-muted);">
                        ${notesText}
                      </div>
                    </div>
                  </div>

                  <!-- CARD ACTIONS FOOTER -->
                  <div class="eq-mobile-card-actions">
                    ${returnBtnHtml}
                    <button class="btn btn-tertiary btn-sm edit-equipment-btn" data-id="${item.id}">
                      Edit Asset
                    </button>
                    <button class="btn btn-tertiary btn-sm view-history-btn" data-id="${item.id}">
                      Log (${combinedHistory.length})
                    </button>
                    <button class="btn btn-destructive btn-sm delete-equipment-btn" data-id="${item.id}">
                      Delete
                    </button>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;

      mainContentArea.appendChild(catCard);
    });

    // Attach Event Handlers
    mainContentArea.querySelectorAll('.return-equipment-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const item = equipmentList.find((e) => e.id === id);
        if (item) {
          openReturnEquipmentModal(item, projectsList, () => renderEquipmentManagement(container, viewState));
        }
      });
    });

    mainContentArea.querySelectorAll('.edit-equipment-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const item = equipmentList.find((e) => e.id === id);
        if (item) {
          openEditEquipmentModal(item, () => renderEquipmentManagement(container, viewState));
        }
      });
    });

    mainContentArea.querySelectorAll('.delete-equipment-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const item = equipmentList.find((e) => e.id === id);
        if (item) {
          openStrictDeleteEquipmentModal(item, () => renderEquipmentManagement(container, viewState));
        }
      });
    });

    mainContentArea.querySelectorAll('.view-history-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const item = equipmentList.find((e) => e.id === id);
        if (item) {
          const { combinedHistory } = computeEquipmentUsage(item, projectsList);
          openFullHistoryModal(item, combinedHistory, () =>
            openReturnEquipmentModal(item, projectsList, () => renderEquipmentManagement(container, viewState))
          );
        }
      });
    });

    mainContentArea.querySelectorAll('.lightbox-trigger').forEach((img) => {
      img.addEventListener('click', (e) => {
        const src = (e.currentTarget as HTMLElement).getAttribute('data-image-src');
        const title = (e.currentTarget as HTMLElement).getAttribute('data-image-title');
        if (src) {
          openImageLightboxModal(src, title || 'Equipment Image');
        }
      });
    });
  };

  layoutContainer.appendChild(mainContentArea);
  container.appendChild(layoutContainer);

  renderSidebarSubtabs();
  renderFilteredEquipmentTables();

  // Export Asset Audit Handler
  titleBar.querySelector('#btn-export-equipment')?.addEventListener('click', () => {
    if (equipmentList && equipmentList.length > 0) {
      exportAssetAuditCSV(equipmentList);
    }
  });

  // Add Equipment Handler
  titleBar.querySelector('#btn-add-equipment')?.addEventListener('click', () => {
    let photoUrlVal = '';

    const modal = new ModalDialog({
      title: 'Register New Equipment Asset',
      contentHtml: `
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Equipment Name</label>
          <input type="text" class="form-control" id="add-eq-name" placeholder="e.g. Panasonic 30K Lumens DLP Laser Projector" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-control" id="add-eq-category">
              ${CategoryStoreService.getCategories('equipment')
                .map((cat) => `<option>${cat}</option>`)
                .join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Quantity (Units)</label>
            <input type="number" class="form-control" id="add-eq-qty" value="1" min="1" />
          </div>
          <div class="form-group">
            <label class="form-label">Serial Number</label>
            <input type="text" class="form-control" id="add-eq-sn" placeholder="SN-9988-PANA" />
          </div>
        </div>
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Bundled Tools & Included Accessories (Comma-separated)</label>
          <input type="text" class="form-control" id="add-eq-bundled" placeholder="e.g. Remote Control, Standard HDMI, Power Cable" />
        </div>
        <div class="form-group" style="margin-bottom: var(--space-4);">
          <label class="form-label">Additional Notes & Condition (Damage, Scratches, Issues)</label>
          <textarea class="form-control" id="add-eq-notes" rows="3" placeholder="e.g. Minor cosmetic scuff on outer chassis, optical element clean."></textarea>
        </div>

        ${renderPhotoSelectorHtml('', 'add-photo')}
      `,
      confirmText: 'Save Equipment',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const nameVal = (document.getElementById('add-eq-name') as HTMLInputElement)?.value.trim();
        const catVal = (document.getElementById('add-eq-category') as HTMLSelectElement)?.value as any;
        const qtyVal = (document.getElementById('add-eq-qty') as HTMLInputElement)?.value;
        const snVal = (document.getElementById('add-eq-sn') as HTMLInputElement)?.value.trim();
        const bundledVal = (document.getElementById('add-eq-bundled') as HTMLInputElement)?.value;
        const notesVal = (document.getElementById('add-eq-notes') as HTMLTextAreaElement)?.value.trim();

        if (!nameVal) return;

        const bundledTools = bundledVal ? bundledVal.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

        await DataService.createEquipment({
          name: nameVal,
          category: catVal || 'Projection Equipment',
          quantity: parseInt(qtyVal, 10) || 1,
          serialNumber: snVal || `SN-${Math.floor(Math.random() * 9000 + 1000)}`,
          status: 'Available',
          imageUrl: photoUrlVal || undefined,
          additionalNotes: notesVal || undefined,
          bundledTools,
          history: []
        });

        renderEquipmentManagement(container, viewState);
      }
    });

    modal.open();

    setTimeout(() => {
      attachPhotoSelectorHandlers('add-photo', (url) => {
        photoUrlVal = url;
      });
    }, 50);
  });
}

function openEditEquipmentModal(item: EquipmentItem, onSaved?: () => void): void {
  let photoUrlVal = item.imageUrl || '';

  const currentBundled = item.bundledTools && item.bundledTools.length > 0
    ? item.bundledTools.join(', ')
    : 'Wireless Remote Control, Standard HDMI Cable, AC Power Cable';

  const modalHtml = `
    <div>
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Equipment Name</label>
        <input type="text" class="form-control" id="edit-eq-name" value="${item.name}" />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" id="edit-eq-category">
            ${CategoryStoreService.getCategories('equipment')
              .map((cat) => `<option ${item.category === cat ? 'selected' : ''}>${cat}</option>`)
              .join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Quantity (Units)</label>
          <input type="number" class="form-control" id="edit-eq-qty" value="${item.quantity || 1}" min="1" />
        </div>

        <div class="form-group">
          <label class="form-label">Serial Number</label>
          <input type="text" class="form-control" id="edit-eq-sn" value="${item.serialNumber}" />
        </div>

        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="edit-eq-status">
            <option ${item.status === 'Available' ? 'selected' : ''}>Available</option>
            <option ${item.status === 'In Use' ? 'selected' : ''}>In Use</option>
            <option ${item.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
            <option ${item.status === 'Retired' ? 'selected' : ''}>Retired</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Bundled Tools & Included Accessories (Comma-separated)</label>
        <input type="text" class="form-control" id="edit-eq-bundled" value="${currentBundled}" placeholder="e.g. Remote Control, Standard HDMI, Power Cable" />
      </div>

      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Additional Notes & Condition Logs (Damages / Inspection Notes)</label>
        <textarea class="form-control" id="edit-eq-notes" rows="3">${item.additionalNotes || ''}</textarea>
      </div>

      ${renderPhotoSelectorHtml(item.imageUrl || '', 'edit-photo')}

      <div style="padding-top: 12px; margin-top: 12px; border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end;">
        <button type="button" class="btn btn-destructive btn-sm" id="btn-delete-eq-action">
          Delete Equipment Asset
        </button>
      </div>
    </div>
  `;

  const modal = new ModalDialog({
    title: `Edit Equipment Asset: ${item.name}`,
    contentHtml: modalHtml,
    confirmText: 'Save Changes',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const nameVal = (document.getElementById('edit-eq-name') as HTMLInputElement)?.value.trim();
      const qtyVal = (document.getElementById('edit-eq-qty') as HTMLInputElement)?.value;
      const snVal = (document.getElementById('edit-eq-sn') as HTMLInputElement)?.value.trim();
      const catVal = (document.getElementById('edit-eq-category') as HTMLSelectElement)?.value as any;
      const statusVal = (document.getElementById('edit-eq-status') as HTMLSelectElement)?.value as any;
      const bundledVal = (document.getElementById('edit-eq-bundled') as HTMLInputElement)?.value;
      const notesVal = (document.getElementById('edit-eq-notes') as HTMLTextAreaElement)?.value.trim();

      const bundledTools = bundledVal !== undefined
        ? bundledVal.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;

      await DataService.updateEquipment(item.id, {
        name: nameVal,
        quantity: parseInt(qtyVal, 10) || 1,
        serialNumber: snVal,
        category: catVal,
        status: statusVal,
        additionalNotes: notesVal,
        imageUrl: photoUrlVal || undefined,
        bundledTools
      });

      if (onSaved) onSaved();
    }
  });

  modal.open();

  setTimeout(() => {
    attachPhotoSelectorHandlers('edit-photo', (url) => {
      photoUrlVal = url;
    });

    document.getElementById('btn-delete-eq-action')?.addEventListener('click', () => {
      modal.close();
      openStrictDeleteEquipmentModal(item, () => {
        if (onSaved) onSaved();
      });
    });
  }, 50);
}

function openStrictDeleteEquipmentModal(item: EquipmentItem, onDeleted?: () => void): void {
  new StrictDeleteModal({
    itemName: item.name,
    itemType: 'equipment asset',
    onConfirmDelete: async () => {
      await DataService.deleteEquipment(item.id);
      if (onDeleted) onDeleted();
    }
  }).open();
}

function openFullHistoryModal(
  item: EquipmentItem,
  combinedHistory?: EquipmentUsageHistory[],
  onReturnClick?: () => void
): void {
  const logList = combinedHistory && combinedHistory.length > 0 ? combinedHistory : item.history;
  const tools =
    item.bundledTools && item.bundledTools.length > 0
      ? item.bundledTools
      : ['Wireless Remote Control', 'Standard HDMI 10m', 'AC Power Cable'];

  const isDeployed = item.status === 'In Use' || (logList.length > 0 && !logList[0]?.notes?.includes('[RETURNED]'));

  const modalHtml = `
    <div class="history-log-modal">
      <!-- HEADER SUMMARY ITEM CARD -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 20px; padding: 14px 16px; background-color: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">
          ${renderEquipmentImage(item)}
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: var(--text-base); font-weight: bold; color: var(--color-foreground);">${item.name}</div>
            <div style="font-size: var(--text-xs); color: var(--color-foreground-muted);">
              Serial No: <span class="font-mono">${item.serialNumber}</span> &bull; Stock Qty: <strong style="color: var(--color-accent);">${item.quantity || 1} Units</strong> &bull; Category: ${item.category}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
              ${tools.map((t) => `<span class="badge badge-neutral font-mono" style="font-size: 10px; padding: 2px 6px;">+ ${t}</span>`).join('')}
            </div>
            ${item.additionalNotes ? `<div style="font-size: 11px; color: var(--color-warning); margin-top: 4px;">Notes: ${item.additionalNotes}</div>` : ''}
          </div>
        </div>
        ${
          isDeployed && onReturnClick
            ? `
          <button type="button" class="btn btn-secondary btn-sm modal-return-btn" style="font-size: 12px; font-weight: 600; color: var(--color-success); border-color: var(--color-success); padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l-4 4 4 4"></path><path d="M5 15h11a5 5 0 0 0 5-5v-1"></path></svg>
            Return Asset to Inventory
          </button>
        `
            : ''
        }
      </div>

      <div style="font-size: var(--text-xs); font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-foreground-subtle); margin-bottom: 12px;">
        Chronological Assignment Log (${logList.length} Record${logList.length > 1 ? 's' : ''})
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${
          logList.length > 0
            ? logList
                .map(
                  (hist: EquipmentUsageHistory, index: number) => `
              <div style="padding: 16px 20px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-left: 4px solid ${index === 0 ? 'var(--color-accent)' : 'var(--color-border-strong)'}; border-radius: var(--radius-md);">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="font-size: var(--text-sm); font-weight: bold; color: var(--color-foreground);">${hist.responsiblePerson}</div>
                    <span class="badge badge-neutral">${hist.responsibleRole}</span>
                    ${index === 0 ? `<span class="badge badge-orange"><span class="badge-dot"></span>Most Recent</span>` : ''}
                  </div>
                  <div class="font-mono" style="font-size: var(--text-xs); color: var(--color-accent); font-weight: 600; background: var(--color-accent-subtle); padding: 4px 10px; border-radius: var(--radius-full); border: 1px solid var(--color-accent-border);">
                    ${hist.startDate} &rarr; ${hist.endDate}
                  </div>
                </div>

                <div style="font-size: var(--text-xs); color: var(--color-foreground-muted); margin-bottom: 8px; line-height: 1.5;">
                  <strong>Project / Event:</strong> ${hist.projectName} &bull; <strong>Contact Phone:</strong> <span class="font-mono">${hist.responsiblePhone || 'N/A'}</span>
                </div>

                ${hist.notes ? `<div style="font-size: var(--text-xs); color: var(--color-foreground-subtle); font-style: italic; padding: 8px 12px; background: var(--color-bg); border-radius: var(--radius-sm); border-left: 2px solid var(--color-border-strong);">"${hist.notes}"</div>` : ''}
              </div>
            `
                )
                .join('')
            : `
              <div style="text-align: center; padding: 24px; color: var(--color-foreground-muted); font-size: 13px;">
                No usage history records found for this equipment asset.
              </div>
            `
        }
      </div>
    </div>
  `;

  const modal = new ModalDialog({
    title: `Equipment Usage History Log`,
    contentHtml: modalHtml,
    confirmText: 'Close Log'
  });

  modal.open();

  if (isDeployed && onReturnClick) {
    document.querySelector('.modal-return-btn')?.addEventListener('click', () => {
      modal.close();
      onReturnClick();
    });
  }
}

function createEquipmentSkeleton(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'card';
  div.style.height = '300px';
  div.style.opacity = '0.5';
  div.innerHTML = `<div style="padding: 40px; text-align: center;">Loading equipment database...</div>`;
  return div;
}

/**
 * Client-side Image Compression using HTML Canvas
 */
function compressImage(base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

/**
 * Image Lightbox Modal to show large image previews
 */
function openImageLightboxModal(imageUrl: string, title: string): void {
  const modalHtml = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #000000; padding: 16px; border-radius: 12px;">
      <img src="${imageUrl}" alt="${title}" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);" />
      <div style="font-size: 13.5px; font-weight: 600; color: #ffffff; text-align: center;">${title}</div>
    </div>
  `;

  new ModalDialog({
    title: 'Image Viewer',
    contentHtml: modalHtml,
    confirmText: 'Close Viewer'
  }).open();
}
