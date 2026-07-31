import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    const storedProfile = localStorage.getItem('userProfile');
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      if (storedProfile) {
        try {
          setUserProfile(JSON.parse(storedProfile));
        } catch (e) {}
      }
      setIsLoggedIn(true);
    }
  }, []);

  const signup = async (email, password, name) => {
    try {
      const res = await authAPI.signup({ name, email, password });
      if (res && res.success) {
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Failed to create account.' };
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err?.error || err?.message || 'Failed to sign up.');
      return { success: false, error: errorMsg };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res && res.success) {
        localStorage.removeItem('pitchHistory');
        localStorage.setItem('currentUser', res.user.email);
        localStorage.setItem('userProfile', JSON.stringify(res.user));
        setCurrentUser(res.user.email);
        setUserProfile(res.user);
        setIsLoggedIn(true);
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Invalid credentials.' };
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err?.error || err?.message || 'Login failed.');
      return { success: false, error: errorMsg };
    }
  };

  const setSession = (user) => {
    localStorage.removeItem('pitchHistory');
    localStorage.setItem('currentUser', user.email);
    localStorage.setItem('userProfile', JSON.stringify(user));
    setCurrentUser(user.email);
    setUserProfile(user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('pitchHistory');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    setCurrentUser(null);
    setUserProfile(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, userProfile, login, logout, signup, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
