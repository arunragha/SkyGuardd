import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  avatar: string;
  department: string;
  timezone: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-8921',
  name: 'Dr. Sarah Lin',
  email: 's.lin@skyguard.ai',
  role: 'Lead Weather Intelligence Scientist',
  organization: 'National Meteorological & Environmental Agency',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  department: 'Atmospheric Physics & Sensor Telemetry',
  timezone: 'UTC -8 (Pacific Time)'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const login = async (email: string): Promise<boolean> => {
    // Realistic simulation
    await new Promise(resolve => setTimeout(resolve, 600));
    setUser({
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email,
    });
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser({
      ...DEFAULT_USER,
      name,
      email,
    });
    setIsAuthenticated(true);
    return true;
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updated } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, updateProfile }}>
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

