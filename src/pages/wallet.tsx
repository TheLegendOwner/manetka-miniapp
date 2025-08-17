'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTelegram } from '../context/TelegramContext';
import { toast } from 'react-toastify';
import NextImage from 'next/image';
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
import html2canvas from "html2canvas";

interface BalancesResponse {
  code: number;
  data: {
    balances: Array<{
      token: string;
      logo: string;
      url: string;
      sums: Record<'BALANCE' | 'USD' | 'TON' | 'RUB', number>
    }>
  };
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
  const searchParams = useSearchParams();
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
  const [activeTab, setActiveTab] = useState<'balances' | 'stats'>('balances');

  // Даты по умолчанию
  const [fromDate, setFromDate] = useState<Date | null>(new Date(2000, 0, 1));
  const [toDate, setToDate] = useState<Date | null>(new Date());

  const [rewardsStats, setRewardsStats] = useState<Array<{ token: string; amount: number }>>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Показываем тост, если вернулись с verified=1
  useEffect(() => {
    if (searchParams?.get('verified') === '1') {
      toast.success(t('wallet_added'));
    }
  }, [searchParams, t]);

  // Фетч статистики ревардов по кнопке и при входе на таб "Статистика"
  const fetchRewardsStats = useCallback(async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

      // читаем текущее состояние, но НЕ включаем wallets в deps, чтобы не зациклить
      const walletsToProcess =
          selectedWalletId === 'all'
              ? wallets
              : wallets.filter((w: Wallet) => w.wallet_id === selectedWalletId);

      const totalRewards = new Map<string, number>();

      for (const w of walletsToProcess) {
        let endpoint = `/api/rewards/${w.wallet_id}`;
        if (fromDate && toDate) {
          endpoint = `/api/rewards/${w.wallet_id}/between/${fmt(fromDate)}/${fmt(toDate)}`;
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
    } finally {
      setStatsLoading(false);
    }
  }, [token, selectedWalletId, fromDate, toDate, wallets]);

