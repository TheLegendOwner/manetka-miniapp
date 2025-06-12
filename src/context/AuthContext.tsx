'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTelegram } from './TelegramContext';

interface AuthUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ token: null, user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    const initData = (window as any).Telegram.WebApp.initData;
    fetch('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    })
      .then(async res => {
        const json = await res.json();
        if (res.ok) {
          setToken(json.token);
          setUser({
            id: json.user.id,
            firstName: json.user.first_name,
            lastName: json.user.last_name,
            username: json.user.username
          });
          localStorage.setItem('jwt', json.token);
        } else {
          console.error('Auth failed', json);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ready]);

  return (
    <AuthContext.Provider value={{ token, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
