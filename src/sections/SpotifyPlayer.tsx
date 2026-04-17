import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  LogIn,
  LogOut,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Disc3,
  ChevronLeft,
  User,
} from 'lucide-react';
import type { SpotifyPlaylist, SpotifyTrack } from '@/hooks/useSpotify';

interface SpotifyPlayerProps {
  isAuthenticated: boolean;
  user: { display_name: string; images: { url: string }[] } | null;
  playlists: SpotifyPlaylist[];
  tracks: SpotifyTrack[];
  currentPlaylist: SpotifyPlaylist | null;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  onLogin: () => void;
  onLogout: () => void;
  onSelectPlaylist: (playlist: SpotifyPlaylist) => void;
  onPlayTrack: (uri: string) => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onBackToPlaylists: () => void;
}

export default function SpotifyPlayer({
  isAuthenticated,
  user,
  playlists,
  tracks,
  currentPlaylist,
  currentTrack,
  isPlaying,
  isLoading,
  error,
  onLogin,
  onLogout,
  onSelectPlaylist,
  onPlayTrack,
  onTogglePlay,
  onNext,
  onPrevious,
  onBackToPlaylists,
}: SpotifyPlayerProps) {
  const [showPlaylists, setShowPlaylists] = useState(!currentPlaylist);

  const handleSelectPlaylist = (playlist: SpotifyPlaylist) => {
    onSelectPlaylist(playlist);
    setShowPlaylists(false);
  };

  const handleBack = () => {
    onBackToPlaylists();
    setShowPlaylists(true);
  };

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
          Spotify
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[240px]">
          Conecta tu cuenta de Spotify para reproducir tu música mientras trabajas
        </p>
        <button
          onClick={onLogin}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/20"
        >
          <LogIn className="w-4 h-4" />
          Iniciar sesión con Spotify
        </button>
        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with user info */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {user?.images?.[0]?.url ? (
            <img
              src={user.images[0].url}
              alt={user?.display_name || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-200 dark:ring-emerald-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
              {user?.display_name || 'Usuario'}
            </p>
            <p className="text-xs text-slate-400">Spotify</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {showPlaylists ? (
          <motion.div
            key="playlists"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 overflow-y-auto"
          >
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Tus playlists
            </h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Disc3 className="w-6 h-6 text-emerald-500 animate-spin" />
              </div>
            ) : playlists.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No se encontraron playlists
              </p>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleSelectPlaylist(playlist)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 transition-all text-left group"
                  >
                    {playlist.images?.[0]?.url ? (
                      <img
                        src={playlist.images[0].url}
                        alt={playlist.name}
                        className="w-12 h-12 rounded-lg object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                        <Music className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {playlist.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {playlist.tracks.total} canciones
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="tracks"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-3 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </button>

            {/* Playlist header */}
            <div className="flex items-center gap-3 mb-4">
              {currentPlaylist?.images?.[0]?.url ? (
                <img
                  src={currentPlaylist.images[0].url}
                  alt={currentPlaylist.name}
                  className="w-14 h-14 rounded-xl object-cover shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                  <Music className="w-6 h-6 text-emerald-500" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white">
                  {currentPlaylist?.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {tracks.length} canciones
                </p>
              </div>
            </div>

            {/* Now playing */}
            {currentTrack && (
              <div className="mb-4 p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                <p className="text-xs text-slate-400 mb-2">Reproduciendo</p>
                <div className="flex items-center gap-3">
                  {currentTrack.album?.images?.[0]?.url ? (
                    <img
                      src={currentTrack.album.images[0].url}
                      alt={currentTrack.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                      <Music className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {currentTrack.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {currentTrack.artists.map((a) => a.name).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Playback controls */}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <button
                    onClick={onPrevious}
                    className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onTogglePlay}
                    className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={onNext}
                    className="p-2 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Track list */}
            <div className="flex-1 overflow-y-auto">
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => onPlayTrack(track.uri)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${
                    currentTrack?.id === track.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'hover:bg-white dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="w-5 text-center text-xs text-slate-400 group-hover:hidden">
                    {index + 1}
                  </span>
                  <Play className="w-3 h-3 text-emerald-500 hidden group-hover:block" />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        currentTrack?.id === track.id
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {track.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {track.artists.map((a) => a.name).join(', ')}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDuration(track.duration_ms)}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
