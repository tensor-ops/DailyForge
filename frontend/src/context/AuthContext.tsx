import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthState } from '@/types/user';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

interface AuthContextType extends AuthState {
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string, confirmPassword?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      const savedToken = localStorage.getItem('ai_habit_auth_token');
      setToken(currentUser ? savedToken : null);
    } catch {
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('ai_habit_auth_token');
        if (savedToken) {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setToken(savedToken);
          } else {
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken(res.token);
    } catch (err) {
      setIsLoading(false);
      throw err; // Re-throw so LoginPage can show the error
    }
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password?: string, confirmPassword?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, password, confirmPassword);
      setUser(res.user);
      setToken(res.token);
    } catch (err) {
      setIsLoading(false);
      throw err; // Re-throw so RegisterPage can show the error
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPreferences = async (prefs: Partial<User['preferences']>) => {
    if (!user) return;
    try {
      const updatedUser = await userService.updatePreferences(prefs);
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUserPreferences,
        refreshUser,
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
