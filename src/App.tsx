import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ListTodo,
  Settings,
  Headphones,
  HardDrive,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import WelcomeScreen from '@/sections/WelcomeScreen';
import PomodoroTimer from '@/sections/PomodoroTimer';
import SpotifyPlayer from '@/sections/SpotifyPlayer';
import LocalPlayer from '@/sections/LocalPlayer';
import TaskManager from '@/sections/TaskManager';
import SettingsPanel from '@/sections/SettingsPanel';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTasks } from '@/hooks/useTasks';
import { useTheme } from '@/hooks/useTheme';
import { useSpotify } from '@/hooks/useSpotify';
import { useLocalPlayer } from '@/hooks/useLocalPlayer';

type SidebarTab = 'spotify' | 'local' | 'tasks' | 'settings';

function App() {
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('pomodoro_user_name');
  });
  const [activeTab, setActiveTab] = useState<SidebarTab>('tasks');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('pomodoro_sound') !== 'false';
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('pomodoro_user_name') || 'Camila';
  });

  const pomodoro = usePomodoro();
  const tasks = useTasks();
  const theme = useTheme();
  const spotify = useSpotify();
  const localPlayer = useLocalPlayer();

  const handleEnter = useCallback((name: string) => {
    setUserName(name);
    setShowWelcome(false);
  }, []);

  const handleToggleSound = useCallback(() => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('pomodoro_sound', String(newVal));
  }, [soundEnabled]);

  const handleResetData = useCallback(() => {
    localStorage.removeItem('pomodoro_tasks');
    localStorage.removeItem('pomodoro_settings');
    localStorage.removeItem('pomodoro_sessions');
    localStorage.removeItem('pomodoro_theme');
    localStorage.removeItem('pomodoro_sound');
    localStorage.removeItem('pomodoro_user_name');
    window.location.reload();
  }, []);

  const handleSpotifySelectPlaylist = useCallback(
    (playlist: any) => {
      spotify.setCurrentPlaylist(playlist);
      spotify.fetchPlaylistTracks(playlist.id);
    },
    [spotify]
  );

  const tabs = [
    { id: 'tasks' as SidebarTab, icon: ListTodo, label: 'Tareas' },
    { id: 'spotify' as SidebarTab, icon: Headphones, label: 'Spotify' },
    { id: 'local' as SidebarTab, icon: HardDrive, label: 'Local' },
    { id: 'settings' as SidebarTab, icon: Settings, label: 'Ajustes' },
  ];

  if (showWelcome) {
    return <WelcomeScreen onEnter={handleEnter} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 transition-colors duration-500">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md shadow-sky-200 dark:shadow-blue-900/30">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
              Pomodoro Focus
            </h1>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span className="text-xs text-sky-500 dark:text-sky-400 font-medium">
                Bienvenida {userName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={handleToggleSound}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              soundEnabled
                ? 'bg-sky-100 dark:bg-sky-800/50 text-sky-600 dark:text-sky-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`}
            title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={theme.toggleTheme}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              theme.isDark
                ? 'bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400'
                : 'bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-400'
            }`}
            title={theme.isDark ? 'Modo oscuro' : 'Modo claro'}
          >
            {theme.isDark ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-6 px-6 pb-6 max-w-[1400px] mx-auto">
        {/* Timer Section - Main */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-sky-100/50 dark:shadow-black/20 border border-white/50 dark:border-slate-700/50"
          >
            <PomodoroTimer
              formattedTime={pomodoro.formattedTime}
              progress={pomodoro.progress}
              isRunning={pomodoro.isRunning}
              mode={pomodoro.mode}
              completedSessions={pomodoro.completedSessions}
              onStart={pomodoro.start}
              onPause={pomodoro.pause}
              onReset={pomodoro.reset}
              onSwitchMode={pomodoro.switchMode}
            />
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full lg:w-[360px] flex flex-col gap-4"
        >
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-sky-100/50 dark:shadow-black/20 border border-white/50 dark:border-slate-700/50 min-h-[400px] lg:min-h-[500px]"
            >
              {activeTab === 'spotify' && (
                <SpotifyPlayer
                  isAuthenticated={spotify.isAuthenticated}
                  user={spotify.user}
                  playlists={spotify.playlists}
                  tracks={spotify.tracks}
                  currentPlaylist={spotify.currentPlaylist}
                  currentTrack={spotify.currentTrack}
                  isPlaying={spotify.isPlaying}
                  isLoading={spotify.isLoading}
                  error={spotify.error}
                  onLogin={spotify.login}
                  onLogout={spotify.handleLogout}
                  onSelectPlaylist={handleSpotifySelectPlaylist}
                  onPlayTrack={spotify.playTrack}
                  onTogglePlay={spotify.togglePlay}
                  onNext={spotify.nextTrack}
                  onPrevious={spotify.previousTrack}
                  onBackToPlaylists={() => {
                    spotify.setCurrentPlaylist(null);
                  }}
                />
              )}

              {activeTab === 'local' && (
                <LocalPlayer
                  tracks={localPlayer.tracks}
                  currentTrack={localPlayer.currentTrack}
                  isPlaying={localPlayer.isPlaying}
                  currentTime={localPlayer.currentTime}
                  duration={localPlayer.duration}
                  volume={localPlayer.volume}
                  onAddTracks={localPlayer.addTracks}
                  onRemoveTrack={localPlayer.removeTrack}
                  onPlayTrack={localPlayer.playTrack}
                  onTogglePlay={localPlayer.togglePlay}
                  onNext={localPlayer.playNext}
                  onPrevious={localPlayer.playPrevious}
                  onSeek={localPlayer.seekTo}
                  onVolumeChange={localPlayer.setVolume}
                  formatTime={localPlayer.formatTime}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskManager
                  tasks={tasks.tasks}
                  activeCount={tasks.activeCount}
                  completedCount={tasks.completedCount}
                  onAddTask={tasks.addTask}
                  onToggleTask={tasks.toggleTask}
                  onDeleteTask={tasks.deleteTask}
                  onClearCompleted={tasks.clearCompleted}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsPanel
                  settings={pomodoro.settings}
                  isDark={theme.isDark}
                  soundEnabled={soundEnabled}
                  onUpdateSettings={pomodoro.updateSettings}
                  onToggleTheme={theme.toggleTheme}
                  onToggleSound={handleToggleSound}
                  onResetData={handleResetData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
