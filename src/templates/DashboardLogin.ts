/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — DASHBOARD LOGIN PAGE
   Features: Admin / Management login card with static .env credentials.
   ========================================================================== */

import { ActivePageTemplate } from '../types/ui';
import { AuthService } from '../services/authService';

export function renderDashboardLogin(
  container: HTMLElement,
  onNavigate: (template: ActivePageTemplate) => void
): void {
  container.className = 'template-executive-overview';
  container.style.minHeight = '80vh';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.position = 'relative';
  container.style.overflow = 'hidden';

  // 1. VIDEO BACKGROUND CONTAINER & SEQUENTIAL PLAYLIST LOOP
  const videoBgContainer = document.createElement('div');
  videoBgContainer.className = 'welcome-video-bg-container';
  videoBgContainer.style.position = 'absolute';
  videoBgContainer.style.top = '0';
  videoBgContainer.style.left = '0';
  videoBgContainer.style.width = '100%';
  videoBgContainer.style.height = '100%';
  videoBgContainer.style.overflow = 'hidden';
  videoBgContainer.style.zIndex = '0';
  videoBgContainer.style.pointerEvents = 'none';

  // Cinematic Vignette Shadow Overlay
  const videoOverlay = document.createElement('div');
  videoOverlay.style.position = 'absolute';
  videoOverlay.style.top = '0';
  videoOverlay.style.left = '0';
  videoOverlay.style.width = '100%';
  videoOverlay.style.height = '100%';
  videoOverlay.style.background = 'radial-gradient(ellipse at center, rgba(18, 18, 21, 0.05) 25%, rgba(18, 18, 21, 0.85) 100%)';
  videoOverlay.style.boxShadow = 'inset 0 0 150px 30px rgba(0, 0, 0, 0.85)';
  videoOverlay.style.zIndex = '1';

  // HTML5 Video Element
  const videoElem = document.createElement('video');
  videoElem.style.position = 'absolute';
  videoElem.style.top = '50%';
  videoElem.style.left = '50%';
  videoElem.style.width = '100%';
  videoElem.style.height = '100%';
  videoElem.style.objectFit = 'cover';
  videoElem.style.transform = 'translate(-50%, -50%)';
  videoElem.style.opacity = '0.9';
  videoElem.autoplay = true;
  videoElem.muted = true;
  videoElem.playsInline = true;

  const videoPlaylist = [
    '/video/web_alaqsa_2025_crf50.webm',
    '/video/web_condong_2025_crf50.webm',
    '/video/web_rajapolah_2025_crf50.webm'
  ];
  let currentVideoIndex = 0;

  videoElem.src = videoPlaylist[currentVideoIndex];
  videoElem.play().catch(() => { });

  videoElem.addEventListener('ended', () => {
    currentVideoIndex = (currentVideoIndex + 1) % videoPlaylist.length;
    videoElem.src = videoPlaylist[currentVideoIndex];
    videoElem.play().catch(() => { });
  });

  videoBgContainer.appendChild(videoElem);
  videoBgContainer.appendChild(videoOverlay);
  container.appendChild(videoBgContainer);

  const loginCard = document.createElement('div');
  loginCard.className = 'card auth-login-card';
  loginCard.style.maxWidth = '440px';
  loginCard.style.width = '100%';
  loginCard.style.padding = 'var(--space-8)';
  loginCard.style.position = 'relative';
  loginCard.style.zIndex = '2';
  loginCard.style.background = 'rgba(24, 24, 27, 0.85)';
  loginCard.style.backdropFilter = 'blur(12px)';
  loginCard.style.setProperty('-webkit-backdrop-filter', 'blur(12px)');

  const defaultUser = AuthService.getAdminUsername();
  const defaultPass = AuthService.getAdminPassword();

  loginCard.innerHTML = `
    <!-- HEADER BRANDING -->
    <div style="text-align: center; margin-bottom: var(--space-6);">
      <img src="/logo/LogoArt.png" alt="Soenrect Logo" style="width: 52px; height: 52px; object-fit: contain; margin: 0 auto 12px auto;" />
      <h2 style="font-size: var(--text-xl); font-weight: bold; color: var(--color-foreground);">
        Dashboard Admin Login
      </h2>
      <p style="font-size: var(--text-xs); color: var(--color-foreground-muted); margin-top: 4px;">
        Enter management credentials to access full dashboard controls.
      </p>
    </div>

    <!-- ERROR ALERT BOX -->
    <div id="login-error-alert" style="display: none; padding: 10px 14px; background: var(--color-error-subtle); border: 1px solid var(--color-error-border); border-radius: var(--radius-md); color: var(--color-error); font-size: 12px; margin-bottom: var(--space-4);">
      Invalid username or password credentials. Please try again.
    </div>

    <!-- LOGIN FORM -->
    <form id="admin-login-form">
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Username / Email Address</label>
        <input type="text" class="form-control" id="login-username" value=" " placeholder="e.g. admin.official@soenrect.com" required />
      </div>

      <div class="form-group" style="margin-bottom: var(--space-5);">
        <label class="form-label">Password</label>
        <input type="password" class="form-control" id="login-password" value=" " placeholder="Enter password" required />
      </div>

      <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; justify-content: center; margin-bottom: var(--space-4);">
        Sign In to Dashboard
      </button>
    </form>

    <!-- CREDENTIALS HELPER BADGE -->
    // <div style="padding: 10px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 11px; color: var(--color-foreground-subtle);">
    //   <div style="font-weight: bold; color: var(--color-accent); margin-bottom: 2px;">Environment Credentials (.env):</div>
    //   <div>Username: <strong style="color: var(--color-foreground);">${defaultUser}</strong></div>
    //   <div>Password: <strong style="color: var(--color-foreground);">${defaultPass}</strong></div>
    // </div>

    <!-- BACK TO WELCOME LINK -->
    <div style="text-align: center; margin-top: var(--space-5);">
      <button type="button" class="btn btn-tertiary btn-sm" id="btn-back-welcome" style="font-size: 12px;">
        &larr; Back to Welcoming Setup
      </button>
    </div>
  `;

  container.appendChild(loginCard);

  // Attach Form Submit Handler
  const form = loginCard.querySelector('#admin-login-form') as HTMLFormElement;
  const errorAlert = loginCard.querySelector('#login-error-alert') as HTMLElement;
  const userInput = loginCard.querySelector('#login-username') as HTMLInputElement;
  const passInput = loginCard.querySelector('#login-password') as HTMLInputElement;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = loginCard.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 0.8s linear infinite; width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Signing in...
      `;
    }

    const style = document.createElement('style');
    style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    if (!document.querySelector('[data-spin-style]')) {
      style.setAttribute('data-spin-style', '1');
      document.head.appendChild(style);
    }

    // Delay slightly to show loading state + allow DOM to flush before navigating
    setTimeout(() => {
      const success = AuthService.loginAdmin(userInput.value, passInput.value);

      if (success) {
        onNavigate('executive-overview');
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign In to Dashboard';
        }
        if (errorAlert) errorAlert.style.display = 'block';
      }
    }, 350);
  });

  loginCard.querySelector('#btn-back-welcome')?.addEventListener('click', () => {
    onNavigate('welcome');
  });
}
