import React, { createContext, useState, useContext, useEffect } from 'react';

// Define how our user/User looks on the frontend
interface User {
  id: number;
  username: string;
  level: number;
  xp: number;
  gold: number;
  dailyStreak: number;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check if a user session already exists on load
  useEffect(() => {
    const savedUser = localStorage.getItem('pira_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('pira_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pira_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to quickly tap into the global user state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};