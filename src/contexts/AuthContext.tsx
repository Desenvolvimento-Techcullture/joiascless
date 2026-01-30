import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, AuthState, AuthContextType } from '@/lib/types';


const USERS_API_URL = 'https://techculture.portaldeanuncios.com/api/v2/users/';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Busca usuários da API
      const response = await fetch(USERS_API_URL + `?email=${email}`);
      if (!response.ok) {
        console.error('Erro ao buscar usuários');
        return false;
      }
      
      const users: User[] = await response.json();
      const user = users.find(u => (u.email === email) && (u.password === btoa(password)) );
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AZW1haWwuY29tIiwic3lzIjoiY2F0YWxvZyIsIm93bmVyIjoidGVjaGN1bHR1cmUiLCJpYXQiOjE3Njk1MjQ5NzksImV4cCI6MTc2OTUyODU3OX0=.jZP+Ek0Ojx5JuF7EOTO2C48Y0BgX76JV2STJ5aku2ec=';
      
      if (user && password.length >= 6) {
        setAuthState({ user, isAuthenticated: true });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    if (!name || !email || password.length < 6) {
      return false;
    }

    try {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        phone,
        email,
        password: btoa(password),
      };

      const response = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        console.error('Erro ao cadastrar usuário');
        return false;
      }

      const createdUser = await response.json();

      setAuthState({ user: createdUser || newUser, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({ user: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
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
