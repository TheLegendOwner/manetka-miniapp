'use client';

import { useTonConnectUI } from '@tonconnect/ui-react';

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  const isConnected = tonConnectUI?.connected ?? false;
  const address = tonConnectUI?.account?.address;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4">
      <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-6" />
      <h1 className="text-2xl font-bold mb-2">MANETKA WALLET</h1>
      <p className="text-sm text-gray-600 text-center mb-8">
        All reward tokens in one place with MANETKA WALLET
      </p>

      {isConnected ? (
        <>
          <p className="text-green-600 mb-4 text-sm">Connected: {address}</p>
          <button
            onClick={() => tonConnectUI.disconnect()}
            className="w-[300px] h-[50px] bg-red-500 hover:bg-red-600 text-white font-medium rounded-full"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={() => tonConnectUI.openModal()}
          className="w-[300px] h-[50px] bg-[#EBB923] hover:bg-[#e2aa14] text-gray-900 font-semibold rounded-full"
        >
          Connect your TON Wallet
        </button>
      )}
    </div>
  );
}
