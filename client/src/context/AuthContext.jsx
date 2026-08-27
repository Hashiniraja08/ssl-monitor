import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredUser, setStoredUser, setAuthToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser() || {
    id: 'usr_admin_01',
    name: 'Analyst 01',
    email: 'analyst.01@securescan.ai',
    role: 'Admin',
    title: 'Tier 3 Admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const list = await api.getUsers();
      setAvailableUsers(list || []);
    } catch (err) {
      console.warn('Could not fetch user list:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setAuthToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
    return res.user;
  };

  const register = async (data) => {
    const res = await api.register(data);
    setAuthToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
    fetchUsers();
    return res.user;
  };

  const switchUser = async (userId) => {
    try {
      const res = await api.switchUser(userId);
      setAuthToken(res.token);
      setStoredUser(res.user);
      setUser(res.user);
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    setStoredUser(res.user);
    setUser(res.user);
    fetchUsers();
    return res.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        availableUsers,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        isAdmin: user?.role === 'Admin',
        isAnalyst: user?.role === 'Analyst' || user?.role === 'Admin',
        isViewer: user?.role === 'Viewer'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
