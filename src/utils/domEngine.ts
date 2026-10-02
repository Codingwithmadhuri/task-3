/**
 * FlowList - Pure DOM Manipulation & Event Delegation Engine
 * Task 3: JavaScript Logic & State Management
 * 
 * Implements:
 * - document.createElement() node construction
 * - textContent safe escaping (XSS prevention)
 * - Semantic, accessible interactive controls (buttons with role="checkbox")
 * - Event delegation on the parent container (single click/keydown listener)
 * - Dynamic list rendering & clean updates without duplicate nodes
 */

import { Task, TaskFilter, TaskCounts } from '../types/task';

export interface DOMEventHandlerCallbacks {
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, newTitle: string) => void;
  onCancelEdit: () => void;
}

/**
 * Filter tasks according to selected filter
 */
export function getFilteredTasks(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case 'active':
      return tasks.filter(t => !t.completed);
    case 'completed':
      return tasks.filter(t => t.completed);
    case 'all':
    default:
      return tasks;
  }
}

/**
 * Calculate task counts
 */
export function updateTaskCounts(tasks: Task[]): TaskCounts {
  return {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };
}

/**
 * Creates a single task item DOM node using document.createElement and safe textContent
 */
export function createTaskElement(
  task: Task,
  isEditing: boolean,
  editDraftTitle: string
): HTMLElement {
  const li = document.createElement('li');
  li.className = `task-item group transition-all duration-200 border rounded-xl p-4 bg-white shadow-xs hover:shadow-md ${
    task.completed ? 'border-slate-200 bg-slate-50/80 completed' : 'border-slate-200 hover:border-indigo-300'
  }`;
  li.setAttribute('data-id', task.id);
  li.setAttribute('role', 'listitem');

  if (isEditing) {
    // --- Editing Mode DOM structure ---
    const editContainer = document.createElement('div');
    editContainer.className = 'edit-wrapper flex flex-col gap-2.5 w-full';

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'relative flex-1';

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className =
      'edit-input w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-white border-2 border-indigo-600 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-300';
    editInput.value = editDraftTitle;
    editInput.setAttribute('data-role', 'edit-input');
    editInput.setAttribute('data-id', task.id);
    editInput.setAttribute('aria-label', `Edit task title for ${task.title}`);
    editInput.maxLength = 150;

    const charCounter = document.createElement('span');
    charCounter.className = 'absolute right-3 top-3 text-[11px] font-mono text-slate-400 pointer-events-none';
    charCounter.textContent = `${editDraftTitle.length}/150`;

    editInput.addEventListener('input', () => {
      charCounter.textContent = `${editInput.value.length}/150`;
    });

    inputWrapper.appendChild(editInput);
    inputWrapper.appendChild(charCounter);

    const buttonRow = document.createElement('div');
    buttonRow.className = 'flex flex-wrap items-center justify-between gap-2 pt-1';

    const hintSpan = document.createElement('span');
    hintSpan.className = 'text-xs text-slate-500 flex items-center gap-1.5';
    hintSpan.innerHTML = '<kbd class="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono text-slate-700">Enter</kbd> to save, <kbd class="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-mono text-slate-700">Esc</kbd> to cancel';

    const actionButtons = document.createElement('div');
    actionButtons.className = 'edit-buttons flex items-center gap-2';

    // Cancel Button
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className =
      'px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.setAttribute('data-action', 'cancel');
    cancelBtn.setAttribute('data-id', task.id);
    cancelBtn.setAttribute('aria-label', 'Cancel editing');

    // Save Button
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className =
      'px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer flex items-center gap-1';
    saveBtn.innerHTML = `
      <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
      </svg>
      <span>Save Changes</span>
    `;
    saveBtn.setAttribute('data-action', 'save');
    saveBtn.setAttribute('data-id', task.id);
    saveBtn.setAttribute('aria-label', 'Save task changes');

    actionButtons.appendChild(cancelBtn);
    actionButtons.appendChild(saveBtn);

    buttonRow.appendChild(hintSpan);
    buttonRow.appendChild(actionButtons);

    editContainer.appendChild(inputWrapper);
    editContainer.appendChild(buttonRow);
    li.appendChild(editContainer);

    // Auto-focus and select text for instant keyboard typing
    setTimeout(() => {
      try {
        editInput.focus();
        editInput.select();
      } catch {
        // Safe fallback
      }
    }, 20);

    return li;
  }

  // --- Normal Display Mode ---
  const mainRow = document.createElement('div');
  mainRow.className = 'flex items-center justify-between gap-3 w-full';

  const leftCol = document.createElement('div');
  leftCol.className = 'task-left flex items-start gap-3 flex-1 min-w-0';

  // Semantic Completion Checkbox Button (Robust against delegation & screen readers)
  const checkBtn = document.createElement('button');
  checkBtn.type = 'button';
  checkBtn.setAttribute('data-action', 'toggle');
  checkBtn.setAttribute('data-id', task.id);
  checkBtn.setAttribute('role', 'checkbox');
  checkBtn.setAttribute('aria-checked', task.completed ? 'true' : 'false');
  checkBtn.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'completed'}`);
  checkBtn.className = `task-checkbox w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer mt-0.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
    task.completed
      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
      : 'border-slate-300 bg-white hover:border-indigo-500 hover:bg-slate-50'
  }`;

  if (task.completed) {
    checkBtn.innerHTML = `
      <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
    `;
  }

  leftCol.appendChild(checkBtn);

  // Content block (Title + Meta)
  const contentBlock = document.createElement('div');
  contentBlock.className = 'task-content flex flex-col flex-1 min-w-0';

  // Safe task title using textContent (Prevents XSS vulnerabilities)
  const titleSpan = document.createElement('span');
  titleSpan.className = `task-text text-sm font-medium leading-relaxed break-words transition-all cursor-pointer select-text ${
    task.completed ? 'line-through text-slate-400' : 'text-slate-800 hover:text-indigo-900'
  }`;
  titleSpan.setAttribute('data-action', 'toggle');
  titleSpan.setAttribute('data-id', task.id);
  titleSpan.setAttribute('title', 'Click to toggle completion');
  titleSpan.textContent = task.title;
  contentBlock.appendChild(titleSpan);

  // Meta row (Priority, Category, Timestamp)
  const metaRow = document.createElement('div');
  metaRow.className = 'task-meta flex items-center flex-wrap gap-2 mt-1 text-[11px] text-slate-500';

  // Priority badge
  const priorityBadge = document.createElement('span');
  const priorityColors = {
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  priorityBadge.className = `priority-badge px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
    priorityColors[task.priority] || priorityColors.medium
  }`;
  priorityBadge.textContent = task.priority;
  metaRow.appendChild(priorityBadge);

  // Category if exists
  if (task.category) {
    const catBadge = document.createElement('span');
    catBadge.className = 'px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200/60';
    catBadge.textContent = task.category;
    metaRow.appendChild(catBadge);
  }

  // Time stamp
  const dateSpan = document.createElement('span');
  dateSpan.className = 'text-slate-500';
  const createdDate = new Date(task.createdAt);
  dateSpan.textContent = `Added ${createdDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  metaRow.appendChild(dateSpan);

  if (task.updatedAt) {
    const updatedSpan = document.createElement('span');
    updatedSpan.className = 'text-slate-500 italic';
    updatedSpan.textContent = '(edited)';
    metaRow.appendChild(updatedSpan);
  }

  contentBlock.appendChild(metaRow);
  leftCol.appendChild(contentBlock);
  mainRow.appendChild(leftCol);

  // Actions group (Edit, Delete)
  const actionGroup = document.createElement('div');
  actionGroup.className = 'task-actions flex items-center gap-1 shrink-0';

  // Edit Button
  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className =
    'action-btn p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300';
  editBtn.setAttribute('data-action', 'edit');
  editBtn.setAttribute('data-id', task.id);
  editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
  editBtn.innerHTML = `
    <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  `;

  // Delete Button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className =
    'action-btn delete p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-300';
  deleteBtn.setAttribute('data-action', 'delete');
  deleteBtn.setAttribute('data-id', task.id);
  deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
  deleteBtn.innerHTML = `
    <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  `;

  actionGroup.appendChild(editBtn);
  actionGroup.appendChild(deleteBtn);
  mainRow.appendChild(actionGroup);

  li.appendChild(mainRow);
  return li;
}

