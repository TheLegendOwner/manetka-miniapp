'use client';

import { AppProps } from 'next/app';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { TelegramProvider } from '../context/TelegramContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TonConnectUIProvider manifestUrl="https://your-domain.com/tonconnect-manifest.json">
      <TelegramProvider>
        <Component {...pageProps} />
      </TelegramProvider>
    </TonConnectUIProvider>
  );
}