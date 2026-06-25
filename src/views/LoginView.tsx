import React, { useState } from 'react';

interface LoginViewProps {
  onLoginSuccess: (userData: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    localStorage.removeItem('token');

    const endpoint = isRegister ? '/api/user/register' : '/api/user/login';
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(isRegister ? 'Username already taken' : 'Invalid credentials');
      }

      const data = await response.json();
      const credentialsBase64 = btoa(`${username}:${password}`);
      const authHeaderValue = `Basic ${credentialsBase64}`;
      localStorage.setItem('token', authHeaderValue);

      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/60 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="text-4xl p-3 bg-slate-950 border border-slate-800 rounded-xl mb-3 select-none">
            {isRegister ? '🛡️' : '⚔️'}
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase font-mono">
            Pira Project
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isRegister ? 'Create your character and start your quest' : 'Welcome back, Hero. Authenticate your profile'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              Hero Name
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-slate-200 transition-all font-medium"
              placeholder="e.g., PiraHero"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              Secret Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl outline-none text-slate-200 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-950/50 active:scale-[0.98] disabled:opacity-50 font-mono text-sm uppercase tracking-wider"
          >
            {loading ? 'Processing...' : isRegister ? 'Initialize Character' : 'Enter World'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors font-mono uppercase tracking-wide"
          >
            {isRegister ? 'Already registered? Enter World' : 'First time playing? Create an account'}
          </button>
        </div>

      </div>
    </div>
  );
}