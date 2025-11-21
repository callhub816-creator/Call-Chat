import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USER } from '../services/mockDatabase';

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  register: (email: string, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for persisted session
    const storedUser = localStorage.getItem('callhub_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
  }, []);

  const login = (email: string) => {
    // Mock login logic - in real app, validate password against backend
    const loggedInUser = { ...MOCK_USER, email };
    setUser(loggedInUser);
    localStorage.setItem('callhub_user', JSON.stringify(loggedInUser));
  };

  const register = (email: string, name: string) => {
    // Mock register logic
    const newUser: User = { 
      ...MOCK_USER, 
      id: 'u_' + Date.now(),
      email,
    };
    setUser(newUser);
    localStorage.setItem('callhub_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('callhub_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);