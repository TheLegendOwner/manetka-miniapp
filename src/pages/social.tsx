// src/pages/social.tsx
'use client';

import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Wallet, Gamepad2, Image as ImageIcon, Users, Share2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import '../lib/i18n';

const socials = [
  { name: 'MANETKA Telegram Chanel', icon: '/icons/telegram.svg', url: 'https://manetka.site' },
  { name: 'MANETKA Telegram Chat', icon: '/icons/telegram.svg', url: 'https://manetka.site' },
  { name: 'MANETKA Instagram', icon: '/icons/instagram.svg', url: 'https://manetka.site' },
  { name: 'MANETKA VK Chanel', icon: '/icons/vk.svg', url: 'https://manetka.site' },
  { name: 'MANETKA YouTube Chanel', icon: '/icons/youtube.svg', url: 'https://manetka.site' }
];

export default function SocialPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] font-['Aboreto']">
      <div className="flex items-center justify-between gap-4 py-4 px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-semibold text-[#171A1F] uppercase font-['Aboreto']">{t('socials')}</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-6 pb-24">
        {socials.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Image src={item.icon} alt={item.name} width={44} height={44} />
              <span className="text-[16px] font-normal text-[#171A1F] font-['AbeeZee']">{item.name}</span>
            </div>
          </a>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-2 px-4 flex justify-between items-center shadow-md">
        <button onClick={() => router.push('/wallet')} className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Wallet size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('wallet')}</span>
        </button>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <Gamepad2 size={24} className="mb-1 opacity-50" />
          <span className="text-[12px] font-medium">{t('games')}</span></div>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <ImageIcon size={24} className="mb-1 opacity-50" />
          <span className="text-[12px] font-medium">{t('nfts')}</span></div>
        <button onClick={() => router.push('/social')} className="w-1/5 flex flex-col items-center text-[#EBB923] hover:text-yellow-600">
          <Share2 size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('social')}</span>
        </button>
        <button onClick={() => router.push('/refs')} className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Users size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('refs')}</span>
        </button>
      </div>
    </div>
  );
}
