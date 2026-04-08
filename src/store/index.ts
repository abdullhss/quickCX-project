import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { loadAuthSession } from "@/lib/authStorage";

const saved = loadAuthSession();

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState:
    saved !== null
      ? {
          auth: {
            accessToken: saved.accessToken,
            refreshToken: saved.refreshToken,
            isAuthenticated: true,
          },
        }
      : undefined,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
