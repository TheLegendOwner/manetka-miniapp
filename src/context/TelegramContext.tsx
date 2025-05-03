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

    tg.ready();
    setReady(true);

    const initUser = tg.initDataUnsafe?.user as TelegramUser | undefined;
    if (initUser) setUser(initUser);
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