import { useRef, useEffect, useCallback, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import { usePlayerStore, type Track } from '../../store/playerStore';
import * as audio from './audioEngine';
import styles from './Player.module.css';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function Player() {
  const {
    playlist,
    currentIndex,
    isPlaying,
    volume,
    progress,
    repeatMode,
    isShuffle,
    addTracks,
    setPlaylist,
    removeTrack,
    setCurrentIndex,
    setVolume,
    setProgress,
    setRepeatMode,
    toggleShuffle,
    nextTrack,
    prevTrack,
  } = usePlayerStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const frameCountRef = useRef(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const currentTrack = playlist[currentIndex] ?? null;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const drawSpectrum = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameCountRef.current += 1;
    const t = frameCountRef.current;

    ctx.fillStyle = 'var(--color-bg)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barCount = 16;
    const barWidth = canvas.width / barCount;
    const spacing = 2;
    const style = getComputedStyle(canvas);
    const primaryColor = style.getPropertyValue('--color-primary').trim();
    const dimColor = style.getPropertyValue('--color-primary-dark').trim();

    for (let i = 0; i < barCount; i++) {
      const phase = (i / barCount) * Math.PI * 2;
      const speed = 0.04 + (i % 3) * 0.015;
      const rawHeight = (Math.sin(t * speed + phase) * 0.5 + 0.5) * 0.85 + 0.05;
      const barHeight = rawHeight * canvas.height;
      ctx.fillStyle = rawHeight > 0.35 ? primaryColor : dimColor;
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - spacing, barHeight);
    }

    if (isPlayingRef.current) {
      animFrameRef.current = requestAnimationFrame(drawSpectrum);
    }
  }, []);

  const stopAnimation = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    stopAnimation();
    animFrameRef.current = requestAnimationFrame(drawSpectrum);
  }, [drawSpectrum, stopAnimation]);

  // When the component mounts or tab is switched back, sync with the engine state
  useEffect(() => {
    if (isPlaying) startAnimation();
    return () => stopAnimation();
  }, []);

  useEffect(() => {
    if (isPlaying) startAnimation();
    else stopAnimation();
  }, [isPlaying]);

  // When currentIndex changes, load the new track — but only if it actually changed
  useEffect(() => {
    if (!currentTrack) return;
    audio.loadTrack(currentTrack.id, isPlaying);
  }, [currentIndex]);

  // Keep volume in sync
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

  const handlePlayPause = () => {
    if (!currentTrack) return;
    const howl = audio.getCurrentHowl();
    if (!howl) {
      audio.loadTrack(currentTrack.id, true);
    } else {
      audio.togglePlayPause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
    audio.seek(val);
  };

  const handleImportFiles = async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: 'Audio Files', extensions: ['mp3', 'flac', 'ogg', 'wav', 'm4a', 'aac', 'wma'] }],
    });
    if (!selected) return;
    const files = Array.isArray(selected) ? selected : [selected];
    const tracks: Track[] = files.map((path) => ({
      id: crypto.randomUUID(),
      title: (path.split(/[/\\]/).pop() ?? path).replace(/\.[^/.]+$/, ''),
      artist: 'UNKNOWN',
      path,
      duration: 0,
    }));
    if (tracks.length > 0) addTracks(tracks);
  };

  const handleImportFolder = async () => {
    const dir = await open({ directory: true, multiple: false });
    if (!dir || Array.isArray(dir)) return;
    try {
      const entries = await readDir(dir as string);
      const audioExts = ['.mp3', '.flac', '.ogg', '.wav', '.m4a', '.aac', '.wma'];
      const tracks: Track[] = entries
        .filter((e) => e.name && audioExts.some((ext) => e.name!.toLowerCase().endsWith(ext)))
        .map((e) => ({
          id: crypto.randomUUID(),
          title: e.name!.replace(/\.[^/.]+$/, ''),
          artist: 'UNKNOWN',
          path: (e as any).path ?? `${dir}\\${e.name}`,
          duration: 0,
        }));
      if (tracks.length > 0) setPlaylist(tracks);
    } catch (err) {
      console.error('Failed to read directory:', err);
    }
  };

  const duration = audio.getDuration() || currentTrack?.duration || 0;

  return (
    <div className={styles.container}>
      <div className={styles.nowPlaying}>
        <div className={styles.trackInfo}>
          {currentTrack ? (
            <>
              <span className={`${styles.trackTitle} glow`}>{currentTrack.title}</span>
              <span className={styles.trackArtist}>{currentTrack.artist}</span>
            </>
          ) : (
            <span className={styles.trackTitle}>NO TRACK LOADED</span>
          )}
        </div>

        <canvas ref={canvasRef} className={styles.spectrum} width={240} height={80} />
      </div>

      <div className={styles.progress}>
        <span>{formatTime(progress)}</span>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.iconBtn} ${repeatMode !== 'none' ? styles.active : ''}`}
          onClick={() =>
            setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')
          }
          title="Repeat"
        >
          {repeatMode === 'one' ? '1' : repeatMode === 'all' ? '∞' : '→'}
        </button>
        <button className={styles.iconBtn} onClick={prevTrack} title="Prev">◄◄</button>
        <button className={`${styles.iconBtn} ${styles.playBtn}`} onClick={handlePlayPause} title="Play/Pause">
          {isPlaying ? '■' : '►'}
        </button>
        <button className={styles.iconBtn} onClick={nextTrack} title="Next">►►</button>
        <button
          className={`${styles.iconBtn} ${isShuffle ? styles.active : ''}`}
          onClick={toggleShuffle}
          title="Shuffle"
        >
          ⇄
        </button>
      </div>

      <div className={styles.volume}>
        <span>VOL</span>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <span>{Math.round(volume * 100)}</span>
      </div>

      <div className={styles.toolbar}>
        <button className={styles.toolBtn} onClick={handleImportFiles} title="Import audio files">
          + FILES
        </button>
        <button className={styles.toolBtn} onClick={handleImportFolder} title="Import folder as playlist">
          + FOLDER
        </button>
        <button
          className={styles.toolBtn}
          onClick={() => setShowPlaylist(!showPlaylist)}
          title="Toggle playlist"
        >
          LIST ({playlist.length})
        </button>
      </div>

      {showPlaylist && (
        <div className={styles.playlist}>
          <ul className={styles.trackList}>
            {playlist.length === 0 && <li className={styles.emptyMsg}>NO TRACKS IN PLAYLIST</li>}
            {playlist.map((track, idx) => (
              <li
                key={track.id}
                className={`${styles.trackItem} ${idx === currentIndex ? styles.trackActive : ''}`}
                onDoubleClick={() => {
                  setCurrentIndex(idx);
                  // loadTrack will be called by the currentIndex useEffect;
                  // force play by calling it directly with autoPlay=true
                  setTimeout(() => audio.loadTrack(track.id, true), 0);
                }}
              >
                <span className={styles.trackNum}>
                  {idx === currentIndex && isPlaying ? '♪' : String(idx + 1).padStart(2, '0')}
                </span>
                <span className={styles.trackName}>{track.title}</span>
                <span className={styles.trackDur}>
                  {track.duration > 0 ? formatTime(track.duration) : '--:--'}
                </span>
                <button
                  className={styles.removeBtn}
                  onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Player;
