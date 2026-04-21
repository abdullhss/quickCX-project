export const AUTH_STORAGE_KEY = "quickcx_auth";

export type StoredRefreshToken = {
  Email: string;
  TokenString: string;
  ExpireAt: string;
};

export type AuthSession = {
  FullName: string;
  accessToken: string;
  /** From sign-in form when the API does not return a refresh token (cookie-based session). */
  email?: string;
  isOnboardingDone?: boolean;
  refreshToken?: StoredRefreshToken;
};

/** Backend: `isOnboardingDone === false` means onboarding is finished; `true` means user must complete the wizard. */
export function onboardingDoneFromPayload(isOnboardingDone: boolean | undefined): boolean {
  return !(isOnboardingDone ?? false);
}

export function loadAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    const email = parsed.email ?? parsed.refreshToken?.Email;
    const hasToken = !!(parsed.accessToken && String(parsed.accessToken).trim());
    if (!email && !hasToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
