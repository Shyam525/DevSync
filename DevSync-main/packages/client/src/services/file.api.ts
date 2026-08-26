import { axiosInstance } from '../lib/axiosInstance';

export const fileApi = {
  upload: (formData: FormData) => axiosInstance.post('/files/upload', formData),
  download: (fileId: string) => axiosInstance.get(`/files/${fileId}`, { responseType: 'blob' }),
  remove: (fileId: string) => axiosInstance.delete(`/files/${fileId}`),
};
