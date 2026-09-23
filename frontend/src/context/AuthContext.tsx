import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, UserPersona } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  persona: UserPersona | null;
  isLoading: boolean;
  isProfileComplete: boolean;
  login: (email: string, password: string) => Promise<{ isComplete: boolean }>;
  register: (email: string, password: string, displayName: string) => Promise<{ isComplete: boolean }>;
  demoLogin: () => Promise<{ isComplete: boolean }>;
  googleLogin: (googleData: { token?: string; credential?: string; googleUser?: any }) => Promise<{ isComplete: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<{ isComplete: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const checkIsProfileComplete = (profile: UserProfile | null, _persona?: UserPersona | null): boolean => {
  if (!profile) return false;
  const hasBio = Boolean(profile.bio && profile.bio.trim().length > 0);
  const hasPhone = Boolean(profile.phone && profile.phone.trim().length > 0);

  const rawGroup = profile.skills?.networkingGroup;
  const groups = Array.isArray(rawGroup)
    ? rawGroup
    : typeof rawGroup === 'string' && rawGroup.trim().length > 0
    ? [rawGroup]
    : [];
  const hobbies = Array.isArray(profile.skills?.hobbies) ? profile.skills.hobbies : [];
  const interests = Array.isArray(profile.skills?.interests) ? profile.skills.interests : [];
  const objectives = Array.isArray(profile.skills?.goals) ? profile.skills.goals : [];
  const targets = Array.isArray(profile.networking_goals)
    ? profile.networking_goals
    : Array.isArray(profile.targetBusinesses)
    ? profile.targetBusinesses
    : [];
  const bridges = Array.isArray(profile.interests) && profile.interests.length > 0
    ? profile.interests
    : Array.isArray(profile.connectionsOffered)
    ? profile.connectionsOffered
    : [];

  const hasGroup = groups.some((g: any) => typeof g === 'string' && g.trim().length > 0);
  const hasHobby = hobbies.some((h: any) => typeof h === 'string' && h.trim().length > 0);
  const hasInterest = interests.some((i: any) => typeof i === 'string' && i.trim().length > 0);
  const hasObjective = objectives.some((o: any) => typeof o === 'string' && o.trim().length > 0);
  const hasTarget = targets.some((t: any) => typeof t === 'string' && t.trim().length > 0);
  const hasBridge = bridges.length > 0;

  return Boolean(hasBio && hasPhone && hasGroup && hasHobby && hasInterest && hasObjective && hasTarget && hasBridge);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [persona, setPersona] = useState<UserPersona | null>(null);
  const [serverIsComplete, setServerIsComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isProfileComplete = serverIsComplete !== null ? serverIsComplete : checkIsProfileComplete(profile, persona);

  const fetchCurrentUser = async (): Promise<{ isComplete: boolean }> => {
    try {
      const data = await api.get<{ user: User; profile: UserProfile; persona: UserPersona; isProfileComplete?: boolean }>('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
      setPersona(data.persona);
      const computed = data.isProfileComplete !== undefined ? Boolean(data.isProfileComplete) : checkIsProfileComplete(data.profile, data.persona);
      setServerIsComplete(computed);
      return { isComplete: computed };
    } catch {
      setUser(null);
      setProfile(null);
      setPersona(null);
      setServerIsComplete(false);
      return { isComplete: false };
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
    return await fetchCurrentUser();
  };

  const register = async (email: string, password: string, displayName: string) => {
    const data = await api.post<{ user: User; token: string }>('/auth/register', { email, password, displayName });
    localStorage.setItem('token', data.token);
    return await fetchCurrentUser();
  };

  const demoLogin = async () => {
    const data = await api.post<{ user: User; token: string }>('/auth/demo-login');
    localStorage.setItem('token', data.token);
    return await fetchCurrentUser();
  };

  const googleLogin = async (googleData: { token?: string; credential?: string; googleUser?: any }) => {
    const data = await api.post<{ user: User; token: string }>('/auth/google', googleData);
    localStorage.setItem('token', data.token);
    return await fetchCurrentUser();
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
    return await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        persona,
        isLoading,
        isProfileComplete,
        login,
        register,
        demoLogin,
        googleLogin,
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
