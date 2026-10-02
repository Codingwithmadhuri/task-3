/**
 * FlowList - Master Application Component
 * Task 3: JavaScript Logic & State Management
 * 
 * Demonstrates:
 * - DOM manipulation with document.createElement and textContent
 * - Event delegation on the parent container
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - localStorage data persistence with error recovery
 * - Dynamic filtering (All, Active, Completed)
 * - Responsive layout & accessibility
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task, TaskFilter, TaskPriority, TaskCategory, ValidationFeedback } from '../types/task';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  SAMPLE_TASKS,
  isLocalStorageAvailable,
  STORAGE_KEY,
} from '../utils/storage';
import {
  getFilteredTasks,
  updateTaskCounts,
  createTaskElement,
  setupTaskEventDelegation,
} from '../utils/domEngine';
import { StorageInspectorModal } from './StorageInspectorModal';
import {
  CheckCircle,
  Plus,
  Filter,
  CheckCheck,
  ListTodo,
  Circle,
  Clock,
  Sparkles,
  AlertCircle,
  Search,
  Database,
  Trash2,
  X,
  RotateCcw,
} from 'lucide-react';

export const TaskFlowApp: React.FC = () => {
  // --- Application State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newCategory, setNewCategory] = useState<TaskCategory>('General');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingDraftTitle, setEditingDraftTitle] = useState<string>('');
  const [feedback, setFeedback] = useState<ValidationFeedback | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Modals state
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // DOM Container Ref for pure DOM manipulation & event delegation
  const taskListRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // --- 1. Initial Load from localStorage ---
  const reloadFromStorage = useCallback(() => {
    const { tasks: storedTasks, error } = loadTasksFromStorage();
    if (error) {
      setStorageError(error);
    } else {
      setStorageError(null);
    }

    const rawStored = window.localStorage.getItem(STORAGE_KEY);
    if (storedTasks.length === 0 && (!rawStored || rawStored === '[]')) {
      // First-time visit or cleared storage: initialize demo tasks so user immediately sees a working app
      saveTasksToStorage(SAMPLE_TASKS);
      setTasks(SAMPLE_TASKS);
    } else {
      setTasks(storedTasks);
    }
  }, []);

  useEffect(() => {
    reloadFromStorage();
  }, [reloadFromStorage]);

  // --- 2. Persist Tasks to localStorage on change ---
  const persistTasks = useCallback((updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    const result = saveTasksToStorage(updatedTasks);
    if (!result.success && result.error) {
      setStorageError(result.error);
    } else {
      setStorageError(null);
    }
  }, []);

  // --- 3. CRUD: Create Task ---
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = newTitle.trim();
    if (!trimmed) {
      setFeedback({
        type: 'error',
        message: 'Task title cannot be empty or contain only whitespace. Please enter a valid description.',
      });
      inputRef.current?.focus();
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
      priority: newPriority,
      category: newCategory,
    };

    const nextTasks = [newTask, ...tasks];
    persistTasks(nextTasks);

    // Reset input
    setNewTitle('');
    setFeedback({
      type: 'success',
      message: `Task "${trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed}" added successfully.`,
    });
    setTimeout(() => {
      setFeedback(prev => (prev?.type === 'success' ? null : prev));
    }, 3500);

    inputRef.current?.focus();
  };

  // --- 4. CRUD: Update Task Completion ---
  const handleToggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t));
      saveTasksToStorage(updated);
      return updated;
    });
  }, []);

  // --- 5. CRUD: Edit Task ---
  const handleStartEdit = useCallback((id: string) => {
    setTasks(prev => {
      const target = prev.find(t => t.id === id);
      if (target) {
        setEditingTaskId(id);
        setEditingDraftTitle(target.title);
      }
      return prev;
    });
  }, []);

  const handleSaveEdit = useCallback((id: string, updatedTitle: string) => {
    const trimmed = updatedTitle.trim();
    if (!trimmed) {
      setFeedback({
        type: 'error',
        message: 'Edited title cannot be empty. Please enter a valid task title or click Cancel.',
      });
      return;
    }

    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, title: trimmed, updatedAt: Date.now() } : t
      );
      saveTasksToStorage(updated);
      return updated;
    });

    setEditingTaskId(null);
    setEditingDraftTitle('');
    setFeedback({
      type: 'success',
      message: 'Task updated successfully.',
    });
    setTimeout(() => {
      setFeedback(prev => (prev?.type === 'success' ? null : prev));
    }, 2500);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditingDraftTitle('');
    setFeedback(null);
  }, []);

  // --- 6. CRUD: Delete Task ---
  const handleDeleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const target = prev.find(t => t.id === id);
      const updated = prev.filter(t => t.id !== id);
      saveTasksToStorage(updated);
      if (target) {
        setFeedback({
          type: 'info',
          message: `Deleted task "${target.title.length > 25 ? target.title.substring(0, 25) + '...' : target.title}".`,
        });
        setTimeout(() => {
          setFeedback(prev => (prev?.type === 'info' ? null : prev));
        }, 2500);
      }
      return updated;
    });
    if (editingTaskId === id) {
      setEditingTaskId(null);
    }
  }, [editingTaskId]);

  // Clear completed tasks action
  const handleClearCompleted = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    if (window.confirm(`Are you sure you want to remove all ${completedCount} completed task(s)?`)) {
      const updated = tasks.filter(t => !t.completed);
      persistTasks(updated);
      setFeedback({
        type: 'success',
        message: `Cleared ${completedCount} completed task(s).`,
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Reset to initial sample tasks
  const handleResetSampleTasks = () => {
    persistTasks(SAMPLE_TASKS);
    setFeedback({
      type: 'success',
      message: 'Loaded sample demonstration tasks.',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  // --- 7. Filtered Tasks & Counts Calculation ---
  const counts = updateTaskCounts(tasks);

  const displayedTasks = getFilteredTasks(tasks, filter).filter(task => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.category?.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query)
    );
  });

  // --- 8. Pure DOM Rendering & Event Delegation Synchronization ---
  // Demonstrates Feature 8 (Safe DOM APIs) and Feature 9 (Event Delegation on Parent Container)
  useEffect(() => {
    const container = taskListRef.current;
    if (!container) return;

    // 1. Clear previous task DOM children safely
    container.innerHTML = '';

    // 2. Render tasks using document.createElement & textContent
    if (displayedTasks.length > 0) {
      displayedTasks.forEach(task => {
        const isEditing = task.id === editingTaskId;
        const taskNode = createTaskElement(
          task,
          isEditing,
          isEditing ? editingDraftTitle : task.title
        );
        container.appendChild(taskNode);
      });
    }

    // 3. Attach single shared event delegation handler on container
    const cleanupDelegation = setupTaskEventDelegation(container, {
      onToggle: handleToggleTask,
      onEdit: handleStartEdit,
      onDelete: handleDeleteTask,
      onSaveEdit: handleSaveEdit,
      onCancelEdit: handleCancelEdit,
    });

    return () => {
      cleanupDelegation();
    };
  }, [
    displayedTasks,
    editingTaskId,
    editingDraftTitle,
    handleToggleTask,
    handleStartEdit,
    handleDeleteTask,
    handleSaveEdit,
    handleCancelEdit,
  ]);

  // Completion percentage
  const completionPercent = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Academic & Internship Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <CheckCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">FlowList</h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                  Task 3
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Smart To-Do List • JavaScript Logic & State Management</p>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInspectorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Inspect raw localStorage key 'flowlist-tasks'"
            >
              <Database className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Storage Inspector</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Status Overview Metric Cards */}
        <section aria-label="Task Statistics" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Total Tasks Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</span>
              <p className="text-2xl font-black text-slate-900">{counts.total}</p>
              <span className="text-[11px] text-slate-600 font-medium">Recorded in memory & storage</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <ListTodo className="w-6 h-6" />
            </div>
          </div>

          {/* Active Tasks Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Active Tasks</span>
              <p className="text-2xl font-black text-slate-900">{counts.active}</p>
              <span className="text-[11px] text-slate-600 font-medium">Pending completion</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <Circle className="w-6 h-6" />
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5 flex-1 mr-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</span>
                <span className="text-xs font-bold text-emerald-600">{completionPercent}%</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{counts.completed}</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Storage Error Warning Banner */}
        {storageError && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start justify-between gap-2"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Storage Issue: </strong>
                <span>{storageError}</span>
              </div>
            </div>
            <button
              onClick={() => setStorageError(null)}
              className="text-rose-500 hover:text-rose-700 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Validation / Action Feedback Banner */}
        {feedback && (
          <div
            role="status"
            className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-2 transition-all ${
              feedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
                : feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {feedback.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
              {feedback.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add Task Form Card */}
        <section aria-labelledby="add-task-heading" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="add-task-heading" className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Create New Task
            </h2>
            <span className="text-[11px] font-mono text-slate-600">
              {newTitle.length}/150 characters
            </span>
          </div>

          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="What task needs to be completed? (e.g., Implement localStorage persistence)"
                maxLength={150}
                aria-label="New task title"
                className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Priority Selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Priority:</span>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TaskPriority)}
                    aria-label="Task priority"
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                {/* Category Selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Category:</span>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as TaskCategory)}
                    aria-label="Task category"
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Personal">Personal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Add Button */}
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer focus:ring-2 focus:ring-indigo-400"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </form>
        </section>

        {/* Filter Controls & Search Bar */}
        <section aria-label="Task Filters" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Tabs: All, Active, Completed */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>All</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filter === 'all' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {counts.total}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={filter === 'active'}
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  filter === 'active'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Active</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filter === 'active' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {counts.active}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={filter === 'completed'}
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Completed</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filter === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {counts.completed}
                </span>
              </button>
            </div>

            {/* Search Input Filter */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                aria-label="Filter tasks by query"
                className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sub-actions row (Clear completed & Reset Demo) */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-600 font-medium">
              Showing <strong className="text-slate-700">{displayedTasks.length}</strong> of{' '}
              <strong className="text-slate-700">{counts.total}</strong> task(s)
            </span>

            <div className="flex items-center gap-2">
              {counts.completed > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Completed ({counts.completed})</span>
                </button>
              )}

              {tasks.length === 0 && (
                <button
                  type="button"
                  onClick={handleResetSampleTasks}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Sample Tasks</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Task List Section - Populated via pure DOM Engine & Event Delegation */}
        <section aria-label="Task Items" className="space-y-3">
          {/* Empty State when no tasks match current filter */}
          {displayedTasks.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                <ListTodo className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-700">
                  {filter === 'completed'
                    ? 'No completed tasks yet'
                    : filter === 'active'
                    ? 'All tasks completed!'
                    : searchQuery
                    ? `No tasks matching "${searchQuery}"`
                    : 'No tasks on your list yet'}
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  {filter === 'completed'
                    ? 'Mark any task complete to view it in this category.'
                    : filter === 'active'
                    ? 'Great job! You have cleared all pending active tasks.'
                    : searchQuery
                    ? 'Try adjusting your search query or clear the filter.'
                    : 'Type a task in the box above and press Enter or click Add Task to begin.'}
                </p>
              </div>

              {tasks.length === 0 && (
                <button
                  type="button"
                  onClick={handleResetSampleTasks}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Sample Tasks</span>
                </button>
              )}
            </div>
          )}

          {/* Live DOM Root Container: populated by createTaskElement and managed via setupTaskEventDelegation */}
          <ul
            ref={taskListRef}
            id="taskflow-task-list"
            role="list"
            className="space-y-2.5"
            aria-label="Tasks"
          />
        </section>

        {/* Architecture & Verification Info Card */}
        <section aria-label="Architecture Details" className="bg-white/80 rounded-2xl border border-slate-200 p-4.5 space-y-3 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              JavaScript & DOM Architecture Highlights
            </span>
            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              Live & Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <strong className="text-slate-800 block">Safe DOM Manipulation (XSS Immune)</strong>
              <p className="text-[11px] leading-relaxed">
                Task titles are inserted using <code className="bg-white px-1 py-0.2 rounded border border-slate-200 font-mono text-indigo-600">document.createElement()</code> and <code className="bg-white px-1 py-0.2 rounded border border-slate-200 font-mono text-indigo-600">node.textContent</code>, eliminating HTML injection vulnerabilities.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <strong className="text-slate-800 block">Event Delegation on Container</strong>
              <p className="text-[11px] leading-relaxed">
                A single event listener on <code className="bg-white px-1 py-0.2 rounded border border-slate-200 font-mono text-indigo-600">&lt;ul id=&quot;taskflow-task-list&quot;&gt;</code> intercepts clicks and keydowns via <code className="bg-white px-1 py-0.2 rounded border border-slate-200 font-mono text-indigo-600">event.target.closest(&apos;[data-action]&apos;)</code>, scaling efficiently without memory leaks.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Identifying FlowList as an Internship Project */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-semibold text-slate-700">
            <span>FlowList — Smart To-Do List</span>
            <span>•</span>
            <span>Web Development Internship</span>
            <span>•</span>
            <span>Task 3: JavaScript Logic & State Management</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Data persistence: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600">window.localStorage[&apos;flowlist-tasks&apos;]</code> (no external database or server telemetry).
          </p>
        </div>
      </footer>

      {/* Modals */}
      <StorageInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onDataChanged={reloadFromStorage}
      />
    </div>
  );
};
