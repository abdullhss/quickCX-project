export const AUTH_STORAGE_KEY = "quickcx_auth";

export type StoredRefreshToken = {
  Email: string;
  TokenString: string;
  ExpireAt: string;
};

export type AuthSession = {
  FullName: string;
  accessToken: string;
  refreshToken: StoredRefreshToken;
};

export function loadAuthSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.accessToken || !parsed?.refreshToken) return null;
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
