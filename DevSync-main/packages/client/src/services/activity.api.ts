import { axiosInstance } from '../lib/axiosInstance';

export const activityApi = {
  fetchActivity: (projectId: string, page = 1, limit = 20) =>
    axiosInstance.get(`/activity/${projectId}`, { params: { page, limit } }),
};
