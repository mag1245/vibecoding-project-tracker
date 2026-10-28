import React, { useState, useEffect } from 'react';

// Locked STAGES constant per PRD §7
const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

const TEAMMATES = ['Teammate A', 'Teammate B', 'Teammate C'];

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

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibecoding_tasks', INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('feature');
  const [status, setStatus] = useState('todo');
  const [assignee, setAssignee] = useState('Teammate A');
  const [dueDate, setDueDate] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCreateModal = (defaultStatus = 'todo') => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setType('feature');
    setStatus(defaultStatus);
    setAssignee('Teammate A');
    setDueDate('');
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
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      setTasks(
        tasks.map((t) =>
          t.id === editingTask.id
            ? { ...t, title, description, type, status, assignee, dueDate }
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
        createdDate: new Date().toISOString().split('T')[0],
        context: '',
        contextTool: null,
        contextUpdatedAt: null,
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

  const handleHandoff = (taskId, newAssignee, taskTitle) => {
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
      {/* Toast Notification */}
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

      {/* Team Ownership Summary Strip (M7) */}
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
                    return (
                      <div
                        key={task.id}
                        className={`bg-surface-card p-4 rounded-md border shadow-sm transition group relative overflow-hidden ${
                          isBug ? 'border-l-4 border-l-red-500 border-slate-700/60 hover:border-red-400' : 'border-l-4 border-l-emerald-500 border-slate-700/60 hover:border-emerald-400'
                        }`}
                      >
                        {/* Header Badge & Owner Initials */}
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

                        {/* Title & Description */}
                        <div onClick={() => openEditModal(task)} className="cursor-pointer">
                          <h3 className="text-sm font-medium text-text-primary mb-1 group-hover:text-brand-primary transition">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-xs text-text-muted line-clamp-2 mb-2">{task.description}</p>
                          )}
                        </div>

                        {/* Footer & Quick Handoff Dropdown (M7) */}
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
                          <div className="text-text-muted font-mono">
                            {task.dueDate ? `Due: ${task.dueDate}` : ''}
                          </div>

                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleHandoff(task.id, e.target.value, task.title);
                            }}
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
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface-card border border-slate-700 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>
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
                  rows={3}
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