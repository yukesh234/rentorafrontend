import axios from "axios";
import { useAuthStore } from "../stores/Authstore";

/**
 * api — Rentora
 * 
 * Single axios instance for every backend call.
 *
 * - `withCredentials: true` is required so the browser sends the httpOnly
 *   refresh-token cookie your Spring backend sets on login/OAuth2 success.
 * - Request interceptor attaches the in-memory access token from the
 *   Zustand store (never from localStorage — see authStore.js for why).
 * - Response interceptor catches a 401, tries ONE silent refresh, then
 *   retries the original request. Concurrent requests that 401 while a
 *   refresh is already in flight get queued instead of each firing their
 *   own refresh call.
 * 
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Auth endpoints themselves should never trigger a refresh-and-retry
    // loop — a 401 on /login or /refresh means "not authenticated",
    // full stop.
    const isAuthRoute =
      originalRequest?.url?.includes("/api/v1/auth/refresh") ||
      originalRequest?.url?.includes("/api/v1/auth/login") ||
      originalRequest?.url?.includes("/api/v1/auth/register");

    if (status !== 401 || isAuthRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // A refresh is already in flight — wait for it instead of firing
      // a second one, then retry this request with the new token.
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        console.log(originalRequest)
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await useAuthStore.getState().refresh();
      flushQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;