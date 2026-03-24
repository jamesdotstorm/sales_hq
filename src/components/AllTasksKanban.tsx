'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, KanbanStatus } from '@/lib/types';

interface Props {
  tasks: Task[];
  onUpdate: (task: Task) => void;
  dark: boolean;
  onOpen: (task: Task) => void;
}

const COLUMNS: { id: KanbanStatus; label: string; accent: string; bg: string }[] = [
  { id: 'not-started', label: 'Not Started', accent: 'text-white/50', bg: '' },
  { id: 'working', label: 'In Progress', accent: 'text-blue-400', bg: 'bg-blue-500/5' },
  { id: 'stuck', label: 'Stuck', accent: 'text-red-400', bg: 'bg-red-500/5' },
  { id: 'finished', label: 'Completed', accent: 'text-green-400', bg: 'bg-green-500/5' },
];

export default function AllTasksKanban({ tasks, onUpdate, dark, onOpen }: Props) {
  const allFiled = tasks.filter(t => t.filed);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const task = allFiled.find(t => t.id === result.draggableId);
    if (!task) return;
    onUpdate({ ...task, kanbanStatus: result.destination.droppableId as KanbanStatus });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>All Tasks</h1>
        <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>Full Kanban view across all tasks</p>
      </div>

      {allFiled.length === 0 ? (
        <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
          <div className="text-5xl mb-3">📋</div>
          <p className={`text-lg font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>No tasks filed yet</p>
          <p className="text-sm">File tasks from the inbox to see them here</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map(col => {
              const colTasks = allFiled.filter(t => t.kanbanStatus === col.id);
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
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <button
                                    onClick={() => onUpdate({ ...task, done: !task.done, kanbanStatus: !task.done ? 'finished' : task.kanbanStatus })}
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${task.done ? 'bg-green-500 border-green-500 text-white' : dark ? 'border-white/20 hover:border-green-400' : 'border-gray-300 hover:border-green-400'}`}
                                  >
                                    {task.done && <span className="text-[10px] leading-none">✓</span>}
                                  </button>
                                  <button onClick={() => onOpen(task)} className={`text-sm font-medium flex-1 text-left hover:underline decoration-dotted ${task.done ? 'line-through opacity-40' : ''} ${dark ? 'text-white' : 'text-gray-800'}`}>{task.title}</button>
                                  {task.isCollaborative && <span className="text-xs">🤝</span>}
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {task.delegate && (
                                    <span className="bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0.5 rounded-full">{task.delegate}</span>
                                  )}
                                  {task.category && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'}`}>{task.category}</span>
                                  )}
                                  {task.importance && (
                                    <span className="text-yellow-400/70 text-xs">{'★'.repeat(task.importance)}</span>
                                  )}
                                  {task.scheduledDate && (
                                    <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>📅 {task.scheduledDate}</span>
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
