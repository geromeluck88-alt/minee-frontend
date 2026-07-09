// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import type { Utilisateur } from '@/types';

interface AuthContextValue {
  user: Utilisateur | null;
  token: string | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<Utilisateur>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const tok = localStorage.getItem('token');
    if (saved && tok) {
      try {
        setUser(JSON.parse(saved));
        setToken(tok);
      } catch { /* corrupted */ }
    }

    // Vérifie le token côté serveur
    if (tok) {
      api.get('/auth/me')
        .then((r) => {
          setUser(r.data.user);
          localStorage.setItem('user', JSON.stringify(r.data.user));
        })
        .catch(() => { /* l'intercepteur gère */ })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, motDePasse: string) {
    const { data } = await api.post('/auth/connexion', { email, motDePasse });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user as Utilisateur;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    window.location.href = '/connexion';
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
