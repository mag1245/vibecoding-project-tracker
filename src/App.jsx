import React, { useState, useEffect } from 'react';

// Locked STAGES constant per PRD §7[cite: 7]
const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

const TEAMMATES = ['Teammate A', 'Teammate B', 'Teammate C'];
const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

const DEFAULT_CONTEXT_TEMPLATE = `### Background
- 

### Constraints
- 

### Tried so far
- 

### Pick up
- `;

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
    context: DEFAULT_CONTEXT_TEMPLATE,
    contextTool: 'Claude',
    contextUpdatedAt: '2026-10-25T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'About page layout',
    description: 'Create clean typography blocks for team description.',
    type: 'feature',
    status: 'in-progress',
    assignee: 'Teammate B',
    dueDate: '2026-10-29',
    createdDate: '2026-10-20',
    context: DEFAULT_CONTEXT_TEMPLATE,
    contextTool: 'Cursor',
    contextUpdatedAt: '2026-10-27T14:30:00.000Z',
  },
  {
    id: '3',
    title: 'Review PRD details',
    description: 'Verify all team requirements are fully filled out.',
    type: 'feature',
    status: 'review',
    assignee: 'Teammate C',
    dueDate: '2026-11-05',
    createdDate: '2026-10-19',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
];

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

function getDueState(dueDateStr, status) {
  if (status === 'done' || !dueDateStr) return 'neutral';
  
  const now = new Date('2026-10-28T17:00:00');
  const due = new Date(dueDateStr + 'T23:59:59');
  const diffHours = (due - now) / (1000 * 60 * 60);

  if (diffHours < 0) return 'overdue';
  if (diffHours <= 24) return 'warning';
  return 'safe';
}

