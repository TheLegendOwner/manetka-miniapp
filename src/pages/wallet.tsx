// src/pages/wallet.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTonWallet } from '@tonconnect/ui-react';
import Image from 'next/image';
import {
  Wallet as WalletIcon,
  Gamepad2,
  Image as ImageIcon,
  Users,
  Share2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../context/TelegramContext';
import '../lib/i18n';

const tokens = [
  {
    name: 'MANETKA',
    logo: '/token-manetka.png',
    balance: '1,250 MNTK',
    usd: '$220.00',
    ton: '70 TON',
    rewards: '3.2 TON',
  },
  {
    name: 'SIMPLE COIN',
    logo: '/token-ton.png',
    balance: '1,000,000 SC',
    usd: '$1,050.00',
    ton: '500 TON',
    rewards: '1.8 TON',
  },
];

export default function WalletPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, ready } = useTelegram();
  const wallet = useTonWallet();
const avatarSrc =
    user?.photo_url || `/icons/avatar${Math.floor(Math.random() * 11) + 1}.svg`;
	
	
  useEffect(() => {
    if (ready) {
      if (!user || wallet === null) {
        router.replace('/');
      }
    }
  }, [ready, user, wallet, router]);

  if (!ready || wallet === undefined || wallet === null) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] font-['Aboreto']">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-[20px] font-semibold text-[#171A1F] uppercase">
          {t('token_assets')}
        </h1>
        <div
          className="w-9 h-9 rounded-full overflow-hidden cursor-pointer"
          onClick={() => router.push('/account')}
        >
          <Image
            src={user?.photo_url || '/icons/avatar_default.svg'}
            alt="avatar"
            width={36}
            height={36}
            unoptimized
          />
        </div>
      </div>

      {/* Token List */}
      <div className="flex-1 px-4 pt-4 pb-24 space-y-4">
        {tokens.map((token, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col w-full mr-4">
              <span className="text-[20px] font-bold text-[#171A1F] leading-tight">
                {token.name}
              </span>
              <span className="text-[12px] text-[#9095A1]">
                {t('balance')}: {token.balance}
              </span>
              <span className="text-[12px] text-[#9095A1]">
                {t('balance_usd')}: {token.usd}
              </span>
              <span className="text-[12px] text-[#9095A1]">
                {t('balance_ton')}: {token.ton}
              </span>
              <span className="text-[13px] text-green-600 font-bold">
                {t('rewards')}: {token.rewards}
              </span>
              <button className="mt-2 w-full border border-[#8B6C0D] text-[#8B6C0D] text-sm py-1 rounded-full bg-white">
                {t('buy_sell')}
              </button>
            </div>
            <Image src={token.logo} alt={token.name} width={115} height={115} />
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-2 px-4 flex justify-between items-center shadow-md">
        <button
          onClick={() => router.push('/wallet')}
          className="w-1/5 flex flex-col items-center text-[#EBB923] hover:text-yellow-600"
        >
          <WalletIcon size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('wallet')}</span>
        </button>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <Gamepad2 size={24} className="mb-1 opacity-50" />
          <span className="text-[12px] font-medium">{t('games')}</span>
        </div>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <ImageIcon size={24} className="mb-1 opacity-50" />
          <span className="text-[12px] font-medium">{t('nfts')}</span>
        </div>
        <button
          onClick={() => router.push('/social')}
          className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600"
        >
          <Share2 size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('social')}</span>
        </button>
        <button
          onClick={() => router.push('/refs')}
          className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600"
        >
          <Users size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('refs')}</span>
        </button>
      </div>
    </div>
  );
}
