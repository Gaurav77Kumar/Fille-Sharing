import { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  getUser,
} from '../api/authApi';

const AuthContext = createContext(null);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch {
        
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (credentials) => {
    
      const response = await loginApi(credentials);
      setUser(response.user);
    return response;
  }
  const register = async (userData) => {
    
      const response = await registerApi(userData);
      return response;
  }

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
    }
  };

  
  const refreshUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      if (error?.response?.status === 401) {
        setUser(null);
      }
    }
  };

  
  const updateStorageUsed = (newStorageUsed) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, storageUsed: newStorageUsed };
    });
  };

  const value = {
    user,             
    login,           
    register,         
    logout,           
    refreshUser,     
    updateStorageUsed,
    loading,          
    isAuthenticated: !!user, 
  };

  return (
    <AuthContext.Provider value={value}>
     
      {!loading && children}
    </AuthContext.Provider>
  );
};


export default AuthContext;



