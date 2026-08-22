/* ==========================================================================
   PAGE COMPOSITION TEMPLATE 2 — ANALYTICS & TELEMETRY SPLIT PATTERN
   ========================================================================== */

import { ApplicationViewState } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { renderChartSkeleton } from '../components/dashboard/SkeletonLoader';
import { createEmptyState } from '../components/dashboard/EmptyState';
import { createErrorState } from '../components/dashboard/ErrorState';
import { renderAreaChart } from '../components/charts/CanvasChart';

import { renderBreadcrumbs } from '../components/navigation/Breadcrumbs';

export async function renderAnalyticsDetail(
  container: HTMLElement,
  viewState: ApplicationViewState,
  onStateRetry: () => void
): Promise<void> {
  container.className = 'template-analytics-detail';

  const titleBar = document.createElement('div');
  titleBar.className = 'page-header-bar';
  titleBar.innerHTML = `
    <div class="page-title-group">
      ${renderBreadcrumbs([
        { label: 'Workspace', path: '/executive-overview' },
        { label: 'Analytics & System Telemetry Split' }
      ])}
      <h1>Analytics & System Telemetry Split</h1>
      <div class="page-title-description">Deep-dive telemetry visualizations and node throughput statistics.</div>
    </div>
  `;
  container.appendChild(titleBar);

  if (viewState === 'loading') {
    const split = document.createElement('div');
    split.className = 'two-column-equal';
    split.innerHTML = renderChartSkeleton() + renderChartSkeleton();
    container.appendChild(split);
    return;
  }

  if (viewState === 'empty') {
    container.appendChild(createEmptyState({ title: 'No Analytics Telemetry Recorded', description: 'No network traces available.', actionText: 'Start Ingestion', onAction: onStateRetry }));
    return;
  }

  if (viewState === 'error') {
    container.appendChild(createErrorState({ onRetry: onStateRetry }));
    return;
  }

  const series24h = await DataService.getChartSeries('24h');

  const splitGrid = document.createElement('div');
  splitGrid.className = 'two-column-equal';

  const col1 = document.createElement('div');
  col1.id = 'analytics-chart-1';
  splitGrid.appendChild(col1);

  const col2 = document.createElement('div');
  col2.className = 'card';
  col2.innerHTML = `
    <div class="card-header">
      <div class="card-title">Node Performance Breakout</div>
      <span class="badge badge-info">Cluster A</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 14px; font-size: var(--text-sm);">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
        <span style="color: var(--color-foreground-muted);">API Gateway Ingress</span>
        <span class="font-mono" style="font-weight: bold; color: var(--color-foreground);">99.98% uptime</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
        <span style="color: var(--color-foreground-muted);">Supabase Auth Latency</span>
        <span class="font-mono" style="font-weight: bold; color: var(--color-success);">12 ms avg</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-border); padding-bottom: 8px;">
        <span style="color: var(--color-foreground-muted);">Database Connection Pool</span>
        <span class="font-mono" style="font-weight: bold; color: var(--color-warning);">68 / 100 active</span>
      </div>
    </div>
  `;
  splitGrid.appendChild(col2);

  container.appendChild(splitGrid);

  renderAreaChart(col1, series24h);
}
