import { create } from 'zustand';

type UIState = {
  isModalOpen: boolean;
  loading: boolean;
  setModalOpen: (isOpen: boolean) => void;
  setLoading: (isLoading: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  loading: false,
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setLoading: (isLoading) => set({ loading: isLoading }),
}));
