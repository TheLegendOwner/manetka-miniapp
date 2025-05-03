// src/pages/index.tsx
'use client';

import React from 'react';
import { useTonConnectUI, TonConnectUIProvider } from '@tonconnect/ui-react';

export default function MainPage() {
  const [tonConnectUI] = useTonConnectUI();
  const isConnected = tonConnectUI?.connected ?? false;

  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <div className="flex flex-col justify-center items-center min-h-screen bg-white px-6 relative">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="Manetka Logo" className="w-32 h-32 mb-6" />
          <h1 className="text-[22px] font-bold text-gray-900 mb-2 text-center">
            MANETKA WALLET
          </h1>
          <p className="text-sm text-gray-600 text-center max-w-[320px] leading-snug">
            All reward tokens in one place with MANETKA WALLET
          </p>
        </div>

        <div className="absolute bottom-[50px] w-full flex justify-center">
          {isConnected ? (
            <button
              onClick={() => tonConnectUI?.disconnect()}
              className="w-[350px] h-[52px] bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-full shadow-md"
            >
              Disconnect Wallet
            </button>
          ) : (
            <button
              onClick={() => tonConnectUI?.openModal()}
              className="w-[350px] h-[52px] bg-[#EBB923] hover:bg-[#e2aa14] text-gray-900 font-semibold text-base rounded-full shadow-md"
            >
              Connect your TON Wallet
            </button>
          )}
        </div>
      </div>
    </TonConnectUIProvider>
  );
}
