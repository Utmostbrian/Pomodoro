import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ListTodo,
  CheckSquare,
  X,
} from 'lucide-react';
import type { Task } from '@/hooks/useTasks';

interface TaskManagerProps {
  tasks: Task[];
  activeCount: number;
  completedCount: number;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
}

export default function TaskManager({
  tasks,
  activeCount,
  completedCount,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}: TaskManagerProps) {
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-800 flex items-center justify-center">
          <ListTodo className="w-5 h-5 text-violet-500" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">Tareas</h3>
          <p className="text-xs text-slate-400">
            {activeCount} pendiente{activeCount !== 1 ? 's' : ''}
            {completedCount > 0 && ` · ${completedCount} completada${completedCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Add task input */}
      <form onSubmit={handleSubmit} className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Agregar nueva tarea..."
          className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 transition-all"
        />
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:bg-slate-200 dark:disabled:bg-slate-600 text-white flex items-center justify-center transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Filter tabs */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-1 mb-3 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'active' ? 'Pendientes' : 'Completadas'}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            {filter === 'completed' ? (
              <>
                <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No hay tareas completadas</p>
              </>
            ) : filter === 'active' ? (
              <>
                <Circle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No hay tareas pendientes</p>
              </>
            ) : (
              <>
                <ListTodo className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No hay tareas aún</p>
                <p className="text-xs text-slate-300 mt-1">
                  Agrega tu primera tarea arriba
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-700/50 transition-all"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="flex-shrink-0 text-violet-500 hover:text-violet-600 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <span
                    className={`flex-1 text-sm transition-all ${
                      task.completed
                        ? 'text-slate-400 line-through'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {task.text}
                  </span>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Clear completed */}
      {completedCount > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClearCompleted}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar completadas
          </button>
        </div>
      )}
    </div>
  );
}
