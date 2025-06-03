// src/pages/index.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useRouter } from 'next/router';
import { useTelegram } from '../context/TelegramContext';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL as string;

function MainPage() {
  const tonConnectUI = useTonConnectUI()[0];
  const wallet = useTonWallet();
  const router = useRouter();
  const { ready } = useTelegram();

  const [isRequestingProof, setIsRequestingProof] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delayedCheck, setDelayedCheck] = useState(false);

  // Хранит текущее WebSocket-соединение
  const wsRef = useRef<WebSocket | null>(null);

  // 1) Редирект, если кошелёк уже подключён
  useEffect(() => {
    if ((wallet as any)?.account?.address) {
      router.replace('/wallet');
    } else if (!wallet) {
      const timer = setTimeout(() => setDelayedCheck(true), 500);
      return () => clearTimeout(timer);
    }
  }, [wallet, router]);

  // Помогает закрыть текущее соединение, если оно есть
  const closeSocket = () => {
    if (wsRef.current) {
      console.log('>>> Closing old WebSocket');
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // Основная функция: закрываем старый сокет, открываем новый и в onopen шлём auth→get_ton_proof
  const handleConnectClick = useCallback(() => {
    if (!ready) {
      setError('Telegram ещё не готов');
      return;
    }
    setError(null);
    setIsRequestingProof(true);

    tonConnectUI.setConnectRequestParameters({ state: 'loading' });

    // 1) Закрываем предыдущее соединение, если оно существует
    //closeSocket();

    // 2) Создаём новый WebSocket
    const socket = new WebSocket(WS_URL);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('>>> WebSocket opened, sending auth now');
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData;

      // Отправляем auth
      socket.send(JSON.stringify({ type: 'auth', initData }));
      console.log('>>> auth sent:', { type: 'auth', initData });

      // Спустя 100 мс отправляем get_ton_proof
      setTimeout(() => {
        console.log('>>> sending get_ton_proof');
        socket.send(JSON.stringify({ type: 'get_ton_proof' }));
      }, 100);
    };

    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      console.log('>>> WS message:', data);

      // Если сервер вернул “Unauthorized” — повторяем auth→get_ton_proof
      if (data.code === 1 && data.error?.includes('Unauthorized')) {
        console.warn('>>> Received Unauthorized, retrying auth + get_ton_proof');
        const tg = (window as any).Telegram?.WebApp;
        const initData = tg?.initData;
        socket.send(JSON.stringify({ type: 'auth', initData }));
        setTimeout(() => {
          socket.send(JSON.stringify({ type: 'get_ton_proof' }));
        }, 100);
        return;
      }

      // Когда приходит challenge (ton_proof) — отдаем его TonConnect UI
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

    socket.onclose = (e) => {
      console.warn('>>> WS closed:', e.code, e.reason);
      // Ничего дополнительно делать не надо — при следующем клике создадим новый
    };

    socket.onerror = (err) => {
      console.error('>>> WS error:', err);
      socket.close();
    };
  }, [ready, tonConnectUI, router]);

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

      {!((wallet as any)?.account?.address) && delayedCheck && (
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
