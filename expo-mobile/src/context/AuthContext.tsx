import React, { createContext, useContext, useState } from 'react';
import { api, UserProfile, AuthResponse } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updatedUser: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  id: 1,
  first_name: 'Rahul',
  last_name: 'Sharma',
  name: 'Rahul Sharma',
  email: 'rahul@fixly.com',
  phone: '+91 98765 43210',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(defaultUser);
  const [token, setToken] = useState<string | null>('mock-token');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token || null);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.register(params);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token || null);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
