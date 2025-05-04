// src/pages/_app.tsx
'use client';

import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { TelegramProvider } from '../context/TelegramContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // iOS pinch-to-zoom
    const onGestureStart = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', onGestureStart);

const onTouchMove = (e: TouchEvent) => {
  // Блокируем мультитач (pinch-зум)
  if (e.touches && e.touches.length > 1) {
    e.preventDefault();
  }
};
document.addEventListener('touchmove', onTouchMove, { passive: false });



    return () => {
      document.removeEventListener('gesturestart', onGestureStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <TonConnectUIProvider manifestUrl="https://your-domain.com/tonconnect-manifest.json">
      <TelegramProvider>
        <Component {...pageProps} />
      </TelegramProvider>
    </TonConnectUIProvider>
  );
}
