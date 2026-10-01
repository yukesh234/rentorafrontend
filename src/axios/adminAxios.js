import axios from 'axios';
import { useAdminAuthStore } from '../stores/AdminAuthstore.js';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

adminApi.interceptors.request.use((config) => {
  const token = useAdminAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAdminAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export default adminApi;