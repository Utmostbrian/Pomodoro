import { useState, useRef, useCallback, useEffect } from 'react';

export interface LocalTrack {
  id: string;
  name: string;
  duration: number;
  url: string;
}

export function useLocalPlayer() {
  const [tracks, setTracks] = useState<LocalTrack[]>(() => {
    try {
      const saved = localStorage.getItem('local_tracks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [currentTrack, setCurrentTrack] = useState<LocalTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio) setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio) setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Auto-play next track
      playNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const addTracks = useCallback((files: FileList | null) => {
    if (!files) return;
    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.ogg')
    );

    const newTracks: LocalTrack[] = audioFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      duration: 0,
      url: URL.createObjectURL(file),
    }));

    setTracks((prev) => {
      const updated = [...prev, ...newTracks];
      localStorage.setItem('local_tracks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeTrack = useCallback((id: string) => {
    setTracks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem('local_tracks', JSON.stringify(updated));
      return updated;
    });
    if (currentTrack?.id === id) {
      pause();
      setCurrentTrack(null);
    }
  }, [currentTrack]);

  const playTrack = useCallback((track: LocalTrack) => {
    if (!audioRef.current) return;

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    audioRef.current.src = track.url;
    audioRef.current.play().catch(() => {});
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
  }, [currentTrack, isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  }, [currentTrack, tracks, playTrack]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prevIndex]);
  }, [currentTrack, tracks, playTrack]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      pause();
    } else {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying, pause]);

  const formatTime = useCallback((time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    addTracks,
    removeTrack,
    playTrack,
    pause,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    formatTime,
  };
}
