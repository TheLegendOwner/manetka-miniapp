// types/window.d.ts
export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            photo_url?: string;
          };
        };
      };
    };
  }
}
