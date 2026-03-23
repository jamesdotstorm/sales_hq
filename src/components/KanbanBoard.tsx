'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, KanbanStatus } from '@/lib/types';

interface Props {
  tasks: Task[];
  onUpdate: (task: Task) => void;
}

const COLUMNS: { id: KanbanStatus; label: string; color: string; bg: string }[] = [
  { id: 'not-started', label: 'Not Started', color: 'text-gray-600', bg: 'bg-gray-50' },
  { id: 'working', label: 'Working on It', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'stuck', label: 'Stuck', color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'finished', label: 'Finished', color: 'text-green-600', bg: 'bg-green-50' },
];

export default function KanbanBoard({ tasks, onUpdate }: Props) {
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
        <h1 className="text-2xl font-bold text-gray-800">Torti&apos;s Board</h1>
        <p className="text-gray-500 text-sm mt-1">Tasks assigned to Torti 🐢</p>
      </div>

      {kanbanTasks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🐢</div>
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm">File a task and assign it to Torti to see it here</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map(col => {
              const colTasks = kanbanTasks.filter(t => t.kanbanStatus === col.id);
              return (
                <div key={col.id} className={`${col.bg} rounded-xl p-3`}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className={`font-semibold text-sm ${col.color}`}>{col.label}</h2>
                    <span className="bg-white text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">
                      {colTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-24 rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? 'bg-white/60' : ''
                        }`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg p-3 mb-2 shadow-sm border transition-shadow ${
                                  snapshot.isDragging ? 'shadow-md border-indigo-200' : 'border-gray-100'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium text-gray-800 flex-1">{task.title}</p>
                                  {task.isCollaborative && (
                                    <span title="Collaborative task" className="text-sm">🤝</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {task.category && (
                                    <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded">
                                      {task.category}
                                    </span>
                                  )}
                                  {task.importance && (
                                    <span className="text-yellow-400 text-xs">
                                      {'★'.repeat(task.importance)}
                                    </span>
                                  )}
                                  {task.timing === 'schedule' && task.scheduledDate && (
                                    <span className="text-xs text-gray-400">📅 {task.scheduledDate}</span>
                                  )}
                                  {task.taskType === 'project' && task.subtasks.length > 0 && (
                                    <span className="text-xs text-gray-400">
                                      {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
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
