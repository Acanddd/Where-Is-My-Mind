import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  title: string;
  artist: string;
  path: string;
  duration: number;
}

type RepeatMode = 'none' | 'one' | 'all';

interface PlayerStore {
  playlist: Track[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;

  addTracks: (tracks: Track[]) => void;
  setPlaylist: (tracks: Track[]) => void;
  removeTrack: (id: string) => void;
  clearPlaylist: () => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  updateTrackDuration: (id: string, duration: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      playlist: [],
      currentIndex: 0,
      isPlaying: false,
      volume: 0.8,
      progress: 0,
      repeatMode: 'none',
      isShuffle: false,

      addTracks: (tracks) =>
        set((state) => ({ playlist: [...state.playlist, ...tracks] })),

      setPlaylist: (tracks) =>
        set({ playlist: tracks, currentIndex: 0, progress: 0, isPlaying: false }),

      removeTrack: (id) =>
        set((state) => {
          const idx = state.playlist.findIndex((t) => t.id === id);
          const filtered = state.playlist.filter((t) => t.id !== id);
          let newIndex = state.currentIndex;
          if (idx < state.currentIndex) newIndex = Math.max(0, newIndex - 1);
          if (idx === state.currentIndex) newIndex = Math.min(newIndex, filtered.length - 1);
          return { playlist: filtered, currentIndex: Math.max(0, newIndex) };
        }),

      clearPlaylist: () =>
        set({ playlist: [], currentIndex: 0, progress: 0, isPlaying: false }),

      setCurrentIndex: (index) => set({ currentIndex: index, progress: 0 }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (volume) => set({ volume }),
      setProgress: (progress) => set({ progress }),
      setRepeatMode: (repeatMode) => set({ repeatMode }),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

      updateTrackDuration: (id, duration) =>
        set((state) => ({
          playlist: state.playlist.map((t) => (t.id === id ? { ...t, duration } : t)),
        })),

      nextTrack: () => {
        const { playlist, currentIndex, isShuffle, repeatMode } = get();
        if (playlist.length === 0) return;
        if (repeatMode === 'one') { set({ progress: 0 }); return; }
        if (isShuffle) {
          set({ currentIndex: Math.floor(Math.random() * playlist.length), progress: 0 });
          return;
        }
        const next = currentIndex + 1;
        if (next >= playlist.length) {
          if (repeatMode === 'all') set({ currentIndex: 0, progress: 0 });
          else set({ isPlaying: false });
        } else {
          set({ currentIndex: next, progress: 0 });
        }
      },

      prevTrack: () => {
        const { currentIndex, progress } = get();
        if (progress > 3) { set({ progress: 0 }); return; }
        set({ currentIndex: Math.max(0, currentIndex - 1), progress: 0 });
      },
    }),
    {
      name: 'pixelnook-player',
      partialize: (state) => ({
        playlist: state.playlist,
        currentIndex: state.currentIndex,
        volume: state.volume,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
      }),
    },
  ),
);
