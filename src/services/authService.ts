/* ==========================================================================
   AUTHENTICATION & SESSION MANAGEMENT SERVICE
   Handles Dashboard Admin login via static .env credentials
   and Crew Portal login via crew-specific passcodes.
   ========================================================================== */

import { DataService } from './mockAdapter';
import { CrewMember } from '../types/database';

export class AuthService {
  private static ADMIN_AUTH_KEY = 'soenrect_admin_authenticated';
  private static CREW_AUTH_KEY = 'soenrect_active_crew_id';

  // --- ADMIN DASHBOARD AUTHENTICATION ---
  public static getAdminUsername(): string {
    return import.meta.env.VITE_ADMIN_USERNAME || 'admin@soenrect.com';
  }

  public static getAdminPassword(): string {
    return import.meta.env.VITE_ADMIN_PASSWORD || 'soenrect2026';
  }

  public static loginAdmin(usernameInput: string, passwordInput: string): boolean {
    const validUser = this.getAdminUsername();
    const validPass = this.getAdminPassword();

    if (usernameInput.trim() === validUser && passwordInput === validPass) {
      sessionStorage.setItem(this.ADMIN_AUTH_KEY, 'true');
      return true;
    }
    return false;
  }

  public static isAdminAuthenticated(): boolean {
    return sessionStorage.getItem(this.ADMIN_AUTH_KEY) === 'true';
  }

  public static logoutAdmin(): void {
    sessionStorage.removeItem(this.ADMIN_AUTH_KEY);
  }

  // --- CREW PORTAL AUTHENTICATION ---
  public static async loginCrew(crewId: string, passcodeInput: string): Promise<CrewMember | null> {
    const crewList = await DataService.getCrewMembers();
    const found = crewList.find((c) => c.id === crewId);

    if (found) {
      const validCode = found.passcode || 'crew1234';
      if (passcodeInput.trim() === validCode) {
        sessionStorage.setItem(this.CREW_AUTH_KEY, found.id);
        return found;
      }
    }
    return null;
  }

  public static getActiveCrewId(): string | null {
    return sessionStorage.getItem(this.CREW_AUTH_KEY);
  }

  public static async getActiveCrewMember(): Promise<CrewMember | null> {
    const id = this.getActiveCrewId();
    if (!id) return null;
    const crewList = await DataService.getCrewMembers();
    return crewList.find((c) => c.id === id) || null;
  }

  public static isCrewAuthenticated(): boolean {
    return !!this.getActiveCrewId();
  }

  public static logoutCrew(): void {
    sessionStorage.removeItem(this.CREW_AUTH_KEY);
  }

  // --- PRIVACY NAME MASKING HELPER ---
  public static maskCrewName(fullName: string): string {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map((part) => {
        if (part.length <= 2) return part;
        return part.slice(0, 3) + '***';
      })
      .join(' ');
  }
}
