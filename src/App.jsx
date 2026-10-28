import React, { useState } from 'react';

// Locked STAGES constant per PRD §7
const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

// Initial mock tasks for Milestone 4 data-model
const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Fix nav alignment',
    description: 'Ensure header links are responsive on smaller widths.',
    type: 'bug',
    status: 'todo',
    assignee: 'Teammate A',
    dueDate: '2026-10-25',
    createdDate: '2026-10-20',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: '2',
    title: 'About page layout',
    description: 'Create clean typography blocks for team description.',
    type: 'feature',
    status: 'in-progress',
    assignee: 'Teammate B',
    dueDate: '2026-10-26',
    createdDate: '2026-10-20',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: '3',
    title: 'Review PRD details',
    description: 'Verify all team requirements are fully filled out.',
    type: 'feature',
    status: 'review',
    assignee: 'Teammate C',
    dueDate: '2026-10-24',
    createdDate: '2026-10-19',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
];

export default function App() {
  const [tasks] = useState(INITIAL_TASKS);

  return (
    <div className="min-h-screen bg-surface-page text-text-primary p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Vibecoding Project Tracker</h1>
          <p className="text-sm text-text-muted">Monitor your projects from intent to ship.</p>
        </div>
        <div className="text-xs bg-surface-card px-3 py-1.5 rounded-md border border-slate-700 text-text-muted">
          Milestone 4: Data Model & Kanban Board Active
        </div>
      </header>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STAGES.map((stage) => {
          const columnTasks = tasks.filter((t) => t.status === stage.id);

          return (
            <div key={stage.id} className="bg-surface-card/50 rounded-lg p-4 border border-slate-800 flex flex-col">
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/60">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                  {stage.label}
                </h2>
                <span className="bg-slate-800 text-text-muted text-xs px-2 py-0.5 rounded-full font-mono">
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-md text-text-muted text-xs">
                    Nothing here yet — keep vibecoding.
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-surface-card p-4 rounded-md border border-slate-700/60 shadow-sm hover:border-slate-600 transition"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wide ${
                          task.type === 'bug' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {task.type}
                        </span>
                        <span className="text-xs text-text-muted font-mono">{task.assignee}</span>
                      </div>
                      <h3 className="text-sm font-medium text-text-primary mb-1">{task.title}</h3>
                      <p className="text-xs text-text-muted line-clamp-2">{task.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}