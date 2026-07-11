import { create } from 'zustand';

export type DrawerView = 'pools' | 'oracle' | 'profile' | null;

interface UIState {
  drawer: DrawerView;
  walletModal: boolean;
  openDrawer: (d: DrawerView) => void;
  closeDrawer: () => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  drawer: null,
  walletModal: false,
  openDrawer: (d) => set({ drawer: d }),
  closeDrawer: () => set({ drawer: null }),
  openWalletModal: () => set({ walletModal: true }),
  closeWalletModal: () => set({ walletModal: false }),
}));
