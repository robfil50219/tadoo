export type TaskPriority = 'low' | 'normal' | 'high';
export type TaskCategory = 'home' | 'school' | 'activity' | 'health' | 'shopping';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  assigneeId: string;
  createdById: string;
  category: TaskCategory;
  priority: TaskPriority;
  reminderMinutesBefore?: number;
  requiresApproval: boolean;
  approvedById?: string;
  dueDateTime?: string;
}
