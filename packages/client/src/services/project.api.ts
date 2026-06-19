import { axiosInstance } from '../lib/axiosInstance';

export const projectApi = {
  list: () => axiosInstance.get('/projects'),
  create: (data: unknown) => axiosInstance.post('/projects', data),
  get: (projectId: string) => axiosInstance.get(`/projects/${projectId}`),
  update: (projectId: string, data: unknown) => axiosInstance.put(`/projects/${projectId}`, data),
  delete: (projectId: string) => axiosInstance.delete(`/projects/${projectId}`),
};
