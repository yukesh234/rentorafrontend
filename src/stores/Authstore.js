import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../axios/axios.js";



export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setSession: ({ user, accessToken }) =>
        set({ user, accessToken, isAuthenticated: true, error: null }),

      clearSession: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      login: async ({ email, password }) => {
        set({ error: null });
        try {
          console.log(email,password);
          const { data } = await api.post("/api/v1/auth/login", { email, password });
          get().setSession({ user: data.user, accessToken: data.access_token });
          return { success: true };
        } catch (err) {
          const message =
            err.response?.data?.message || "Incorrect email or password";
          set({ error: message });
          return { success: false, error: message };
        }
      },

      signup: async ({ name, email, password }) => {
        set({ error: null });
        try {
          const { data } = await api.post("/api/v1/auth/register", {
            name,
            email,
            password,
          });
          get().setSession({ user: data.user, accessToken: data.access_token });
          return { success: true };
        } catch (err) {
          const message =
            err.response?.data?.message || "Couldn't create your account";
          set({ error: message });
          return { success: false, error: message };
        }
      },

      refresh: async () => {
        try {
          const { data } = await api.post("/api/v1/auth/refresh");
          get().setSession({
            user: data.user ?? get().user,
            accessToken: data.access_token,
          });
          return data.access_token;
        } catch (err) {
          get().clearSession();
          throw err;
        }
      },

      logout: async () => {
        try {
          await api.post("/api/v1/auth/logout");
        } catch {
          // even if the network call fails, still clear local state below
        } finally {
          get().clearSession();
        }
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          await get().refresh();
        } catch {
          // no valid refresh cookie — user just isn't logged in, that's fine
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "rentora-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);