// src/pages/index.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useIsConnectionRestored, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import '../lib/i18n';

function MainPage() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [payloadGenerated, setPayloadGenerated] = useState(false);
  const [verified, setVerified] = useState(false);
  const [hasWallets, setHasWallets] = useState<boolean | null>(null);

  // Получение списка кошельков пользователя
  useEffect(() => {
    if (!authLoading && token) {
      fetch('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      })
          .then((r) => r.json())
          .then((json) => {
            const list = json.data.wallets as any[];
            setHasWallets(list.length > 0);
          })
          .catch(() => setHasWallets(false));
    }
  }, [authLoading, token]);

  // Перенаправление, если уже есть кошельки
  useEffect(() => {
    if (!authLoading && token && hasWallets) {
      router.replace('/wallet');
    }
  }, [authLoading, token, hasWallets, router]);

  // Запрос payload с backend и установка в TonConnectUI
  const generateProofPayload = useCallback(async () => {
    try {
      if (!token) return;

      const response = await fetch('/api/proof-payload', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!data?.data?.payload) throw new Error('No payload from server');

      tonConnectUI.setConnectRequestParameters({
        state: 'ready',
        value: data.data.payload,
      });

      setPayloadGenerated(true);
      tonConnectUI.openModal();
    } catch (err) {
      console.error('Failed to generate payload:', err);
      tonConnectUI.setConnectRequestParameters(null);
    }
  }, [token, tonConnectUI]);

  // Проверка TON Proof
  const verifyWallet = useCallback(async () => {
    const tonProof = wallet?.connectItems?.tonProof;

    if (!tonProof || !('proof' in tonProof)) {
      alert('TON Proof not received. Try another wallet.');
      tonConnectUI.disconnect();
      return;
    }

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          account: wallet.account,
          proof: tonProof.proof,
        }),
      });

      const result = await response.json();

      if (result.verified) {
        setVerified(true);
        router.replace('/wallet');
      } else {
        alert('Verification failed. Try another wallet.');
        tonConnectUI.disconnect();
      }
    } catch (err) {
      console.error('Verification error:', err);
    }
  }, [token, wallet, tonConnectUI, router]);

  // Автоматическая проверка, если tonProof получен
  useEffect(() => {
    if (wallet?.connectItems?.tonProof && !verified) {
      verifyWallet();
    }
  }, [wallet, verified, verifyWallet]);

  // Показ загрузки, если токен ещё не получен
  if (authLoading || hasWallets === null) {
    return <p className="p-4 text-center">Loading authentication…</p>;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-6 relative">
      <div className="flex flex-col items-center">
        <img src="/logo.png" alt="Manetka Logo" className="w-32 h-32 mb-6" />
        <h1 className="text-[22px] font-bold text-gray-900 mb-2 text-center">
          MANETKA WALLET
        </h1>
        <p className="text-sm text-gray-600 text-center max-w-[320px] leading-snug">
          All reward tokens in one place with MANETKA WALLET
        </p>
      </div>

      {hasWallets === false && (
        <div className="absolute bottom-[clamp(50px,20%,120px)] w-full flex justify-center">
          <button
            onClick={generateProofPayload}
            disabled={!token}
            className="w-[350px] h-[52px] bg-[#EBB923] hover:bg-[#e2aa14] disabled:opacity-50 text-gray-900 font-semibold text-base rounded-full shadow-md"
          >
            {token ? 'Connect your TON Wallet' : 'Waiting for login…'}
          </button>
        </div>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(MainPage), { ssr: false });
