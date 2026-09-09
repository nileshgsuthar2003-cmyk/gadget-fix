import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, UserProfile, AuthResponse } from '../lib/api';

const AUTH_STORAGE_KEY = 'cellcare_auth_session';

interface StoredSession {
  user: UserProfile;
  token: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  registerSendOtp: (params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ success: boolean; message?: string; error?: string; debug_otp?: string }>;
  registerVerifyOtp: (params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updatedUser: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => ({ success: false }),
  registerSendOtp: async () => ({ success: false }),
  registerVerifyOtp: async () => ({ success: false }),
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Save session to AsyncStorage whenever user/token changes
  const saveSession = async (userData: UserProfile | null, authToken: string | null) => {
    try {
      if (userData && authToken) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: userData, token: authToken }));
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      // Storage error, ignore silently
    }
  };

  // Initialize: restore session from AsyncStorage, then verify with server
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Step 1: Restore cached session instantly (fast startup)
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const session: StoredSession = JSON.parse(stored);
          if (session.user && session.token) {
            setUser(session.user);
            setToken(session.token);
          }
        }

        // Step 2: Verify with server to get fresh data
        const res = await api.getMe();
        if (res && res.success && res.user) {
          setUser(res.user);
          if (!token) setToken('live-session-token');
          await saveSession(res.user, 'live-session-token');
        }
      } catch (err) {
        // Server offline — keep using cached session if available
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token || null);
        await saveSession(res.user, res.token || 'live-session-token');
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const registerSendOtp = async (params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; message?: string; error?: string; debug_otp?: string }> => {
    setIsLoading(true);
    try {
      return await api.registerSendOtp(params);
    } finally {
      setIsLoading(false);
    }
  };

  const registerVerifyOtp = async (params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.registerVerifyOtp(params);
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token || null);
        await saveSession(res.user, res.token || 'live-session-token');
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await saveSession(null, null);
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      saveSession(newUser, token);
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
        registerSendOtp,
        registerVerifyOtp,
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
