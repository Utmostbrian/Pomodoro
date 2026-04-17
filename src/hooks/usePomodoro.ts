import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};

const STORAGE_KEY_SETTINGS = 'pomodoro_settings';
const STORAGE_KEY_SESSIONS = 'pomodoro_sessions';

function loadSettings(): PomodoroSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

function loadCompletedSessions(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (saved) return parseInt(saved, 10);
  } catch (e) {
    console.error('Error loading sessions:', e);
  }
  return 0;
}

function getDurationForMode(mode: TimerMode, settings: PomodoroSettings): number {
  switch (mode) {
    case 'work':
      return settings.workMinutes * 60;
    case 'shortBreak':
      return settings.shortBreakMinutes * 60;
    case 'longBreak':
      return settings.longBreakMinutes * 60;
    default:
      return settings.workMinutes * 60;
  }
}

export function usePomodoro() {
  const [settings, setSettings] = useState<PomodoroSettings>(loadSettings);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(() => getDurationForMode('work', loadSettings()));
  const [totalTime, setTotalTime] = useState(() => getDurationForMode('work', loadSettings()));
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(loadCompletedSessions);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            playAlarm();
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Update page title
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const modeLabel = mode === 'work' ? 'Trabajo' : mode === 'shortBreak' ? 'Descanso' : 'Descanso largo';
    document.title = `${timeStr} - ${modeLabel} | Pomodoro Focus`;
  }, [timeLeft, mode]);

  const playAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const handleSessionComplete = useCallback(() => {
    if (mode === 'work') {
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);
      localStorage.setItem(STORAGE_KEY_SESSIONS, String(newCompleted));

      // Auto-switch: after 4 work sessions, long break
      if (newCompleted % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('work');
    }
  }, [mode, completedSessions]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setMode(newMode);
      setIsRunning(false);
      const duration = getDurationForMode(newMode, settings);
      setTimeLeft(duration);
      setTotalTime(duration);
    },
    [settings]
  );

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    const duration = getDurationForMode(mode, settings);
    setTimeLeft(duration);
    setTotalTime(duration);
  }, [mode, settings]);

  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      // Recalculate current timer
      const duration = getDurationForMode(mode, updated);
      if (!isRunning) {
        setTimeLeft(duration);
        setTotalTime(duration);
      }
    },
    [settings, mode, isRunning]
  );

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const formattedTime = {
    minutes: Math.floor(timeLeft / 60),
    seconds: timeLeft % 60,
    display: `${Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`,
  };

  return {
    timeLeft,
    totalTime,
    isRunning,
    mode,
    completedSessions,
    settings,
    progress,
    formattedTime,
    start,
    pause,
    reset,
    switchMode,
    updateSettings,
  };
}
