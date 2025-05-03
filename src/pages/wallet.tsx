// src/pages/wallet.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTonConnectUI } from '@tonconnect/ui-react';
import Image from 'next/image';
import { Wallet, Gamepad2, Image as ImageIcon, Users, Share2 } from 'lucide-react';

const tokens = [
  {
    name: 'MANETKA',
    logo: '/token-manetka.png',
    balance: '1,250 MNTK',
    usd: '$220.00',
    ton: '70 TON',
    rewards: '3.2 TON'
  },
  {
    name: 'SIMPLE COIN',
    logo: '/token-ton.png',
    balance: '1,000,000 SC',
    usd: '$1,050.00',
    ton: '500 TON',
    rewards: '1.8 TON'
  }
];

export default function WalletPage() {
  const [tonConnectUI] = useTonConnectUI();
  const router = useRouter();
  const [connected, setConnected] = useState(!!tonConnectUI?.account?.address);
  const [avatar, setAvatar] = useState('/tg-avatar.png');

  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange(wallet => {
      const isConnected = !!wallet?.account?.address;
      setConnected(isConnected);
      if (!isConnected) {
        router.replace('/');
      }
    });
    return () => unsubscribe();
  }, [tonConnectUI]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const photo = window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;
      console.log('TG photo_url:', photo);
      if (photo) {
        setAvatar(photo);
      }
    }
  }, []);

  if (!connected) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] font-['Aboreto']">
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-[20px] font-semibold text-[#171A1F]">TOKEN ASSETS</h1>
        <div
          className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 cursor-pointer"
          onClick={() => router.push('/account')}
        >
          <Image src={avatar} alt="avatar" width={36} height={36} />
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-24 space-y-4">
        {tokens.map((token, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col w-full mr-4">
              <span className="text-[20px] font-bold text-[#171A1F] leading-tight">{token.name}</span>
              <span className="text-[12px] text-[#9095A1]">BALANCE: {token.balance}</span>
              <span className="text-[12px] text-[#9095A1]">BALANCE IN USD: {token.usd}</span>
              <span className="text-[12px] text-[#9095A1]">BALANCE IN TON: {token.ton}</span>
              <span className="text-[13px] text-green-600 font-bold">REWARDS: {token.rewards}</span>
              <button
                className="mt-2 w-full border border-[#8B6C0D] text-[#8B6C0D] text-sm py-1 rounded-full bg-white"
              >
                Buy | Sell
              </button>
            </div>
            <Image src={token.logo} alt={token.name} width={48} height={48} />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-2 px-4 flex justify-between items-center shadow-md">
        <button onClick={() => router.push('/wallet')} className="flex flex-col items-center text-[#EBB923] hover:text-yellow-600">
          <Wallet size={24} className="mb-1" />
          <span className="text-[12px] font-medium">Wallet</span>
        </button>
        <button onClick={() => router.push('/lottery')} className="flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Gamepad2 size={24} className="mb-1" />
          <span className="text-[12px] font-medium">Games</span>
        </button>
        <button onClick={() => router.push('/nfts')} className="flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <ImageIcon size={24} className="mb-1" />
          <span className="text-[12px] font-medium">NFTs</span>
        </button>
        <button onClick={() => router.push('/social')} className="flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Share2 size={24} className="mb-1" />
          <span className="text-[12px] font-medium">Social</span>
        </button>
        <button onClick={() => router.push('/refs')} className="flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Users size={24} className="mb-1" />
          <span className="text-[12px] font-medium">Refs</span>
        </button>
      </div>
    </div>
  );
}
