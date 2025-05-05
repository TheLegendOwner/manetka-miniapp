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
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', onGestureStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // Используем URL из переменных окружения
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const manifestUrl = `${baseUrl.replace(/\/$/, '')}/tonconnect-manifest.json`;

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
    >
      <TelegramProvider>
        <Component {...pageProps} />
      </TelegramProvider>
    </TonConnectUIProvider>
  );
}