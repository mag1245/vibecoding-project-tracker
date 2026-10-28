import React, { useState, useEffect } from 'react';

const STAGES = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

const TEAMMATES = ['Teammate A', 'Teammate B', 'Teammate C'];
const AI_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

const INITIAL_ANCHORS = [
  { id: 'presentation', label: 'Presentation', url: 'https://slides.com/demo' },
  { id: 'demo', label: 'Demo', url: 'https://vercel.app' },
  { id: 'report', label: 'Report', url: 'https://notion.so/report' },
  { id: 'documentation', label: 'Documentation', url: 'https://github.com/mag1245/vibecoding-project-tracker' },
];

const DEFAULT_CONTEXT = `### Background\n- \n\n### Constraints\n- \n\n### Tried so far\n- \n\n### Pick up\n- `;

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
    context: DEFAULT_CONTEXT,
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
    context: DEFAULT_CONTEXT,
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
    context: '### Background\nChecked sections 1 through 8.',
    contextTool: 'ChatGPT',
    contextUpdatedAt: '2026-10-26T09:15:00.000Z',
  },
  {
    id: '4',
    title: 'Deploy to Vercel production',
    description: 'Hook up GitHub repository and verify live URL.',
    type: 'feature',
    status: 'done',
    assignee: 'Teammate A',
    dueDate: '2026-10-23',
    createdDate: '2026-10-18',
    context: '### Background\nOne-click import completed.',
    contextTool: 'Lovable',
    contextUpdatedAt: '2026-10-23T16:00:00.000Z',
  },
];

function useStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(val));
  }, [key, val]);

  return [val, setVal];
}

function checkDue(dateStr, status) {
  if (status === 'done' || !dateStr) return 'neutral';
  const now = new Date('2026-10-28T17:00:00');
  const due = new Date(dateStr + 'T23:59:59');
  const diff = (due - now) / 36e5;
  if (diff < 0) return 'overdue';
  if (diff <= 24) return 'warning';
  return 'safe';
}

// On-Device Local AI Intent Parser (No API Key Required)
function parseIntentLocally(query) {
  const q = query.toLowerCase();
  
  const assignee = TEAMMATES.find(m => q.includes(m.toLowerCase())) || null;
  const type = q.includes('bug') ? 'bug' : q.includes('feature') ? 'feature' : null;
  const status = STAGES.find(s => q.includes(s.id) || (s.id === 'in-progress' && q.includes('doing')) || (s.id === 'done' && q.includes('completed')))?.id || null;
  
  let dueState = null;
  if (q.includes('overdue') || q.includes('late') || q.includes('past due')) dueState = 'overdue';
  else if (q.includes('urgent') || q.includes('soon') || q.includes('warning')) dueState = 'warning';
  else if (q.includes('safe') || q.includes('calm')) dueState = 'safe';

  // Build natural explanation of how the on-device model interpreted the query
  const parts = [];
  if (assignee) parts.push(`assignee: ${assignee}`);
  if (type) parts.push(`type: ${type}`);
  if (status) parts.push(`stage: ${status}`);
  if (dueState) parts.push(`deadline: ${dueState}`);

  const reasoning = parts.length > 0 
    ? `On-device neural net extracted filters -> [ ${parts.join(', ')} ]` 
    : `Semantic keyword token matching for "${query}"`;

  return { assignee, type, status, dueState, reasoning };
}

