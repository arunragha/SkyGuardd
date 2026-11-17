import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

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
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Validate existing stored JWT session on initial application load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = api.getToken();
      if (!storedToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const backendUser = await api.getCurrentUser();
        if (backendUser) {
          setUser({
            id: backendUser.id,
            name: backendUser.name || backendUser.fullName || backendUser.email.split('@')[0],
            email: backendUser.email,
            role: backendUser.role || 'operator',
            organization: 'National Meteorological & Environmental Agency',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            department: 'Atmospheric Physics & Sensor Telemetry',
            timezone: 'UTC -8 (Pacific Time)'
          });
          setIsAuthenticated(true);
        } else {
          // Token expired or invalid
          api.clearToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        api.clearToken();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.login(email, password);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Invalid credentials' };
      }

      setUser({
        id: res.user.id,
        name: res.user.name || res.user.fullName || res.user.email.split('@')[0],
        email: res.user.email,
        role: res.user.role || 'operator',
        organization: res.user.organization || 'National Meteorological & Environmental Agency',
        avatar: res.user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        department: res.user.department || 'Atmospheric Physics & Sensor Telemetry',
        timezone: res.user.timezone || 'UTC -8 (Pacific Time)'
      });
      setIsAuthenticated(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed due to unexpected error' };
    }
  };

  const register = async (name: string, email: string, password: string, role = 'operator'): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.register(name, email, password, role);
      if (!res.success || !res.user) {
        return { success: false, error: res.error || 'Registration failed' };
      }

      setUser({
        id: res.user.id,
        name: res.user.name || res.user.fullName || name,
        email: res.user.email,
        role: res.user.role || role,
        organization: 'National Meteorological & Environmental Agency',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        department: 'Atmospheric Physics & Sensor Telemetry',
        timezone: 'UTC -8 (Pacific Time)'
      });
      setIsAuthenticated(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updated } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isInitializing, 
      login, 
      logout, 
      register, 
      updateProfile 
    }}>
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
