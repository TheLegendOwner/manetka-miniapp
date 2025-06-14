// src/pages/account.tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import {
  Wallet,
  Gamepad2,
  Image as ImageIcon,
  Users,
  Share2,
  ArrowLeft, Copy, Trash2
} from 'lucide-react';
import { Address } from '@ton/core';
import '../lib/i18n';
import { useTelegram } from '../context/TelegramContext';
import { useAuth } from '../context/AuthContext';
import {useCallback, useEffect, useState} from "react";

export default function AccountPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user, ready } = useTelegram();
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();
  const { token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  const [wallets, setWallets] = useState<Array<{
    wallet_id: string;
    address: string;
    main: boolean;
  }>>([]);

  type WalletFromServer = {
    wallet_id: string;
    address: string;
    main: boolean;
    connected_at: string;
  };

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/');
    }
  }, [authLoading, token, router]);

  const avatarSrc =
    user?.photo_url || `/icons/avatar${Math.floor(Math.random() * 11) + 1}.svg`;
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const username = user?.username;

  const fetchWallets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const wRes = await fetch('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await wRes.json();
      const wallets: WalletFromServer[] = json.data.wallets;
      setWallets(
          wallets.map(({ wallet_id, address, main }) => ({
            wallet_id,
            address,
            main
          }))
      );
    } catch (e) {
      console.error('Fetch wallet data failed', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const disconnect = async (wallet_id: string) => {
    const disconnectResp = await fetch(`/api/wallets/${wallet_id}/disconnect`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const json = await disconnectResp.json();
    if (json.data.disconnected) {
      fetchWallets();
    }
  }

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  const addWallet = async () => {
    if (!token) return;
    try {
      // 4) Запрос proof-payload с сервера
      const ppRes = await fetch('/api/proof-payload', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { data: { payload, timestamp } } = await ppRes.json();

      // 5) Открыть модалку TonConnect и запросить подпись
      const proof = await (tonConnectUI as any).requestProof({
        payload,
        timestamp
      });

      // 6) Отправить proof на сервер для верификации
      await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ account: tonConnectUI.account, proof })
      });

      // 7) Перейти на страницу кошелька
      router.push('/wallet');
    } catch (err) {
      console.error('Add wallet failed', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWallets();
    }
  }, [token, fetchWallets]);

  if (authLoading || loading) {
    return <p className="p-4 text-center">Loading…</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] font-['Aboreto']">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 py-4 px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-semibold text-[#171A1F] uppercase">
            {t('account')}
          </h1>
        </div>
        <div className="flex gap-2 bg-gray-200 rounded-full p-1">
          <button
            onClick={() => i18n.changeLanguage('ru')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              i18n.language === 'ru'
                ? 'bg-[#EBB923] text-black'
                : 'text-gray-500'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              i18n.language === 'en'
                ? 'bg-[#EBB923] text-black'
                : 'text-gray-500'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="flex flex-col gap-4 px-4 pt-6 pb-24">
        <div className="flex items-center gap-4">
          <div className="w-[75px] h-[75px] rounded-full overflow-hidden border border-gray-300">
            <Image
              src={avatarSrc}
              alt="avatar"
              width={75}
              height={75}
              unoptimized
            />
          </div>
          <div>
            {user ? (
              <>
                <p className="text-[16px] font-medium text-[#171A1F]">
                  {firstName} {lastName}
                </p>
                {username && (
                  <p className="text-[14px] text-[#9095A1]">@{username}</p>
                )}
              </>
            ) : (
              <p className="text-[16px] font-medium text-[#171A1F]">
                Wallet User
              </p>
            )}
          </div>
        </div>

        {/* Wallet Address */}
        <div>
          <p className="text-[14px] text-[#171A1F] font-semibold">
            {t('your_wallet_addresses')}:
          </p>

          {wallets.length === 0 ? (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-[14px] text-[#171A1F]">{t('no_wallet_connected')}</p>
              </div>
          ) : (
              wallets.map((wallet) => (
                  <div
                      key={wallet.wallet_id}
                      className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between mt-2"
                  >
                    <div className="flex flex-col">
                      <p className="text-[14px] text-[#171A1F] break-all">
                        {wallet.address}
                      </p>
                      {wallet.main && (
                          <span className="text-xs text-green-600 mt-1">{t('main_wallet')}</span>
                      )}
                    </div>

                    <button onClick={() => copyToClipboard(wallet.address)} className="text-yellow-600">
                      <Copy size={24} />
                    </button>

                    <button onClick={() => disconnect(wallet.wallet_id)} className="text-red-600">
                      <Trash2 size={24} />
                    </button>
                  </div>
              ))
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-2 px-4 flex justify-between items-center shadow-md">
        <button
          onClick={() => router.push('/wallet')}
          className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600"
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
