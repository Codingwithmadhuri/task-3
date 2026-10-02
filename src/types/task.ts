/**
 * TaskFlow - TypeScript Definitions
 * Task 3: JavaScript Logic & State Management
 */

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategory = 'General' | 'Work' | 'Personal' | 'Study' | 'Urgent';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt?: number;
  priority: TaskPriority;
  category?: TaskCategory;
}

export type TaskFilter = 'all' | 'active' | 'completed';

export interface TaskCounts {
  total: number;
  active: number;
  completed: number;
}

export interface ValidationFeedback {
  type: 'error' | 'success' | 'info';
  message: string;
}

export interface StorageStatus {
  isAvailable: boolean;
  itemCount: number;
  bytesUsed: number;
  lastSavedAt: number | null;
  error?: string;
}

export interface TestCaseResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details?: string;
  timestamp?: number;
}
