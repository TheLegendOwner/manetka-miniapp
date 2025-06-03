// src/context/TelegramContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramContextValue {
  user: TelegramUser | null;
  ready: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({ user: null, ready: false });

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    // Вызвать метод ready WebApp
    tg.ready();

    const initData = tg.initData;
    if (!initData) {
      // Если нет initData, сразу отмечаем готовность без пользователя
      setReady(true);
      return;
    }

    // Валидируем initData на сервере
    fetch('/api/validate-initdata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          const initUser = tg.initDataUnsafe?.user as TelegramUser | undefined;
          if (initUser) {
            setUser(initUser);
          }
        } else {
          console.error('Invalid Telegram initData');
        }
      })
      .catch((err) => {
        console.error('Error validating initData:', err);
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  return (
    <TelegramContext.Provider value={{ user, ready }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}
