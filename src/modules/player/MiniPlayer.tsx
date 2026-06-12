import { useEffect, useRef, useCallback, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { LogicalSize } from '@tauri-apps/api/dpi';
import { usePlayerStore } from '../../store/playerStore';
import { useSettingsStore } from '../../store/settingsStore';
import * as audio from './audioEngine';
import styles from './MiniPlayer.module.css';

const MINI_H = 145;
const VOLUME_PANEL_H = 70;
const LIST_PANEL_H = 200;

function MiniPlayer() {
  const {
    playlist,
    currentIndex,
    isPlaying,
    volume,
    progress,
    setCurrentIndex,
    setVolume,
    setProgress,
    nextTrack,
    prevTrack,
  } = usePlayerStore();

  const setMiniMode = useSettingsStore((state) => state.setMiniMode);
  const currentTrack = playlist[currentIndex] ?? null;
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showVolume, setShowVolume] = useState(false);
  const [showList, setShowList] = useState(false);

  const resizeWindow = useCallback(async (extraH: number) => {
    await getCurrentWindow().setSize(new LogicalSize(320, MINI_H + extraH));
  }, []);

  const toggleVolume = useCallback(() => {
    const next = !showVolume;
    setShowVolume(next);
    setShowList(false);
    resizeWindow(next ? VOLUME_PANEL_H : 0);
  }, [showVolume, resizeWindow]);

  const toggleList = useCallback(() => {
    const next = !showList;
    setShowList(next);
    setShowVolume(false);
    resizeWindow(next ? LIST_PANEL_H : 0);
  }, [showList, resizeWindow]);

  // Sync volume with engine when it changes
  useEffect(() => {
    audio.setVolume(volume);
  }, [volume]);

  // Progress polling
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        const s = audio.getSeek();
        if (s > 0) setProgress(s);
      }, 500);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, setProgress]);

  // When currentIndex changes, load the new track
  useEffect(() => {
    if (!currentTrack) return;
    audio.loadTrack(currentTrack.id, isPlaying);
  }, [currentIndex]);

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;
    const howl = audio.getCurrentHowl();
    if (!howl) {
      audio.loadTrack(currentTrack.id, true);
    } else {
      audio.togglePlayPause();
    }
  }, [currentTrack]);

  const handleRestore = async () => {
    setShowVolume(false);
    setShowList(false);
    setMiniMode(false);
    await getCurrentWindow().setSize(new LogicalSize(420, 560));
  };

  const duration = audio.getDuration() || currentTrack?.duration || 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.mini}>
        <div className={styles.titlebar} data-tauri-drag-region>
          <span className={styles.title}>MINI MODE</span>
          <div className={styles.titleControls}>
            <button className={styles.titleBtn} onClick={() => getCurrentWindow().minimize()} title="Minimize">_</button>
            <button className={styles.titleBtn} onClick={() => getCurrentWindow().close()} title="Close">X</button>
          </div>
        </div>

        <div className={styles.trackScroll}>
          <span className={styles.trackName}>
            {currentTrack ? currentTrack.title : 'NO TRACK'}
          </span>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }}
          />
        </div>

        <div className={styles.controls}>
          <button className={styles.btn} onClick={prevTrack} title="Prev">◄</button>
          <button className={`${styles.btn} ${styles.playBtn}`} onClick={handlePlayPause} title="Play/Pause">
            {isPlaying ? '■' : '►'}
          </button>
          <button className={styles.btn} onClick={nextTrack} title="Next">►</button>
          <button
            className={`${styles.btn} ${showVolume ? styles.btnActive : ''}`}
            onClick={toggleVolume}
            title="Volume"
          >
            ♪
          </button>
          <button
            className={`${styles.btn} ${showList ? styles.btnActive : ''}`}
            onClick={toggleList}
            title="Playlist"
          >
            ≡
          </button>
          <button className={styles.btn} onClick={handleRestore} title="Restore">
            ▲
          </button>
        </div>
      </div>

      {showVolume && (
        <div className={styles.volumePanel}>
          <span>VOL {Math.round(volume * 100)}</span>
          <input
            type="range"
            className={styles.volSlider}
            min={0} max={1} step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>
      )}

      {showList && (
        <div className={styles.listPanel}>
          {playlist.map((t, i) => (
            <div
              key={t.id}
              className={`${styles.listItem} ${i === currentIndex ? styles.listItemActive : ''}`}
              onDoubleClick={() => {
                setCurrentIndex(i);
                setTimeout(() => audio.loadTrack(t.id, true), 0);
              }}
            >
              {i === currentIndex && isPlaying ? '♪ ' : ''}{t.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MiniPlayer;
