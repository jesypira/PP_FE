import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskLogProps {
  onTaskChanged: () => void;
}

const token = localStorage.getItem('token');

export default function TaskLog({ onTaskChanged}: TaskLogProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');

useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token || ''
    }
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Error');
      }
      return res.json();
    })
    .then((data) => setTasks(data))
    .catch((err) => console.error('Error', err));

}, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

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
      console.error('Error:', err);
    }
  };

  const handleToggleTask = async (id: number) => {
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
      console.error('Error:', err);
    }
  };

  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const handleDeleteTask = async (taskId: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, { method: 'DELETE',
         headers: { 'Content-Type': 'application/json' ,
                   'Authorization': token || ''
        }
       });
      
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error("Error", err);
    } finally {
      setTaskToDelete(null);
       onTaskChanged();
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
              <span className="text-sm font-mono flex-1 pr-4 truncate">{task.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                task.completed 
                  ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-950/50 text-amber-400 border border-amber-500/20'
              }`}>
                {task.completed ? 'COMPLETED' : 'ACTIVE'}
              </span>
              <button
            onClick={(e) => {
              e.stopPropagation(); 
              setTaskToDelete(task);
            }}
            className="text-slate-500 hover:text-red-400 transition-colors p-1"
            title="Abandon Quest"
          >
            🗑️
          </button>
            </div>
          ))
        )}
      </div>

      {taskToDelete && (
  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-center">
      <div className="text-3xl mb-2">❌</div>
      <h3 className="text-lg font-bold font-mono uppercase tracking-wider text-slate-200">
        Abandon Quest?
      </h3>
      <p className="text-xs text-slate-400 mt-2 font-mono">
        Are you sure you want to abandon: <br/>
        <span className="text-red-400 font-semibold">"{taskToDelete.title}"</span>? <br/>
        Progress will be lost forever.
      </p>

      <div className="mt-6 flex space-x-3">
        <button
          onClick={() => setTaskToDelete(null)}
          className="flex-1 py-2 px-4 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold font-mono text-xs rounded-xl transition-all uppercase tracking-wider"
        >
          Nevermind
        </button>
        <button
          onClick={() => handleDeleteTask(taskToDelete.id)}
          className="flex-1 py-2 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold font-mono text-xs rounded-xl transition-all shadow-lg shadow-red-950/50 uppercase tracking-wider"
        >
          Abandon
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );

}

