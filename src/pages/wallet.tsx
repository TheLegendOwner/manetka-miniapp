'use client';
import React from 'react';
import { useTonConnectUI, TonConnectButton } from '@tonconnect/ui-react';
import Link from 'next/link';

export default function WalletPage() {
  const [tonConnectUI] = useTonConnectUI();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <img src="/logo.png" alt="Manetka Logo" className="w-28 h-28 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">MANETKA WALLET</h1>
      <p className="text-gray-600 text-center mb-8">
        Manage your connected TON wallet here.
      </p>

      {/* Стандартная кнопка */}
      <TonConnectButton className="w-full max-w-sm bg-[#EBB923] hover:bg-yellow-400 text-gray-900 font-semibold py-3 rounded-full shadow" />

      {/* Кастомный вызов модалки */}
      <button
        onClick={() => tonConnectUI.openModal()}
        className="w-full max-w-sm mt-4 bg-[#EBB923] hover:bg-[#d1a619] text-gray-900 font-semibold py-3 rounded-full shadow"
      >
        Open TON Connect
      </button>

      {/* Навигация по разделам */}
      <div className="mt-6 space-y-2 w-full max-w-sm">
        <Link href="/refs" className="block bg-green-500 text-white px-4 py-2 rounded">
          Referrals
        </Link>
        <Link href="/account" className="block bg-blue-500 text-white px-4 py-2 rounded">
          Account
        </Link>
        <Link href="/social" className="block bg-indigo-500 text-white px-4 py-2 rounded">
          Social
        </Link>
        <Link href="/lottery" className="block bg-purple-500 text-white px-4 py-2 rounded">
          Lottery
        </Link>
        <Link href="/nfts" className="block bg-pink-500 text-white px-4 py-2 rounded">
          NFTs
        </Link>
      </div>
    </div>
  );
}
