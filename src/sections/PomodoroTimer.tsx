import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Sun, Timer } from 'lucide-react';
import type { TimerMode } from '@/hooks/usePomodoro';

interface PomodoroTimerProps {
  formattedTime: { minutes: number; seconds: number; display: string };
  progress: number;
  isRunning: boolean;
  mode: TimerMode;
  completedSessions: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSwitchMode: (mode: TimerMode) => void;
}

const modeConfig: Record<TimerMode, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
  work: {
    label: 'Trabajo',
    color: 'text-sky-600 dark:text-sky-400',
    icon: <Brain className="w-5 h-5" />,
    bgColor: 'bg-sky-500',
  },
  shortBreak: {
    label: 'Descanso Corto',
    color: 'text-emerald-600 dark:text-emerald-400',
    icon: <Coffee className="w-5 h-5" />,
    bgColor: 'bg-emerald-500',
  },
  longBreak: {
    label: 'Descanso Largo',
    color: 'text-amber-600 dark:text-amber-400',
    icon: <Sun className="w-5 h-5" />,
    bgColor: 'bg-amber-500',
  },
};

export default function PomodoroTimer({
  formattedTime,
  progress,
  isRunning,
  mode,
  completedSessions,
  onStart,
  onPause,
  onReset,
  onSwitchMode,
}: PomodoroTimerProps) {
  const config = modeConfig[mode];
  const radius = 120;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Mode Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
        {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onSwitchMode(m)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === m
                ? `${modeConfig[m].color} bg-slate-50 dark:bg-slate-700 shadow-sm`
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {modeConfig[m].icon}
            <span className="hidden sm:inline">{modeConfig[m].label}</span>
          </button>
        ))}
      </div>

      {/* Circular Progress Timer */}
      <div className="relative mb-8">
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className={`${config.color} transition-colors duration-300`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(14, 165, 233, 0.3))' }}
          />
        </svg>

        {/* Timer display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={formattedTime.display}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-6xl font-bold text-slate-800 dark:text-white tabular-nums tracking-tight"
          >
            {formattedTime.display}
          </motion.div>
          <div className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${config.color}`}>
            {config.icon}
            {config.label}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onReset}
          className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shadow-sm"
          title="Reiniciar"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRunning ? onPause : onStart}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
            isRunning
              ? 'bg-amber-400 hover:bg-amber-500 shadow-amber-200 dark:shadow-amber-900/30'
              : 'bg-sky-500 hover:bg-sky-600 shadow-sky-200 dark:shadow-sky-900/30'
          }`}
        >
          {isRunning ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </motion.button>

        {/* Spacer for symmetry */}
        <div className="w-12" />
      </div>

      {/* Session counter */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Timer className="w-4 h-4" />
        <span>{completedSessions} sesiones completadas</span>
        {completedSessions > 0 && (
          <div className="flex items-center gap-1 ml-2">
            {Array.from({ length: Math.min(completedSessions, 8) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                className="w-2 h-2 rounded-full bg-sky-400 dark:bg-sky-500"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