  // Основной фетч: кошельки + агрегированные балансы/реварды
  const fetchWalletsAndData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1) фетчим wallets
      const wRes = await fetch('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const wJson = await wRes.json();
      const fetchedWallets: Wallet[] = wJson?.data?.wallets ?? [];

      // 2) сразу считаем данные по только что полученным fetchedWallets,
      //    НЕ используя state wallets (чтобы не создавать цикл)
      const walletsToProcess =
          selectedWalletId === 'all'
              ? fetchedWallets
              : fetchedWallets.filter((w: Wallet) => w.wallet_id === selectedWalletId);

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

      // 3) только теперь кладём wallets в состояние (для UI)
      setWallets(
          fetchedWallets.map((w: Wallet & { address?: string }) => ({
            ...w,
            address:
                w.address.slice(0, 6) +
                '......' +
                w.address.slice(w.address.length - 7, w.address.length - 1),
          }))
      );
    } catch (e) {
      console.error('Fetch wallet data failed', e);
    } finally {
      setLoading(false);
    }
  }, [token, selectedWalletId]);

  // Редирект, если не авторизованы
  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/');
    }
  }, [authLoading, token, router]);

  // Первичная и последующие загрузки при смене выбранного кошелька
  useEffect(() => {
    if (token) {
      fetchWalletsAndData();
    }
  }, [token, selectedWalletId, fetchWalletsAndData]);

  // При входе на таб "Статистика" — один раз загружаем (и при смене выбранного кошелька)
  useEffect(() => {
    if (activeTab === 'stats') {
      fetchRewardsStats();
    }
  }, [activeTab, selectedWalletId, fetchRewardsStats]);

  // Экспорт в изображение: собираем offscreen DOM и рендерим html2canvas
  const handleExportImage = async () => {
    const statsContainer = document.getElementById("stats-table");
    if (!statsContainer) return;

    // Клонируем таблицу, чтобы рендерить offscreen
    const clonedTable = statsContainer.cloneNode(true) as HTMLElement;

    // Временный контейнер вне экрана
    const temp = document.createElement("div");
    temp.style.position = "fixed";
    temp.style.left = "-99999px";
    temp.style.top = "-99999px";
    temp.style.width = `${statsContainer.clientWidth}px`;
    temp.style.background = "#ffffff";
    temp.style.padding = "16px";
    temp.style.border = "1px solid #e5e7eb";
    temp.style.borderRadius = "12px";

    // Заголовок (логотип + текст)
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.marginBottom = "12px";

    const logoEl = document.createElement("img");
    logoEl.src = "/logo.png"; // положите файл в public/logo.png
    logoEl.style.width = "56px";
    logoEl.style.height = "56px";
    logoEl.style.marginRight = "12px";

    const titleEl = document.createElement("span");
    titleEl.textContent = "MANETKA Wallet";
    titleEl.style.fontSize = "22px";
    titleEl.style.fontWeight = "700";
    titleEl.style.color = "#222";

    header.appendChild(logoEl);
    header.appendChild(titleEl);

    // Даты
    const dateLine = document.createElement("div");
    dateLine.style.fontSize = "14px";
    dateLine.style.color = "#4b5563";
    dateLine.style.margin = "8px 0 12px 0";
    const fromStr = fromDate ? format(fromDate, "yyyy-MM-dd") : t("not_selected");
    const toStr = toDate ? format(toDate, "yyyy-MM-dd") : t("not_selected");
    dateLine.textContent = `${t('from')}: ${fromStr}  |  ${t('to')}: ${toStr}`;

    temp.appendChild(header);
    temp.appendChild(dateLine);
    temp.appendChild(clonedTable);

    document.body.appendChild(temp);

    try {
      const canvas = await html2canvas(temp, { backgroundColor: "#ffffff", scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const w = window.open("");
      if (w) {
        w.document.write(`<meta name="viewport" content="width=device-width, initial-scale=1" />`);
        w.document.write(`<img src="${imgData}" style="display:block;max-width:100%;height:auto;margin:0 auto;" />`);
      }
    } catch (e) {
      console.error("Export image failed", e);
      toast.error(t('export_failed') || 'Export failed');
    } finally {
      document.body.removeChild(temp);
    }
  };

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
            <NextImage
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
          <Select value={selectedWalletId} onValueChange={(v) => setSelectedWalletId(v)}>
            <SelectTrigger className="w-full mb-2">
              <SelectValue placeholder={t('select_wallet')} />
            </SelectTrigger>
            <SelectContent className="z-[9999] bg-white rounded-md shadow-lg">
              <SelectItem value="all">{t('all_wallets')}</SelectItem>
              {wallets.map((w) => (
                  <SelectItem key={w.wallet_id} value={w.wallet_id}>
                    {w.address}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'balances' | 'stats')} className="w-full">
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
                      <NextImage src={tok.logo} alt={tok.token} width={64} height={64} />
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
              <div className="flex gap-3 items-end">
                {/* FROM */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-600">{t('from')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                        {fromDate ? format(fromDate, 'yyyy-MM-dd') : t('pick_date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0 z-[9999] bg-white shadow-xl border border-gray-200 rounded-md"
                        align="start"
                        sideOffset={4}
                    >
                      <Calendar
                          mode="single"
                          selected={fromDate ?? undefined}
                          onSelect={(date) => setFromDate(date ?? null)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* TO */}
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-gray-600">{t('to')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                        {toDate ? format(toDate, 'yyyy-MM-dd') : t('pick_date')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0 z-[9999] bg-white shadow-xl border border-gray-200 rounded-md"
                        align="start"
                        sideOffset={4}
                    >
                      <Calendar
                          mode="single"
                          selected={toDate ?? undefined}
                          onSelect={(date) => setToDate(date ?? null)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* APPLY */}
                <Button
                    onClick={fetchRewardsStats}
                    className="flex items-center gap-2 bg-[#EBB923] hover:bg-[#e2aa14] text-white"
                >
                  🔍 {t('apply')}
                </Button>
              </div>

              {/* Rewards Table */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  {t('from')}: {fromDate ? format(fromDate, 'yyyy-MM-dd') : t('not_selected')} |{' '}
                  {t('to')}: {toDate ? format(toDate, 'yyyy-MM-dd') : t('not_selected')}
                </div>

                <div className="overflow-x-auto border rounded-xl p-4" id="stats-table">
                  {statsLoading ? (
                      <p className="text-center">Loading…</p>
                  ) : (
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2">{t('token')}</th>
                          <th className="px-4 py-2">{t('reward_ton')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rewardsStats.map(r => (
                            <tr key={r.token} className="border-t">
                              <td className="px-4 py-2 font-medium">{r.token}</td>
                              <td className="px-4 py-2">{r.amount.toFixed(4)} TON</td>
                            </tr>
                        ))}
                        <tr className="font-bold bg-gray-50 border-t">
                          <td className="px-4 py-2">{t('total')}</td>
                          <td className="px-4 py-2">
                            {rewardsStats.reduce((acc, r) => acc + r.amount, 0).toFixed(4)} TON
                          </td>
                        </tr>
                        </tbody>
                      </table>
                  )}
                </div>

                {/* Export Image */}
                <Button onClick={handleExportImage} className="bg-blue-500 hover:bg-blue-600 text-white w-full">
                  📸 {t('export_image')}
                </Button>
                <p className="text-xs text-gray-500">{t('long_press_save') || 'Откроется картинка — сохраните долгим нажатием.'}</p>
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
