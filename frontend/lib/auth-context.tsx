"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  companyName?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "luminus_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
        // Token is invalid
        localStorage.removeItem(TOKEN_KEY);
        setTokenState(null);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return false;
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        setTokenState(savedToken);
        await fetchUser(savedToken);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchUser]);

  const setToken = useCallback(async (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
    await fetchUser(newToken);
  }, [fetchUser]);

  const login = useCallback(() => {
    // Redirect to Google OAuth
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// Helper to get auth header
export function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
