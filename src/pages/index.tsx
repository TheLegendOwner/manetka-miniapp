'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';          // <-- импорт
import '../lib/i18n';

function MainPage() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const router = useRouter();
  const [delayedCheck, setDelayedCheck] = useState(false);

  const { token, loading: authLoading } = useAuth();       // <-- получаем token и флаг загрузки

  // Если есть и адрес, и токен — сразу уходим на /wallet
  useEffect(() => {
    if (!authLoading && token && address) {
      router.replace('/wallet');
    } else {
      const timer = setTimeout(() => setDelayedCheck(true), 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, token, address, router]);

  // Пока идёт авторизация — можно показать спиннер или просто ничего
  if (authLoading) {
    return <p className="p-4 text-center">Loading authentication…</p>;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white px-6 relative">
      {/* …лого и заголовок без изменений… */}

      {!address && delayedCheck && (
        <div className="absolute bottom-[clamp(50px,20%,120px)] w-full flex justify-center">
          <button
            onClick={() => tonConnectUI.openModal()}
            disabled={!token}                       // <-- без токена кнопка неактивна
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
