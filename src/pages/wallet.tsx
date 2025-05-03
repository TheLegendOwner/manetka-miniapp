// src/pages/wallet.tsx
'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { User } from 'lucide-react';

// Моки токенов
const tokens = [
  {
    name: 'MANETKA',
    logo: '/token-manetka.png',
    balance: '1,250 MNTK',
    usd: '$220.00',
    rewards: '3.2 TON',
  },
  {
    name: 'TONCOIN',
    logo: '/token-ton.png',
    balance: '500 TON',
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
    <div className="flex flex-col min-h-screen bg-white font-['Aboreto']">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
        <h1 className="text-[20px] font-semibold text-gray-900 tracking-wide">TOKEN ASSETS</h1>
        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-300">
          <Image src={tgUser.avatar} alt="avatar" width={36} height={36} />
        </div>
      </div>

      {/* Token list */}
      <div className="flex-1 px-4 pt-4 pb-24 space-y-4 bg-[#F9FAFB]">
        {tokens.map((token, idx) => (
          <div
            key={idx}
            className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm"
          >
            <Image
              src={token.logo}
              alt={token.name}
              width={48}
              height={48}
              className="mr-4"
            />
            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-gray-900 leading-tight">{token.name}</span>
              <span className="text-[13px] text-gray-600">Balance: {token.balance}</span>
              <span className="text-[13px] text-gray-600">In USD: {token.usd}</span>
              <span className="text-[13px] text-green-600 font-medium">Rewards: {token.rewards}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-2 px-6 flex justify-between items-center shadow-md">
        <button className="flex flex-col items-center text-[#EBB923]">
          <svg width="24" height="24" fill="currentColor" className="mb-1">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
            10-4.48 10-10S17.52 2 12 2zm0 17.5c-1.38
            0-2.75-.35-3.94-1.02L12 13l3.94 5.48c-1.19.67-2.56
            1.02-3.94 1.02z" />
          </svg>
          <span className="text-[12px] font-medium">Wallet</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <User size={24} className="mb-1" />
          <span className="text-[12px] font-medium">Account</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1">
            <path d="M4 17l6-6-6-6" /><path d="M12 17l6-6-6-6" />
          </svg>
          <span className="text-[12px] font-medium">Refs</span>
        </button>
      </div>
    </div>
  );
}
