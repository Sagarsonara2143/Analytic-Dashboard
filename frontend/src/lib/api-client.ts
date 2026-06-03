import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";

// Use relative URL — Next.js rewrites /api/* → http://backend:8004/api/*
// This works both in Docker (container-to-container) and local dev
const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error);

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers!.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const refresh = useAuthStore.getState().refreshToken;
      const { data } = await axios.post("/api/v1/auth/refresh", {
        refresh_token: refresh,
      });
      useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
      queue.forEach((cb) => cb(data.access_token));
      queue = [];
      original.headers!.Authorization = `Bearer ${data.access_token}`;
      return api(original);
    } catch {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
