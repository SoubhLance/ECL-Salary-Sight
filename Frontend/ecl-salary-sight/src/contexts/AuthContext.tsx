import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { employeeId: string } | null;
  login: (employeeId: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_CREDENTIALS = {
  employeeId: 'admin',
  password: 'admin123',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ employeeId: string } | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('ecl_auth');
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      setIsAuthenticated(true);
      setUser(parsed.user);
    }
  }, []);

  const login = (employeeId: string, password: string) => {
    if (employeeId === VALID_CREDENTIALS.employeeId && password === VALID_CREDENTIALS.password) {
      const userData = { employeeId };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('ecl_auth', JSON.stringify({ user: userData }));
      return { success: true };
    }
    return { success: false, error: 'Invalid Employee ID or Password' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('ecl_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
