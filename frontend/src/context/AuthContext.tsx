import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, UserPersona } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  persona: UserPersona | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const data = await api.get<{ user: User; profile: UserProfile; persona: UserPersona }>('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
      setPersona(data.persona);
    } catch {
      setUser(null);
      setProfile(null);
      setPersona(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    await fetchCurrentUser();
  };

  const register = async (email: string, password: string, displayName: string) => {
    const data = await api.post<{ user: User; token: string }>('/auth/register', { email, password, displayName });
    localStorage.setItem('token', data.token);
    await fetchCurrentUser();
  };

  const demoLogin = async () => {
    const data = await api.post<{ user: User; token: string }>('/auth/demo-login');
    localStorage.setItem('token', data.token);
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
      setPersona(null);
      window.location.href = '/login';
    }
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        persona,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
