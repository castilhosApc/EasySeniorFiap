import { create } from 'zustand';

interface AppUiState {
  aiAssistNotice: string | null;
  setAiAssistNotice: (msg: string | null) => void;
}

export const useAppUiStore = create<AppUiState>((set) => ({
  aiAssistNotice: null,
  setAiAssistNotice: (msg) => set({ aiAssistNotice: msg }),
}));
