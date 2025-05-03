import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WebAppUser } from 'telegram-web-app';

interface TelegramContextValue {
  user: WebAppUser | null;
  ready: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({ user: null, ready: false });

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WebAppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    setReady(true);

    const initUser = tg.initDataUnsafe.user;
    if (initUser) {
      setUser(initUser);
    }
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