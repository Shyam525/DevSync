import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_URL = import.meta.env.VITE_API_URL as string;

// ─── THE PROBLEM THIS FILE SOLVES ─────────────────────────────────────
//
// Your access token expires in 15 minutes (set in Week 1's .env).
// Without this file, 15 minutes into using the app, every API call
// starts returning 401 and the user thinks the app is broken.
//
// The fix: when a request gets a 401, silently use the refresh token
// to get a NEW access token, then retry the original request. The
// user never sees an error — they just keep using the app.

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST INTERCEPTOR — runs BEFORE every request is sent ─────────
// Attaches the current access token to every outgoing request.
// Without this, you'd have to manually add the header on every
// single API call you write, everywhere in the app.
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── THE QUEUE PROBLEM ──────────────────────────────────────────────
//
// Imagine the Dashboard loads and fires 3 API calls at once (projects,
// user profile, notifications) and the access token just expired.
// All 3 requests get a 401 AT THE SAME TIME.
//
// Without a queue: all 3 would independently try to refresh the token,
// sending 3 refresh requests to the server, invalidating each other,
// and 2 out of 3 requests would fail.
//
// With a queue: the FIRST 401 triggers ONE refresh call. The other
// 2 requests wait in a queue. When the refresh finishes, all 3
// requests retry using the new token.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

// ─── RESPONSE INTERCEPTOR — runs AFTER every response arrives ────────
axiosInstance.interceptors.response.use(
  // If the response is successful, do nothing special — pass it through
  (response) => response,

  // If the response is an error, this function decides what to do
  async (error: AxiosError) => {
    // _retry is a flag WE add — it does not exist on a normal request.
    // It prevents an infinite loop: if the RETRIED request also gets
    // a 401 (meaning even the new token doesn't work), we do NOT try
    // to refresh again — we give up and log the user out.
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // A refresh is already in progress — queue this request
        // instead of starting a second, competing refresh call.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        // IMPORTANT: we use plain `axios.post`, NOT `axiosInstance.post`.
        // If we used axiosInstance, this call would ALSO go through
        // these same interceptors — and if IT got a 401, it would try
        // to refresh again, forever. Plain axios bypasses our own
        // interceptor chain for this one specific call.
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Let every queued request know the new token is ready
        processQueue(null, newAccessToken);

        // Retry the ORIGINAL request that triggered all of this,
        // now with a valid token attached
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // The refresh token itself is invalid or expired too —
        // there is nothing left to do except log the user out.
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Not a 401, or already retried once — just pass the error along
    return Promise.reject(error);
  }
);

export { axiosInstance };
export default axiosInstance;
