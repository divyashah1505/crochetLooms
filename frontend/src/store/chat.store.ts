import { create } from 'zustand';

interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  isExpanded: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  toggleMinimize: () => void;
  toggleExpand: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  isMinimized: false,
  isExpanded: false,

  openChat: () => set({ isOpen: true, isMinimized: false }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen, isMinimized: false })),
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
  toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));
