import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize user profile from Supabase
  const refreshUser = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }

    try {
      const profile = await api.getProfile();
      if (profile) {
        setUser(profile);
      } else {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
          skills: [],
          interests: [],
          preferredLocations: [],
          graduationYear: 2027,
          role: 'student'
        });
      }
    } catch (err) {
      console.warn('Profile fetch error:', err.message);
      setUser({
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0],
        role: 'student'
      });
    }
  }, []);

  // Set up Supabase Auth listener on mount
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // 1. Check existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        if (session?.user) {
          refreshUser(session.user).finally(() => {
            if (isMounted) setLoading(false);
          });
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    // 2. Listen to real-time auth changes (LOGIN, LOGOUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        await refreshUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await refreshUser(currentUser);
    }
    return res.user;
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Google OAuth is unavailable.');
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  const register = async (formData) => {
    const res = await api.register(formData);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await refreshUser(currentUser);
    }
    return res.user;
  };

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const updateUserProfile = async (updates) => {
    if (!user) return null;
    const updated = await api.updateProfile(updates);
    if (updated) {
      setUser(updated);
      return updated;
    }
    return user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
