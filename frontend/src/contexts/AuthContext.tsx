import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setToken, removeToken, isAuthenticated } from '@/api/client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (isAuthenticated() && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch {
        // Invalid stored user, clear it
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (token: string, userData: User) => {
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    // console.log(userData)
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
