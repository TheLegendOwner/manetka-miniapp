// src/pages/wallet.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Моки токенов
const tokens = [
  {
    name: 'MANETKA',
    logo: '/token-manetka.png',
    balance: '1,250',
    usd: '$220.00',
    rewards: '3.2 TON',
  },
  {
    name: 'TONCOIN',
    logo: '/token-ton.png',
    balance: '500',
    usd: '$1,050.00',
    rewards: '1.8 TON',
  }
];

export default function WalletPage() {
  const [tonConnectUI] = useTonConnectUI();
  const isConnected = tonConnectUI?.connected;
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected]);

  // Мок Telegram User
  const tgUser = {
    username: 'ton_user',
    avatar: '/tg-avatar.png'
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">TOKEN ASSETS</h1>
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image src={tgUser.avatar} alt="avatar" width={40} height={40} />
        </div>
      </div>

      {/* Token list */}
      <div className="flex-1 p-4 space-y-4">
        {tokens.map((token, idx) => (
          <div
            key={idx}
            className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <Image
              src={token.logo}
              alt={token.name}
              width={48}
              height={48}
              className="mr-4"
            />
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800">{token.name}</span>
              <span className="text-sm text-gray-600">Balance: {token.balance}</span>
              <span className="text-sm text-gray-600">In USD: {token.usd}</span>
              <span className="text-sm text-green-600 font-medium">Rewards: {token.rewards}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer navigation */}
      <div className="border-t border-gray-200 p-2 bg-white flex justify-around">
        {/* Можно подключить react-icons или lucide-react */}
        <button className="flex flex-col items-center text-gray-700">
          <span className="text-sm">Wallet</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <span className="text-sm">Account</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <span className="text-sm">Refs</span>
        </button>
      </div>
    </div>
  );
}
