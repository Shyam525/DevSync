import { axiosInstance } from '../lib/axiosInstance';

export const kanbanApi = {
  createCard: (data: unknown) => axiosInstance.post('/kanban/cards', data),
  moveCard: (cardId: string, data: unknown) => axiosInstance.post(`/kanban/cards/${cardId}/move`, data),
  updateCard: (cardId: string, data: unknown) => axiosInstance.put(`/kanban/cards/${cardId}`, data),
};
