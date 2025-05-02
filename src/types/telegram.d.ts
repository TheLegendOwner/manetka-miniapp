// src/types/telegram.d.ts
export {};

declare global {
  interface TelegramUser {
    id: number;
    first_name?: string;
    photo_url?: string;
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe?: {
      user?: TelegramUser;
    };
    ready: () => void;
    expand: () => void;
    close?: () => void;
  }

  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
