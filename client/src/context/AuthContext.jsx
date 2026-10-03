import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('testora_token');
    const stored = localStorage.getItem('testora_user');
    if (token && stored) {
      setUser(JSON.parse(stored));
      // Verify token validity
      api.get('/auth/me')
        .then(res => setUser(res.data.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, data } = res.data;
    localStorage.setItem('testora_token', token);
    localStorage.setItem('testora_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token, data } = res.data;
    localStorage.setItem('testora_token', token);
    localStorage.setItem('testora_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('testora_token');
    localStorage.removeItem('testora_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('testora_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
