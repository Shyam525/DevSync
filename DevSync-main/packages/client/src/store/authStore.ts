import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

// ─── WHY persist() ──────────────────────────────────────────────────
// Without this, refreshing the browser page would wipe the Zustand
// store back to its initial state — the user would appear logged out
// even though their tokens are still valid. persist() automatically
// saves the store to localStorage on every change and restores it
// when the page loads. This is standard practice for auth state —
// GitHub, Notion, Linear all do the same thing.

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      // Called by axiosInstance.ts after a silent token refresh —
      // only the access token changes, everything else stays the same
      setAccessToken: (accessToken) => set({ accessToken }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'devsync-auth' }   // the localStorage key this is saved under
  )
);