/**
 * Attaches a single delegated event listener on the task-list parent container.
 * Returns a cleanup function.
 */
export function setupTaskEventDelegation(
  container: HTMLElement,
  callbacks: DOMEventHandlerCallbacks
): () => void {
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if clicked element or its closest ancestor has data-action
    const actionElement = target.closest('[data-action]') as HTMLElement | null;
    if (!actionElement) return;

    const action = actionElement.getAttribute('data-action');
    const taskId = actionElement.getAttribute('data-id');
    if (!taskId) return;

    if (action === 'toggle') {
      callbacks.onToggle(taskId);
    } else if (action === 'edit') {
      callbacks.onEdit(taskId);
    } else if (action === 'delete') {
      callbacks.onDelete(taskId);
    } else if (action === 'save') {
      const taskItem = actionElement.closest('[data-id]') as HTMLElement;
      const input = taskItem?.querySelector('[data-role="edit-input"]') as HTMLInputElement | null;
      if (input) {
        callbacks.onSaveEdit(taskId, input.value);
      }
    } else if (action === 'cancel') {
      callbacks.onCancelEdit();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.getAttribute('data-role') === 'edit-input') {
      const input = target as HTMLInputElement;
      const taskId = input.getAttribute('data-id');
      if (!taskId) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        callbacks.onSaveEdit(taskId, input.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        callbacks.onCancelEdit();
      }
    }
  };

  container.addEventListener('click', handleClick);
  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('click', handleClick);
    container.removeEventListener('keydown', handleKeyDown);
  };
}
