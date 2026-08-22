/* ==========================================================================
   BADGE PRIMITIVE COMPONENT
   ========================================================================== */

export interface BadgeOptions {
  text: string;
  variant?: 'neutral' | 'orange' | 'success' | 'warning' | 'error' | 'info';
  showDot?: boolean;
}

export function createBadge(options: BadgeOptions): HTMLSpanElement {
  const badge = document.createElement('span');
  const variant = options.variant || 'neutral';
  badge.className = `badge badge-${variant}`;

  let html = '';
  if (options.showDot) {
    html += `<span class="badge-dot"></span>`;
  }
  html += `<span>${options.text}</span>`;
  
  badge.innerHTML = html;
  return badge;
}
