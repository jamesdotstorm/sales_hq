'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, KanbanStatus } from '@/lib/types';

interface Props {
  tasks: Task[];
  onUpdate: (task: Task) => void;
  dark: boolean;
}

const COLUMNS: { id: KanbanStatus; label: string; accent: string; bg: string }[] = [
  { id: 'not-started', label: 'Not Started', accent: 'text-white/50', bg: 'bg-white/[0.03]' },
  { id: 'working', label: 'Working on It', accent: 'text-blue-400', bg: 'bg-blue-500/5' },
  { id: 'stuck', label: 'Stuck', accent: 'text-red-400', bg: 'bg-red-500/5' },
  { id: 'finished', label: 'Finished', accent: 'text-green-400', bg: 'bg-green-500/5' },
];

export default function KanbanBoard({ tasks, onUpdate, dark }: Props) {
  const kanbanTasks = tasks.filter(t => t.filed && t.delegate === 'Torti');

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const task = kanbanTasks.find(t => t.id === result.draggableId);
    if (!task) return;
    onUpdate({ ...task, kanbanStatus: result.destination.droppableId as KanbanStatus });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Torti&apos;s Board</h1>
        <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>Tasks assigned to Torti 🐢</p>
      </div>

      {kanbanTasks.length === 0 ? (
        <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
          <div className="text-5xl mb-3">🐢</div>
          <p className={`text-lg font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>No tasks yet</p>
          <p className="text-sm">File a task and assign it to Torti to see it here</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map(col => {
              const colTasks = kanbanTasks.filter(t => t.kanbanStatus === col.id);
              return (
                <div key={col.id} className={`${col.bg} border rounded-xl p-3 ${dark ? 'border-white/5' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className={`font-semibold text-sm ${col.accent}`}>{col.label}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'}`}>
                      {colTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-24 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`border rounded-lg p-3 mb-2 transition-shadow ${dark ? 'bg-[#1e1e1e]' : 'bg-white shadow-sm'} ${
                                  snapshot.isDragging ? 'shadow-xl border-indigo-500/40' : dark ? 'border-white/5' : 'border-gray-100'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <button
                                    onClick={() => onUpdate({ ...task, done: !task.done, kanbanStatus: !task.done ? 'finished' : task.kanbanStatus })}
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.done ? 'bg-green-500 border-green-500 text-white' : dark ? 'border-white/20 hover:border-green-400' : 'border-gray-300 hover:border-green-400'}`}
                                  >
                                    {task.done && <span className="text-[10px] leading-none">✓</span>}
                                  </button>
                                  <p className={`text-sm font-medium flex-1 ${task.done ? 'line-through opacity-40' : ''} ${dark ? 'text-white' : 'text-gray-800'}`}>{task.title}</p>
                                  {task.isCollaborative && <span title="Collaborative" className="text-sm">🤝</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {task.category && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'}`}>{task.category}</span>
                                  )}
                                  {task.importance && (
                                    <span className="text-yellow-400/70 text-xs">{'★'.repeat(task.importance)}</span>
                                  )}
                                  {task.timing === 'schedule' && task.scheduledDate && (
                                    <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>📅 {task.scheduledDate}</span>
                                  )}
                                  {task.taskType === 'project' && task.subtasks.length > 0 && (
                                    <span className="text-xs text-white/30">
                                      {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
