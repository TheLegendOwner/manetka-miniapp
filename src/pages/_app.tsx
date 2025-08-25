// src/pages/_app.tsx
'use client';

import { useEffect } from 'react';
import { AppProps } from 'next/app';
import '../lib/i18n';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { TelegramProvider } from '../context/TelegramContext';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  // Запрет pinch-to-zoom на мобильных устройствах
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

  // Абсолютный путь к манифесту TonConnect на клиенте
  const manifestUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tonconnect-manifest.json`
    : undefined;

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <TelegramProvider>
        <AuthProvider>
          <Component {...pageProps} />
          <ToastContainer position="top-right" autoClose={4000}
                          style={{ zIndex: 2147483647 }}/>
        </AuthProvider>
      </TelegramProvider>
    </TonConnectUIProvider>
  );
}
