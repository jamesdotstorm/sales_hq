'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { loadTasks, saveTasks } from '@/lib/storage';
import InboxView from '@/components/InboxView';
import KanbanBoard from '@/components/KanbanBoard';

type View = 'inbox' | 'kanban';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>('inbox');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setMounted(true);
  }, []);

  const updateTasks = (updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
  };

  const addTask = (title: string) => {
    const task: Task = {
      id: Date.now().toString(),
      title,
      createdAt: new Date().toISOString(),
      filed: false,
      timing: null,
      scheduledDate: null,
      taskType: null,
      importance: null,
      category: null,
      delegate: null,
      subtasks: [],
      kanbanStatus: 'not-started',
      isCollaborative: false,
    };
    updateTasks([task, ...tasks]);
  };

  const updateTask = (updated: Task) => {
    updateTasks(tasks.map(t => t.id === updated.id ? updated : t));
  };

  const fileTask = (task: Task) => {
    const updated = { ...task, filed: true };
    updateTasks(tasks.map(t => t.id === task.id ? updated : t));
  };

  const deleteTask = (id: string) => {
    updateTasks(tasks.filter(t => t.id !== id));
  };

  const inboxCount = tasks.filter(t => !t.filed).length;
  const kanbanCount = tasks.filter(t => t.filed && t.delegate === 'Torti').length;
  const stuckCount = tasks.filter(t => t.filed && t.delegate === 'Torti' && t.kanbanStatus === 'stuck').length;

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="px-5 py-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐢</span>
            <div>
              <p className="font-bold text-sm">Task Inbox</p>
              <p className="text-gray-400 text-xs">Jamie & Torti</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <button
            onClick={() => setView('inbox')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'inbox'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>📥</span>
              <span>Inbox</span>
            </div>
            {inboxCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${view === 'inbox' ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                {inboxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setView('kanban')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'kanban'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>🐢</span>
              <span>Torti&apos;s Board</span>
            </div>
            <div className="flex gap-1">
              {stuckCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500 text-white">{stuckCount}</span>
              )}
              {kanbanCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${view === 'kanban' ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                  {kanbanCount}
                </span>
              )}
            </div>
          </button>
        </nav>

        <div className="px-5 py-4 border-t border-gray-800">
          <p className="text-gray-500 text-xs">Powered by Torti 🐢</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {view === 'inbox' ? (
          <InboxView
            tasks={tasks}
            onUpdate={updateTask}
            onFile={fileTask}
            onDelete={deleteTask}
            onAdd={addTask}
          />
        ) : (
          <KanbanBoard tasks={tasks} onUpdate={updateTask} />
        )}
      </div>
    </div>
  );
}
