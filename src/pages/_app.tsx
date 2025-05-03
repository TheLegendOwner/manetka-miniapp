// src/pages/_app.tsx
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: any) {
  return (
    <TonConnectUIProvider manifestUrl="https://manetka-miniapp-rufp.vercel.app/tonconnect-manifest.json">
      <Component {...pageProps} />
    </TonConnectUIProvider>
  );
}
