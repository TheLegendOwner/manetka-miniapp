// src/pages/wallet.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../context/TelegramContext';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import {
  Wallet,
  Gamepad2,
  Image as ImageIcon,
  Users,
  Share2
} from 'lucide-react';

interface BalancesResponse {
  code: number;
  data: { balances: Array<{ token: string; sums: Record<string, number> }> };
}
interface RewardsResponse {
  code: number;
  data: { rewards: Array<{ token: string; amount: number }> };
}

export default function WalletPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, ready: tgReady } = useTelegram();
  const { token, loading: authLoading } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();

  const [walletId, setWalletId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Array<{
    token: string;
    balance: string;
    usd: string;
    ton: string;
    rewards: string;
  }>>([]);

  // Редирект, если не авторизованы или кошелёк не подключён
  useEffect(() => {
    if (tgReady && !token) {
      router.replace('/');
    } else if (tgReady && !tonAddress) {
      router.replace('/');
    }
  }, [tgReady, token, tonAddress, router]);

  // Загрузка балансов и наград
  useEffect(() => {
    if (!token || !tonAddress) return;

    (async () => {
      setLoading(true);
      try {
        // 1. GET /api/wallets
        const wRes = await fetch('/api/wallets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const wJson = await wRes.json();
        const main = wJson.data.wallets[0];
        setWalletId(main.wallet_id);

        // 2. GET /api/balances/{walletId}
        const bRes = await fetch(`/api/balances/${main.wallet_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const bJson: BalancesResponse = await bRes.json();

        // 3. GET /api/rewards/{walletId}
        const rRes = await fetch(`/api/rewards/${main.wallet_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const rJson: RewardsResponse = await rRes.json();

        // 4. Merge
        const merged = bJson.data.balances.map(b => {
          const rw = rJson.data.rewards.find(r => r.token === b.token);
          return {
            token: b.token,
            balance: b.sums.balance?.toString() ?? '0',
            usd: b.sums.usd?.toFixed(2) ?? '0.00',
            ton: b.sums.ton?.toString() ?? '0',
            rewards: rw ? rw.amount.toString() : '0'
          };
        });
        setTokens(merged);
      } catch (e) {
        console.error('Fetch wallet data failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, tonAddress]);

  if (authLoading || loading) {
    return <p className="p-4 text-center">Loading…</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] font-['Aboreto']">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b bg-white">
        <h1 className="text-lg font-semibold uppercase">{t('token_assets')}</h1>
        <div
          className="w-9 h-9 rounded-full overflow-hidden cursor-pointer"
          onClick={() => router.push('/account')}
        >
          <Image
            src={user?.photo_url || '/icons/avatar-default.svg'}
            alt="avatar"
            width={36}
            height={36}
            unoptimized
          />
        </div>
      </div>

      {/* Token List */}
      <div className="flex-1 px-4 pt-4 pb-24 space-y-4">
        {tokens.map((tok, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-white border rounded-2xl px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col w-full mr-4">
              <span className="text-xl font-bold">{tok.token}</span>
              <span className="text-sm text-gray-500">Balance: {tok.balance}</span>
              <span className="text-sm text-gray-500">USD: {tok.usd}</span>
              <span className="text-sm text-gray-500">TON: {tok.ton}</span>
              <span className="text-sm text-green-600 font-semibold">
                Rewards: {tok.rewards}
              </span>
            </div>
            <Image
              src={`/token-${tok.token.toLowerCase()}.png`}
              alt={tok.token}
              width={64}
              height={64}
            />
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 inset-x-0 border-t bg-white py-2 px-4 flex justify-between">
        <button
          onClick={() => router.push('/wallet')}
          className="w-1/5 flex flex-col items-center text-[#EBB923] hover:text-yellow-600"
        >
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
