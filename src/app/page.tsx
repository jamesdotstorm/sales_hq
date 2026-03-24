'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { loadTasks, saveTasks } from '@/lib/storage';
import { loadFromGist, saveToGist } from '@/lib/gist';
import InboxView from '@/components/InboxView';
import KanbanBoard from '@/components/KanbanBoard';
import ScheduledView from '@/components/ScheduledView';
import DelegatedView from '@/components/DelegatedView';
import TodayView from '@/components/TodayView';
import AllTasksKanban from '@/components/AllTasksKanban';
import TaskModal from '@/components/TaskModal';
import DoneView from '@/components/DoneView';

type View = 'inbox' | 'today' | 'scheduled' | 'delegated' | 'all' | 'kanban' | 'done';

const NAV: { id: View; label: string; icon: string }[] = [
  { id: 'inbox', label: 'Inbox', icon: '📥' },
  { id: 'today', label: "Today's Mission", icon: '🎯' },
  { id: 'scheduled', label: 'Scheduled', icon: '📅' },
  { id: 'delegated', label: 'Delegated', icon: '👥' },
  { id: 'all', label: 'All Tasks', icon: '📋' },
  { id: 'kanban', label: "Torti's Board", icon: '🐢' },
  { id: 'done', label: 'Done', icon: '✅' },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>('inbox');
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dark-mode');
    if (saved !== null) setDark(saved === 'true');

    // Load from Gist first, fall back to localStorage
    setSyncing(true);
    loadFromGist().then(gistTasks => {
      if (gistTasks && gistTasks.length > 0) {
        const merged = gistTasks as Task[];
        setTasks(merged);
        saveTasks(merged);
      } else {
        setTasks(loadTasks());
      }
      setSyncing(false);
      setMounted(true);
    }).catch(() => {
      setTasks(loadTasks());
      setSyncing(false);
      setMounted(true);
    });
  }, []);

  const updateTasks = (updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
    saveToGist(updated); // async, fire and forget
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
      done: false,
      notes: '',
    };
    updateTasks([task, ...tasks]);
  };

  const updateTask = (updated: Task) => updateTasks(tasks.map(t => t.id === updated.id ? updated : t));
  const fileTask = (task: Task) => updateTasks(tasks.map(t => t.id === task.id ? { ...task, filed: true } : t));
  const deleteTask = (id: string) => updateTasks(tasks.filter(t => t.id !== id));

  const toggleDark = () => setDark(d => { localStorage.setItem('dark-mode', String(!d)); return !d; });

  const inboxCount = tasks.filter(t => !t.filed).length;
  const stuckCount = tasks.filter(t => t.filed && t.delegate === 'Torti' && t.kanbanStatus === 'stuck').length;

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = tasks.filter(t => t.filed && (t.timing === 'do-now' || t.scheduledDate === today)).length;
  const doneCount = tasks.filter(t => t.done).length;

  if (!mounted) return null;

  return (
    <div className={`flex h-screen font-sans ${dark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`w-60 border-r flex flex-col flex-shrink-0 ${dark ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-200'}`}>
        {/* Logo */}
        <div className={`px-5 py-5 border-b ${dark ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐢</span>
              <div>
                <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>Task Inbox</p>
                <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Jamie & Torti</p>
              </div>
            </div>
            <button onClick={toggleDark} className="text-lg opacity-50 hover:opacity-100 transition-opacity" title="Toggle dark mode">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon }) => {
            const badge = id === 'inbox' ? inboxCount
              : id === 'kanban' ? (stuckCount > 0 ? stuckCount : 0)
              : id === 'today' ? todayCount
              : id === 'done' ? doneCount
              : 0;
            const isStuck = id === 'kanban' && stuckCount > 0;

            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  view === id
                    ? 'bg-indigo-600 text-white'
                    : dark ? 'text-white/50 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </div>
                {badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isStuck ? 'bg-red-500 text-white' : view === id ? 'bg-indigo-500' : dark ? 'bg-white/10' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className={`px-5 py-4 border-t ${dark ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
            <p className={`text-xs ${dark ? 'text-white/20' : 'text-gray-300'}`}>{syncing ? 'Syncing...' : 'Synced'}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 overflow-auto ${dark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        {view === 'inbox' && <InboxView tasks={tasks} onUpdate={updateTask} onFile={fileTask} onDelete={deleteTask} onAdd={addTask} dark={dark} onOpen={setModalTask} />}
        {view === 'today' && <TodayView tasks={tasks} dark={dark} onOpen={setModalTask} />}
        {view === 'scheduled' && <ScheduledView tasks={tasks} dark={dark} onOpen={setModalTask} />}
        {view === 'delegated' && <DelegatedView tasks={tasks} dark={dark} onOpen={setModalTask} />}
        {view === 'all' && <AllTasksKanban tasks={tasks} onUpdate={updateTask} dark={dark} onOpen={setModalTask} />}
        {view === 'kanban' && <KanbanBoard tasks={tasks} onUpdate={updateTask} dark={dark} onOpen={setModalTask} />}
        {view === 'done' && <DoneView tasks={tasks} dark={dark} onOpen={setModalTask} onUpdate={updateTask} />}
      </div>

      {modalTask && (
        <TaskModal
          task={tasks.find(t => t.id === modalTask.id) || modalTask}
          dark={dark}
          onUpdate={t => { updateTask(t); setModalTask(t); }}
          onClose={() => setModalTask(null)}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}
