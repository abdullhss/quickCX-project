import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { supabase } from "@/integrations/supabase/client";
import { clearAuthSession, loadAuthSession } from "@/lib/authStorage";
import { store } from "@/store";
import { clearAuth } from "@/store/authSlice";

const baseURL = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Language": "EN"
  },
});

type RequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    return null;
  }
  return data.session.access_token;
}

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const bearer =
    session?.access_token ?? loadAuthSession()?.accessToken ?? null;

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
      await supabase.auth.signOut();
      clearAuthSession();
      store.dispatch(clearAuth());
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return api(originalRequest);
  }
);
