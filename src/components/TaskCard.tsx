'use client';

import { useState } from 'react';
import { Task, CATEGORIES, DELEGATES, Importance, Category, Timing, TaskType } from '@/lib/types';

interface Props {
  task: Task;
  onUpdate: (task: Task) => void;
  onFile: (task: Task) => void;
  onDelete: (id: string) => void;
  dark: boolean;
}

const stars = [1, 2, 3, 4, 5] as Importance[];

export default function TaskCard({ task, onUpdate, onFile, onDelete, dark }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');

  const update = (partial: Partial<Task>) => onUpdate({ ...task, ...partial });

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    update({ subtasks: [...task.subtasks, { id: Date.now().toString(), title: newSubtask.trim(), done: false }] });
    setNewSubtask('');
  };

  const canFile = task.timing && task.taskType && task.importance && task.category && task.delegate;

  return (
    <div className={`border rounded-xl mb-3 overflow-hidden ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => setExpanded(!expanded)} className={`text-sm ${dark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}>
          {expanded ? '▼' : '▶'}
        </button>
        <button
          onClick={() => update({ done: !task.done, kanbanStatus: !task.done ? 'finished' : 'not-started' })}
          title={task.done ? 'Mark incomplete' : 'Mark done'}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            task.done
              ? 'bg-green-500 border-green-500 text-white'
              : dark ? 'border-white/20 hover:border-green-400' : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {task.done && <span className="text-xs leading-none">✓</span>}
        </button>
        <span className={`flex-1 font-medium ${task.done ? 'line-through opacity-40' : ''} ${dark ? 'text-white' : 'text-gray-800'}`}>{task.title}</span>
        {task.importance && <span className="text-yellow-400 text-sm">{'⭐'.repeat(task.importance)}</span>}
        {task.delegate && (
          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{task.delegate}</span>
        )}
        <button onClick={() => onDelete(task.id)} className={`text-lg leading-none ml-1 hover:text-red-400 ${dark ? 'text-white/20' : 'text-gray-300'}`}>×</button>
      </div>

      {/* Attributes */}
      {expanded && (
        <div className={`px-4 pb-4 space-y-3 border-t pt-3 ${dark ? 'border-white/5' : 'border-gray-50'}`}>
          <div className="grid grid-cols-2 gap-3">
            {/* Timing */}
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Timing</label>
              <div className="flex gap-2">
                {(['do-now', 'schedule'] as Timing[]).map(t => (
                  <button
                    key={t}
                    onClick={() => update({ timing: t })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
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
                  className={`mt-2 w-full text-xs border rounded-lg px-2 py-1.5 ${dark ? 'bg-[#222] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                />
              )}
            </div>

            {/* Task Type */}
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Type</label>
              <div className="flex gap-2">
                {(['quick', 'project'] as TaskType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => update({ taskType: t })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      task.taskType === t
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : dark ? 'bg-transparent text-white/50 border-white/10 hover:border-indigo-400 hover:text-white' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {t === 'quick' ? 'Quick' : 'Project'}
                  </button>
                ))}
              </div>
            </div>

            {/* Importance */}
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Importance</label>
              <div className="flex gap-1">
                {stars.map(s => (
                  <button
                    key={s}
                    onClick={() => update({ importance: s })}
                    className={`text-xl transition-all ${
                      task.importance && s <= task.importance ? 'text-yellow-400' : dark ? 'text-white/10 hover:text-yellow-300' : 'text-gray-200 hover:text-yellow-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Category</label>
              <select
                value={task.category || ''}
                onChange={e => update({ category: e.target.value as Category || null })}
                className={`w-full text-xs border rounded-lg px-2 py-1.5 ${dark ? 'bg-[#222] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
              >
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Delegation */}
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Assign to</label>
              <select
                value={task.delegate || ''}
                onChange={e => update({ delegate: e.target.value || null })}
                className={`w-full text-xs border rounded-lg px-2 py-1.5 ${dark ? 'bg-[#222] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
              >
                <option value="">Select...</option>
                {DELEGATES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Subtasks */}
          {task.taskType === 'project' && (
            <div>
              <label className={`text-xs mb-1 block ${dark ? 'text-white/40' : 'text-gray-500'}`}>Subtasks</label>
              {task.subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={st.done}
                    onChange={e => update({ subtasks: task.subtasks.map(s => s.id === st.id ? { ...s, done: e.target.checked } : s) })}
                    className="rounded accent-indigo-500"
                  />
                  <span className={`text-xs ${st.done ? `line-through ${dark ? 'text-white/20' : 'text-gray-300'}` : dark ? 'text-white/70' : 'text-gray-700'}`}>{st.title}</span>
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <input
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubtask()}
                  placeholder="Add subtask..."
                  className={`flex-1 text-xs border rounded-lg px-2 py-1.5 ${dark ? 'bg-[#222] border-white/10 text-white placeholder-white/30' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'}`}
                />
                <button onClick={addSubtask} className={`text-xs px-3 py-1.5 rounded-lg ${dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>+</button>
              </div>
            </div>
          )}

          {/* File button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={() => canFile && onFile(task)}
              disabled={!canFile}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                canFile
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              File Task →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
