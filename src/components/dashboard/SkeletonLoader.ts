/* ==========================================================================
   SYSTEM SKELETON LOADER COMPONENT
   ========================================================================== */

export function renderKpiSkeleton(): string {
  return `
    <div class="card kpi-card">
      <div class="kpi-top">
        <div class="skeleton" style="width: 90px; height: 12px;"></div>
        <div class="skeleton" style="width: 32px; height: 32px; border-radius: 6px;"></div>
      </div>
      <div class="kpi-value-row">
        <div class="skeleton" style="width: 130px; height: 32px;"></div>
        <div class="skeleton" style="width: 50px; height: 18px;"></div>
      </div>
      <div class="kpi-footer">
        <div class="skeleton" style="width: 100px; height: 12px;"></div>
      </div>
    </div>
  `;
}

export function renderChartSkeleton(): string {
  return `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="skeleton" style="width: 180px; height: 20px; margin-bottom: 6px;"></div>
          <div class="skeleton" style="width: 120px; height: 12px;"></div>
        </div>
        <div class="skeleton" style="width: 120px; height: 28px; border-radius: 6px;"></div>
      </div>
      <div class="skeleton" style="width: 100%; height: 240px; border-radius: 8px;"></div>
    </div>
  `;
}

export function renderTableSkeleton(): string {
  return `
    <div class="table-wrapper">
      <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
        <div class="skeleton" style="width: 100%; height: 36px; border-radius: 4px;"></div>
        <div class="skeleton" style="width: 100%; height: 44px; border-radius: 4px;"></div>
        <div class="skeleton" style="width: 100%; height: 44px; border-radius: 4px;"></div>
        <div class="skeleton" style="width: 100%; height: 44px; border-radius: 4px;"></div>
        <div class="skeleton" style="width: 100%; height: 44px; border-radius: 4px;"></div>
      </div>
    </div>
  `;
}
