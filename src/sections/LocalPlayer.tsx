import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Trash2,
  Music,
  Volume2,
  Upload,
  Disc3,
} from 'lucide-react';
import type { LocalTrack } from '@/hooks/useLocalPlayer';

interface LocalPlayerProps {
  tracks: LocalTrack[];
  currentTrack: LocalTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onAddTracks: (files: FileList | null) => void;
  onRemoveTrack: (id: string) => void;
  onPlayTrack: (track: LocalTrack) => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  formatTime: (time: number) => string;
}

export default function LocalPlayer({
  tracks,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  onAddTracks,
  onRemoveTrack,
  onPlayTrack,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  formatTime,
}: LocalPlayerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAddTracks(e.target.files);
    e.target.value = '';
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onAddTracks(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative border-2 border-dashed rounded-2xl p-6 mb-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20'
            : 'border-slate-200 dark:border-slate-600 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-slate-50 dark:hover:bg-slate-700/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-6 h-6 text-sky-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Arrastra archivos aquí
        </p>
        <p className="text-xs text-slate-400 mt-1">
          o haz clic para seleccionar (MP3, WAV, OGG)
        </p>
      </div>

      {/* Now Playing */}
      {currentTrack && (
        <div className="mb-4 p-4 bg-white dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-800 flex items-center justify-center flex-shrink-0">
              {isPlaying ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Disc3 className="w-5 h-5 text-sky-500" />
                </motion.div>
              ) : (
                <Music className="w-5 h-5 text-sky-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {currentTrack.name}
              </p>
              <p className="text-xs text-slate-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-1.5 bg-slate-100 dark:bg-slate-600 rounded-full cursor-pointer mb-4"
          >
            <motion.div
              className="h-full bg-sky-400 rounded-full relative"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              layout
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-sky-500 rounded-full shadow-sm" />
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={onPrevious}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-md transition-all"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            <button
              onClick={onNext}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 mt-3">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-slate-100 dark:bg-slate-600 rounded-full appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="flex-1 overflow-y-auto">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Canciones ({tracks.length})
        </h4>
        {tracks.length === 0 ? (
          <div className="text-center py-8">
            <Music className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              No hay canciones aún
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Sube tus archivos de audio
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {tracks.map((track) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 group transition-all"
                >
                  <button
                    onClick={() => onPlayTrack(track)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        currentTrack?.id === track.id
                          ? 'bg-sky-100 dark:bg-sky-800'
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        >
                          <Disc3 className="w-4 h-4 text-sky-500" />
                        </motion.div>
                      ) : (
                        <Music
                          className={`w-4 h-4 ${
                            currentTrack?.id === track.id
                              ? 'text-sky-500'
                              : 'text-slate-400'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          currentTrack?.id === track.id
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {track.name}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => onRemoveTrack(track.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
