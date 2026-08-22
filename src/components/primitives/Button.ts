/* ==========================================================================
   BUTTON PRIMITIVE COMPONENT
   ========================================================================== */

export interface ButtonOptions {
  text: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: string; // HTML string or Lucide icon SVG
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  isDisabled?: boolean;
  id?: string;
  className?: string;
  onClick?: (e: MouseEvent) => void;
}

export function createButton(options: ButtonOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  
  const variantClass = `btn-${options.variant || 'primary'}`;
  const sizeClass = options.size ? `btn-${options.size}` : '';
  btn.className = `btn ${variantClass} ${sizeClass} ${options.className || ''}`.trim();

  if (options.id) btn.id = options.id;
  if (options.isDisabled) {
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
  }

  const contentParts: string[] = [];

  if (options.isLoading) {
    contentParts.push('<span class="spinner" aria-hidden="true"></span>');
  } else if (options.icon && options.iconPosition !== 'right') {
    contentParts.push(`<span class="btn-icon-left">${options.icon}</span>`);
  }

  contentParts.push(`<span>${options.text}</span>`);

  if (!options.isLoading && options.icon && options.iconPosition === 'right') {
    contentParts.push(`<span class="btn-icon-right">${options.icon}</span>`);
  }

  btn.innerHTML = contentParts.join('');

  if (options.onClick) {
    btn.addEventListener('click', options.onClick);
  }

  return btn;
}
