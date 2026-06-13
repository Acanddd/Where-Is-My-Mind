import { useEffect, useCallback, useRef, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { useNotepadStore } from '../../store/notepadStore';
import { useSettingsStore } from '../../store/settingsStore';
import TodoList from './TodoList';
import styles from './Notepad.module.css';

const FONT_MIN = 8;
const FONT_MAX = 32;
const FONT_STEP = 2;

function Notepad() {
  const {
    notes,
    activeNoteId,
    fontSize,
    addNote,
    deleteNote,
    updateContent,
    setCursorPosition,
    setActiveNote,
    openFile,
    resetToNew,
  } = useNotepadStore();

  const [showTodoList, setShowTodoList] = useState(false);
  const activeNote = notes.find((n) => n.id === activeNoteId) ?? notes[0];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setIsTyping = useSettingsStore((state) => state.setIsTyping);

  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      setActiveNote(notes[0].id);
    }
  }, [activeNoteId, notes, setActiveNote]);

  useEffect(() => {
    if (textareaRef.current && activeNote && !showTodoList) {
      const position = activeNote.cursorPosition || 0;
      textareaRef.current.selectionStart = position;
      textareaRef.current.selectionEnd = position;
      textareaRef.current.focus();
    }
  }, [activeNote?.id, showTodoList]);

  const handleOpenFile = useCallback(async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }],
    });
    if (!selected || typeof selected !== 'string') return;

    // If this file is already open in a tab, just switch to it
    const { notes: latestNotes, setActiveNote: switchNote } = useNotepadStore.getState();
    const existing = latestNotes.find((n) => n.filePath === selected);
    if (existing) {
      switchNote(existing.id);
      return;
    }

    try {
      const content = await readTextFile(selected);
      const fileName = selected.split(/[/\\]/).pop() ?? selected;
      openFile(fileName, content, selected);
    } catch (e) {
      console.error('Failed to read file:', e);
    }
  }, [openFile]);

  const handleSave = useCallback(async () => {
    const { notes: latestNotes, activeNoteId: latestId, markSaved: markSavedFn } = useNotepadStore.getState();
    const note = latestNotes.find((n) => n.id === latestId) ?? latestNotes[0];
    if (!note) return;

    let targetPath = note.filePath;

    if (!targetPath) {
      const chosen = await save({
        filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }],
        defaultPath: `${note.title.toLowerCase().replace(/\s+/g, '_')}.txt`,
      });
      if (!chosen) return;
      targetPath = chosen;
    }

    try {
      await writeTextFile(targetPath, note.content);
      markSavedFn(note.id, targetPath);
    } catch (e) {
      console.error('Failed to save file:', e);
      alert(`Failed to save file: ${e}`);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const { fontSize: current, setFontSize } = useNotepadStore.getState();
      const next = e.deltaY < 0
        ? Math.min(FONT_MAX, current + FONT_STEP)
        : Math.max(FONT_MIN, current - FONT_STEP);
      setFontSize(next);
    };
    const el = textareaRef.current;
    el?.addEventListener('wheel', onWheel, { passive: false });
    return () => el?.removeEventListener('wheel', onWheel);
  }, [activeNote?.id]);

  const fileLabel = activeNote?.filePath
    ? activeNote.filePath.split(/[/\\]/).pop()
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {notes.map((note) => (
          <button
            key={note.id}
            className={`${styles.tab} ${note.id === activeNote?.id ? styles.active : ''}`}
            onClick={() => setActiveNote(note.id)}
            title={note.filePath ?? note.title}
          >
            <span className={styles.tabLabel}>{note.title.slice(0, 8)}</span>
            {note.isDirty && <span className={styles.dirtyDot}>*</span>}
            <span
              className={styles.tabClose}
              onClick={(e) => {
                e.stopPropagation();
                if (notes.length === 1) {
                  resetToNew();
                  getCurrentWindow().close();
                } else {
                  deleteNote(note.id);
                }
              }}
            >
              x
            </span>
          </button>
        ))}
        <button className={styles.addBtn} onClick={addNote} title="New note">
          +
        </button>
      </div>

      <div className={styles.toolbar}>
        <button className={styles.toolBtn} onClick={handleOpenFile} title="Open file (txt/md)">
          OPEN
        </button>
        <button
          className={`${styles.toolBtn} ${activeNote?.isDirty ? styles.toolBtnDirty : ''}`}
          onClick={handleSave}
          title="Save file (Ctrl+S)"
        >
          SAVE{activeNote?.isDirty ? '*' : ''}
        </button>
        {fileLabel && (
          <span className={styles.filePath} title={activeNote?.filePath ?? ''}>
            {fileLabel}
          </span>
        )}
        <button
          className={`${styles.todoToggle} ${showTodoList ? styles.todoToggleActive : ''}`}
          onClick={() => setShowTodoList(!showTodoList)}
          title={showTodoList ? 'Show notepad' : 'Show todo list'}
        >
          ✓
        </button>
      </div>

      {showTodoList ? (
        <TodoList />
      ) : (
        activeNote && (
          <textarea
            ref={textareaRef}
            key={activeNote.id}
            className={`${styles.editor} selectable`}
            style={{ fontSize: `${fontSize}px` }}
            value={activeNote.content}
            onChange={(e) => {
              updateContent(activeNote.id, e.target.value);
              setIsTyping(true);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
            }}
            onBlur={() => {
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              if (textareaRef.current) {
                setCursorPosition(activeNote.id, textareaRef.current.selectionStart);
              }
              setIsTyping(false);
            }}
            onClick={() => {
              if (textareaRef.current) {
                setCursorPosition(activeNote.id, textareaRef.current.selectionStart);
              }
            }}
            spellCheck={false}
            placeholder={'> START TYPING...'}
          />
        )
      )}

      <div className={styles.statusbar}>
        <span>{activeNote?.content.length ?? 0} CHARS</span>
        <span title="Ctrl+Scroll to zoom">{fontSize}PX</span>
        <span>
          {activeNote
            ? new Date(activeNote.updatedAt).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '--:--'}
        </span>
      </div>
    </div>
  );
}

export default Notepad;
