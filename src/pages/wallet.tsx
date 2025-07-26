'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTelegram } from '../context/TelegramContext';
import { toast } from 'react-toastify';
import Image from 'next/image';
import {
  Wallet as WalletIcon,
  Gamepad2,
  Image as ImageIcon,
  Users,
  Share2
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface BalancesResponse {
  code: number;
  data: { balances: Array<{ token: string; logo: string; url: string; sums: Record<'BALANCE' | 'USD' | 'TON' | 'RUB', number> }> };
}
interface RewardsResponse {
  code: number;
  data: { rewards: Array<{ token: string; amount: number }> };
}

interface Wallet {
  wallet_id: string;
  address: string;
  main: boolean;
  connected_at: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { token, loading: authLoading } = useAuth();
  const { user } = useTelegram();

  const [tokens, setTokens] = useState<Array<{
    token: string;
    logo: string;
    url: string;
    balance: number;
    usd: number;
    ton: number;
    rewards: number;
  }>>([]);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('balances');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [rewardsStats, setRewardsStats] = useState<Array<{ token: string; amount: number }>>([]);

  useEffect(() => {
    if (router.query.verified === '1') {
      toast.success(t('wallet_added'));
    }
  }, [router.query]);

  const fetchWalletsAndData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const wRes = await fetch('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { data: { wallets } } = await wRes.json();

      setWallets(wallets.map((w: Wallet & { address?: string }) => ({
        ...w,
        address: w.address.slice(0, 6) + '...' + w.address.slice(w.address.length-7, w.address.length-1)
      })));

      const walletsToProcess = selectedWalletId === 'all'
          ? wallets
          : wallets.filter((w: Wallet) => w.wallet_id === selectedWalletId);

      const balMap = new Map<string, { balance: number; usd: number; rub: number; ton: number }>();
      const rewMap = new Map<string, number>();
      const logoMap = new Map<string, string>();
      const urlMap = new Map<string, string>();

      for (const w of walletsToProcess) {
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
          const prev = balMap.get(b.token) ?? { balance: 0, usd: 0, rub: 0, ton: 0 };
          balMap.set(b.token, {
            balance: prev.balance + b.sums.BALANCE,
            usd: prev.usd + b.sums.USD,
            rub: prev.rub + b.sums.RUB,
            ton: prev.ton + b.sums.TON
          });
          logoMap.set(b.token, b.logo);
          urlMap.set(b.token, b.url);
        });

        rewards.forEach(r => {
          rewMap.set(r.token, (rewMap.get(r.token) ?? 0) + r.amount);
        });
      }

      setTokens(
          Array.from(balMap.entries()).map(([token, sums]) => ({
            token,
            logo: logoMap.get(token) ?? "",
            url: urlMap.get(token) ?? "",
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
  }, [token, selectedWalletId]);

  const fetchRewardsStats = useCallback(async () => {
    if (!token) return;
    try {
      const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
      const from = fromDate ? formatDate(fromDate) : null;
      const to = toDate ? formatDate(toDate) : null;

      const walletsToProcess = selectedWalletId === 'all'
          ? wallets
          : wallets.filter((w: Wallet) => w.wallet_id === selectedWalletId);

      const totalRewards = new Map<string, number>();

      for (const w of walletsToProcess) {
        let endpoint = `/api/rewards/${w.wallet_id}`;
        if (from && to) {
          endpoint = `/api/rewards/${w.wallet_id}/between/${from}/${to}`;
        }

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { data: { rewards } }: RewardsResponse = await res.json();

        rewards.forEach(r => {
          totalRewards.set(r.token, (totalRewards.get(r.token) ?? 0) + r.amount);
        });
      }

      const result = Array.from(totalRewards.entries()).map(([token, amount]) => ({ token, amount }));
      setRewardsStats(result);
    } catch (e) {
      console.error('Failed to fetch reward stats', e);
    }
  }, [token, wallets, selectedWalletId, fromDate, toDate]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/');
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchRewardsStats();
    }
  }, [activeTab, fromDate, toDate, fetchRewardsStats]);

  useEffect(() => {
    if (token) {
      fetchWalletsAndData();
    }
  }, [token, selectedWalletId, fetchWalletsAndData]);

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

        {/* Wallet Select + Tokens */}
        <div className="flex flex-col justify-between bg-white border rounded-2xl px-4 py-3 shadow-sm pt-4 pb-24 space-y-4">
          {/* Select wallet */}
          <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
            <SelectTrigger className="w-full mb-2">
              <SelectValue placeholder={t('select_wallet')} />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white rounded-md shadow-lg">
              <SelectItem value="all">{t('all_wallets')}</SelectItem>
              {wallets.map(w => (
                  <SelectItem key={w.wallet_id} value={w.wallet_id}>
                    {w.address}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Token cards */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="balances">{t('balances')}</TabsTrigger>
              <TabsTrigger value="stats">{t('statistics')}</TabsTrigger>
            </TabsList>

            {/* BALANCES */}
            <TabsContent value="balances">
              {tokens.map(tok => (
                  <div
                      key={tok.token}
                      className="flex flex-col justify-between bg-white border rounded-2xl px-4 py-3 shadow-sm space-y-4 mb-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">{tok.token}</p>
                        <p className="text-sm text-gray-500">{t('balance')}: {tok.balance.toFixed(4)}</p>
                        <p className="text-sm text-gray-500">{t('balance_usd')}: ${tok.usd.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{t('balance_ton')}: {tok.ton.toFixed(4)} TON</p>
                        <p className="text-sm text-green-600 font-semibold">{t('rewards')}: {tok.rewards.toFixed(4)} TON</p>
                      </div>
                      <Image src={tok.logo} alt={tok.token} width={64} height={64} />
                    </div>
                    <button
                        onClick={() => window.open(tok.url, '_blank')}
                        className="w-full h-[40px] bg-[#EBB923] hover:bg-[#e2aa14] text-gray-900 font-semibold text-base rounded-full shadow-md"
                    >
                      {t('trade_button')}
                    </button>
                  </div>
              ))}
            </TabsContent>

            {/* STATS */}
            <TabsContent value="stats" className="space-y-4">
              {/* Date Filters */}
              <div className="flex gap-4">
                {/* FROM DATE */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-600">{t('from')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          className="w-[150px] justify-start text-left font-normal"
                      >
                        {fromDate ? format(fromDate, 'yyyy-MM-dd') : t('pick_date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-100" align="start">
                      <Calendar
                          mode="single"
                          selected={fromDate ?? undefined}
                          onSelect={(date) => setFromDate(date ?? null)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* TO DATE */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-600">{t('to')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          className="w-[150px] justify-start text-left font-normal"
                      >
                        {toDate ? format(toDate, 'yyyy-MM-dd') : t('pick_date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-100" align="start">
                      <Calendar
                          mode="single"
                          selected={toDate ?? undefined}
                          onSelect={(date) => setToDate(date ?? null)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <button
                  onClick={fetchRewardsStats}
                  className="mt-2 bg-[#EBB923] text-black rounded-full px-4 py-2 font-semibold text-sm"
              >
                {t('apply_filter')}
              </button>

              {/* Rewards Table */}
              <div className="overflow-x-auto border rounded-xl">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">{t('token')}</th>
                    <th className="px-4 py-2">{t('reward_ton')}</th>
                  </tr>
                  </thead>
                  <tbody>
                  {rewardsStats.map(r => (
                      <tr key={r.token}>
                        <td className="px-4 py-2 font-medium">{r.token}</td>
                        <td className="px-4 py-2">{r.amount.toFixed(4)} TON</td>
                      </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="px-4 py-2">{t('total')}</td>
                    <td className="px-4 py-2">
                      {rewardsStats.reduce((acc, r) => acc + r.amount, 0).toFixed(4)} TON
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 inset-x-0 border-t bg-white py-2 px-4 flex justify-between">
          <button onClick={() => router.push('/wallet')} className="w-1/5 flex flex-col items-center text-[#EBB923]">
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
          <button onClick={() => router.push('/social')} className="w-1/5 flex flex-col items-center text-gray-500">
            <Share2 size={24} />
            <span className="text-xs">{t('social')}</span>
          </button>
          <button onClick={() => router.push('/refs')} className="w-1/5 flex flex-col	items-center text-gray-500">
            <Users size={24} />
            <span className="text-xs">{t('refs')}</span>
          </button>
        </div>
      </div>
  );
}