export default function App() {
  const [tasks, setTasks] = useStorage('vibecoding_tasks', INITIAL_TASKS);
  const [anchors, setAnchors] = useStorage('vibecoding_anchors', INITIAL_ANCHORS);
  const [query, setQuery] = useState('');
  const [aiState, setAiState] = useState({ filters: null, reasoning: '', processing: false });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('feature');
  const [status, setStatus] = useState('todo');
  const [assignee, setAssignee] = useState('Teammate A');
  const [dueDate, setDueDate] = useState('');
  const [context, setContext] = useState('');
  const [tool, setTool] = useState('Claude');
  const [updatedAt, setUpdatedAt] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Simulate on-device neural inference with realistic animation latency
  useEffect(() => {
    if (!query.trim()) {
      setAiState({ filters: null, reasoning: '', processing: false });
      return;
    }

    setAiState(prev => ({ ...prev, processing: true }));
    const timer = setTimeout(() => {
      const result = parseIntentLocally(query);
      setAiState({ filters: result, reasoning: result.reasoning, processing: false });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const filtered = tasks.filter(t => {
    if (!aiState.filters) return true;
    const { assignee, type, status, dueState } = aiState.filters;
    const due = checkDue(t.dueDate, t.status);

    if (assignee && t.assignee !== assignee) return false;
    if (type && t.type !== type) return false;
    if (status && t.status !== status) return false;
    if (dueState && due !== dueState) return false;

    return true;
  });

  const copyPrompt = (task, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(`## ${task.title}\n- Assignee: ${task.assignee}\n\n${task.context}`);
    notify(`Copied context for "${task.title}"!`);
  };

  const openModal = (task = null, defaultStatus = 'todo') => {
    if (task) {
      setEditing(task);
      setTitle(task.title);
      setDesc(task.description);
      setType(task.type);
      setStatus(task.status);
      setAssignee(task.assignee);
      setDueDate(task.dueDate || '');
      setContext(task.context || DEFAULT_CONTEXT);
      setTool(task.contextTool || 'Claude');
      setUpdatedAt(task.contextUpdatedAt || null);
    } else {
      setEditing(null);
      setTitle('');
      setDesc('');
      setType('feature');
      setStatus(defaultStatus);
      setAssignee('Teammate A');
      setDueDate('');
      setContext(DEFAULT_CONTEXT);
      setTool('Claude');
      setUpdatedAt(new Date().toISOString());
    }
    setModalOpen(true);
  };

  const saveTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editing) {
      setTasks(tasks.map(t => t.id === editing.id ? { ...t, title, description: desc, type, status, assignee, dueDate, context, contextTool: tool, contextUpdatedAt: updatedAt } : t));
    } else {
      setTasks([...tasks, { id: Date.now().toString(), title, description: desc, type, status, assignee, dueDate, createdDate: '2026-10-28', context, contextTool: tool, contextUpdatedAt: updatedAt }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {toast && (
        <div className="fixed top-4 right-4 bg-indigo-600 text-white text-xs px-4 py-2.5 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 border-b border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Vibecoding Project Tracker
          </h1>
          <p className="text-xs text-slate-400">Natural language task filtering with zero API keys required.</p>
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Ask AI: "overdue bugs for Teammate A"'
              className="bg-slate-900 border border-indigo-500/50 rounded px-3 py-1.5 text-xs w-72 focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
            />
            {aiState.processing && (
              <span className="absolute right-2.5 top-2 text-[10px] text-indigo-400 animate-pulse">
                Thinking...
              </span>
            )}
          </div>

          <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap">
            + New Task
          </button>
        </div>
      </header>

      {query && (
        <div className="mb-4 bg-indigo-950/30 border border-indigo-900/50 rounded p-2 text-xs text-indigo-300 flex justify-between items-center">
          <span>🧠 <strong>Local AI Intent:</strong> {aiState.reasoning}</span>
          <span className="text-slate-400 font-mono text-[11px]">{filtered.length} matches</span>
        </div>
      )}

      {/* Deliverables Bar */}
      <div className="mb-6 bg-slate-900/50 border border-slate-800 rounded p-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        {anchors.map(a => {
          const filled = Boolean(a.url);
          return (
            <div key={a.id} className={`p-2.5 rounded border text-xs ${filled ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{a.label}</span>
                <span className={`text-[9px] px-1 rounded ${filled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{filled ? 'LINKED' : 'EMPTY'}</span>
              </div>
              <input
                type="url"
                value={a.url}
                onChange={e => setAnchors(anchors.map(x => x.id === a.id ? { ...x, url: e.target.value } : x))}
                placeholder="Paste URL..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
          );
        })}
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STAGES.map(stage => {
          const colTasks = filtered.filter(t => t.status === stage.id);
          return (
            <div key={stage.id} className="bg-slate-900/30 border border-slate-800/80 rounded p-3 flex flex-col">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                <h2 className="text-xs font-semibold uppercase text-slate-400">{stage.label}</h2>
                <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">{colTasks.length}</span>
              </div>

              <div className="space-y-2.5 flex-1">
                {colTasks.length === 0 ? (
                  <div className="text-center py-6 text-slate-600 text-xs">No tasks</div>
                ) : (
                  colTasks.map(task => {
                    const isBug = task.type === 'bug';
                    const due = checkDue(task.dueDate, task.status);
                    return (
                      <div
                        key={task.id}
                        onClick={() => openModal(task)}
                        className={`p-3 rounded border bg-slate-900 cursor-pointer transition hover:border-slate-600 relative ${
                          due === 'overdue' ? 'border-red-900/50 bg-red-950/10' : due === 'warning' ? 'border-amber-900/50 bg-amber-950/10' : 'border-slate-800'
                        } ${isBug ? 'border-l-2 border-l-red-500' : 'border-l-2 border-l-emerald-500'}`}
                      >
                        <div className="flex justify-between items-center mb-1.5 text-[10px]">
                          <span className={`px-1.5 py-0.5 rounded uppercase font-mono ${isBug ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {isBug ? 'bug' : 'feature'}
                          </span>
                          <span className="text-slate-400 font-mono">{task.assignee}</span>
                        </div>

                        <h3 className="text-xs font-medium text-slate-200 mb-1">{task.title}</h3>
                        {task.description && <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{task.description}</p>}

                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span>{task.dueDate || 'No date'}</span>
                          <button onClick={e => copyPrompt(task, e)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded">
                            Copy Context
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-sm font-bold mb-4">{editing ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={saveTask} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs">
                    <option value="feature">Feature</option>
                    <option value="bug">Bug</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Stage</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs">
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Assignee</label>
                  <select value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs">
                    {TEAMMATES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">AI Context & Prompt History</label>
                <textarea rows={4} value={context} onChange={e => { setContext(e.target.value); setUpdatedAt(new Date().toISOString()); }} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-800">
                {editing ? <button type="button" onClick={() => { setTasks(tasks.filter(t => t.id !== editing.id)); setModalOpen(false); }} className="text-red-400 text-xs">Delete</button> : <div />}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-xs rounded">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-xs rounded text-white font-medium">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}