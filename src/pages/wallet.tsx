// src/pages/wallet.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  useTonConnectUI,
  useTonWallet,
  useTonAddress,
  useIsConnectionRestored
} from '@tonconnect/ui-react';
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

interface WalletInfo {
  wallet_id: number;
  address: string;
  connected_at: string;
}

interface BalancesResponse {
  code: number;
  data: { balances: Array<{ token: string; sums: Record<'balance'|'usd'|'ton', number> }> };
}

interface RewardsResponse {
  code: number;
  data: { rewards: Array<{ token: string; amount: number }> };
}

interface ProofPayloadResponse {
  code: number;
  data: { payload: string; timestamp: number };
}

function WalletPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { ready: tgReady } = useTelegram();
  const { token, loading: authLoading } = useAuth();

  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const tonAddress = useTonAddress();
  const isRestored = useIsConnectionRestored();

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
  const intervalRef = useRef<number>();

  // 1) Подтягиваем payload каждые 20 мин после восстановления соединения
  useEffect(() => {
    if (!isRestored || !token) return;
    clearInterval(intervalRef.current);
    const refresh = async () => {
      tonConnectUI.setConnectRequestParameters({ state: 'loading' });
      try {
        const res = await fetch('/api/proof-payload', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json: ProofPayloadResponse = await res.json();
        tonConnectUI.setConnectRequestParameters({
          state: 'ready',
          value: json.data.payload
        });
      } catch {
        tonConnectUI.setConnectRequestParameters(null);
      }
    };
    refresh();
    intervalRef.current = window.setInterval(refresh, 20 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRestored, token, tonConnectUI]);

  // 2) Когда подключённый кошелёк имеет proof — сразу шлём на верификацию
  useEffect(() => {
    if (!wallet?.connectItems?.tonProof || !token) return;
    const { proof } = wallet.connectItems.tonProof;
    const account = wallet.account;
    (async () => {
      try {
        await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ account, proof })
        });
        await loadData();
      } catch (err) {
        console.error('Wallet verification failed', err);
        tonConnectUI.disconnect();
      }
    })();
  }, [wallet, token]);

  // 3) Функция загрузки списка кошельков + балансов/наград
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const wRes = await fetch('/api/wallets', {
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
      const { data: { rewards } }: RewardsResponse   = await rRes.json();

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
      console.error('Fetch data failed', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 4) После успешной верификации или прямого подключения, если есть tonAddress
  useEffect(() => {
    if (token && tonAddress) {
      loadData();
    }
  }, [token, tonAddress, loadData]);

  // 5) Set main wallet
  const handleSetMain = async (walletId: number) => {
    if (!token) return;
    try {
      await fetch(`/api/wallets/${walletId}/set_main`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadData();
    } catch (err) {
      console.error('Set main wallet failed', err);
    }
  };

  // Редирект только по отсутствию JWT
  useEffect(() => {
    if (!authLoading && !token) router.replace('/');
  }, [authLoading, token, router]);

  if (authLoading || loading) {
    return <p className="p-4 text-center">Loading…</p>;
  }

  // Если ещё не подключен TON-кошелёк — показываем кнопку
  if (!tonAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
        <button
          onClick={() => tonConnectUI.openModal()}
          className="w-[300px] h-[50px] bg-[#EBB923] hover:bg-[#e2aa14] text-gray-900 font-semibold rounded-full"
        >
          {t('connect')}
        </button>
      </div>
    );
  }

  // Основной UI со списком токенов
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
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

export default dynamic(() => Promise.resolve(WalletPage), { ssr: false });
