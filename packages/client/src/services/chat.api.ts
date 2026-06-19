import { axiosInstance } from '../lib/axiosInstance';

export const chatApi = {
  fetchMessages: (projectId: string) => axiosInstance.get(`/chat/${projectId}`),
  sendMessage: (data: unknown) => axiosInstance.post('/chat', data),
};
