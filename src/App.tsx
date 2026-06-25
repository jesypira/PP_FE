import { useState } from 'react';
import LoginView from './views/LoginView';
import TaskLog from './components/TaskLog'; 

export default function App() {
  const [user, setuser] = useState<any>(null);

  const handleLoginSuccess = (userData: any) => {
    setuser(userData);
  };

  const fetchPlayerData = async () => {
    if (!user?.id) return;
    const token = localStorage.getItem('token');
    
    try {
      // Ajuste a URL para a rota onde você busca os dados do seu usuário por ID
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
        headers: { 'Authorization': token || '' }
      });
      if (response.ok) {
        const freshData = await response.json();
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
          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold font-mono text-indigo-400">
              Welcome, {user.username}!
            </h2>
            <p className="text-slate-400 text-sm mt-1">Your world awaits you.</p>
            
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

          <TaskLog onTaskChanged={fetchPlayerData} />
        </div>
      )}
    </main>
  );
}