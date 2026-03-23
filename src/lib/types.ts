export type Timing = 'do-now' | 'schedule';
export type TaskType = 'quick' | 'project';
export type Importance = 1 | 2 | 3 | 4 | 5;
export type Category = 'Turnstay' | 'Bunker Hills' | 'Life Admin' | 'Turnstay Admin';
export type KanbanStatus = 'not-started' | 'working' | 'stuck' | 'finished';

export const CATEGORIES: Category[] = ['Turnstay', 'Bunker Hills', 'Life Admin', 'Turnstay Admin'];
export const DELEGATES = ['Torti', 'Jamie', 'Alon'];

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  createdAt: string;
  filed: boolean;

  // Attributes
  timing: Timing | null;
  scheduledDate: string | null;
  taskType: TaskType | null;
  importance: Importance | null;
  category: Category | null;
  delegate: string | null;
  subtasks: Subtask[];

  // Kanban
  kanbanStatus: KanbanStatus;
  isCollaborative: boolean;
}
