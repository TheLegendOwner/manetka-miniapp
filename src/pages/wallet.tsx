// src/pages/wallet.tsx (full updated code)
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import {
  Wallet as WalletIcon,
  Gamepad2,
  Image as ImageIcon,
  Users,
  Share2
} from 'lucide-react';

interface BalancesResponse {
  code: number;
  data: { balances: Array<{ token: string; sums: Record<'balance' | 'usd' | 'ton', number> }> };
}
interface RewardsResponse {
  code: number;
  data: { rewards: Array<{ token: string; amount: number }> };
}
interface ProofPayloadResponse {
  code: number;
  data: { payload: string; timestamp: number };
}

export default function WalletPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { token, loading: authLoading } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();

  const [tokens, setTokens] = useState<Array<{
    token: string;
    balance: number;
    usd: number;
    ton: number;
    rewards: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const connectTonWallet = useCallback(async () => {
    if (!token) return;
    try {
      const ppRes = await fetch('/api/proof-payload', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { data: { payload, timestamp } }: ProofPayloadResponse = await ppRes.json();

      const proof = await (tonConnectUI as any).requestProof({ payload, timestamp });

      await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ account: tonConnectUI.account, proof })
      });

      // After successful verify, reload wallets & balances
      await fetchWalletsAndData();
    } catch (err) {
      console.error('Connect wallet failed', err);
    }
  }, [token, tonConnectUI]);

  const fetchWalletsAndData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const wRes = await fetch('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { data: { wallets } } = await wRes.json();

      if (wallets.length === 0) {
        // First time: server has no wallets, but user may have connected TON address
        // Prompt connect flow
        await connectTonWallet();
        return;
      }

      // Aggregate balances and rewards across all wallets
      const balMap = new Map<string, { balance: number; usd: number; ton: number }>();
      const rewMap = new Map<string, number>();

      for (const w of wallets) {
        const [bRes, rRes] = await Promise.all([
          fetch(`/api/balances/${w.wallet_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`/api/rewards/${w.wallet_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        const { data: { balances } }: BalancesResponse = await bRes.json();
        const { data: { rewards } }: RewardsResponse = await rRes.json();

        balances.forEach(b => {
          const prev = balMap.get(b.token) ?? { balance: 0, usd: 0, ton: 0 };
          balMap.set(b.token, {
            balance: prev.balance + b.sums.balance,
            usd: prev.usd + b.sums.usd,
            ton: prev.ton + b.sums.ton
          });
        });
        rewards.forEach(r => {
          rewMap.set(r.token, (rewMap.get(r.token) ?? 0) + r.amount);
        });
      }

      setTokens(
        Array.from(balMap.entries()).map(([token, sums]) => ({
          token,
          balance: sums.balance,
          usd: sums.usd,
          ton: sums.ton,
          rewards: rewMap.get(token) ?? 0
        }))
      );
    } catch (e) {
      console.error('Fetch wallet data failed', e);
    } finally {
      setLoading(false);
    }
  }, [token, connectTonWallet]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/');
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (token && tonAddress) {
      fetchWalletsAndData();
    }
  }, [token, tonAddress, fetchWalletsAndData]);

  if (authLoading || loading) {
    return <p className="p-4 text-center">Loading…</p>;
  }

  if (!tonAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
        <button
          onClick={connectTonWallet}
          className="w-[300px] h-[50px] bg-[#EBB923] hover:bg-[#e2aa14] text-gray-900 font-semibold rounded-full"
        >
          {t('connect')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-white">
        <h1 className="text-lg font-semibold uppercase">{t('token_assets')}</h1>
      </div>
      {/* Tokens */}
      <div className="flex-1 px-4 pt-4 pb-24 space-y-4">
        {tokens.map(tok => (
          <div
            key={tok.token}
            className="flex justify-between items-center bg-white border rounded-2xl px-4 py-3 shadow-sm"
          >
            <div>
              <p className="font-bold text-lg">{tok.token}</p>
              <p className="text-sm text-gray-500">
                {t('balance')}: {tok.balance.toFixed(4)}
              </p>
              <p className="text-sm text-gray-500">
                {t('balance_usd')}: ${tok.usd.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {t('balance_ton')}: {tok.ton.toFixed(4)} TON
              </p>
              <p className="text-sm text-green-600 font-semibold">
                {t('rewards')}: {tok.rewards.toFixed(4)} TON
              </p>
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
          className="w-1/5 flex flex-col items-center text-[#EBB923]"
        >
          <WalletIcon size={24} />
          <span className="text-xs">{t('wallet')}</span>
        </button>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <Gamepad2 size={24} />
          <span className="text-xs">{t('games')}</span>
        </div>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <ImageIcon size={24} />
          <span className="text-xs">{t('nfts')}</span>
        </div>
        <button
          onClick={() => router.push('/social')}
          className="w-1/5 flex flex-col items-center text-gray-500"
        >
          <Share2 size={24} />
          <span className="text-xs">{t('social')}</span>
        </button>
        <button
          onClick={() => router.push('/refs')}
          className="w-1/5 flex flex-col	items-center text-gray-500"
        >
          <Users size={24} />
          <span className="text-xs">{t('refs')}</span>
        </button>
      </div>
    </div>
  );
}
