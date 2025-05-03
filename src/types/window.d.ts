// types/window.d.ts
export {};

declare global {
  interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initDataUnsafe: {
    user?: TelegramUser;
  };
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}

}
