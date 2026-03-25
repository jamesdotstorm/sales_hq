export type Timing = 'do-now' | 'schedule' | 'review-next-week';
export type TaskType = 'quick' | 'project';
export type Importance = 1 | 2 | 3 | 4 | 5;
export type Category = 'Turnstay' | 'Bunker Hills' | 'Life Admin' | 'Turnstay Admin';
export type KanbanStatus = 'not-started' | 'working' | 'stuck' | 'finished';

export const CATEGORIES: Category[] = ['Turnstay', 'Bunker Hills', 'Life Admin', 'Turnstay Admin'];
export const DELEGATES = ['Torti', 'Alon', 'Victory', 'Tarn', 'Morag', 'Adam', 'Mommy'];
export const TAGS = ['Bill to pay', 'Fun', 'Urgent', 'Waiting', 'Research', 'Call', 'Buy', 'Alon chat points'];

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
  done: boolean;

  // Attributes
  timing: Timing | null;
  scheduledDate: string | null;
  reviewDate: string | null;
  taskType: TaskType | null;
  importance: Importance | null;
  category: Category | null;
  delegate: string | null;
  subtasks: Subtask[];

  notes: string;
  tags: string[];

  // Kanban
  kanbanStatus: KanbanStatus;
  isCollaborative: boolean;
}
