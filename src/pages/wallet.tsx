// src/pages/wallet.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../context/TelegramContext';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import {
  Wallet as WalletIcon,
  Gamepad2,
  Image as ImageIcon,
  Users,
  Share2
} from 'lucide-react';
import { API_BASE } from '../config/api';

interface WalletInfo {
  wallet_id: number;
  address: string;
  connected_at: string;
}

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
  const { ready: tgReady } = useTelegram();
  const { token, loading: authLoading } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();

  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [mainWalletId, setMainWalletId] = useState<number | null>(null);
  const [tokens, setTokens] = useState<Array<{
    token: string;
    balance: string;
    usd: string;
    ton: string;
    rewards: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletsAndData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const wRes = await fetch(`/api/wallets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { data: { wallets: list } } = await wRes.json();
      setWallets(list);
      const main = list[0];
      setMainWalletId(main.wallet_id);

      const [bRes, rRes] = await Promise.all([
        fetch(`/api/balances/${main.wallet_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/rewards/${main.wallet_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const { data: { balances } }: BalancesResponse = await bRes.json();
      const { data: { rewards } }: RewardsResponse = await rRes.json();

      setTokens(
        balances.map(b => {
          const rw = rewards.find(r => r.token === b.token);
          return {
            token:   b.token,
            balance: b.sums.balance.toString(),
            usd:     b.sums.usd.toFixed(2),
            ton:     b.sums.ton.toString(),
            rewards: rw ? rw.amount.toString() : '0'
          };
        })
      );
    } catch (e) {
      console.error('Fetch wallet data failed', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) router.replace('/');
      else if (!tonAddress) router.replace('/');
    }
  }, [authLoading, token, tonAddress, router]);

  // Initial server-side verification (first load)
  useEffect(() => {
    const verifyWallet = async () => {
      if (!token || !tonConnectUI.account?.address) return;
      try {
        const ppRes = await fetch(`/api/proof-payload`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { data: { payload, timestamp } }: ProofPayloadResponse = await ppRes.json();

        const proof = await (tonConnectUI as any).requestProof({ payload, timestamp });

        await fetch(`/api/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            account: tonConnectUI.account,
            proof
          })
        });

        await fetchWalletsAndData();
      } catch (err) {
        console.error('Initial wallet verification failed', err);
      }
    };

    verifyWallet();
  }, [token, tonConnectUI, fetchWalletsAndData]);

  // Load data whenever token & address exist
  useEffect(() => {
    if (token && tonAddress) {
      fetchWalletsAndData();
    }
  }, [token, tonAddress, fetchWalletsAndData]);

  // Verify newly added wallets
  useEffect(() => {
    if (!token) return;
    const unsub = tonConnectUI.onStatusChange(async wallet => {
      if (wallet?.account?.address) {
        try {
          const ppRes = await fetch(`/api/proof-payload`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const { data: { payload, timestamp } }: ProofPayloadResponse = await ppRes.json();

          const proof = await (tonConnectUI as any).requestProof({ payload, timestamp });

          await fetch(`/api/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              account: wallet.account,
              proof
            })
          });

          await fetchWalletsAndData();
        } catch (err) {
          console.error('New wallet verification failed', err);
        }
      }
    });
    return () => unsub();
  }, [tonConnectUI, token, fetchWalletsAndData]);

  const handleSetMain = async (walletId: number) => {
    if (!token) return;
    try {
      await fetch(`/api/wallets/${walletId}/set_main`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchWalletsAndData();
    } catch (err) {
      console.error('Set main wallet failed', err);
    }
  };

  if (authLoading || loading) {
    return <p className="p-4 text-center">Loading…</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      {/* Header with selector */}
      <div className="flex justify-between items-center px-5 py-4 border-b bg-white">
        <h1 className="text-lg font-semibold uppercase">{t('token_assets')}</h1>
        <div className="flex space-x-2">
          {wallets.map(w => (
            <button
              key={w.wallet_id}
              onClick={() => handleSetMain(w.wallet_id)}
              className={`px-3 py-1 rounded-full text-sm ${
                w.wallet_id === mainWalletId
                  ? 'bg-[#EBB923] text-black'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {w.address.slice(0, 6)}…{w.address.slice(-4)}
            </button>
          ))}
        </div>
      </div>

      {/* Token list */}
      <div className="flex-1 px-4 pt-4 pb-24 space-y-4">
        {tokens.map((tok, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-white border rounded-2xl px-4 py-3 shadow-sm"
          >
            <div>
              <p className="font-bold text-lg">{tok.token}</p>
              <p className="text-sm text-gray-500">{t('balance')}: {tok.balance}</p>
              <p className="text-sm text-gray-500">{t('balance_usd')}: {tok.usd}</p>
              <p className="text-sm text-gray-500">{t('balance_ton')}: {tok.ton}</p>
              <p className="text-sm text-green-600 font-semibold">{t('rewards')}: {tok.rewards}</p>
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

      {/* Bottom nav */}
      <div className="fixed bottom-0 inset-x-0 border-t bg-white py-2 px-4 flex justify-between">
        <button onClick={() => router.push('/wallet')} className="w-1/5 flex flex-col items-center text-[#EBB923]">
          <WalletIcon size={24} /><span className="text-xs">{t('wallet')}</span>
        </button>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <Gamepad2 size={24} /><span className="text-xs">{t('games')}</span>
        </div>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <ImageIcon size={24} /><span className="text-xs">{t('nfts')}</span>
        </div>
        <button onClick={() => router.push('/social')} className="w-1/5 flex flex-col items-center text-gray-500">
          <Share2 size={24} /><span className="text-xs">{t('social')}</span>
        </button>
        <button onClick={() => router.push('/refs')} className="w-1/5 flex flex-col items-center text-gray-500">
          <Users size={24} /><span className="text-xs">{t('refs')}</span>
        </button>
      </div>
    </div>
  );
}
