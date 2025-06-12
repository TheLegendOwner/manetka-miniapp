// src/pages/refs.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useTelegram } from '../context/TelegramContext';
import {
  Wallet,
  Gamepad2,
  Image as ImageIcon,
  Users,
  Share2,
  ArrowLeft,
  Copy,
  Send
} from 'lucide-react';
import Image from 'next/image';
import '../lib/i18n';

const referrals = [
  { first_name: 'Alex', last_name: 'Ivanov', username: 'alexivanov', rewards: '1.23 TON' },
  { first_name: 'Maria', last_name: 'Petrova', username: 'mariap',    rewards: '0.85 TON' },
  { first_name: 'John',  last_name: 'Smith',   username: 'johnsmith', rewards: '0.36 TON' }
];

export default function RefsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, ready } = useTelegram();
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();
  const [referralLink, setReferralLink] = useState('');

  // Redirect if WebApp not ready, no user or wallet
  useEffect(() => {
    if (ready && (!user || !tonAddress)) {
      router.replace('/');
    }
  }, [ready, user, tonAddress, router]);

  // Build dynamic referral link from Telegram user id
  useEffect(() => {
    if (ready && user) {
      setReferralLink(`https://t.me/manetka_bot/app?startapp=ref${user.id}`);
    }
  }, [ready, user]);

  const copyReferral = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
    }
  };

  const shareReferral = () => {
    if (!referralLink) return;
    const shareText = `${t('join_manetka')}: ${referralLink}`;
    if (navigator.share) {
      navigator.share({ title: 'Manetka', text: shareText, url: referralLink });
    } else {
      alert(t('share_not_supported'));
    }
  };

  if (!ready || !user || !tonAddress) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] font-['Aboreto']">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-semibold text-[#171A1F] uppercase">
            {t('refs')}
          </h1>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-6 px-4 pt-6 pb-28">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-2">
          <div className="flex justify-between text-[14px] text-[#171A1F] font-medium">
            <span>{t('number_of_referrals')}</span>
            <span>{referrals.length}</span>
          </div>
          <div className="flex justify-between text-[14px] text-[#171A1F] font-medium">
            <span>{t('referral_share')}</span>
            <span>2.44 TON</span> {/* Could compute dynamically */}
          </div>
          <div className="text-[12px] text-[#9095A1] mt-2">{t('your_referral_link')}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-[#F9FAFB] text-[14px] text-[#171A1F] border border-gray-200 rounded-full px-4 py-2 break-all">
              {referralLink}
            </div>
            <button onClick={copyReferral} className="text-[#EBB923]">
              <Copy size={24} />
            </button>
            <button onClick={shareReferral} className="text-[#EBB923]">
              <Send size={24} />
            </button>
          </div>
        </div>

        {/* Detailed list */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {referrals.map((ref, idx) => (
            <div key={idx} className="flex justify-between items-center p-4">
              <div className="flex flex-col">
                <span className="text-[14px] font-medium text-[#171A1F]">
                  {ref.first_name} {ref.last_name}
                </span>
                <span className="text-[12px] text-[#9095A1]">
                  @{ref.username}
                </span>
              </div>
              <div className="text-[14px] font-semibold text-[#171A1F]">
                {ref.rewards}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-2 px-4 flex justify-between items-center shadow-md">
        <button onClick={() => router.push('/wallet')}
                className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Wallet size={24} className="mb-1" />
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
        <button onClick={() => router.push('/social')}
                className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Share2 size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('social')}</span>
        </button>
        <button onClick={() => router.push('/refs')}
                className="w-1/5 flex flex-col items-center text-[#EBB923] hover:text-yellow-600">
          <Users size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('refs')}</span>
        </button>
      </div>
    </div>
);
}
