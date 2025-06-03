// src/pages/_app.tsx
'use client';

import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { TelegramProvider } from '../context/TelegramContext';
import { SocketProvider } from '../context/WebSocketContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Запрет pinch-to-zoom и мультитач на мобильных устройствах
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

  // Абсолютный путь к манифесту для TonConnect UI
  const manifestUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/tonconnect-manifest.json`
      : undefined;

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <TelegramProvider>
        <SocketProvider>
          <Component {...pageProps} />
        </SocketProvider>
      </TelegramProvider>
    </TonConnectUIProvider>
  );
}
