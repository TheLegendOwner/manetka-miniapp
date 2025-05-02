export {};

declare global {
  interface TelegramWebAppUser {
    id: number;
    first_name?: string;
    photo_url?: string;
  }

  interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    close?: () => void;
    initData: string;
    initDataUnsafe?: {
      user?: TelegramWebAppUser;
    };
  }

  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
