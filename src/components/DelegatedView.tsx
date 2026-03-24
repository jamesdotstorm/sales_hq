'use client';

import { Task } from '@/lib/types';

interface Props {
  tasks: Task[];
  dark: boolean;
}

export default function DelegatedView({ tasks, dark }: Props) {
  const delegated = tasks.filter(t => t.filed && t.delegate);

  const grouped = delegated.reduce<Record<string, Task[]>>((acc, t) => {
    const d = t.delegate!;
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {});

  const personColors: Record<string, string> = {
    Torti: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    Jamie: 'text-green-400 bg-green-500/10 border-green-500/20',
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Delegated Tasks</h1>
        <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>All delegated tasks, organised by person</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
          <div className="text-5xl mb-3">👥</div>
          <p className={`text-lg font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>No delegated tasks</p>
          <p className="text-sm">Assign a task to someone from the inbox</p>
        </div>
      ) : (
        Object.entries(grouped).map(([person, personTasks]) => {
          const colorClass = personColors[person] || 'text-blue-400 bg-blue-500/10 border-blue-500/20';
          return (
            <div key={person} className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${colorClass}`}>
                  {person}
                </span>
                <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>{personTasks.length} task{personTasks.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {personTasks.map(task => (
                  <div key={task.id} className={`border rounded-xl px-4 py-3 ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-800'}`}>{task.title}</p>
                        {task.scheduledDate && (
                          <p className={`text-xs mt-0.5 ${dark ? 'text-white/30' : 'text-gray-400'}`}>📅 {task.scheduledDate}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {task.category && <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'}`}>{task.category}</span>}
                        {task.importance && <span className="text-yellow-400/70 text-xs">{'★'.repeat(task.importance)}</span>}
                        {task.taskType === 'project' && (
                          <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>
                            {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
