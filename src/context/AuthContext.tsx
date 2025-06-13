// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTelegram } from './TelegramContext';

interface AuthUser { id: number; telegramId: number; referralCode: string; createdAt: string; invitedBy?: number }
interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue>({ token: null, user: null, loading: true, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    const initData = (window as any).Telegram.WebApp.initData;
    fetch(`/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    })
    .then(res => res.json())
    .then(json => {
      if (json.token) {
        setToken(json.token);
        setUser({
          id: json.user.id,
          telegramId: json.user.telegram_id,
          referralCode: json.user.referral_code,
          createdAt: json.user.created_at,
          invitedBy: json.user.invited_by
        });
        localStorage.setItem('jwt', json.token);
      } else {
        console.error('Auth failed', json);
      }
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [ready]);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt');
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
