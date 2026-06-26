import { useState } from 'react';
import LoginView from './views/LoginView';
import TaskLog from './components/TaskLog'; 

export default function App() {

const [gameEventPopup, setGameEventPopup] = useState<{
  isOpen: boolean;
  type: 'LEVEL_UP' | 'LEVEL_DOWN' | 'STREAK';
  value: number;
} | null>(null);

  const [user, setuser] = useState<any>(null);

  const handleLoginSuccess = (userData: any) => {
    setuser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    setuser(null);                     
  };

  const fetchUserData = async () => {
    if (!user?.id) return;
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
        headers: { 'Authorization': token || '' }
      });
      if (response.ok) {
        const freshData = await response.json();

        const newLevel = freshData.level?.level || 1;
        const newStreak = freshData.dailyStreak || 0;
        const oldLevel = user.level?.level || 1;
        const oldStreak = user.dailyStreak || 0;
        
        if (newLevel > oldLevel) {
          setGameEventPopup({ isOpen: true, type: 'LEVEL_UP', value: newLevel });
        } else if (newLevel < oldLevel) {
          setGameEventPopup({ isOpen: true, type: 'LEVEL_DOWN', value: newLevel });
        }else if (newStreak > oldStreak) {
          setGameEventPopup({ isOpen: true, type: 'STREAK', value: newStreak });
        }

        setuser(freshData); 
      }
    } catch (err) {
      console.error("Erro ao atualizar player:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4">
      {!user ? (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="space-y-6">
          {/* Dashboard / user Hub */}
              <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative">
  
            <button 
              onClick={handleLogout}
              className="absolute top-4 right-4 text-xs font-mono px-2.5 py-1 bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/40 rounded-lg transition-all uppercase tracking-wider"
            >
              Logout 
            </button>

            <h2 className="text-2xl font-bold font-mono text-indigo-400">
              Welcome, {user.username}!
            </h2>
            <p className="text-slate-400 text-sm mt-1">Your world awaits you.</p>

            {/* BARRA DE XP DINÂMICA */}
            <div className="mt-5 space-y-1.5 font-mono">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-400">✨ EXPERIENCE PROGRESS</span>
                <span className="text-slate-400">
                  {user.xp || 0} / {user.nextLevel?.requiredXP || 100} XP
                </span>
              </div>
              
              {/* Container da Barra (Fundo) */}
              <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-[2px]">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(147,51,234,0.4)]"
                  style={{ 
                    width: `${Math.min(100, ((user.xp || 0) / (user.nextLevel?.requiredXP || 100)) * 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 font-mono text-xs text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                ⭐ LVL: {user.level.level || 1}
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                🔥 STREAK: {user.dailyStreak || 0}
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                💰 GOLD: {user.gold || 0}
              </div>
            </div>
          </div>

          <TaskLog onTaskChanged={fetchUserData} />

         

          {/* 🌟 POPUP DE LEVEL UP / DOWN */}
          {gameEventPopup?.isOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-mono">
                <div className={`w-full max-w-sm border p-6 rounded-2xl shadow-2xl text-center transition-all ${
                  gameEventPopup.type === 'STREAK' ? 'bg-slate-900 border-amber-500/40 shadow-amber-950/50' : 
                  gameEventPopup.type === 'LEVEL_UP' ? 'bg-slate-900 border-purple-500/40 shadow-purple-950/50' : 
                  'bg-slate-900 border-red-500/40 shadow-red-950/50'
                }`}>

                 {gameEventPopup.type === 'STREAK' && (
                  <>
                    <div className="text-5xl mb-2 animate-pulse">🔥 ⚔️ 🔥</div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 uppercase tracking-widest">
                      STREAK MULTIPLIER!
                    </h2>
                    <p className="text-xs text-slate-400 mt-2">
                      You have maintained your dedication. The fire burns bright!
                    </p>
                    
                    <div className="my-6 inline-block bg-gradient-to-r from-amber-950 to-orange-950 border border-amber-500/30 px-6 py-2 rounded-xl">
                      <span className="text-amber-400 text-xs uppercase block tracking-wider animate-pulse">Combo Active</span>
                      <span className="text-xl font-bold text-orange-400">🔥 {gameEventPopup.value} DAYS STRAIGHT</span>
                    </div>

                    <button
                      onClick={() => setGameEventPopup(null)}
                      className="w-full py-2.5 font-bold text-xs rounded-xl transition-all uppercase tracking-wider shadow-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-orange-950"
                    >
                      Keep it Burning
                    </button>
                  </>
                )}
                
                {/* Ícone e Título Dinâmico */}
                {gameEventPopup.type === 'LEVEL_UP' && (
                  <>
                    <div className="text-5xl mb-3 animate-bounce">✨ ⚔️ ✨</div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 uppercase tracking-widest drop-shadow">
                      Level Up!
                    </h2>
                    <p className="text-xs text-slate-400 mt-2">
                      Your power grows! You have ascended to a new rank.
                    </p>
                    <div className="my-6 inline-block bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-500/30 px-6 py-2 rounded-xl">
                      <span className="text-purple-400 text-xs uppercase block tracking-wider">New Rank</span>
                      <span className="text-xl font-bold text-yellow-400">⭐ LEVEL {gameEventPopup.value}</span>
                    </div>
                       <button
                        onClick={() => setGameEventPopup(null)}
                        className={`w-full py-2.5 font-bold text-xs rounded-xl transition-all uppercase tracking-wider shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950`}
                      >
                        {'Claim Glory'}
                      </button>
                  </>
                )}
                {gameEventPopup.type === 'LEVEL_DOWN' && (
                  <>
                    <div className="text-5xl mb-3">💀 🩸 💀</div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600 uppercase tracking-widest drop-shadow">
                      Level Down
                    </h2>
                    <p className="text-xs text-slate-400 mt-2">
                      A heavy toll was paid... You lost your footing.
                    </p>
                    <div className="my-6 inline-block bg-gradient-to-r from-red-950 to-rose-950 border border-red-500/30 px-6 py-2 rounded-xl">
                      <span className="text-red-400 text-xs uppercase block tracking-wider">Current Rank</span>
                      <span className="text-xl font-bold text-red-500">💔 LEVEL {gameEventPopup.value}</span>
                    </div>
                     <button
                      onClick={() => setGameEventPopup(null)}
                      className={`w-full py-2.5 font-bold text-xs rounded-xl transition-all uppercase tracking-wider shadow-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-950`}
                    >
                      {'Accept Fate'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}