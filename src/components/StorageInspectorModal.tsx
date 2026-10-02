/**
 * Storage Inspector Modal
 * Inspects, exports, imports, and tests recovery from corrupt localStorage JSON
 */

import React, { useState, useEffect } from 'react';
import {
  STORAGE_KEY,
  getRawStorageString,
  getStorageUsage,
  injectRawStorage,
  clearTaskFlowStorage,
  SAMPLE_TASKS,
  saveTasksToStorage,
} from '../utils/storage';
import { Database, AlertTriangle, Check, RefreshCw, Download, Upload, Trash2, ShieldCheck, X } from 'lucide-react';

interface StorageInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const StorageInspectorModal: React.FC<StorageInspectorModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [rawJson, setRawJson] = useState<string>('');
  const [stats, setStats] = useState<{ bytes: number; count: number }>({ bytes: 0, count: 0 });
  const [copied, setCopied] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshData = () => {
    const raw = getRawStorageString();
    setRawJson(raw);
    setStats(getStorageUsage());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowlist-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ type: 'success', message: 'Backup JSON downloaded successfully.' });
  };

  const handleCorruptTest = () => {
    const corruptPayload = '{"corrupted": true, [syntax-error-string]]]';
    injectRawStorage(corruptPayload);
    refreshData();
    onDataChanged();
    setFeedback({
      type: 'error',
      message: 'Injected malformed JSON into localStorage! Close this modal or observe how FlowList safely catches it without crashing.',
    });
  };

  const handleClearStorage = () => {
    if (window.confirm('Are you sure you want to clear all tasks from localStorage?')) {
      clearTaskFlowStorage();
      refreshData();
      onDataChanged();
      setFeedback({ type: 'success', message: `localStorage key "${STORAGE_KEY}" cleared.` });
    }
  };

  const handleLoadSampleData = () => {
    saveTasksToStorage(SAMPLE_TASKS);
    refreshData();
    onDataChanged();
    setFeedback({ type: 'success', message: 'Loaded 5 sample tasks into localStorage.' });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          injectRawStorage(text);
          refreshData();
          onDataChanged();
          setFeedback({ type: 'success', message: `Imported ${parsed.length} tasks from file.` });
        } else {
          setFeedback({ type: 'error', message: 'Imported JSON must contain a valid task array.' });
        }
      } catch (err) {
        setFeedback({ type: 'error', message: 'Failed to parse JSON file: Invalid syntax.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">localStorage Inspector</h3>
              <p className="text-xs text-slate-500 font-mono">Key: {STORAGE_KEY}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {feedback && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2.5 text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Storage Status</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active & Persistent
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Stored Records</span>
              <span className="text-slate-800 font-bold text-base mt-0.5">{stats.count} Tasks</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Bytes Consumed</span>
              <span className="text-indigo-600 font-bold font-mono text-base mt-0.5">
                {(stats.bytes / 1024).toFixed(2)} KB <span className="text-xs text-slate-400 font-normal">({stats.bytes} B)</span>
              </span>
            </div>
          </div>

          {/* Raw JSON View */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Raw JSON Payload</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshData}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Reload from localStorage"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono max-h-48 overflow-y-auto overflow-x-auto select-all leading-relaxed">
              {rawJson}
            </pre>
          </div>

          {/* Test & Maintenance Tools */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block mb-2.5">
              Testing & Internship Verification Tools
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                type="button"
                onClick={handleCorruptTest}
                className="flex items-center justify-center gap-1.5 p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Inject bad JSON to test safe parse error handler"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Test Corrupt JSON</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleData}
                className="flex items-center justify-center gap-1.5 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Reset Demo Tasks</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearStorage}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Storage Data</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
