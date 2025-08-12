import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configurar axios para incluir credenciais e URL base
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;

  // Função para obter token CSRF
  const getCSRFToken = async () => {
    try {
      const response = await axios.get('/api/accounts/csrf/');
      return response.data.csrfToken;
    } catch (error) {
      console.error('Erro ao obter token CSRF:', error);
      return null;
    }
  };

  // Interceptor para adicionar token CSRF automaticamente
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        if (config.method !== 'get') {
          const csrfToken = await getCSRFToken();
          if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  useEffect(() => {
    // Verificar se há uma sessão ativa
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/accounts/profile/');
      setCurrentUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/accounts/login/', {
        username,
        password
      });
      
      const { user } = response.data;
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.username?.[0] || 
               error.response?.data?.password?.[0] || 
               'Erro ao fazer login' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/accounts/register/', userData);
      return { success: true, user: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.username?.[0] || 
               error.response?.data?.email?.[0] || 
               error.response?.data?.password?.[0] || 
               'Erro ao registrar usuário' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/accounts/logout/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
