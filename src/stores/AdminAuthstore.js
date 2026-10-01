import { create } from 'zustand';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const AUTH_PATH = '/api/v1/super-admin/auth';

// no interceptors here, so login/refresh failures can't loop
// withCredentials lets the browser store/send the refresh cookie
export const rawAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// one refresh at a time, even if several requests get a 401 together
let refreshPromise = null;

const EMPTY_SESSION = {
  accessToken: null,
  admin: null,
  isAuthenticated: false,
};

export const useAdminAuthStore = create((set, get) => ({
  ...EMPTY_SESSION,
  isInitializing: true, // true until the first refresh attempt finishes

  login: async ({ email, password }) => {
    try {
      console.log("Email and password",email,password)
      const { data } = await rawAxios.post(`${AUTH_PATH}/login`, { email, password });
      set({
        accessToken: data.access_token,
        admin: { email: data.email, name: data.name },
        isAuthenticated: true,
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response ? 'Invalid admin credentials' : 'Unable to reach the server',
      };
    }
  },

  // returns the new access token, or null if the session is gone
  refresh: () => {
    if (!refreshPromise) {
      refreshPromise = rawAxios
        .post(`${AUTH_PATH}/refresh`)
        .then(({ data }) => {
          set({
            accessToken: data.access_token,
            admin: { email: data.email, name: data.name },
            isAuthenticated: true,
          });
          return data.access_token;
        })
        .catch(() => {
          set(EMPTY_SESSION);
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }
    return refreshPromise;
  },

  // call once when the admin app mounts (restores session after reload)
  initialize: async () => {
    await get().refresh();
    set({ isInitializing: false });
  },

  logout: async () => {
    try {
      await rawAxios.post(`${AUTH_PATH}/logout`); // clears the cookie
    } catch {
      // ignore, clear local state anyway
    }
    set(EMPTY_SESSION);
  },
}));