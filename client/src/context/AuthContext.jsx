import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

const DEFAULT_USER = {
  id: 'usr-demo-001',
  name: 'Alex Sharma',
  email: 'alex.sharma@student.edu',
  skills: ['React', 'JavaScript', 'Node.js', 'Python', 'Tailwind CSS'],
  interests: ['Web Development', 'Open Source', 'Hackathons', 'Fintech'],
  preferredLocations: ['Bengaluru', 'Remote'],
  educationLevel: '3rd Year B.Tech Computer Science',
  graduationYear: 2027,
  role: 'student'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('launchpad_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync with backend profile on mount
    const loadProfile = async () => {
      try {
        const data = await api.getProfile();
        if (data && data.name) {
          setUser(data);
          localStorage.setItem('launchpad_user', JSON.stringify(data));
        }
      } catch (err) {
        // Fall back to local user state
      }
    };
    loadProfile();
  }, []);

  const updateUserProfile = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('launchpad_user', JSON.stringify(updated));
    try {
      await api.updateProfile(updates);
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
    }
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
