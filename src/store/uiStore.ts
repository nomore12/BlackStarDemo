// store/uiStore.ts (새로운 파일 또는 gameStore.ts에 통합)
import { create } from 'zustand';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error'; // MUI Alert의 severity와 유사하게
  showSnackbar: (message: string, severity: SnackbarState['severity']) => void;
  closeSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  severity: 'info',
  showSnackbar: (message, severity) => set({ open: true, message, severity }),
  closeSnackbar: () => set({ open: false }),
}));
