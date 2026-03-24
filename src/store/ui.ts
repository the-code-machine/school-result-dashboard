import { create } from "zustand";

interface UIStore {
  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  importModalOpen: false,
  setImportModalOpen: (open) => set({ importModalOpen: open }),
}));
