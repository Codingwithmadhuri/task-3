/**
 * FlowList — Pure JavaScript Logic & State Management
 * Task 3 Internship Project
 * 
 * Features:
 * - Pure DOM manipulation using document.createElement & safe textContent
 * - Event delegation on task-list container
 * - Full CRUD operations
 * - window.localStorage persistence with fallback & recovery
 * - Dynamic filtering (All, Active, Completed)
 * - Safe validation against empty or whitespace input
 */

(function () {
  'use strict';

  // --- 1. Constants & Application State ---
  const STORAGE_KEY = 'taskflow-tasks';

  let state = {
    tasks: [],
    filter: 'all', // 'all' | 'active' | 'completed'
    editingId: null,
  };

  // --- 2. DOM Elements Cache ---
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskPriority = document.getElementById('task-priority');
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const emptyTitle = document.getElementById('empty-title');
  const emptySubtitle = document.getElementById('empty-subtitle');
  const feedbackBanner = document.getElementById('feedback-banner');
  const feedbackMessage = document.getElementById('feedback-message');
  const feedbackDismiss = document.getElementById('feedback-dismiss');
  const charCounter = document.getElementById('char-counter');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  // Counters
  const countTotalEl = document.getElementById('count-total');
  const countActiveEl = document.getElementById('count-active');
  const countCompletedEl = document.getElementById('count-completed');
  const countPercentEl = document.getElementById('count-percent');
  const progressBarEl = document.getElementById('progress-bar');

  // Tab counters
  const tabCountAll = document.getElementById('tab-count-all');
  const tabCountActive = document.getElementById('tab-count-active');
  const tabCountCompleted = document.getElementById('tab-count-completed');
  const tabButtons = document.querySelectorAll('.tab-btn');

  // --- 3. LocalStorage Persistence Functions ---

  /**
   * Load tasks from window.localStorage safely
   */
  function loadTasks() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return getInitialSampleTasks();
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      console.warn('Storage format invalid. Initializing clean array.');
      return [];
    } catch (err) {
      console.error('Failed to parse localStorage JSON:', err);
      showFeedback('Storage read warning: Corrupted data was safely recovered.', 'error');
      return [];
    }
  }

  /**
   * Save tasks to window.localStorage
   */
  function saveTasks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
      return true;
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
      showFeedback('Storage Error: Unable to save changes. Quota may be exceeded.', 'error');
      return false;
    }
  }

  function getInitialSampleTasks() {
    const samples = [
      {
        id: 't-1',
        title: 'Review Task 3 requirements for JavaScript Logic & State Management',
        completed: true,
        priority: 'high',
        createdAt: Date.now() - 3600000 * 24,
      },
      {
        id: 't-2',
        title: 'Implement CRUD operations and localStorage persistence with window.localStorage',
        completed: true,
        priority: 'high',
        createdAt: Date.now() - 3600000 * 12,
      },
      {
        id: 't-3',
        title: 'Build dynamic filter controls (All, Active, Completed) with live count recalculation',
        completed: false,
        priority: 'medium',
        createdAt: Date.now() - 3600000 * 4,
      },
      {
        id: 't-4',
        title: 'Verify event delegation and XSS prevention with safe DOM textContent methods',
        completed: false,
        priority: 'low',
        createdAt: Date.now() - 3600000 * 1,
      },
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
    return samples;
  }

  // --- 4. State Modification (CRUD) Functions ---

  /**
   * Add a new task
   */
  function addTask(title, priority = 'medium') {
    const trimmed = title.trim();
    if (!trimmed) {
      showFeedback('Task title cannot be empty or contain only spaces.', 'error');
      taskInput.focus();
      return false;
    }

    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: trimmed,
      completed: false,
      priority: priority,
      createdAt: Date.now(),
    };

    state.tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateTaskCounts();
    showFeedback('Task added successfully!', 'success');
    return true;
  }

  /**
   * Edit task title
   */
  function editTask(id, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      showFeedback('Edited task title cannot be empty.', 'error');
      return false;
    }

    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.title = trimmed;
      task.updatedAt = Date.now();
      state.editingId = null;
      saveTasks();
      renderTasks();
      showFeedback('Task updated successfully.', 'success');
      return true;
    }
    return false;
  }

  /**
   * Delete task
   */
  function deleteTask(id) {
    const initialLen = state.tasks.length;
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (state.tasks.length < initialLen) {
      if (state.editingId === id) {
        state.editingId = null;
      }
      saveTasks();
      renderTasks();
      updateTaskCounts();
      showFeedback('Task deleted.', 'success');
    }
  }

  /**
   * Toggle completion state
   */
  function toggleTaskCompletion(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      task.updatedAt = Date.now();
      saveTasks();
      renderTasks();
      updateTaskCounts();
    }
  }

  /**
   * Clear all completed tasks
   */
  function clearCompleted() {
    const completedCount = state.tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    if (confirm(`Remove all ${completedCount} completed task(s)?`)) {
      state.tasks = state.tasks.filter(t => !t.completed);
      saveTasks();
      renderTasks();
      updateTaskCounts();
      showFeedback(`Cleared ${completedCount} completed task(s).`, 'success');
    }
  }

  // --- 5. Filtering and Calculation ---

  function getFilteredTasks() {
    if (state.filter === 'active') {
      return state.tasks.filter(t => !t.completed);
    }
    if (state.filter === 'completed') {
      return state.tasks.filter(t => t.completed);
    }
    return state.tasks;
  }

  function updateTaskCounts() {
    const total = state.tasks.length;
    const active = state.tasks.filter(t => !t.completed).length;
    const completed = state.tasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    countTotalEl.textContent = total;
    countActiveEl.textContent = active;
    countCompletedEl.textContent = completed;
    countPercentEl.textContent = percent + '%';
    progressBarEl.style.width = percent + '%';

    tabCountAll.textContent = total;
    tabCountActive.textContent = active;
    tabCountCompleted.textContent = completed;

    if (completed > 0) {
      clearCompletedBtn.classList.remove('hidden');
    } else {
      clearCompletedBtn.classList.add('hidden');
    }
  }

  // --- 6. DOM Manipulation: Rendering ---

  /**
   * Pure DOM creation of a task element
   */
  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.id);

    if (state.editingId === task.id) {
      // Editing view
      const editWrapper = document.createElement('div');
      editWrapper.className = 'edit-wrapper';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'edit-input';
      input.value = task.title;
      input.maxLength = 150;
      input.setAttribute('data-action', 'edit-input');

      const btnGroup = document.createElement('div');
      btnGroup.className = 'edit-buttons';

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn btn-subtle';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.setAttribute('data-action', 'cancel-edit');

      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'btn btn-primary';
      saveBtn.textContent = 'Save';
      saveBtn.setAttribute('data-action', 'save-edit');

      btnGroup.appendChild(cancelBtn);
      btnGroup.appendChild(saveBtn);

      editWrapper.appendChild(input);
      editWrapper.appendChild(btnGroup);
      li.appendChild(editWrapper);

      setTimeout(() => input.focus(), 50);
      return li;
    }

    // Normal view
    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('data-action', 'toggle');
    checkbox.setAttribute('aria-label', 'Toggle task completion');

    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    // Safe textContent (prevents XSS vulnerabilities)
    textSpan.textContent = task.title;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'task-meta';

    const badge = document.createElement('span');
    badge.className = 'priority-badge ' + (task.priority || 'medium');
    badge.textContent = task.priority || 'medium';

    const dateSpan = document.createElement('span');
    const date = new Date(task.createdAt || Date.now());
    dateSpan.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    metaDiv.appendChild(badge);
    metaDiv.appendChild(dateSpan);

    contentDiv.appendChild(textSpan);
    contentDiv.appendChild(metaDiv);

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(contentDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-btn';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('data-action', 'edit');
    editBtn.setAttribute('aria-label', 'Edit task');

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('data-action', 'delete');
    deleteBtn.setAttribute('aria-label', 'Delete task');

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(actionsDiv);

    return li;
  }

  /**
   * Render all tasks according to current filter
   */
  function renderTasks() {
    taskList.innerHTML = '';
    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      if (state.filter === 'completed') {
        emptyTitle.textContent = 'No completed tasks';
        emptySubtitle.textContent = 'Mark tasks as complete to see them here.';
      } else if (state.filter === 'active') {
        emptyTitle.textContent = 'No active tasks';
        emptySubtitle.textContent = 'All tasks have been completed!';
      } else {
        emptyTitle.textContent = 'No tasks yet';
        emptySubtitle.textContent = 'Add your first task using the form above.';
      }
    } else {
      emptyState.classList.add('hidden');
      filtered.forEach(task => {
        const node = createTaskElement(task);
        taskList.appendChild(node);
      });
    }
  }

  // --- 7. Event Delegation on Parent Container ---
  taskList.addEventListener('click', function (e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const taskItem = target.closest('.task-item');
    if (!taskItem) return;

    const taskId = taskItem.getAttribute('data-id');

    if (action === 'toggle') {
      toggleTaskCompletion(taskId);
    } else if (action === 'delete') {
      deleteTask(taskId);
    } else if (action === 'edit') {
      state.editingId = taskId;
      renderTasks();
    } else if (action === 'cancel-edit') {
      state.editingId = null;
      renderTasks();
    } else if (action === 'save-edit') {
      const input = taskItem.querySelector('.edit-input');
      if (input) {
        editTask(taskId, input.value);
      }
    }
  });

  // Handle Enter and Escape in inline editor
  taskList.addEventListener('keydown', function (e) {
    if (e.target.classList.contains('edit-input')) {
      const taskItem = e.target.closest('.task-item');
      const taskId = taskItem ? taskItem.getAttribute('data-id') : null;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (taskId) {
          editTask(taskId, e.target.value);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        state.editingId = null;
        renderTasks();
      }
    }
  });

  // --- 8. Event Listeners for Form & Filters ---
  taskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const success = addTask(taskInput.value, taskPriority.value);
    if (success) {
      taskInput.value = '';
      charCounter.textContent = '0/150';
    }
  });

  taskInput.addEventListener('input', function () {
    charCounter.textContent = taskInput.value.length + '/150';
  });

  tabButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      state.filter = btn.getAttribute('data-filter');
      renderTasks();
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  feedbackDismiss.addEventListener('click', function () {
    feedbackBanner.classList.add('hidden');
  });

  function showFeedback(msg, type) {
    feedbackMessage.textContent = msg;
    feedbackBanner.className = 'feedback-banner ' + type;
    feedbackBanner.classList.remove('hidden');
    setTimeout(() => {
      feedbackBanner.classList.add('hidden');
    }, 3500);
  }

  // --- 9. Initialize ---
  state.tasks = loadTasks();
  renderTasks();
  updateTaskCounts();
})();
