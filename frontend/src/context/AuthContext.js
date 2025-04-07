import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const response = await AuthService.getCurrentUser();
          setCurrentUser(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        AuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await AuthService.login(email, password);
      const userResponse = await AuthService.getCurrentUser();
      setCurrentUser(userResponse.data);
      return data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const data = await AuthService.register(name, email, password);
      const userResponse = await AuthService.getCurrentUser();
      setCurrentUser(userResponse.data);
      return data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: AuthService.isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
