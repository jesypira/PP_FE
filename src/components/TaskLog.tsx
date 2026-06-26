import { useState, useEffect } from 'react';
import { Personal } from './categories/Personal';
import { Work } from './categories/Work';
import { Heath } from './categories/Heath';
import { Finance } from './categories/Finance';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: 'WORK' | 'HEALTH' | 'FINANCE' | 'PERSONAL';
  dueDate: string;
}

interface TaskLogProps {
  onTaskChanged: () => void;
}

export default function TaskLog({ onTaskChanged }: TaskLogProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [activeTab, setActiveTab] = useState<'WORK' | 'HEALTH' | 'FINANCE' | 'PERSONAL'>('PERSONAL');

  useEffect(() => {
    const dateStr = formatDateForJava(currentDate);
    fetch(`${import.meta.env.VITE_API_URL}/api/tasks?dueDate=${dateStr}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') || ''
      }
    })
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error('Error', err));

  }, [currentDate]);

  const formatDateForJava = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const dateStr = formatDateForJava(currentDate);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/new`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' ,
          'Authorization': localStorage.getItem('token') || ''
        },
        body: JSON.stringify({
          title: newTitle,
          difficulty: difficulty,
          dueDate: dateStr,
          category: activeTab 
        })
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([createdTask, ...tasks]);
        setNewTitle('');
        setDifficulty('EASY');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}/toggle`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json' ,
          'Authorization': localStorage.getItem('token') || ''
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

  const handleDeleteTask = async (taskId: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, { 
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json' ,
          'Authorization': localStorage.getItem('token') || ''
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

  const handleNavigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') newDate.setDate(newDate.getDate() - 1);
    if (direction === 'next') newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const renderCategoryContent = () => {
    const categoryTasks = tasks.filter(task => task.category === activeTab);
    
    const categoryProps = {
      tasks: categoryTasks,
      onToggle: handleToggleTask,
      onDelete: (task: any) => setTaskToDelete(task)
    };

    switch (activeTab) {
      case 'WORK':
            return <Work {...categoryProps} />;
      case 'FINANCE':
            return <Finance {...categoryProps} />;
      case 'HEALTH':
            return <Heath {...categoryProps} />;
      case 'PERSONAL':
      default:
        return <Personal {...categoryProps} />;
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 font-mono">
      
      <div className="flex gap-1 pl-2">
        {([
          { key: 'PERSONAL', label: 'PERSONAL' },
          { key: 'WORK',  label: 'WORK' },
          { key: 'HEALTH', label: 'HEALTH' },
          { key: 'FINANCE',label: 'FINANCE' }
        ] as const).map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 border-slate-800 text-purple-400 font-extrabold translate-y-[1px] z-10'
                  : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-b-2xl rounded-tr-2xl shadow-xl">
        <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">
          📜 {activeTab} MISSION BOARD
        </h3>

        <form onSubmit={handleAddTask} className="flex flex-col space-y-3 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`Add a new ${activeTab.toLowerCase()} objective...`}
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl outline-none text-slate-200 text-sm font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all text-xs font-mono uppercase tracking-wider"
          >
            + Add Quest
          </button>
          
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500 mr-1">DIFFICULTY:</span>
            {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => {
              const activeColors = {
                EASY: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400',
                MEDIUM: 'bg-amber-950/60 border-amber-500/40 text-amber-400',
                HARD: 'bg-rose-950/60 border-rose-500/40 text-rose-400'
              };

              const isSelected = difficulty === diff;

              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`px-3 py-1 rounded-lg border transition-all uppercase font-semibold tracking-wider ${
                    isSelected 
                      ? activeColors[diff] 
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </form>

        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono mb-4">
          <button 
            onClick={() => handleNavigateDay('prev')}
            className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-lg text-xs text-slate-400 transition-all"
          >
            ◀ Prev Day
          </button>
          
          <label className="text-center cursor-pointer group relative px-4 py-1 rounded-lg hover:bg-slate-900/60 border border-transparent hover:border-slate-800/60 transition-all">
            <span className="text-[10px] uppercase text-slate-500 tracking-wider block group-hover:text-purple-400 transition-colors">
              📅 Click to Jump
            </span>
            <span className="text-sm font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
              {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>

            {/* O Input de Data Nativo escondido por cima do texto */}
            <input 
              type="date"
              value={formatDateForJava(currentDate)}
              onChange={(e) => {
                if (e.target.value) {
                  // Quando o usuário escolhe a data, quebramos os hifens para evitar bugs de fuso horário local
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  setCurrentDate(new Date(year, month - 1, day));
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-[0px]"
              // showPicker() ajuda navegadores modernos a forçarem a abertura do calendário ao clicar no container
              onClick={(e) => (e.target as any).showPicker?.()} 
            />
          </label>

          <button 
            onClick={() => handleNavigateDay('next')}
            className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-lg text-xs text-slate-400 transition-all"
          >
            Next Day ▶
          </button>
        </div>

        <div className="mt-4">
          {renderCategoryContent()}
        </div>
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