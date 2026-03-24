'use client';

import { useState } from 'react';
import { Task, CATEGORIES, DELEGATES, Importance, Category, Timing, TaskType } from '@/lib/types';

interface Props {
  task: Task;
  dark: boolean;
  onUpdate: (task: Task) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const stars = [1, 2, 3, 4, 5] as Importance[];

export default function TaskModal({ task, dark, onUpdate, onClose, onDelete }: Props) {
  const [newSubtask, setNewSubtask] = useState('');

  const update = (partial: Partial<Task>) => onUpdate({ ...task, ...partial });

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    update({ subtasks: [...task.subtasks, { id: Date.now().toString(), title: newSubtask.trim(), done: false }] });
    setNewSubtask('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-y-auto max-h-[90vh] ${dark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start gap-3 px-6 pt-6 pb-4 border-b ${dark ? 'border-white/5' : 'border-gray-100'}`}>
          <button
            onClick={() => update({ done: !task.done, kanbanStatus: !task.done ? 'finished' : 'not-started' })}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              task.done ? 'bg-green-500 border-green-500 text-white' : dark ? 'border-white/30 hover:border-green-400' : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {task.done && <span className="text-xs leading-none">✓</span>}
          </button>
          <input
            value={task.title}
            onChange={e => update({ title: e.target.value })}
            className={`flex-1 text-lg font-semibold bg-transparent border-b-2 focus:outline-none transition-colors ${task.done ? 'line-through opacity-40' : ''} ${dark ? 'text-white border-white/10 focus:border-indigo-500' : 'text-gray-800 border-gray-200 focus:border-indigo-500'}`}
          />
          <button onClick={onClose} className={`text-xl leading-none hover:text-red-400 ${dark ? 'text-white/30' : 'text-gray-400'}`}>×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Timing */}
          <div>
            <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Timing</label>
            <div className="flex gap-2">
              {(['do-now', 'schedule'] as Timing[]).map(t => (
                <button
                  key={t}
                  onClick={() => update({ timing: t })}
                  className={`text-sm px-4 py-2 rounded-lg border transition-all ${
                    task.timing === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : dark ? 'bg-transparent text-white/50 border-white/10 hover:border-indigo-400 hover:text-white' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {t === 'do-now' ? 'Do Now' : 'Schedule'}
                </button>
              ))}
            </div>
            {task.timing === 'schedule' && (
              <input
                type="date"
                value={task.scheduledDate || ''}
                onChange={e => update({ scheduledDate: e.target.value })}
                className={`mt-2 w-full text-sm border rounded-lg px-3 py-2 ${dark ? 'bg-[#222] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
              />
            )}
          </div>

          {/* Type */}
          <div>
            <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Task Type</label>
            <div className="flex gap-2">
              {(['quick', 'project'] as TaskType[]).map(t => (
                <button
                  key={t}
                  onClick={() => update({ taskType: t })}
                  className={`text-sm px-4 py-2 rounded-lg border transition-all ${
                    task.taskType === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : dark ? 'bg-transparent text-white/50 border-white/10 hover:border-indigo-400 hover:text-white' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {t === 'quick' ? 'Quick Task' : 'Project'}
                </button>
              ))}
            </div>
          </div>

          {/* Importance */}
          <div>
            <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Importance</label>
            <div className="flex gap-1">
              {stars.map(s => (
                <button
                  key={s}
                  onClick={() => update({ importance: s })}
                  className={`text-2xl transition-all ${task.importance && s <= task.importance ? 'text-yellow-400' : dark ? 'text-white/10 hover:text-yellow-300' : 'text-gray-200 hover:text-yellow-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Category + Assign */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Category</label>
              <select
                value={task.category || ''}
                onChange={e => update({ category: e.target.value as Category || null })}
                className={`w-full text-sm border rounded-lg px-3 py-2 ${dark ? 'bg-[#222] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
              >
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Assign to</label>
              <select
                value={task.delegate || ''}
                onChange={e => update({ delegate: e.target.value || null })}
                className={`w-full text-sm border rounded-lg px-3 py-2 ${dark ? 'bg-[#222] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
              >
                <option value="">Select...</option>
                {DELEGATES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Kanban status */}
          <div>
            <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Status</label>
            <div className="flex gap-2 flex-wrap">
              {(['not-started', 'working', 'stuck', 'finished'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => update({ kanbanStatus: s })}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    task.kanbanStatus === s
                      ? s === 'finished' ? 'bg-green-600 text-white border-green-600'
                        : s === 'stuck' ? 'bg-red-600 text-white border-red-600'
                        : s === 'working' ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-indigo-600 text-white border-indigo-600'
                      : dark ? 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {s === 'not-started' ? 'Not Started' : s === 'working' ? 'Working on It' : s === 'stuck' ? 'Stuck' : 'Finished'}
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          {task.taskType === 'project' && (
            <div>
              <label className={`text-xs font-medium uppercase tracking-wider mb-2 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Subtasks</label>
              <div className="space-y-1.5 mb-2">
                {task.subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={st.done}
                      onChange={e => update({ subtasks: task.subtasks.map(s => s.id === st.id ? { ...s, done: e.target.checked } : s) })}
                      className="rounded accent-indigo-500"
                    />
                    <span className={`text-sm ${st.done ? `line-through ${dark ? 'text-white/20' : 'text-gray-300'}` : dark ? 'text-white/70' : 'text-gray-700'}`}>{st.title}</span>
                    <button
                      onClick={() => update({ subtasks: task.subtasks.filter(s => s.id !== st.id) })}
                      className={`ml-auto text-sm hover:text-red-400 ${dark ? 'text-white/20' : 'text-gray-300'}`}
                    >×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubtask()}
                  placeholder="Add subtask..."
                  className={`flex-1 text-sm border rounded-lg px-3 py-2 ${dark ? 'bg-[#222] border-white/10 text-white placeholder-white/30' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'}`}
                />
                <button onClick={addSubtask} className={`px-3 py-2 rounded-lg text-sm ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>+</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${dark ? 'border-white/5' : 'border-gray-100'}`}>
          {onDelete ? (
            <button onClick={() => { onDelete(task.id); onClose(); }} className="text-sm text-red-400 hover:text-red-300 transition-colors">
              Delete task
            </button>
          ) : <div />}
          <button onClick={onClose} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
