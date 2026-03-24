'use client';

import { Task } from '@/lib/types';

interface Props {
  tasks: Task[];
  dark: boolean;
  onOpen: (task: Task) => void;
  onUpdate: (task: Task) => void;
}

export default function DoneView({ tasks, dark, onOpen, onUpdate }: Props) {
  const done = tasks.filter(t => t.done).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Done</h1>
        <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{done.length} completed task{done.length !== 1 ? 's' : ''}</p>
      </div>

      {done.length === 0 ? (
        <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
          <div className="text-5xl mb-3">✅</div>
          <p className={`text-lg font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>Nothing done yet</p>
          <p className="text-sm">Completed tasks will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {done.map(task => (
            <div
              key={task.id}
              onClick={() => onOpen(task)}
              className={`border rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 transition-colors ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={e => { e.stopPropagation(); onUpdate({ ...task, done: false, kanbanStatus: 'not-started' }); }}
                  className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-500 text-white flex items-center justify-center flex-shrink-0 hover:bg-transparent hover:text-green-500 transition-all"
                  title="Mark incomplete"
                >
                  <span className="text-xs leading-none">✓</span>
                </button>
                <div>
                  <p className={`text-sm font-medium line-through ${dark ? 'text-white/40' : 'text-gray-400'}`}>{task.title}</p>
                  {task.notes && <p className={`text-xs mt-0.5 truncate max-w-xs ${dark ? 'text-white/20' : 'text-gray-300'}`}>{task.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {task.category && <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400'}`}>{task.category}</span>}
                {task.delegate && <span className="bg-blue-500/10 text-blue-400/70 text-xs px-2 py-0.5 rounded-full">{task.delegate}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
