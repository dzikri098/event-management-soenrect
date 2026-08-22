/* ==========================================================================
   PAGE COMPOSITION TEMPLATE — CREW PORTAL LOGIN PAGE
   Features: Crew login authentication screen.
   Masks crew member names with asterisks for privacy identification.
   Validates identity using assigned crew passcodes.
   ========================================================================== */

import { ActivePageTemplate } from '../types/ui';
import { DataService } from '../services/mockAdapter';
import { AuthService } from '../services/authService';

export async function renderCrewPortalLogin(
  container: HTMLElement,
  onNavigate: (template: ActivePageTemplate) => void
): Promise<void> {
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
  videoElem.play().catch(() => {});

  videoElem.addEventListener('ended', () => {
    currentVideoIndex = (currentVideoIndex + 1) % videoPlaylist.length;
    videoElem.src = videoPlaylist[currentVideoIndex];
    videoElem.play().catch(() => {});
  });

  videoBgContainer.appendChild(videoElem);
  videoBgContainer.appendChild(videoOverlay);
  container.appendChild(videoBgContainer);

  const crewMembers = await DataService.getCrewMembers();

  const loginCard = document.createElement('div');
  loginCard.className = 'card auth-login-card';
  loginCard.style.maxWidth = '460px';
  loginCard.style.width = '100%';
  loginCard.style.padding = 'var(--space-8)';
  loginCard.style.position = 'relative';
  loginCard.style.zIndex = '2';
  loginCard.style.background = 'rgba(24, 24, 27, 0.85)';
  loginCard.style.backdropFilter = 'blur(12px)';
  loginCard.style.setProperty('-webkit-backdrop-filter', 'blur(12px)');

  loginCard.innerHTML = `
    <!-- HEADER BRANDING -->
    <div style="text-align: center; margin-bottom: var(--space-6);">
      <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: var(--color-success); color: #FFFFFF; font-size: 22px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
      </div>
      <h2 style="font-size: var(--text-xl); font-weight: bold; color: var(--color-foreground);">
        Field Crew Portal Verification
      </h2>
      <p style="font-size: var(--text-xs); color: var(--color-foreground-muted); margin-top: 4px;">
        Select your masked identity and enter your assigned crew passcode.
      </p>
    </div>

    <!-- ERROR ALERT BOX -->
    <div id="crew-login-error" style="display: none; padding: 10px 14px; background: var(--color-error-subtle); border: 1px solid var(--color-error-border); border-radius: var(--radius-md); color: var(--color-error); font-size: 12px; margin-bottom: var(--space-4);">
      Invalid passcode for selected crew member. Please check your passcode and try again.
    </div>

    <!-- CREW LOGIN FORM -->
    <form id="crew-login-form">
      <div class="form-group" style="margin-bottom: var(--space-4);">
        <label class="form-label">Select Your Identity (Masked Crew Roster)</label>
        <select class="form-control" id="crew-select-id" required>
          ${crewMembers
            .map((c) => {
              const masked = AuthService.maskCrewName(c.name);
              return `<option value="${c.id}">${masked} (${c.role})</option>`;
            })
            .join('')}
        </select>
        <div style="font-size: 11px; color: var(--color-foreground-subtle); margin-top: 4px;">
          Names are masked with asterisks (*) for privacy identification.
        </div>
      </div>

      <div class="form-group" style="margin-bottom: var(--space-5);">
        <label class="form-label">Crew Access Passcode / PIN</label>
        <input type="password" class="form-control" id="crew-passcode" placeholder="Enter assigned crew passcode..." required />
      </div>

      <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; justify-content: center; background-color: var(--color-success); border-color: var(--color-success); margin-bottom: var(--space-4);">
        Verify & Access Crew Portal
      </button>
    </form>

    <!-- ROSTER PASSCODES QUICK HELPER -->
    <div style="padding: 10px 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: 11px; color: var(--color-foreground-subtle);">
      <div style="font-weight: bold; color: var(--color-success); margin-bottom: 4px;">Assigned Roster Passcodes (Demo Reference):</div>
      ${crewMembers
        .map((c) => `<div>&bull; ${AuthService.maskCrewName(c.name)} &rarr; Passcode: <strong style="color: var(--color-accent);">${c.passcode || 'crew1234'}</strong></div>`)
        .join('')}
    </div>

    <!-- BACK TO WELCOME LINK -->
    <div style="text-align: center; margin-top: var(--space-5);">
      <button type="button" class="btn btn-tertiary btn-sm" id="btn-back-welcome-crew" style="font-size: 12px;">
        &larr; Back to Welcoming Setup
      </button>
    </div>
  `;

  container.appendChild(loginCard);

  // Attach Handlers
  const form = loginCard.querySelector('#crew-login-form') as HTMLFormElement;
  const crewSelect = loginCard.querySelector('#crew-select-id') as HTMLSelectElement;
  const passInput = loginCard.querySelector('#crew-passcode') as HTMLInputElement;
  const errorAlert = loginCard.querySelector('#crew-login-error') as HTMLElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const crewId = crewSelect.value;
    const pass = passInput.value;

    const loggedInMember = await AuthService.loginCrew(crewId, pass);
    if (loggedInMember) {
      onNavigate('crew-portal');
    } else {
      if (errorAlert) errorAlert.style.display = 'block';
    }
  });

  loginCard.querySelector('#btn-back-welcome-crew')?.addEventListener('click', () => {
    onNavigate('welcome');
  });
}
