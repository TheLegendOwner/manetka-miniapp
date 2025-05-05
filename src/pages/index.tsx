'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';

function MainPage() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const router = useRouter();
  const [delayedCheck, setDelayedCheck] = useState(false);

  // Redirect on connection
  useEffect(() => {
    if (address) {
      router.replace('/wallet');
    } else {
      const timer = setTimeout(() => setDelayedCheck(true), 500);
      return () => clearTimeout(timer);
    }
  }, [address, router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-6 relative">
      <div className="flex flex-col items-center">
        <img src="/logo.png" alt="Manetka Logo" className="w-32 h-32 mb-6" />
        <h1 className="text-[22px] font-bold text-gray-900 mb-2 text-center">MANETKA WALLET</h1>
        <p className="text-sm text-gray-600 text-center max-w-[320px] leading-snug">
          All reward tokens in one place with MANETKA WALLET
        </p>
      </div>

      {!address && delayedCheck && (
        <div className="absolute bottom-[clamp(50px,20%,120px)] w-full flex justify-center">
          <button
            onClick={() => tonConnectUI.openModal()}
            className="w-[350px] h-[52px] bg-[#EBB923] hover:bg-[#e2aa14] text-gray-900 font-semibold text-base rounded-full shadow-md"
          >
            Connect your TON Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(MainPage), { ssr: false });