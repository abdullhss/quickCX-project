import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  clearAuthSession,
  loadAuthSession,
  onboardingDoneFromPayload,
  saveAuthSession,
} from "@/lib/authStorage";
import { store } from "@/store";
import { clearAuth, setAuth } from "@/store/authSlice";
import { signinService } from "@/services/authServices/loginService";
import { signupService } from "@/services/authServices/signupService";

interface Profile {
  id: string | null;
  user_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  job_title: string | null;
  phone: string | null;
  onboarding_completed: boolean;
}

type AuthUser = {
  id: string;
  email: string;
};

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PROFILE_STORAGE_KEY = "quickcx_profile";

function loadStoredProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

function saveStoredProfile(profile: Profile): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function clearStoredProfile(): void {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = loadAuthSession();
    const userEmail = saved?.email ?? saved?.refreshToken?.Email;
    if (!userEmail) {
      setLoading(false);
      return;
    }

    const authUser: AuthUser = {
      id: userEmail,
      email: userEmail,
    };

    const storedProfile = loadStoredProfile();
    const resolvedProfile: Profile = {
      id: storedProfile?.id ?? null,
      user_id: storedProfile?.user_id ?? authUser.id,
      full_name: storedProfile?.full_name ?? saved.FullName ?? null,
      avatar_url: storedProfile?.avatar_url ?? null,
      company_name: storedProfile?.company_name ?? null,
      job_title: storedProfile?.job_title ?? null,
      phone: storedProfile?.phone ?? null,
      onboarding_completed:
        storedProfile?.onboarding_completed ?? onboardingDoneFromPayload(saved.isOnboardingDone),
    };

    setSession({ access_token: saved.accessToken ?? "" });
    setUser(authUser);
    setProfile(resolvedProfile);
    saveStoredProfile(resolvedProfile);
    setLoading(false);
  }, []);
  useEffect(() => {
  if (user && !profile) {
    const storedProfile = loadStoredProfile();
    if (storedProfile) {
      setProfile(storedProfile);
    }
  }
}, [user]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await signupService({ email, password, fullName });
    return { error: error ? new Error(error.message) : null };
  };

  const signIn = async (email: string, password: string) => {
    type SigninResponseData = {
      AccessToken: string;
      FullName: string;
      IsOnboardingDone?: boolean;
      refreshToken?: {
        Email: string;
        TokenString: string;
        ExpireAt: string;
      };
    };
    type ApiEnvelope<T> = {
      Succeeded?: boolean;
      Data?: T;
      Message?: string;
    };
    setLoading(true);
    try {
      const { data, error } = await signinService({ email, password });
      if (error) return { error: new Error(error.message) };

      const envelope = data as ApiEnvelope<SigninResponseData> | undefined;
      const payload = envelope?.Data;
      if (!envelope?.Succeeded || !payload?.AccessToken) {
        return { error: new Error(envelope?.Message ?? "Sign in failed") };
      }

      const nextSession = {
        FullName: payload.FullName,
        accessToken: payload.AccessToken,
        email,
        isOnboardingDone: payload.IsOnboardingDone,
        ...(payload.refreshToken ? { refreshToken: payload.refreshToken } : {}),
      };
      saveAuthSession(nextSession);
      store.dispatch(setAuth(nextSession));

      const authUser: AuthUser = {
        id: email,
        email,
      };
      const nextProfile: Profile = {
        id: null,
        user_id: authUser.id,
        full_name: payload.FullName ?? null,
        avatar_url: null,
        company_name: null,
        job_title: null,
        phone: null,
        onboarding_completed: onboardingDoneFromPayload(payload.IsOnboardingDone),
      };

      setSession({ access_token: payload.AccessToken });
      setUser(authUser);
      setProfile(nextProfile);
      saveStoredProfile(nextProfile);
      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    clearAuthSession();
    clearStoredProfile();
    store.dispatch(clearAuth());
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error("No user logged in") };

    const nextProfile: Profile = {
      id: profile?.id ?? null,
      user_id: profile?.user_id ?? user.id,
      full_name: data.full_name ?? profile?.full_name ?? null,
      avatar_url: data.avatar_url ?? profile?.avatar_url ?? null,
      company_name: data.company_name ?? profile?.company_name ?? null,
      job_title: data.job_title ?? profile?.job_title ?? null,
      phone: data.phone ?? profile?.phone ?? null,
      onboarding_completed: data.onboarding_completed ?? profile?.onboarding_completed ?? false,
    };

    setProfile(nextProfile);
    saveStoredProfile(nextProfile);

    const saved = loadAuthSession();
    if (saved) {
      let nextSession = saved;
      if (typeof data.full_name === "string" && data.full_name.trim().length > 0) {
        nextSession = { ...nextSession, FullName: data.full_name };
      }
      if (typeof data.onboarding_completed === "boolean") {
        nextSession = {
          ...nextSession,
          isOnboardingDone: !data.onboarding_completed,
        };
      }
      if (nextSession !== saved) {
        saveAuthSession(nextSession);
        store.dispatch(setAuth(nextSession));
        setSession({ access_token: nextSession.accessToken ?? "" });
      }
    }

    return { error: null };
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }

  if (!session || !user) {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
