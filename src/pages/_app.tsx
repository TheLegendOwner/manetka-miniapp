// src/pages/_app.tsx
'use client';

import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { TelegramProvider } from '../context/TelegramContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
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

  const manifestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tonconnect-manifest.json`;

  // Приводим NEXT_PUBLIC_APP_URL к нужному шаблону и гарантируем, что это не undefined
  const twaReturnUrl = (process.env.NEXT_PUBLIC_APP_URL! as `${string}://${string}`);

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        // Теперь тип совпадает: мы заявляем, что NEXT_PUBLIC_APP_URL имеет формат "https://..."
        twaReturnUrl
      }}
    >
      <TelegramProvider>
        <Component {...pageProps} />
      </TelegramProvider>
    </TonConnectUIProvider>
  );
}
