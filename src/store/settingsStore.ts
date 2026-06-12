import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'green' | 'amber' | 'white' | 'light';

interface SettingsStore {
  theme: Theme;
  opacity: number;
  alwaysOnTop: boolean;
  miniMode: boolean;
  petMode: boolean;
  isTyping: boolean;
  setTheme: (theme: Theme) => void;
  setOpacity: (opacity: number) => void;
  setAlwaysOnTop: (v: boolean) => void;
  setMiniMode: (mini: boolean) => void;
  setPetMode: (pet: boolean) => void;
  setIsTyping: (typing: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'green',
      opacity: 0.95,
      alwaysOnTop: true,
      miniMode: false,
      petMode: false,
      isTyping: false,
      setTheme: (theme) => set({ theme }),
      setOpacity: (opacity) => set({ opacity }),
      setAlwaysOnTop: (alwaysOnTop) => set({ alwaysOnTop }),
      setMiniMode: (miniMode) => set({ miniMode }),
      setPetMode: (petMode) => set({ petMode }),
      setIsTyping: (isTyping) => set({ isTyping }),
    }),
    {
      name: 'pixelnook-settings',
      partialize: (state) => ({
        theme: state.theme,
        opacity: state.opacity,
        alwaysOnTop: state.alwaysOnTop,
        miniMode: state.miniMode,
        petMode: state.petMode,
      }),
    },
  ),
);
