import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "@/lib/authStorage";
import { store } from "@/store";
import { clearAuth, setAuth } from "@/store/authSlice";

function normalizeApiBase(raw: unknown): string {
  if (raw == null || raw === "") return "";
  return String(raw).trim().replace(/\/+$/, "");
}

const envApiBase = normalizeApiBase(import.meta.env.VITE_API_URL);
/**
 * In development, use same-origin `/api/...` so Vite `server.proxy` forwards to the API.
 * That avoids browser CORS when `withCredentials` is true (credentials disallow `*` ACAO).
 */
const baseURL = import.meta.env.DEV ? "" : envApiBase;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Language": "EN"
  },
});

type RequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const currentSession = loadAuthSession();
  if (!currentSession) {
    return null;
  }

  const expiredAccessToken = currentSession.accessToken?.trim() ?? "";

  try {
    const response = await axios.post(
      `${baseURL}/api/v1/auth/refreshtoken`,
      undefined,
      {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Language: "EN",
          ...(expiredAccessToken
            ? { Authorization: `Bearer ${expiredAccessToken}` }
            : {}),
        },
      }
    );

    const envelope = response.data as {
      Succeeded?: boolean;
      Data?: {
        AccessToken?: string;
        accessToken?: string;
        FullName?: string;
        IsOnboardingDone?: boolean;
      };
    };

    const accessToken = envelope?.Data?.AccessToken ?? envelope?.Data?.accessToken;
    if (!envelope?.Succeeded || !accessToken) {
      return null;
    }

    const nextSession = {
      ...currentSession,
      FullName: envelope.Data?.FullName ?? currentSession.FullName,
      accessToken,
      ...(typeof envelope.Data?.IsOnboardingDone === "boolean"
        ? { isOnboardingDone: envelope.Data.IsOnboardingDone }
        : {}),
    };
    saveAuthSession(nextSession);
    store.dispatch(setAuth(nextSession));
    return accessToken;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const bearer = loadAuthSession()?.accessToken ?? null;

  if (bearer) {
    config.headers.Authorization = `Bearer ${bearer}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfigWithRetry | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const accessToken = await refreshPromise;

    if (!accessToken) {
      clearAuthSession();
      store.dispatch(clearAuth());
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return api(originalRequest);
  }
);
