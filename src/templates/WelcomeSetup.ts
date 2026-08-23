/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — WELCOMING SETUP & SYSTEM ENTRY POINT
   Features: Welcoming hero screen with 2 primary entry choices:
   1. Dashboard Login (Admin / Management)
   2. Crew Portal Access (Field Roster & SOP compliance)
   ========================================================================== */

import { ActivePageTemplate } from '../types/ui';

export function renderWelcomeSetup(
  container: HTMLElement,
  onNavigate: (template: ActivePageTemplate) => void
): void {
  container.className = 'template-auth-page';

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

  // Cinematic Vignette Shadow Overlay (Clear Center, Darkened Edges)
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

  // Video Assets Playlist (Looping through all videos in public/video)
  const videoPlaylist = [
    '/video/web_alaqsa_2025_crf50.webm',
    '/video/web_condong_2025_crf50.webm',
    '/video/web_rajapolah_2025_crf50.webm'
  ];
  let currentVideoIndex = 0;

  videoElem.src = videoPlaylist[currentVideoIndex];
  videoElem.play().catch(() => { });

  // Play next video sequentially when current video ends
  videoElem.addEventListener('ended', () => {
    currentVideoIndex = (currentVideoIndex + 1) % videoPlaylist.length;
    videoElem.src = videoPlaylist[currentVideoIndex];
    videoElem.play().catch(() => { });
  });

  videoBgContainer.appendChild(videoElem);
  videoBgContainer.appendChild(videoOverlay);
  container.appendChild(videoBgContainer);

  // 2. HERO CONTENT BOX OVERLAY
  const heroBox = document.createElement('div');
  heroBox.style.maxWidth = '780px';
  heroBox.style.width = '100%';
  heroBox.style.textAlign = 'center';
  heroBox.style.padding = 'var(--space-6) var(--space-4)';
  heroBox.style.position = 'relative';
  heroBox.style.zIndex = '2';

  heroBox.innerHTML = `
    <!-- BRAND LOGO MARK -->
    <img src="/logo/LogoArt.png" alt="Soenrect Logo" style="width: 64px; height: 64px; object-fit: contain; margin: 0 auto var(--space-5) auto;" />

    <!-- WELCOMING TITLE & INTRO -->
    <span class="badge badge-orange" style="margin-bottom: var(--space-4); font-size: 11px; padding: 4px 12px; white-space: normal; word-break: break-word; line-height: 1.4; display: inline-flex;">
      <span class="badge-dot"></span>SOENRECT EVENT PRODUCTION OPERATIONAL PLATFORM
    </span>

    <h1 style="font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; color: var(--color-foreground); line-height: 1.15; letter-spacing: -0.02em; margin-bottom: var(--space-4);">
      Welcoming Production Setup
    </h1>

    <p style="font-size: var(--text-base); color: var(--color-foreground-muted); max-width: 580px; margin: 0 auto var(--space-8) auto; line-height: 1.6;">
      Select your entry portal below to access the Operational Management Dashboard or the Field Crew Checklist & SOP Portal.
    </p>

    <!-- ENTRY PORTAL SELECTION CARDS -->
    <div class="welcome-portal-grid">
      
      <!-- DASHBOARD LOGIN CARD -->
      <div class="card" id="card-entry-dashboard" style="cursor: pointer; transition: all 0.2s ease; padding: var(--space-6); border-color: var(--color-border-strong); background: rgba(24, 24, 27, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
        <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--color-accent-subtle); color: var(--color-accent); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </div>
        <h2 style="font-size: var(--text-lg); font-weight: bold; color: var(--color-foreground); margin-bottom: 6px;">
          Dashboard Login &rarr;
        </h2>
        <p style="font-size: var(--text-xs); color: var(--color-foreground-muted); line-height: 1.5; margin-bottom: var(--space-5);">
          For Management & Administrators. Access Equipment Inventory, Project Logistics, Crew Rosters, and System Telemetry.
        </p>
        <button class="btn btn-primary btn-sm" style="width: 100%; justify-content: center;">
          Login to Dashboard
        </button>
      </div>

      <!-- CREW PORTAL ACCESS CARD -->
      <div class="card" id="card-entry-crew" style="cursor: pointer; transition: all 0.2s ease; padding: var(--space-6); border-color: var(--color-border-strong); background: rgba(24, 24, 27, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
        <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--color-success-subtle); color: var(--color-success); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <h2 style="font-size: var(--text-lg); font-weight: bold; color: var(--color-foreground); margin-bottom: 6px;">
          Crew Portal &rarr;
        </h2>
        <p style="font-size: var(--text-xs); color: var(--color-foreground-muted); line-height: 1.5; margin-bottom: var(--space-5);">
          Dedicated portal for field crew. Select your name, enter your passcode to view assigned projects and complete SOP Checklists.
        </p>
        <button class="btn btn-secondary btn-sm" style="width: 100%; justify-content: center;">
          Access Crew Portal
        </button>
      </div>

    </div>
  `;

  container.appendChild(heroBox);

  // Attach Card Click Handlers
  heroBox.querySelector('#card-entry-dashboard')?.addEventListener('click', () => {
    onNavigate('login');
  });

  heroBox.querySelector('#card-entry-crew')?.addEventListener('click', () => {
    onNavigate('crew-portal-login');
  });
}
