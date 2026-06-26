
interface CategoryProps {
  tasks: any[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export const Heath = ({ tasks, onToggle, onDelete }: CategoryProps) => {
  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-600 italic text-center py-4">
          No quests for today. Keep resting.
        </p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onToggle(task.id)} 
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none gap-4 ${
              task.completed
                ? 'bg-slate-950/40 border-emerald-900/40 text-slate-500'
                : 'bg-slate-950 border-slate-800/80 hover:border-purple-500/50 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                task.difficulty === 'HARD' ? 'bg-rose-950/30 text-rose-400 border-rose-900/40' 
                : task.difficulty === 'MEDIUM' ? 'bg-amber-950/30 text-amber-400 border-amber-900/40'
                : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40'
              }`}>
                {task.difficulty}
              </span>
              <span className={`text-sm truncate ${task.completed ? 'line-through text-slate-600' : ''}`}>
                {task.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onDelete(task); 
                }}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
              >
                🗑️
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};