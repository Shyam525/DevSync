import { axiosInstance } from '../lib/axiosInstance';

export const authApi = {
  login: (credentials: unknown) => axiosInstance.post('/auth/login', credentials),
  logout: () => axiosInstance.post('/auth/logout'),
  refresh: (body: unknown) => axiosInstance.post('/auth/refresh', body),
  getMe: () => axiosInstance.get('/auth/me'),
};
