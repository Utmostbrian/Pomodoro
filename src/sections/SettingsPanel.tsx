import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Clock,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

interface SettingsPanelProps {
  settings: PomodoroSettings;
  isDark: boolean;
  soundEnabled: boolean;
  onUpdateSettings: (settings: Partial<PomodoroSettings>) => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onResetData: () => void;
}

export default function SettingsPanel({
  settings,
  isDark,
  soundEnabled,
  onUpdateSettings,
  onToggleTheme,
  onToggleSound,
  onResetData,
}: SettingsPanelProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    onResetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-500" />
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-white">
          Configuración
        </h3>
      </div>

      <div className="space-y-6 overflow-y-auto flex-1">
        {/* Timer Settings */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Duración del Timer
          </h4>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-700 dark:text-slate-300">
                  Trabajo
                </label>
                <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                  {settings.workMinutes} min
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.workMinutes}
                onChange={(e) =>
                  onUpdateSettings({ workMinutes: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400">5m</span>
                <span className="text-[10px] text-slate-400">60m</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-700 dark:text-slate-300">
                  Descanso Corto
                </label>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {settings.shortBreakMinutes} min
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={settings.shortBreakMinutes}
                onChange={(e) =>
                  onUpdateSettings({ shortBreakMinutes: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400">1m</span>
                <span className="text-[10px] text-slate-400">15m</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-700 dark:text-slate-300">
                  Descanso Largo
                </label>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {settings.longBreakMinutes} min
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={settings.longBreakMinutes}
                onChange={(e) =>
                  onUpdateSettings({ longBreakMinutes: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400">5m</span>
                <span className="text-[10px] text-slate-400">30m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Apariencia
          </h4>

          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Modo oscuro
                </p>
                <p className="text-xs text-slate-400">
                  {isDark ? 'Activado' : 'Desactivado'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isDark ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                animate={{ left: isDark ? '26px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Sound */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            Sonido
          </h4>

          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Alarma al completar
              </p>
              <p className="text-xs text-slate-400">
                {soundEnabled ? 'Activada' : 'Desactivada'}
              </p>
            </div>
            <button
              onClick={onToggleSound}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-600'
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                animate={{ left: soundEnabled ? '26px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Reset Data */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" />
            Datos
          </h4>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer datos
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  ¿Estás segura?
                </p>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                Se eliminarán todas las tareas, configuraciones y sesiones guardadas.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Sí, restablecer
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
