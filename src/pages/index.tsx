// src/pages/index.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import '../lib/i18n';
import {toast} from "react-toastify";
import {useTranslation} from "react-i18next";

const payloadTTLMS = 1000 * 60 * 20;

function MainPage() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const router = useRouter();
  const { t } = useTranslation();
  const { token, loading: authLoading } = useAuth();

  const [hasWallets, setHasWallets] = useState<boolean | null>(null);
  const [verified, setVerified] = useState(false);
  const [payloadGenerated, setPayloadGenerated] = useState(false);
  const payloadInterval = useRef<number | null>(null);

  useEffect(() => {
    if (!authLoading && token) {
      fetch('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      })
          .then(r => r.json())
          .then(json => {
            const list = json.data.wallets as any[];
            setHasWallets(list.length > 0);
            console.log('Wallets fetched:', list);
          })
          .catch(err => {
            console.warn('Wallet fetch error', err);
            setHasWallets(false);
          });
    }
  }, [authLoading, token]);

  useEffect(() => {
    if (!authLoading && token && (hasWallets || verified)) {
      console.log('Redirecting to /wallet');
      router.replace('/wallet');
    }
  }, [authLoading, token, hasWallets, verified, router]);

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

          if (result.data.valid) {
            setVerified(true);
            toast.success(t("wallet_added"), {position:"top-center"});
            router.replace('/wallet');
          } else {
            alert('Verification failed. Try another wallet.');
          }
        } catch (err) {
          console.error('Verification error:', err);
        } finally {
          tonConnectUI.disconnect();
        }
      };

      verifyWallet();
    }
  }, [wallet, verified, token, router, tonConnectUI]);


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
            onClick={connectTonWallet}
            disabled={!token || payloadGenerated}
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
