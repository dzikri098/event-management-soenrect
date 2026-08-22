/* ==========================================================================
   KPI & METRICS CARD COMPONENT
   ========================================================================== */

import { MetricRecord } from '../../types/database';

export function createKpiCard(metric: MetricRecord): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card kpi-card';

  const isUp = metric.trend === 'up';
  const isDown = metric.trend === 'down';
  const trendClass = isUp ? 'is-up' : isDown ? 'is-down' : 'is-neutral';
  
  const trendIcon = isUp
    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>`
    : isDown
    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>`
    : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

  const sign = metric.changePercentage > 0 ? '+' : '';

  card.innerHTML = `
    <div class="kpi-top">
      <span class="kpi-label">${metric.title}</span>
      <div class="kpi-icon-wrapper" title="${metric.category}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      </div>
    </div>

    <div class="kpi-value-row">
      <div class="kpi-value">${metric.formattedValue}</div>
      <div class="kpi-trend ${trendClass}">
        ${trendIcon}
        <span>${sign}${metric.changePercentage}%</span>
      </div>
    </div>

    <div class="kpi-footer">
      <span>${metric.timeframe}</span>
      <span style="font-family: var(--font-mono); color: var(--color-foreground-muted);">${metric.category}</span>
    </div>
  `;

  return card;
}
