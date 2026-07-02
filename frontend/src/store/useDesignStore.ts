import { create } from 'zustand';

interface DesignState {
  width: number;
  height: number;
  type: string;
  unit: string;
  isCreateModalOpen: boolean;
  setConfig: (config: Partial<DesignState>) => void;
  setCreateModalOpen: (open: boolean) => void;
  reset: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  width: 1080,
  height: 1080,
  type: 'Custom',
  unit: 'px',
  isCreateModalOpen: false,
  setConfig: (config) => set((state) => ({ ...state, ...config })),
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  reset: () => set({ width: 1080, height: 1080, type: 'Custom', unit: 'px', isCreateModalOpen: false })
}));
