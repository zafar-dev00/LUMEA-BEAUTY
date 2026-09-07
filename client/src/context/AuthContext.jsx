import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { getToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session
  const [error, setError] = useState(null);

  // On first load, if a token exists, try to resolve the current user.
  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await authService.getMe();
        setUser(me);
      } catch {
        clearToken(); // stale/invalid token
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const requestOtp = useCallback(async (email) => {
    setError(null);
    try {
      return await authService.requestOtp(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(async (payload) => {
    setError(null);
    try {
      const loggedInUser = await authService.verifyOtp(payload);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    try {
      const newUser = await authService.register(payload);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    // Logout is stateless server-side (see authController.logout) — the API
    // call is best-effort. Local state must always clear, even if that call
    // fails (network hiccup, already-expired token), or the user would
    // appear to stay logged in.
    try {
      await authService.logout();
    } catch {
      // ignore — proceed to clear local state regardless
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setError(null);
    try {
      const updated = await authService.updateProfile(updates);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    clearError: () => setError(null),
    login,
    requestOtp,
    verifyOtp,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
