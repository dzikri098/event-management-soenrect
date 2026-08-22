/* ==========================================================================
   CANVAS CHART RENDERING ENGINE (HIGH PERFORMANCE, CRISP HIDPI SCALED)
   Supports Area Chart, Bar Chart, Donut Chart, and Sparklines.
   ========================================================================== */

import { ChartSeriesData } from '../../types/database';

export function renderAreaChart(
  container: HTMLElement,
  series: ChartSeriesData,
  onRangeChange?: (range: '24h' | '7d' | '30d' | '1y') => void
): void {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            System Revenue & Telemetry Ingestion
          </div>
          <div class="card-subtitle">Real-time throughput metrics over timeframe</div>
        </div>
        <div class="chart-header-actions">
          <div class="segmented-control">
            <button class="segmented-item ${series.timeframe === '24h' ? 'is-active' : ''}" data-range="24h">24h</button>
            <button class="segmented-item ${series.timeframe === '7d' ? 'is-active' : ''}" data-range="7d">7d</button>
            <button class="segmented-item ${series.timeframe === '30d' ? 'is-active' : ''}" data-range="30d">30d</button>
            <button class="segmented-item ${series.timeframe === '1y' ? 'is-active' : ''}" data-range="1y">1y</button>
          </div>
        </div>
      </div>

      <div class="chart-canvas-wrapper">
        <canvas id="area-chart-canvas"></canvas>
        <div class="chart-tooltip" id="area-chart-tooltip"></div>
      </div>
    </div>
  `;

  // Handle Range Clicks
  const buttons = container.querySelectorAll('.segmented-item');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const range = target.getAttribute('data-range') as any;
      if (onRangeChange && range) onRangeChange(range);
    });
  });

  // Canvas Drawing Logic
  const canvas = container.querySelector('#area-chart-canvas') as HTMLCanvasElement;
  const tooltip = container.querySelector('#area-chart-tooltip') as HTMLElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const points = series.points;
  if (points.length < 2) return;

  const width = rect.width;
  const height = rect.height;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...points.map((p) => p.value)) * 1.15;
  const minVal = 0;

  // Grid Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const y = paddingTop + (chartHeight / gridSteps) * i;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();

    // Y Axis Labels
    const valLabel = Math.round(maxVal - (maxVal / gridSteps) * i);
    ctx.fillStyle = 'rgba(161, 161, 170, 0.7)';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${valLabel}`, paddingLeft - 8, y + 4);
  }

  // Calculate coordinates
  const coords = points.map((p, idx) => {
    const x = paddingLeft + (chartWidth / (points.length - 1)) * idx;
    const y = paddingTop + chartHeight - ((p.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, point: p };
  });

  // Gradient Fill
  const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  gradient.addColorStop(0, 'rgba(255, 85, 0, 0.35)');
  gradient.addColorStop(1, 'rgba(255, 85, 0, 0.0)');

  // Fill Path
  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);
  for (let i = 1; i < coords.length; i++) {
    ctx.lineTo(coords[i].x, coords[i].y);
  }
  ctx.lineTo(coords[coords.length - 1].x, height - paddingBottom);
  ctx.lineTo(coords[0].x, height - paddingBottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Stroke Line
  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);
  for (let i = 1; i < coords.length; i++) {
    ctx.lineTo(coords[i].x, coords[i].y);
  }
  ctx.strokeStyle = '#FF5500';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw Dots
  coords.forEach((c) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#09090B';
    ctx.fill();
    ctx.strokeStyle = '#FF5500';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Hover Interaction
  canvas.addEventListener('mousemove', (e) => {
    const bound = canvas.getBoundingClientRect();
    const mouseX = e.clientX - bound.left;

    let closest = coords[0];
    let minDistance = Math.abs(mouseX - coords[0].x);
    for (let i = 1; i < coords.length; i++) {
      const dist = Math.abs(mouseX - coords[i].x);
      if (dist < minDistance) {
        minDistance = dist;
        closest = coords[i];
      }
    }

    if (minDistance < 30 && tooltip) {
      tooltip.classList.add('is-visible');
      tooltip.style.left = `${closest.x}px`;
      tooltip.style.top = `${closest.y - 45}px`;
      tooltip.innerHTML = `
        <div class="chart-tooltip-title">${closest.point.label}</div>
        <div class="chart-tooltip-value">$${closest.point.value.toLocaleString()}</div>
      `;
    } else if (tooltip) {
      tooltip.classList.remove('is-visible');
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.classList.remove('is-visible');
  });
}
