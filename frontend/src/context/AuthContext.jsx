import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (err) {
      console.error('[AuthContext] Invalid user JSON in localStorage');
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const login = useCallback((userData, tokenData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    setUser(userData);
    setToken(tokenData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  // Sonar: memoize context value
  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
