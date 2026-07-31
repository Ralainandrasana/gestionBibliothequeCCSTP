/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configuration d'Axios - CORRECTION
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/auth/check-session');
        if (response.data.success) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        }
      } catch {
        console.log('Session inactive');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (nom, pswd) => {
    try {
      const response = await api.post('/auth/login', { nom, pswd });
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const response = await api.get('/auth/check-session');
    if (response.data.success) {
      setIsAuthenticated(true);
      setUser(response.data.user);
      return response.data.user;
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      logout,
      refreshUser,
      api
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext;
