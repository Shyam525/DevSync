import axiosInstance from '../lib/axiosInstance';

export const projectApi = {
  getAll: () => axiosInstance.get('/projects'),

  create: (data: { name: string; description?: string }) =>
    axiosInstance.post('/projects', data),
};
