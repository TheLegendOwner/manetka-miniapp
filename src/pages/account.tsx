// src/pages/account.tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import {
  Wallet,
  Gamepad2,
  Image as ImageIcon,
  Users,
  Share2,
  ArrowLeft, Copy, Trash2
} from 'lucide-react';
import '../lib/i18n';
import { useTelegram } from '../context/TelegramContext';
import { useAuth } from '../context/AuthContext';
import {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "react-toastify";
import { copyTextToClipboard } from '@telegram-apps/sdk';

export default function AccountPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user, ready } = useTelegram();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payloadGenerated, setPayloadGenerated] = useState(false);
  const [verified, setVerified] = useState(false);
  const payloadInterval = useRef<number | null>(null);

  const payloadTTLMS = 1000 * 60 * 20;

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
      if (wallets.length === 0) {
        router.replace('/');
      }
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
  }, [token, router]);

  const disconnect = async (wallet_id: string) => {
    const disconnectResp = await fetch(`/api/wallets/${wallet_id}/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` }
    });

    const json = await disconnectResp.json();
    if (json.data.disconnected) {
      fetchWallets();
    }
  }

  const generateProofPayload = async () => {
    try {
      const payloadResponse = await fetch('/api/proof-payload', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const payloadData = await payloadResponse.json();
      console.log('Updated payload response:', payloadData);

      if (payloadData?.data?.payload) {
        tonConnectUI.setConnectRequestParameters({
          state: 'ready',
          value: payloadData.data.payload
        });
        setPayloadGenerated(payloadData.data.payload);
      } else {
        tonConnectUI.setConnectRequestParameters(null);
      }
    } catch (err) {
      console.error('Failed to refresh proof payload', err);
      tonConnectUI.setConnectRequestParameters(null);
    }
  };

  const connectTonWallet = async () => {
    if (!token) return;

    try {
      console.log('Opening wallet modal...');

      const payloadResponse = await fetch('/api/proof-payload', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const payloadData = await payloadResponse.json();
      console.log('Payload response:', payloadData);

      if (payloadData?.data?.payload) {
        tonConnectUI.setConnectRequestParameters({
          state: 'ready',
          value: { tonProof: payloadData.data.payload}
        });
      } else {
        console.warn('No payload received');
        tonConnectUI.setConnectRequestParameters(null);
        return;
      }

      tonConnectUI.openModal();

      if (payloadInterval.current !== null) {
        clearInterval(payloadInterval.current);
      }
      payloadInterval.current = window.setInterval(() => {
        console.log('Refreshing proof payload...');
        generateProofPayload();
      }, payloadTTLMS);

    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  useEffect(() => {
    console.log('Wallet updated:', wallet);

    if (
        wallet?.account &&
        wallet?.connectItems?.tonProof &&
        'proof' in wallet.connectItems.tonProof &&
        !verified
    ) {
      const verifyWallet = async () => {
        try {
          const tonProof = wallet.connectItems?.tonProof;

          if (!tonProof || !('proof' in tonProof)) return;

          const proof = tonProof.proof; // теперь тип безопасен
          console.log('Verifying wallet...', proof);

          const response = await fetch('/api/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              account: wallet.account,
              proof: proof,
            }),
          });

          const result = await response.json();
          console.log('Verify response:', result);

          if (result.code === 0 && result.data.valid) {
            setVerified(true);
            toast.success(t('wallet_added'));
            fetchWallets();
          } else {
            toast.error(t('wallet_verification_failed'));
          }
        } catch (err) {
          console.error('Verification error:', err);
          toast.error(t('wallet_verification_error'));
        } finally {
          tonConnectUI.disconnect();
        }
      };

      verifyWallet();
    }
  }, [wallet, verified, token, router, tonConnectUI]);

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
                          // <span className="text-xs text-green-600 mt-1">{t('main_wallet')}</span>
                        <span className="text-xs text-green-600 mt-1">MAIN</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <button onClick={() => copyTextToClipboard(wallet.address)} className="text-yellow-600">
                        <Copy size={24} />
                      </button>
                      <button onClick={() => disconnect(wallet.wallet_id)} className="text-red-600">
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
              ))
          )}
        </div>

        <button
            onClick={connectTonWallet}
            className="w-full bg-black text-white text-sm py-3 rounded-full uppercase"
        >
          {t('connect')}
        </button>
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
