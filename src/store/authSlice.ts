import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession, StoredRefreshToken } from "@/lib/authStorage";

export type AuthState = {
  accessToken: string | null;
  refreshToken: StoredRefreshToken | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<AuthSession>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clearAuth() {
      return initialState;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

export function selectIsApiAuthenticated(state: { auth: AuthState }): boolean {
  return state.auth.isAuthenticated && !!state.auth.accessToken;
}
