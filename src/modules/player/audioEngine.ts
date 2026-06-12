import { Howl } from 'howler';
import { convertFileSrc } from '@tauri-apps/api/core';
import { usePlayerStore } from '../../store/playerStore';

let howl: Howl | null = null;
let loadedTrackId: string | null = null;

function getStore() {
  return usePlayerStore.getState();
}

export function getCurrentHowl(): Howl | null {
  return howl;
}

export function loadTrack(trackId: string, autoPlay: boolean): void {
  const { playlist, volume, setIsPlaying, updateTrackDuration, nextTrack } = getStore();
  const track = playlist.find((t) => t.id === trackId);
  if (!track) return;

  // Already loaded — don't reload, just respect autoPlay
  if (loadedTrackId === trackId && howl) {
    if (autoPlay && !howl.playing()) howl.play();
    return;
  }

  if (howl) {
    howl.unload();
    howl = null;
  }

  loadedTrackId = trackId;
  const src = convertFileSrc(track.path);

  howl = new Howl({
    src: [src],
    html5: true,
    volume,
    onload: () => {
      const dur = (howl?.duration() as number) ?? 0;
      if (dur > 0) updateTrackDuration(track.id, dur);
    },
    onloaderror: (_id, err) => {
      console.error('Audio load error:', err, src);
      loadedTrackId = null;
    },
    onend: () => nextTrack(),
    onplay: () => setIsPlaying(true),
    onpause: () => setIsPlaying(false),
    onstop: () => setIsPlaying(false),
  });

  if (autoPlay) howl.play();
}

export function play(): void {
  if (howl && !howl.playing()) howl.play();
}

export function pause(): void {
  if (howl?.playing()) howl.pause();
}

export function togglePlayPause(): void {
  if (!howl) return;
  if (howl.playing()) howl.pause();
  else howl.play();
}

export function seek(seconds: number): void {
  howl?.seek(seconds);
}

export function setVolume(vol: number): void {
  howl?.volume(vol);
}

export function getDuration(): number {
  return (howl?.duration() as number) ?? 0;
}

export function getSeek(): number {
  if (!howl) return 0;
  const s = howl.seek();
  return typeof s === 'number' ? s : 0;
}

export function isPlaying(): boolean {
  return howl?.playing() ?? false;
}

export function unload(): void {
  if (howl) {
    howl.unload();
    howl = null;
  }
  loadedTrackId = null;
}
