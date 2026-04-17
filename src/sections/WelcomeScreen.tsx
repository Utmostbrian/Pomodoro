import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Headphones, ListTodo, ArrowRight, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: (name: string) => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [name, setName] = useState(() => {
    return localStorage.getItem('pomodoro_user_name') || '';
  });
  const [showInput, setShowInput] = useState(false);

  const handleEnter = () => {
    if (name.trim()) {
      localStorage.setItem('pomodoro_user_name', name.trim());
      onEnter(name.trim());
    } else {
      setShowInput(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEnter();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 transition-colors duration-500">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-sky-300/30 dark:bg-sky-500/20"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -20, 20, -10, 0],
              opacity: [0.3, 0.7, 0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center z-10 px-6"
      >
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-200 dark:shadow-blue-900/30"
        >
          <Clock className="w-12 h-12 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight"
        >
          Pomodoro Focus
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-slate-500 dark:text-slate-400 mb-10"
        >
          Productividad y concentración en un solo lugar
        </motion.p>

        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          {showInput || name ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  Bienvenida
                </span>
                <Sparkles className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="¿Cómo te llamas?"
                className="px-6 py-3 text-2xl font-semibold text-center bg-white/80 dark:bg-slate-800/80 border-2 border-sky-200 dark:border-sky-700 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400 dark:focus:border-sky-500 transition-all w-72"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors text-lg font-medium"
            >
              Presiona para comenzar
            </button>
          )}
        </motion.div>

        {/* Enter button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEnter}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-sky-200 dark:shadow-blue-900/30 transition-all"
        >
          {name.trim() ? `Entrar como ${name}` : 'Entrar a la app'}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Features preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex items-center justify-center gap-8 text-slate-400 dark:text-slate-500"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-slate-800 flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-500" />
            </div>
            <span className="text-xs">Timer</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-slate-800 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-sky-500" />
            </div>
            <span className="text-xs">Música</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-slate-800 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-sky-500" />
            </div>
            <span className="text-xs">Tareas</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
