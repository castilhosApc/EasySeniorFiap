import { create } from 'zustand';

interface ElderInboxState {
  banner: { id: string; title: string; body: string } | null;
  showBanner: (title: string, body: string) => void;
  clearBanner: () => void;
}

export const useElderInboxStore = create<ElderInboxState>((set) => ({
  banner: null,
  showBanner: (title, body) =>
    set({ banner: { id: `${Date.now()}`, title, body } }),
  clearBanner: () => set({ banner: null }),
}));
