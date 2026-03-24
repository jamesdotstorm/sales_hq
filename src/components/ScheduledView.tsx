'use client';

import { Task } from '@/lib/types';

interface Props {
  tasks: Task[];
  dark: boolean;
  onOpen: (task: Task) => void;
}

export default function ScheduledView({ tasks, dark, onOpen }: Props) {
  const scheduled = tasks
    .filter(t => t.filed && t.timing === 'schedule' && t.scheduledDate)
    .sort((a, b) => (a.scheduledDate! > b.scheduledDate! ? 1 : -1));

  const today = new Date().toISOString().slice(0, 10);

  const grouped = scheduled.reduce<Record<string, Task[]>>((acc, t) => {
    const d = t.scheduledDate!;
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {});

  const label = (d: string) => {
    if (d === today) return 'Today';
    const diff = Math.round((new Date(d).getTime() - new Date(today).getTime()) / 86400000);
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Scheduled Tasks</h1>
        <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>All scheduled tasks in chronological order</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
          <div className="text-5xl mb-3">📅</div>
          <p className={`text-lg font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>No scheduled tasks</p>
          <p className="text-sm">Schedule a task from the inbox to see it here</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, dateTasks]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wider ${date === today ? 'text-indigo-400' : dark ? 'text-white/40' : 'text-gray-400'}`}>
                {label(date)}
              </span>
              <span className={`text-xs ${dark ? 'text-white/20' : 'text-gray-300'}`}>{date}</span>
            </div>
            <div className="space-y-2">
              {dateTasks.map(task => (
                <TaskRow key={task.id} task={task} dark={dark} onOpen={onOpen} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function TaskRow({ task, dark, onOpen }: { task: Task; dark: boolean; onOpen: (t: Task) => void }) {
  return (
    <div className={`border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition-colors ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`} onClick={() => onOpen(task)}>
      <div className="flex items-center gap-3">
        <span className="text-indigo-400 text-sm">📅</span>
        <div>
          <p className={`text-sm font-medium ${task.done ? 'line-through opacity-40' : ''} ${dark ? 'text-white' : 'text-gray-800'}`}>{task.title}</p>
          {task.taskType === 'project' && task.subtasks.length > 0 && (
            <p className={`text-xs mt-0.5 ${dark ? 'text-white/30' : 'text-gray-400'}`}>
              {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {task.category && <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'}`}>{task.category}</span>}
        {task.delegate && <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{task.delegate}</span>}
        {task.importance && <span className="text-yellow-400/70 text-xs">{'★'.repeat(task.importance)}</span>}
      </div>
    </div>
  );
}
