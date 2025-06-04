// src/pages/index.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { useTelegram } from '../context/TelegramContext';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL as string;

function MainPage() {
const [tonConnectUI] = useTonConnectUI();
const wallet = useTonWallet();
  const router = useRouter();
  const { ready } = useTelegram();

  const [isRequestingProof, setIsRequestingProof] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delayedCheck, setDelayedCheck] = useState(false);

  // Хранит текущее WebSocket-соединение
  const wsRef = useRef<WebSocket | null>(null);

  // Реф для предотвращения повторного редиректа
  const hasRedirectedRef = useRef(false);

  // 1) Редирект на /wallet, но только если мы на "/" и ещё не редиректили
  useEffect(() => {
    if (router.pathname !== '/') return;
    if (!hasRedirectedRef.current && (wallet as any)?.account?.address) {
      hasRedirectedRef.current = true;
      router.replace('/wallet');
    }
  }, [wallet, router]);

  // Если кошелëк уже подключён, не рендерим ничего (чтобы не триггерить useEffect снова)
  if ((wallet as any)?.account?.address) {
    return null;
  }

  // Закрывает текущее соединение
  const closeSocket = () => {
    if (wsRef.current) {
      const old = wsRef.current;
      old.onopen = null;
      old.onmessage = null;
      old.onclose = null;
      old.onerror = null;
      old.close();
      wsRef.current = null;
    }
  };

  // 2) Создание и работа с WebSocket при клике
  const handleConnectClick = useCallback(() => {
    if (!ready) {
      setError('Telegram ещё не готов');
      return;
    }

    setError(null);
    setIsRequestingProof(true);

    tonConnectUI.setConnectRequestParameters({ state: 'loading' });

    // Закрываем прошлый сокет
    closeSocket();

    // Создаём новый WebSocket
    const socket = new WebSocket(WS_URL);
    wsRef.current = socket;

    socket.onopen = () => {
      // Отправляем auth
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;
      socket.send(JSON.stringify({ type: 'auth', initData }));
    };

    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      // Если сервер подтвердил auth (type="auth", code=0) → отправляем get_ton_proof
      if (data.type === 'auth' && data.code === 0) {
        socket.send(JSON.stringify({ type: 'get_ton_proof' }));
        return;
      }

      // Если сервер вернул Unauthorized → повторяем auth
      if (data.code === 1 && data.error?.includes('Unauthorized')) {
        const tg = (window as any).Telegram?.WebApp;
        const initData = tg?.initData;
        socket.send(JSON.stringify({ type: 'auth', initData }));
        return;
      }

      // Когда приходит challenge (ton_proof) → открываем TonConnect UI
      if (data.type === 'ton_proof' && data.value) {
        tonConnectUI.setConnectRequestParameters({
          state: 'ready',
          value: { tonProof: data.value },
        });
        tonConnectUI.openModal();
        setIsRequestingProof(false);
      }

      // Если сервер вернул ошибку получения proof
      if (data.type === 'error_proof') {
        setError(data.message || 'Ошибка получения tonProof');
        tonConnectUI.setConnectRequestParameters(null);
        setIsRequestingProof(false);
      }
    };

    socket.onclose = () => {
      // Ничего делать не нужно
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [ready, tonConnectUI]);

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

      {!delayedCheck && !((wallet as any)?.account?.address) && (
        <div className="absolute bottom-[clamp(50px,20%,120px)] w-full flex justify-center">
          <button
            onClick={handleConnectClick}
            disabled={isRequestingProof}
            className={`w-[350px] h-[52px] ${
              isRequestingProof ? 'bg-gray-300' : 'bg-[#EBB923] hover:bg-[#e2aa14]'
            } text-gray-900 font-semibold text-base rounded-full shadow-md transition-colors duration-200`}
          >
            {isRequestingProof ? 'Подготовка...' : 'Connect your TON Wallet'}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
    </div>
  );
}

export default dynamic(() => Promise.resolve(MainPage), { ssr: false });
