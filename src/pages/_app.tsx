// src/pages/_app.tsx
'use client';

import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { TelegramProvider } from '../context/TelegramContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Запрет pinch-to-zoom на мобильных
  useEffect(() => {
    const onGestureStart = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', onGestureStart);

    const onTouchMove = (e: TouchEvent) => {
      // блокируем мультитач (pinch-зум)
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', onGestureStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // Берём базовый URL из .env и приводим к шаблонному типу для раздачи манифеста и TWA-привязки
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const manifestUrl = `${baseUrl}/tonconnect-manifest.json`;
  const twaReturnUrl = (baseUrl as `${string}://${string}`);

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        // чтобы при открытии из TWA можно было «вернуться» в мессенджер
        twaReturnUrl
      }}
    >
      <TelegramProvider>
        <Component {...pageProps} />
      </TelegramProvider>
    </TonConnectUIProvider>
  );
}
