// src/pages/index.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import '../lib/i18n';

function MainPage() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const router = useRouter();
  const [delayedCheck, setDelayedCheck] = useState(false);

  const { token, loading: authLoading } = useAuth();

  // Redirect to /wallet when both token and TON address are available
  useEffect(() => {
    if (!authLoading && token && address) {
      router.replace('/wallet');
    } else {
      const timer = setTimeout(() => setDelayedCheck(true), 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, token, address, router]);

  // Handler to fetch proof-payload and open TonConnect modal
  const connectTonWallet = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/proof-payload', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { data: { payload, timestamp } } = await res.json();
      // Provide payload and timestamp to TonConnect UI
      ;(tonConnectUI as any).setConnectRequestParameters({ payload, timestamp });
      // Open the modal to let the user connect/sign
      tonConnectUI.openModal();
    } catch (err) {
      console.error('Failed to get proof-payload', err);
    }
  }, [token, tonConnectUI]);

  if (authLoading) {
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

      {!address && delayedCheck && (
        <div className="absolute bottom-[clamp(50px,20%,120px)] w-full flex justify-center">
          <button
            onClick={connectTonWallet}
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
