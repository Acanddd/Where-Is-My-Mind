import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  filePath: string | null;
  isDirty: boolean;
  cursorPosition?: number;
}

interface NotepadStore {
  notes: Note[];
  activeNoteId: string | null;
  fontSize: number;
  addNote: () => void;
  deleteNote: (id: string) => void;
  renameNote: (id: string, title: string) => void;
  updateContent: (id: string, content: string) => void;
  setCursorPosition: (id: string, position: number) => void;
  setActiveNote: (id: string) => void;
  openFile: (title: string, content: string, filePath: string) => void;
  markSaved: (id: string, filePath: string) => void;
  setFontSize: (size: number) => void;
  resetToNew: () => void;
}

const createNote = (): Note => ({
  id: crypto.randomUUID(),
  title: 'NEW NOTE',
  content: '',
  updatedAt: Date.now(),
  filePath: null,
  isDirty: false,
  cursorPosition: 0,
});

export const useNotepadStore = create<NotepadStore>()(
  persist(
    (set) => ({
      notes: [createNote()],
      activeNoteId: null,
      fontSize: 12,

      addNote: () => {
        const note = createNote();
        set((state) => ({
          notes: [...state.notes, note],
          activeNoteId: note.id,
        }));
      },

      deleteNote: (id) =>
        set((state) => {
          const filtered = state.notes.filter((n) => n.id !== id);
          const safeNotes = filtered.length > 0 ? filtered : [createNote()];
          return {
            notes: safeNotes,
            activeNoteId:
              state.activeNoteId === id ? safeNotes[0].id : state.activeNoteId,
          };
        }),

      renameNote: (id, title) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, title: title.toUpperCase() } : n,
          ),
        })),

      updateContent: (id, content) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, content, updatedAt: Date.now(), isDirty: true }
              : n,
          ),
        })),

      setCursorPosition: (id, position) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, cursorPosition: position } : n,
          ),
        })),

      setActiveNote: (id) => set({ activeNoteId: id }),

      openFile: (title, content, filePath) => {
        const note: Note = {
          id: crypto.randomUUID(),
          title: title.toUpperCase().slice(0, 20),
          content,
          updatedAt: Date.now(),
          filePath,
          isDirty: false,
          cursorPosition: 0,
        };
        set((state) => ({
          notes: [...state.notes, note],
          activeNoteId: note.id,
        }));
      },

      markSaved: (id, filePath) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, filePath, isDirty: false, updatedAt: Date.now() } : n,
          ),
        })),

      setFontSize: (size) => set({ fontSize: Math.min(32, Math.max(8, size)) }),

      resetToNew: () =>
        set({
          notes: [createNote()],
          activeNoteId: null,
        }),
    }),
    {
      name: 'pixelnook-notepad',
      partialize: (state) => ({
        notes: state.notes.map((n) => ({ ...n, isDirty: false })),
        activeNoteId: state.activeNoteId,
        fontSize: state.fontSize,
      }),
    },
  ),
);
