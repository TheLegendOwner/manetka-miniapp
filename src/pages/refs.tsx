// src/pages/refs.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useTonAddress } from '@tonconnect/ui-react';
import { useTelegram } from '../context/TelegramContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Copy,
  Send,
  Wallet,
  Gamepad2,
  Image as ImageIcon,
  Users,
  Share2
} from 'lucide-react';
import '../lib/i18n';
import Image from "next/image";

interface Referral {
  first_name: string;
  last_name: string;
  username: string;
  avatar: string;
  rewards_total: number;
  rewards_unclaimed: number; // e.g. "1.23 TON"
}

export default function RefsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, ready: tgReady } = useTelegram();
  const { token, loading: authLoading } = useAuth();
  const tonAddress = useTonAddress();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [rewardsTotal, setRewardsTotal] = useState<number>(0);
  const [rewardsUnclaimed, setRewardsUnclaimed] = useState<number>(0);

  // Redirect if not authenticated or wallet not connected
  useEffect(() => {
    if (tgReady && (!token || !tonAddress)) {
      router.replace('/');
    }
  }, [tgReady, token, tonAddress, router]);

  // Build referral link and fetch real referrals from API
  useEffect(() => {
    if (tgReady && token && tonAddress && user) {
      setReferralLink(`https://t.me/manetkawallet_bot/app?startapp=ref${user.id}`);

      (async () => {
        try {
          const res = await fetch('/api/referrals', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          // assume API returns { data: { referrals: Referral[] } }
          const list: Referral[] = json.data.referrals;
          setReferrals(list);
          setRewardsTotal(json.data.rewards_total);
          setRewardsUnclaimed(json.data.rewards_unclaimed);
        } catch (err) {
          console.error('Failed to fetch referrals', err);
        }
      })();
    }
  }, [tgReady, token, tonAddress, user]);

  if (authLoading || !user || !tonAddress) {
    return null;
  }

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
  };
  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Manetka',
        text: `${t('join_manetka')}: ${referralLink}`,
        url: referralLink
      });
    } else {
      alert(t('share_not_supported'));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] font-['Aboreto']">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold uppercase">{t('refs')}</h1>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-6 px-4 pt-6 pb-28">
        <div className="bg-white p-4 rounded-xl border flex flex-col gap-2">
          <div className="flex justify-between text-sm font-medium">
            <span>{t('number_of_referrals')}</span>
            <span>{referrals.length}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>{t('referral_share')}</span>
            <span>{rewardsTotal.toFixed(2)} TON</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>{t('referral_unclaimed')}</span>
            <span>{rewardsUnclaimed.toFixed(2)} TON</span>
          </div>
          <div className="text-xs text-gray-500">{t('your_referral_link')}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-100 text-sm border rounded-full px-4 py-2 break-all">
              {referralLink}
            </div>
            <button onClick={copyReferral} className="text-yellow-600">
              <Copy size={24} />
            </button>
            <button onClick={shareReferral} className="text-yellow-600">
              <Send size={24} />
            </button>
          </div>
        </div>

        {/* Detailed list */}
        <div className="bg-white rounded-xl border divide-y divide-gray-100">
          {referrals.map((ref, i) => (
            <div key={i} className="flex justify-between items-center p-4">
              <div className="w-[75px] h-[75px] rounded-full overflow-hidden border border-gray-300">
                <Image
                    src={ref.avatar}
                    alt="avatar"
                    width={30}
                    height={30}
                    unoptimized
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {ref.first_name} {ref.last_name}
                </span>
                <span className="text-xs text-gray-500">@{ref.username}</span>
              </div>
              <div className="text-sm font-semibold">{ref.rewards_total.toFixed(2)} TON</div>
              <div className="text-sm font-semibold">{ref.rewards_unclaimed.toFixed(2)} TON</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 inset-x-0 border-t bg-white py-2 px-4 flex justify-between">
        <button
          onClick={() => router.push('/wallet')}
          className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600"
        >
          <Wallet size={24} className="mb-1" />
          <span className="text-xs">{t('wallet')}</span>
        </button>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <Gamepad2 size={24} className="mb-1 opacity-50" />
          <span className="text-xs">{t('games')}</span>
        </div>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <ImageIcon size={24} className="mb-1 opacity-50" />
          <span className="text-xs">{t('nfts')}</span>
        </div>
        <button
          onClick={() => router.push('/social')}
          className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600"
        >
          <Share2 size={24} className="mb-1" />
          <span className="text-xs">{t('social')}</span>
        </button>
        <button
          onClick={() => router.push('/refs')}
          className="w-1/5 flex flex-col items-center text-[#EBB923] hover:text-yellow-600"
        >
          <Users size={24} className="mb-1" />
          <span className="text-xs">{t('refs')}</span>
        </button>
      </div>
    </div>
  );
}
