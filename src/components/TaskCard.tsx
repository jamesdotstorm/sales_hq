'use client';

import { useState } from 'react';
import { Task, CATEGORIES, DELEGATES, Importance, Category, Timing, TaskType } from '@/lib/types';

interface Props {
  task: Task;
  onUpdate: (task: Task) => void;
  onFile: (task: Task) => void;
  onDelete: (id: string) => void;
}

const stars = [1, 2, 3, 4, 5] as Importance[];

export default function TaskCard({ task, onUpdate, onFile, onDelete }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [newSubtask, setNewSubtask] = useState('');

  const update = (partial: Partial<Task>) => onUpdate({ ...task, ...partial });

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    update({
      subtasks: [...task.subtasks, { id: Date.now().toString(), title: newSubtask.trim(), done: false }],
    });
    setNewSubtask('');
  };

  const canFile = task.timing && task.taskType && task.importance && task.category && task.delegate;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          {expanded ? '▼' : '▶'}
        </button>
        <span className="flex-1 font-medium text-gray-800">{task.title}</span>
        {task.importance && (
          <span className="text-yellow-400 text-sm">{'⭐'.repeat(task.importance)}</span>
        )}
        {task.delegate && (
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{task.delegate}</span>
        )}
        <button onClick={() => onDelete(task.id)} className="text-gray-300 hover:text-red-400 ml-1 text-lg leading-none">×</button>
      </div>

      {/* Attributes */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Timing */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Timing</label>
              <div className="flex gap-2">
                {(['do-now', 'schedule'] as Timing[]).map(t => (
                  <button
                    key={t}
                    onClick={() => update({ timing: t })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      task.timing === t
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
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
                  className="mt-2 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                />
              )}
            </div>

            {/* Task Type */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <div className="flex gap-2">
                {(['quick', 'project'] as TaskType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => update({ taskType: t })}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      task.taskType === t
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {t === 'quick' ? 'Quick Task' : 'Project'}
                  </button>
                ))}
              </div>
            </div>

            {/* Importance */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Importance</label>
              <div className="flex gap-1">
                {stars.map(s => (
                  <button
                    key={s}
                    onClick={() => update({ importance: s })}
                    className={`text-lg transition-all ${
                      task.importance && s <= task.importance ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select
                value={task.category || ''}
                onChange={e => update({ category: e.target.value as Category || null })}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Delegation */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Assign to</label>
              <select
                value={task.delegate || ''}
                onChange={e => {
                  const delegate = e.target.value || null;
                  const isCollaborative = delegate === 'Torti' && task.delegate === 'Jamie' ||
                    delegate === 'Jamie' && task.delegate === 'Torti';
                  update({ delegate, isCollaborative });
                }}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
              >
                <option value="">Select...</option>
                {DELEGATES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Subtasks (if Project) */}
          {task.taskType === 'project' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Subtasks</label>
              {task.subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={st.done}
                    onChange={e =>
                      update({
                        subtasks: task.subtasks.map(s =>
                          s.id === st.id ? { ...s, done: e.target.checked } : s
                        ),
                      })
                    }
                    className="rounded"
                  />
                  <span className={`text-xs ${st.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {st.title}
                  </span>
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <input
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubtask()}
                  placeholder="Add subtask..."
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                />
                <button onClick={addSubtask} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">+</button>
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
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