function timeAgo(dateString) {
  if (!dateString) return null;
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' d ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' m ago';
  return 'just now';
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibecoding_tasks', INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('feature');
  const [status, setStatus] = useState('todo');
  const [assignee, setAssignee] = useState('Teammate A');
  const [dueDate, setDueDate] = useState('');
  const [context, setContext] = useState('');
  const [contextTool, setContextTool] = useState('Claude');
  const [contextUpdatedAt, setContextUpdatedAt] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyPrompt = (task, e) => {
    if (e) e.stopPropagation();
    const markdownBlock = `## Task Briefing: ${task.title}
- **Type:** ${task.type}
- **Status:** ${task.status}
- **Assignee:** ${task.assignee}
- **AI Tool Preference:** ${task.contextTool || 'Not specified'}

### Description
${task.description || 'No description provided.'}

### Context & History
${task.context || 'No context provided.'}`;

    navigator.clipboard.writeText(markdownBlock).then(() => {
      showToast(`Copied prompt context for "${task.title}"!`);
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  const openCreateModal = (defaultStatus = 'todo') => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setType('feature');
    setStatus(defaultStatus);
    setAssignee('Teammate A');
    setDueDate('');
    setContext(DEFAULT_CONTEXT_TEMPLATE);
    setContextTool('Claude');
    setContextUpdatedAt(new Date().toISOString());
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setType(task.type);
    setStatus(task.status);
    setAssignee(task.assignee);
    setDueDate(task.dueDate || '');
    setContext(task.context || DEFAULT_CONTEXT_TEMPLATE);
    setContextTool(task.contextTool || 'Claude');
    setContextUpdatedAt(task.contextUpdatedAt || null);
    setIsModalOpen(true);
  };

  const handleContextChange = (newVal) => {
    setContext(newVal);
    setContextUpdatedAt(new Date().toISOString());
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      setTasks(
        tasks.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title,
                description,
                type,
                status,
                assignee,
                dueDate,
                context,
                contextTool,
                contextUpdatedAt,
              }
            : t
        )
      );
    } else {
      const newTask = {
        id: Date.now().toString(),
        title,
        description,
        type,
        status,
        assignee,
        dueDate,
        createdDate: '2026-10-28',
        context,
        contextTool,
        contextUpdatedAt: contextUpdatedAt || new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Delete this task? This action cannot be undone.')) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      setIsModalOpen(false);
    }
  };

  const handleHandoff = (taskId, newAssignee, taskTitle, e) => {
    if (e) e.stopPropagation();
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, assignee: newAssignee } : t))
    );
    showToast(`Handed off "${taskTitle}" to ${newAssignee}. They've got it!`);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-surface-page text-text-primary p-6 font-sans relative">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-brand-primary text-white text-xs px-4 py-2.5 rounded-md shadow-lg z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Vibecoding Project Tracker</h1>
          <p className="text-sm text-text-muted">Monitor your projects from intent to ship.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openCreateModal('todo')}
            className="bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-md font-medium text-sm transition shadow"
          >
            + New Task
          </button>
        </div>
      </header>

      {/* Team Ownership Summary Strip */}
      <div className="mb-6 bg-surface-card/70 border border-slate-800 rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {TEAMMATES.map((member) => {
          const activeTasks = tasks.filter(
            (t) => t.assignee === member && t.status !== 'done'
          );
          return (
            <div key={member} className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-800/80">
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/40 font-mono text-xs font-bold flex items-center justify-center">
                {getInitials(member)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-text-primary">{member}</div>
                <div className="text-[11px] text-text-muted truncate">
                  {activeTasks.length === 0
                    ? 'No active tasks'
                    : `Driving: ${activeTasks.map((t) => t.title).join(', ')}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {STAGES.map((stage) => {
          const columnTasks = tasks.filter((t) => t.status === stage.id);

          return (
            <div key={stage.id} className="bg-surface-card/50 rounded-lg p-4 border border-slate-800 flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/60">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
                  {stage.label}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800 text-text-muted text-xs px-2 py-0.5 rounded-full font-mono">
                    {columnTasks.length}
                  </span>
                  <button
                    onClick={() => openCreateModal(stage.id)}
                    className="text-text-muted hover:text-text-primary text-sm font-bold px-1.5"
                    title="Add task to this column"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-md text-text-muted text-xs">
                    Nothing here yet — keep vibecoding.
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const isBug = task.type === 'bug';
                    const dueState = getDueState(task.dueDate, task.status);

                    let dueTintClass = 'bg-surface-card border-slate-700/60';
                    if (dueState === 'overdue') {
                      dueTintClass = 'bg-red-950/20 border-red-500/50 shadow-red-950/20';
                    } else if (dueState === 'warning') {
                      dueTintClass = 'bg-amber-950/20 border-amber-500/50 shadow-amber-950/20';
                    }

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-md border shadow-sm transition group relative overflow-hidden ${dueTintClass} ${
                          isBug ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-emerald-500'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1 ${
                              isBug ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {isBug ? '🐛 bug' : '✦ feature'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-text-primary text-[10px] font-mono font-bold flex items-center justify-center border border-slate-700">
                              {getInitials(task.assignee)}
                            </span>
                            <span className="text-[11px] text-text-muted font-mono">{task.assignee}</span>
                          </div>
                        </div>

                        <div onClick={() => openEditModal(task)} className="cursor-pointer">
                          <h3 className="text-sm font-medium text-text-primary mb-1 group-hover:text-brand-primary transition flex items-center justify-between">
                            {task.title}
                            {task.context && (
                              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                                {task.contextTool || 'Context'}
                              </span>
                            )}
                          </h3>
                          {task.description && (
                            <p className="text-xs text-text-muted line-clamp-2 mb-2">{task.description}</p>
                          )}
                        </div>

                        {/* Card Actions & Copy Context Button (M10) */}
                        <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-text-muted font-mono">
                                {task.dueDate ? `Due: ${task.dueDate}` : 'No deadline'}
                              </span>
                              {dueState === 'overdue' && (
                                <span className="bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded text-[9px] font-bold font-mono">PAST DUE</span>
                              )}
                              {dueState === 'warning' && (
                                <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded text-[9px] font-bold font-mono">DUE SOON</span>
                              )}
                            </div>

                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) handleHandoff(task.id, e.target.value, task.title, e);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-slate-900 text-text-muted hover:text-text-primary border border-slate-800 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-brand-primary cursor-pointer"
                            >
                              <option value="" disabled>
                                Hand off to...
                              </option>
                              {TEAMMATES.filter((m) => m !== task.assignee).map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={(e) => handleCopyPrompt(task, e)}
                            className="w-full bg-slate-800/80 hover:bg-brand-primary/20 hover:text-brand-primary text-text-muted text-[11px] font-medium py-1 px-2 rounded border border-slate-700/60 transition flex items-center justify-center gap-1.5"
                          >
                            <span>📋</span> Copy Context
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal with Copy Prompt Button (M10) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface-card border border-slate-700 rounded-lg max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingTask ? 'Edit Task & Prompt Context' : 'New Task & Prompt Context'}
              </h2>
              {editingTask && (
                <button
                  type="button"
                  onClick={(e) => handleCopyPrompt(editingTask, e)}
                  className="bg-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-white text-xs px-3 py-1.5 rounded font-medium transition flex items-center gap-1.5 border border-brand-primary/40"
                >
                  <span>📋</span> Copy Context
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                  placeholder="Task title..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                  placeholder="Task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`w-full bg-slate-900 border rounded p-2 text-sm font-medium focus:outline-none ${
                      type === 'bug' ? 'border-red-500/50 text-red-400' : 'border-emerald-500/50 text-emerald-400'
                    }`}
                  >
                    <option value="feature">✦ Feature</option>
                    <option value="bug">🐛 Bug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Stage</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Assignee</label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                  >
                    {TEAMMATES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Context Section */}
              <div className="border-t border-slate-800 pt-4 mt-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-brand-primary uppercase tracking-wider">
                    Curated AI Prompt Context
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted font-mono">
                      {contextUpdatedAt ? `last updated ${timeAgo(contextUpdatedAt)}` : 'not updated yet'}
                    </span>
                    <select
                      value={contextTool}
                      onChange={(e) => setContextTool(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-text-primary focus:outline-none focus:border-brand-primary"
                    >
                      {AI_TOOLS.map((tool) => (
                        <option key={tool} value={tool}>
                          {tool}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-text-muted mb-2">
                  Paste-ready briefing block for continuing work with your AI assistant.
                </p>
                <textarea
                  rows={6}
                  value={context}
                  onChange={(e) => handleContextChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-xs font-mono text-text-primary focus:outline-none focus:border-brand-primary leading-relaxed"
                  placeholder="Enter Markdown briefing context..."
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                {editingTask ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingTask.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Delete Task
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-800 text-text-muted hover:text-text-primary rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-brand-primary hover:bg-brand-accent text-white rounded text-sm font-medium"
                  >
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}