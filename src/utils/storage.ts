/**
 * FlowList - localStorage Persistence Layer
 * Task 3: JavaScript Logic & State Management
 * 
 * Provides robust reading, writing, self-healing error handling, and recovery for window.localStorage
 */

import { Task } from '../types/task';

export const STORAGE_KEY = 'flowlist-tasks';
export const LEGACY_STORAGE_KEY = 'taskflow-tasks';

/**
 * Checks whether window.localStorage is accessible in the current browser environment.
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__flowlist_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Helper to safely extract and parse tasks from any key
 */
function parseAndValidateTasks(rawJson: string): Task[] | null {
  try {
    const parsed = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed
      .filter((item): item is Partial<Task> => typeof item === 'object' && item !== null)
      .map((item, index) => {
        const id = typeof item.id === 'string' && item.id.trim() ? item.id : `task-${Date.now()}-${index}`;
        const title = typeof item.title === 'string' ? item.title.trim() : 'Untitled Task';
        const completed = Boolean(item.completed);
        const createdAt = typeof item.createdAt === 'number' ? item.createdAt : Date.now();
        const priority = item.priority === 'high' || item.priority === 'medium' || item.priority === 'low'
          ? item.priority
          : 'medium';

        return {
          id,
          title,
          completed,
          createdAt,
          updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : undefined,
          priority,
          category: item.category || 'General',
        };
      })
      .filter(t => t.title.length > 0);
  } catch {
    return null;
  }
}

/**
 * Load tasks from localStorage with complete resilience:
 * - Checks current key and legacy key
 * - Handles missing key
 * - Self-heals corrupted JSON automatically by restoring clean JSON state
 * - Avoids throwing uncaught console errors
 */
export function loadTasksFromStorage(): { tasks: Task[]; error?: string } {
  if (!isLocalStorageAvailable()) {
    return {
      tasks: [],
      error: 'localStorage is unavailable in this environment (e.g. strict private mode or cookies disabled).',
    };
  }

  try {
    // 1. Check primary key first, fallback to legacy key if present
    let rawData = window.localStorage.getItem(STORAGE_KEY);
    let isLegacy = false;

    if (!rawData) {
      const legacyData = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyData) {
        rawData = legacyData;
        isLegacy = true;
      }
    }

    if (!rawData) {
      return { tasks: [] };
    }

    // 2. Validate parsing
    const validTasks = parseAndValidateTasks(rawData);

    if (validTasks === null) {
      // Corrupted JSON detected: self-heal by resetting to empty array in storage
      console.warn('[FlowList Storage] Malformed JSON in localStorage detected. Auto-recovering clean state.');
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // Ignore quota write errors during recovery
      }
      return {
        tasks: [],
        error: 'Corrupted localStorage data format was detected and safely recovered.',
      };
    }

    // If loaded from legacy key, migrate to primary key
    if (isLegacy) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validTasks));
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // Non-fatal
      }
    }

    return { tasks: validTasks };
  } catch (err) {
    console.warn('[FlowList Storage] Handled storage read exception, resetting state:', err);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {
      // Ignore
    }
    return {
      tasks: [],
      error: 'Stored tasks could not be read. Clean state initialized.',
    };
  }
}

/**
 * Save tasks to localStorage with error handling for quota and permissions.
 */
export function saveTasksToStorage(tasks: Task[]): { success: boolean; error?: string } {
  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: 'Cannot persist to localStorage: Storage is blocked or unavailable.',
    };
  }

  try {
    const serialized = JSON.stringify(tasks);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (err: unknown) {
    console.warn('[FlowList Storage] Handled storage write exception:', err);
    let message = 'Failed to save tasks to local storage.';
    if (err instanceof Error) {
      if (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        message = 'Storage quota exceeded. Free up storage space to save new tasks.';
      } else {
        message = err.message;
      }
    }
    return { success: false, error: message };
  }
}

/**
 * Get raw string from localStorage for inspector & verification
 */
export function getRawStorageString(): string {
  try {
    return (
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY) ||
      '[]'
    );
  } catch {
    return '[]';
  }
}

/**
 * Calculate size in bytes of stored tasks
 */
export function getStorageUsage(): { bytes: number; count: number } {
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY) ||
      '';
    const bytes = new Blob([raw]).size;
    let count = 0;
    try {
      const tasks = raw ? JSON.parse(raw) : [];
      count = Array.isArray(tasks) ? tasks.length : 0;
    } catch {
      count = 0;
    }
    return { bytes, count };
  } catch {
    return { bytes: 0, count: 0 };
  }
}

/**
 * Force inject raw string into localStorage (used for testing error handling & corrupt JSON recovery)
 */
export function injectRawStorage(rawContent: string): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, rawContent);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear flowlist tasks from storage
 */
export function clearTaskFlowStorage(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sample tasks for quick demonstration of active/completed states and priorities
 */
export const SAMPLE_TASKS: Task[] = [
  {
    id: 'task-init-1',
    title: 'Review Task 3 requirements for JavaScript Logic & State Management',
    completed: true,
    createdAt: Date.now() - 3600000 * 24 * 3,
    priority: 'high',
    category: 'Study',
  },
  {
    id: 'task-init-2',
    title: 'Implement CRUD operations and localStorage persistence with window.localStorage',
    completed: true,
    createdAt: Date.now() - 3600000 * 24 * 2,
    priority: 'high',
    category: 'Work',
  },
  {
    id: 'task-init-3',
    title: 'Build dynamic filter controls (All, Active, Completed) with live count recalculation',
    completed: false,
    createdAt: Date.now() - 3600000 * 12,
    priority: 'medium',
    category: 'Work',
  },
  {
    id: 'task-init-4',
    title: 'Verify event delegation and XSS prevention with safe DOM textContent methods',
    completed: false,
    createdAt: Date.now() - 3600000 * 4,
    priority: 'high',
    category: 'Study',
  },
  {
    id: 'task-init-5',
    title: 'Capture genuine screenshots and prepare internship submission documentation',
    completed: false,
    createdAt: Date.now() - 3600000 * 1,
    priority: 'low',
    category: 'General',
  },
];
