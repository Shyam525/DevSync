import axiosInstance from '../lib/axiosInstance';

// ─── WHY A SEPARATE services/ FOLDER? ─────────────────────────────────
// Components should never call axiosInstance directly. If the API
// shape ever changes, you fix it in ONE function here instead of
// hunting through every component that happens to call that endpoint.

export const authApi = {
  register: (data: { email: string; password: string; username: string }) =>
    axiosInstance.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    axiosInstance.post('/auth/login', data),
};
