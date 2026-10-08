import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';
import { apiErrorMessage } from '../api/axiosClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nutrition_user') || 'null');
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('nutrition_token')));

  const persistSession = useCallback((session) => {
    localStorage.setItem('nutrition_token', session.token);
    localStorage.setItem('nutrition_user', JSON.stringify(session.user));
    setUser(session.user);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem('nutrition_token')) return null;
    try {
      const result = await authApi.getProfile();
      const nextUser = {
        ...JSON.parse(localStorage.getItem('nutrition_user') || '{}'),
        id: result?.id,
        email: result?.email,
        role: result?.role,
      };
      setProfile(result);
      setUser(nextUser);
      localStorage.setItem('nutrition_user', JSON.stringify(nextUser));
      setProfileError('');
      return result;
    } catch (error) {
      setProfileError(apiErrorMessage(error));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nutrition_token');
    localStorage.removeItem('nutrition_user');
    setUser(null);
    setProfile(null);
    setProfileError('');
  }, []);

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('nutrition:unauthorized', onUnauthorized);
    if (localStorage.getItem('nutrition_token')) {
      refreshProfile().catch((error) => setProfileError(apiErrorMessage(error))).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => window.removeEventListener('nutrition:unauthorized', onUnauthorized);
  }, [logout, refreshProfile]);

  const value = useMemo(() => ({
    user, profile, profileError, loading, setProfile, login: persistSession, logout, refreshProfile,
  }), [user, profile, profileError, loading, persistSession, logout, refreshProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}