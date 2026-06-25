import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskLogProps {
  onTaskChanged: () => void;
}

export default function TaskLog({ onTaskChanged}: TaskLogProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');

useEffect(() => {
  const token = localStorage.getItem('token');

  fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token || ''
    }
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Falha ao carregar as tasks');
      }
      return res.json();
    })
    .then((data) => setTasks(data))
    .catch((err) => console.error('Erro ao carregar as quests:', err));

}, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const token = localStorage.getItem('token');

    console.log('token: ',token)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
                   'Authorization': token || ''
        },
        body: JSON.stringify({
          title: newTitle
        })
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([...tasks, createdTask]);
        setNewTitle('');
      }
    } catch (err) {
      console.error('Erro ao criar quest:', err);
    }
  };

  const handleToggleTask = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}/toggle`, {
        method: 'PUT',
         headers: { 'Content-Type': 'application/json' ,
                   'Authorization': token || ''
        }
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
        onTaskChanged();
      }
    } catch (err) {
      console.error('Erro ao atualizar quest:', err);
    }
  };

  return (
    <div className="mt-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl mx-auto shadow-xl">
      <h3 className="text-xl font-bold font-mono text-purple-400 mb-4 flex items-center gap-2">
        📜 QUEST LOG (TODOS)
      </h3>

      {/* Formulário para Adicionar Task */}
      <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New quest objective..."
          className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl outline-none text-slate-200 text-sm font-mono"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all text-xs font-mono uppercase tracking-wider"
        >
          + Add Quest
        </button>
      </form>

      {/* Lista de Tasks */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-4 font-mono">
            No active quests. Tavern is quiet.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                task.completed
                  ? 'bg-slate-950/40 border-emerald-900/40 text-slate-500 line-through decoration-emerald-500/40'
                  : 'bg-slate-950 border-slate-800/80 hover:border-purple-500/50 text-slate-200'
              }`}
            >
              <span className="text-sm font-mono">{task.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                task.completed 
                  ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-950/50 text-amber-400 border border-amber-500/20'
              }`}>
                {task.completed ? 'COMPLETED' : 'ACTIVE'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}