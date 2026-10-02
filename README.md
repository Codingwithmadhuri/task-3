# 🚀 FlowList — Smart To-Do List

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Storage](https://img.shields.io/badge/Persistence-localStorage-F59E0B?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![Status](https://img.shields.io/badge/Status-Complete_%26_Verified-10B981?style=for-the-badge)](https://github.com/)

---

## 📌 Project Overview

**FlowList** is an interactive, responsive task management web application built for **Web Development Internship — Task 3: JavaScript Logic & State Management**.

The core objective of this project is to demonstrate mastery of essential frontend development fundamentals without reliance on external backend servers or third-party database APIs:
- **Client-Side State Management:** Immediate, reactive UI synchronization.
- **Full CRUD Operations:** Create, Read, Update, and Delete tasks with unique IDs.
- **Safe DOM Manipulation:** Creation of elements via `document.createElement()` and safe assignment via `.textContent` to guarantee complete immunity against Cross-Site Scripting (XSS).
- **Event Delegation:** A single shared listener attached to the task list parent container (`event.target.closest('[data-action]')`) that efficiently routes user actions for dynamic items.
- **Browser Data Persistence:** Seamless persistence using `window.localStorage` (key: `flowlist-tasks`) with automatic JSON validation, quota handling, and self-healing error recovery.
- **Real-Time Dynamic Filtering:** Fast view switching between **All**, **Active**, and **Completed** tasks, paired with live keyword search and dynamic metric counters.

---

## ✨ Key Features

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Task Creation** | Add tasks with title, priority (Low, Medium, High), and category. Supports <kbd>Enter</kbd> key submission. | ✅ Complete |
| **Strict Input Validation** | Automatically trims input and rejects empty or whitespace-only submissions with immediate visual alert. | ✅ Complete |
| **Dynamic Task Display** | Displays task title, priority badges, category chips, creation timestamps, and contextual empty states. | ✅ Complete |
| **In-Place Inline Editing** | Edit task titles directly in the list with <kbd>Enter</kbd> to save, <kbd>Esc</kbd> to cancel, and character counter. | ✅ Complete |
| **Instant Deletion** | Remove tasks by unique ID; immediately recalculates counts and synchronizes storage. | ✅ Complete |
| **Task Completion** | Accessible, custom-styled checkbox button toggles complete/active status with strikethrough styling. | ✅ Complete |
| **Dynamic Filtering** | Filter by **All**, **Active**, and **Completed** with live counter badges on every tab. | ✅ Complete |
| **Live Search Filter** | Search and filter tasks in real time by keywords in the title, category, or priority. | ✅ Complete |
| **`localStorage` Persistence** | Stored under key `flowlist-tasks` with automated recovery if corrupt JSON is encountered. | ✅ Complete |
| **Storage Inspector Tool** | Modal tool to inspect the raw JSON payload in `localStorage`, check byte consumption, and export backups. | ✅ Complete |
| **Safe DOM Architecture** | Employs `document.createElement()` and `textContent` rather than dangerous `innerHTML` interpolation. | ✅ Complete |
| **Event Delegation** | Employs a single delegated click and keydown listener on the parent `<ul>` element. | ✅ Complete |

---

## 🛠️ Tech Stack & Architecture

- **Markup & Semantics:** HTML5 (`<header>`, `<main>`, `<section>`, `<ul>`, `<li>`, `<form>`, `<footer>`, ARIA attributes)
- **Styling:** CSS3, Tailwind CSS, Flexbox & Grid, responsive layout (Mobile, Tablet, Desktop)
- **Programming Language:** JavaScript / TypeScript (strict typings, modular separation of concerns)
- **Data Storage:** Browser `window.localStorage` (client-side, privacy-preserving, zero external telemetry)
- **Icons:** Lucide Icons (accessible SVG vector icons)

---

## 📂 Project Directory Structure

```text
/
├── index.html                     # HTML5 entry point with synced metadata
├── metadata.json                  # Application identity & permissions
├── package.json                   # Dependencies & npm scripts
├── README.md                      # Comprehensive project documentation (this file)
├── src/
│   ├── main.tsx                   # React root entry point
│   ├── App.tsx                    # Top-level application wrapper
│   ├── index.css                  # Tailwind CSS styling, custom scrollbars, and animations
│   ├── types/
│   │   └── task.ts                # TypeScript interfaces: Task, Priority, Filter, Counts
│   ├── utils/
│   │   ├── storage.ts             # LocalStorage manager (key: flowlist-tasks) with self-healing recovery
│   │   ├── domEngine.ts           # Pure DOM manipulation & Event Delegation engine
│   │   └── testRunner.ts          # Automated test execution suite
│   └── components/
│       ├── TaskFlowApp.tsx        # Master FlowList component (form, filters, metrics, DOM container)
│       └── StorageInspectorModal.tsx # Live localStorage JSON inspector & backup exporter
└── task-3-todo-app/               # Standalone Vanilla HTML/CSS/JS export
    ├── index.html                 # Standalone pure HTML5 entry
    ├── style.css                  # Standalone CSS3 styling
    └── app.js                     # Standalone Vanilla JS DOM & state controller
```

---

## ⚡ Setup & Run Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- `npm` (bundled with Node.js)

### Installation & Development
```bash
# 1. Clone the repository or navigate to project folder
cd FlowList

# 2. Install project dependencies
npm install

# 3. Start the local Vite development server (runs on port 3000)
npm run dev

# 4. Build optimized production bundle
npm run build
```

### Standalone Vanilla JS Version (No Node.js Required)
If you need to demonstrate pure vanilla JavaScript without running a Node.js server:
1. Open the `/task-3-todo-app/` folder.
2. Double-click `index.html` or open it with VS Code Live Server / any web browser.

---

## 📖 How to Use the Application

### 1. Creating a Task
1. Type your task title in the **"What task needs to be completed?"** field.
2. Select a **Priority** (*Low*, *Medium*, or *High*) and **Category** (*General*, *Work*, *Study*, *Personal*, *Urgent*).
3. Press <kbd>Enter</kbd> or click the **Add Task** button.
4. *Validation Check:* If you attempt to submit an empty input or whitespace, a red validation alert will immediately appear.

### 2. Toggling Completion
- Click the checkbox or click the task title text directly to toggle completion.
- Completed tasks display a strike-through title, an emerald badge, and immediately update the completion percentage progress bar.

### 3. Editing a Task (Inline Edit)
- Click the pencil icon on any task.
- The task switches into inline editing mode, auto-focuses the text box, and displays a character counter.
- Press <kbd>Enter</kbd> or click **Save Changes** to commit your changes.
- Press <kbd>Esc</kbd> or click **Cancel** to revert without modifying the original task.

### 4. Deleting a Task
- Click the trash icon on any task. The task is removed from memory, the DOM, and `localStorage` simultaneously.
- Use the **Clear Completed** button to bulk-remove all completed tasks in one click.

### 5. Filtering & Search
- Use the **All**, **Active**, and **Completed** filter tabs to isolate tasks.
- Tab badges dynamically show the exact count of tasks in each state.
- Type inside the **Search tasks...** input to filter matching tasks in real-time by title, priority, or category.

### 6. Inspecting `localStorage`
- Click the **Storage Inspector** button in the header.
- View the raw JSON string stored under key `flowlist-tasks`.
- Check total bytes consumed and download a timestamped `.json` backup file.

---

## 🔬 Core JavaScript Implementation Concepts

### Safe DOM Manipulation (XSS Immune)
Task titles are created and mounted using safe browser DOM APIs:
```javascript
const titleSpan = document.createElement('span');
titleSpan.textContent = task.title; // Safe textContent avoids innerHTML injection
```
Even if a user inputs `<script>alert('xss')</script>` or `<img src=x onerror=...>`, it is treated purely as inert text and cannot execute malicious code.

### Event Delegation
Rather than attaching hundreds of individual event listeners to every task, a single shared listener is mounted on the parent `<ul>` element:
```javascript
container.addEventListener('click', (e) => {
  const actionElement = e.target.closest('[data-action]');
  if (!actionElement) return;

  const action = actionElement.getAttribute('data-action');
  const taskId = actionElement.getAttribute('data-id');

  if (action === 'toggle') callbacks.onToggle(taskId);
  else if (action === 'edit') callbacks.onEdit(taskId);
  else if (action === 'delete') callbacks.onDelete(taskId);
  else if (action === 'save') callbacks.onSaveEdit(taskId, input.value);
  else if (action === 'cancel') callbacks.onCancelEdit();
});
```

### Self-Healing Data Persistence
All operations synchronize to `window.localStorage` under key `flowlist-tasks`. If corrupted or non-array JSON is encountered (e.g., interrupted storage write or manual corruption), FlowList catches the error gracefully, auto-heals storage to a valid clean state, and displays an informative recovery banner without crashing.

---

## 📋 Evaluation Checklist

- [x] Full CRUD functionality (Create, Read, Update, Delete)
- [x] `window.localStorage` persistence across page reloads
- [x] Input validation rejecting empty and whitespace-only text
- [x] Dynamic filter tabs (All, Active, Completed) with live counters
- [x] In-place inline task editing with <kbd>Enter</kbd> / <kbd>Esc</kbd> support
- [x] Pure DOM element creation (`document.createElement`)
- [x] Safe string escaping (`textContent`) preventing XSS
- [x] Event delegation on task list parent container
- [x] Self-healing error recovery from corrupted JSON
- [x] Fully responsive layout (Mobile, Tablet, Desktop)
- [x] Semantic HTML5, accessible labels, and keyboard navigation rings
- [x] Independent standalone export available in `/task-3-todo-app/`

---

## 👨‍💻 Internship Submission Details

- **Application Name:** FlowList — Smart To-Do List
- **Internship Task:** Task 3 — JavaScript Logic & State Management
- **Candidate Submission:** Web Development Internship
- **Persistence Key:** `window.localStorage['flowlist-tasks']`
