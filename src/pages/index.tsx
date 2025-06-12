// src/pages/index.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import '../lib/i18n';

function MainPage() {
  const [tonConnectUI] = useTonConnectUI();
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [delayedCheck, setDelayedCheck] = useState(false);
  const [hasWallets, setHasWallets] = useState<boolean | null>(null);
  const [verified, setVerified] = useState(false);

  // 1) After auth, load /api/wallets once
  useEffect(() => {
    if (!authLoading && token) {
      fetch('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(json => {
          const list = json.data.wallets as any[];
          setHasWallets(list.length > 0);
        })
        .catch(() => setHasWallets(false));
    }
  }, [authLoading, token]);

  // 2) Redirect to /wallet if we already have wallets or just verified
  useEffect(() => {
    if (!authLoading && token && (hasWallets === true || verified)) {
      router.replace('/wallet');
    }
  }, [authLoading, token, hasWallets, verified, router]);

  // 3) Delay showing the connect button to avoid flicker
  useEffect(() => {
    const timer = setTimeout(() => setDelayedCheck(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // 4) Connect & verify flow using requestProof directly
  const connectTonWallet = useCallback(async () => {
    if (!token) return;
    try {
      // fetch proof-payload from server
      const ppRes = await fetch('/api/proof-payload', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const {
        data: { payload, timestamp }
      } = (await ppRes.json()) as { data: { payload: string; timestamp: number } };

      // hand off to TonConnect UI
      ;(tonConnectUI as any).setConnectRequestParameters({ payload, timestamp });
      // requestProof opens modal and returns the signed proof
      const proof = await (tonConnectUI as any).requestProof({ payload, timestamp });

      // verify on backend
      await fetch('/api/verify', {
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

      setVerified(true);
    } catch (err) {
      console.error('Connection or verification failed', err);
    }
  }, [token, tonConnectUI]);

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

      {hasWallets === false && delayedCheck && (
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
