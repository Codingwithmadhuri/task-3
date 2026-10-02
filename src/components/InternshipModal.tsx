/**
 * Internship Task 3 Modal
 * Includes 7-Day Plan (7 Oct – 13 Oct 2026), Live Test Runner (18 checks), and Submission Guidelines
 */

import React, { useState } from 'react';
import { runAllInternshipTests } from '../utils/testRunner';
import { TestCaseResult } from '../types/task';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Play,
  Camera,
  Layers,
  X,
  FileCheck2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface InternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshTasks?: () => void;
}

export const InternshipModal: React.FC<InternshipModalProps> = ({
  isOpen,
  onClose,
  onRefreshTasks,
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'plan' | 'evidence'>('tests');
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    // slight delay for visual feedback of execution
    await new Promise((resolve) => setTimeout(resolve, 350));
    try {
      const results = await runAllInternshipTests();
      setTestResults(results);
      setHasRun(true);
      if (onRefreshTasks) {
        onRefreshTasks();
      }
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = testResults.filter((r) => r.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base">Internship Task 3 Portal</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold">
                  7 Oct – 13 Oct 2026
                </span>
              </div>
              <p className="text-xs text-slate-500">JavaScript Logic & State Management • Testing & Evidence Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Automated Test Suite</span>
            {hasRun && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  passedCount === totalCount ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {passedCount}/{totalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'plan'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7-Day Activity Plan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evidence')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Screenshot Capture Guide</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* TAB 1: AUTOMATED TEST SUITE */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Automated Verification Suite
                  </h4>
                  <p className="text-xs text-indigo-700/90 mt-0.5">
                    Executes 18 comprehensive tests covering CRUD, localStorage, XSS, filters, and event delegation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunTests}
                  disabled={isRunning}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running Checks...' : 'Run All 18 Checks'}</span>
                </button>
              </div>

              {!hasRun && (
                <div className="py-12 text-center text-slate-400">
                  <FileCheck2 className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-medium text-slate-600">Tests Not Yet Executed</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Click &ldquo;Run All 18 Checks&rdquo; above to verify all requirements specified in Task 3.
                  </p>
                </div>
              )}

              {hasRun && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <span className="font-semibold text-slate-700">Verification Result Summary:</span>
                    <span
                      className={`font-bold flex items-center gap-1.5 ${
                        passedCount === totalCount ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {passedCount === totalCount ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      {passedCount} / {totalCount} Requirements Passed (
                      {Math.round((passedCount / totalCount) * 100)}%)
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs max-h-96 overflow-y-auto">
                    {testResults.map((t) => (
                      <div key={t.id} className="p-3 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-800">
                              {t.id}: {t.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                t.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {t.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                          {t.details && (
                            <p className="text-[11px] font-mono text-slate-600 mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                              {t.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 7-DAY DEVELOPMENT PLAN */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  The following 7-day development plan corresponds to Internship Task 3 (7 October 2026 – 13 October 2026).
                  All phases have been fully architected and implemented in FlowList.
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    day: 'Day 15',
                    date: '7 October 2026',
                    title: 'Requirement Analysis & Project Architecture',
                    tasks: [
                      'Review Task 3 requirements: DOM manipulation, event delegation, and state.',
                      'Inspect existing workspace to guarantee zero conflict with portfolio.',
                      'Set up data model (Task, Filter, Priority, Counts) in TypeScript/JavaScript.',
                    ],
                  },
                  {
                    day: 'Day 16',
                    date: '8 October 2026',
                    title: 'Task Creation & Dynamic Rendering',
                    tasks: [
                      'Construct semantic task entry form with input validation (reject empty/spaces).',
                      'Implement dynamic task rendering using safe document.createElement and textContent.',
                      'Render empty states for zero-task conditions.',
                    ],
                  },
                  {
                    day: 'Day 17',
                    date: '9 October 2026',
                    title: 'Update & Delete Implementation (Full CRUD)',
                    tasks: [
                      'Build inline task editor with Save and Cancel buttons.',
                      'Enforce Enter key to save and Escape key to cancel editing without mutation.',
                      'Implement task deletion by unique ID with list re-synchronization.',
                    ],
                  },
                  {
                    day: 'Day 18',
                    date: '10 October 2026',
                    title: 'Completion State & localStorage Persistence',
                    tasks: [
                      'Implement accessible checkbox to toggle Active vs Completed status.',
                      'Integrate window.localStorage with key "taskflow-tasks".',
                      'Implement try-catch resilience for malformed JSON and quota limitations.',
                    ],
                  },
                  {
                    day: 'Day 19',
                    date: '11 October 2026',
                    title: 'Dynamic Task Filtering & Real-Time Counters',
                    tasks: [
                      'Implement All, Active, and Completed view filters.',
                      'Recalculate total, active, and completed task counts in real time.',
                      'Ensure editing, deleting, and completing work seamlessly within filtered views.',
                    ],
                  },
                  {
                    day: 'Day 20',
                    date: '12 October 2026',
                    title: 'Event Delegation & DOM Hardening',
                    tasks: [
                      'Attach shared event listener to task list parent container using data-action.',
                      'Inspect event.target and dataset attributes to handle dynamic child elements.',
                      'Audit DOM nodes for XSS protection and zero unsafe HTML interpolations.',
                    ],
                  },
                  {
                    day: 'Day 21',
                    date: '13 October 2026',
                    title: 'Testing, Final Verification & Documentation',
                    tasks: [
                      'Execute full 18-step test suite verifying all edge cases.',
                      'Verify responsive layout on mobile, tablet, and desktop viewports.',
                      'Generate comprehensive README.md and genuine screenshot capture guidelines.',
                    ],
                  },
                ].map((item, index) => (
                  <div key={index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                          {item.day}
                        </span>
                        <span className="font-bold text-slate-800 text-xs">{item.title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.date}
                      </span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                      {item.tasks.map((task, tIdx) => (
                        <li key={tIdx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SCREENSHOT EVIDENCE GUIDE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Academic & Internship Submission Rule:</strong> Capture genuine screenshots directly from your running
                  FlowList application window. Never fabricate dates or mock screenshot files.
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-slate-600" />
                    How to capture screenshots on your operating system:
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Windows:</strong> Press <kbd className="px-1 bg-white border border-slate-300 rounded font-mono">Win + Shift + S</kbd> to open the Snipping Tool. Select the window or rect.
                    </li>
                    <li>
                      <strong>macOS:</strong> Press <kbd className="px-1 bg-white border border-slate-300 rounded font-mono">Cmd + Shift + 4</kbd> (drag rectangle) or <kbd className="px-1 bg-white border border-slate-300 rounded font-mono">Cmd + Shift + 5</kbd>.
                    </li>
                    <li>
                      <strong>Linux:</strong> Press <kbd className="px-1 bg-white border border-slate-300 rounded font-mono">Shift + PrtScn</kbd> or use Gnome Screenshot tool.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-slate-600" />
                    Recommended Screenshot Checklist for Submission:
                  </h4>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                    <li>
                      <strong>Screenshot 1 (Task Creation & Validation):</strong> Enter an empty string or spaces to show the red validation warning, then add 2-3 valid tasks.
                    </li>
                    <li>
                      <strong>Screenshot 2 (Inline Edit):</strong> Click the pencil icon on any task to show the active input, &ldquo;Enter to save / Esc to cancel&rdquo; controls.
                    </li>
                    <li>
                      <strong>Screenshot 3 (Filter Views):</strong> Click &ldquo;Active&rdquo; and &ldquo;Completed&rdquo; tabs showing dynamic counts in the summary banner.
                    </li>
                    <li>
                      <strong>Screenshot 4 (localStorage Inspector):</strong> Open the Storage Inspector modal to show the raw JSON payload in <code className="bg-slate-200 px-1 rounded font-mono">localStorage[&apos;taskflow-tasks&apos;]</code>.
                    </li>
                    <li>
                      <strong>Screenshot 5 (Automated Test Suite):</strong> Open this portal, click &ldquo;Run All 18 Checks&rdquo;, and capture the green 18/18 passed test summary.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            FlowList • Web Development Internship
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
