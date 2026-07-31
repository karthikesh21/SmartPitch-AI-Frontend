import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      setIsLoggedIn(true);
    }
  }, []);

  const signup = (email, password, name) => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'User already exists with this email' };
    }
    users.push({ email, password, name });
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    return { success: true };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = users.find(u => u.email === email);
    if (!user) {
      return { success: false, error: 'User not found. Please sign up first.' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Invalid password.' };
    }
    localStorage.removeItem('pitchHistory');
    localStorage.setItem('currentUser', email);
    setCurrentUser(email);
    setIsLoggedIn(true);
    
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('pitchHistory');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
