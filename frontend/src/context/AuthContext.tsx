import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { api, type User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('assetflow_token');
      if (token) {
        try {
          const response = await api.auth.getProfile();
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            localStorage.removeItem('assetflow_token');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('assetflow_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.auth.login(email, password);
      if (response.success && response.token && response.user) {
        localStorage.setItem('assetflow_token', response.token);
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.auth.signup(name, email, password);
      if (response.success && response.token && response.user) {
        localStorage.setItem('assetflow_token', response.token);
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('assetflow_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
