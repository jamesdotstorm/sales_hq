'use client';

import { Task } from '@/lib/types';

interface Props {
  tasks: Task[];
  dark: boolean;
  onOpen: (task: Task) => void;
}

function Section({ title, icon, tasks, dark, empty, onOpen }: { title: string; icon: string; tasks: Task[]; dark: boolean; empty: string; onOpen: (t: Task) => void }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span>{icon}</span>
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${dark ? 'text-white/50' : 'text-gray-500'}`}>{title}</h2>
        {tasks.length > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'}`}>{tasks.length}</span>
        )}
      </div>
      {tasks.length === 0 ? (
        <p className={`text-sm italic ${dark ? 'text-white/20' : 'text-gray-300'}`}>{empty}</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} onClick={() => onOpen(task)} className={`border rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-500/40 transition-colors ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${task.done ? 'line-through opacity-40' : ''} ${dark ? 'text-white' : 'text-gray-800'}`}>{task.title}</p>
                  {task.taskType === 'project' && task.subtasks.length > 0 && (
                    <p className={`text-xs mt-0.5 ${dark ? 'text-white/30' : 'text-gray-400'}`}>
                      {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {task.category && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'}`}>{task.category}</span>
                  )}
                  {task.delegate && (
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{task.delegate}</span>
                  )}
                  {task.importance && <span className="text-yellow-400/70 text-xs">{'★'.repeat(task.importance)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TodayView({ tasks, dark, onOpen }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const filed = tasks.filter(t => t.filed);

  const doNow = filed.filter(t => t.timing === 'do-now' && t.taskType === 'quick' && !t.delegate);
  const projects = filed.filter(t => t.timing === 'do-now' && t.taskType === 'project');
  const scheduledToday = filed.filter(t => t.timing === 'schedule' && t.scheduledDate === today);
  const delegatedToday = filed.filter(t => t.delegate && (t.timing === 'do-now' || t.scheduledDate === today));

  const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const total = doNow.length + projects.length + scheduledToday.length + delegatedToday.length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Today&apos;s Mission</h1>
        <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{dateStr}</p>
      </div>

      {total === 0 ? (
        <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
          <div className="text-5xl mb-3">🎯</div>
          <p className={`text-lg font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>Nothing for today</p>
          <p className="text-sm">Set tasks to &quot;Do Now&quot; or schedule them for today</p>
        </div>
      ) : (
        <>
          <Section title="Quick Tasks" icon="⚡" tasks={doNow} dark={dark} empty="No quick tasks for today" onOpen={onOpen} />
          <Section title="Projects" icon="🗂" tasks={projects} dark={dark} empty="No projects for today" onOpen={onOpen} />
          <Section title="Scheduled Today" icon="📅" tasks={scheduledToday} dark={dark} empty="Nothing scheduled for today" onOpen={onOpen} />
          <Section title="Delegated Today" icon="👥" tasks={delegatedToday} dark={dark} empty="No delegated tasks for today" onOpen={onOpen} />
        </>
      )}
    </div>
  );
}
