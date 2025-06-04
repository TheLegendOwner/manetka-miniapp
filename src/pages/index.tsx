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
  const wsRef = useRef<WebSocket | null>(null);
  const hasRedirectedRef = useRef(false);

  // 1) Ждём, пока TelegramContext.ready === true И useTonWallet() уже != undefined
  //    Если wallet === undefined, просто вернём null, чтобы не получить ошибку при чтении wallet.account
  if (!ready || wallet === undefined) {
    return null;
  }

  // 2) Если кошелёк подключён и мы всё ещё на "/", редиректим 1 раз
  useEffect(() => {
    if (router.pathname !== '/') return;
    if (!hasRedirectedRef.current && (wallet as any)?.account?.address) {
      hasRedirectedRef.current = true;
      router.replace('/wallet');
    }
  }, [wallet, router]);

  // 3) Как только wallet перестал быть undefined (теперь либо объект, либо null),
  //    если оказался просто null (то есть пользователь не подключил кошелёк), 
  //    — запускаем таймер на показ кнопки "Connect"
  useEffect(() => {
    if (wallet === null) {
      const timer = setTimeout(() => setDelayedCheck(true), 500);
      return () => clearTimeout(timer);
    }
    // Если wallet — уже объект (кошелек подключён), мы вернём null ниже
  }, [wallet]);

  // 4) Если кошелёк подключён, сразу возвращаем null (и редирект выше уже запущен)
  if ((wallet as any)?.account?.address) {
    return null;
  }

  // 5) Остальная WebSocket-логика (запускается только когда ready===true и wallet!==undefined)
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

  const handleConnectClick = useCallback(() => {
    // Здесь ready уже true и wallet !== undefined
    setError(null);
    setIsRequestingProof(true);

    tonConnectUI.setConnectRequestParameters({ state: 'loading' });
    closeSocket();

    const socket = new WebSocket(WS_URL);
    wsRef.current = socket;

    socket.onopen = () => {
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

      if (data.type === 'auth' && data.code === 0) {
        socket.send(JSON.stringify({ type: 'get_ton_proof' }));
        return;
      }

      if (data.code === 1 && data.error?.includes('Unauthorized')) {
        const tg = (window as any).Telegram?.WebApp;
        const initData = tg?.initData;
        socket.send(JSON.stringify({ type: 'auth', initData }));
        return;
      }

      if (data.type === 'ton_proof' && data.value) {
        tonConnectUI.setConnectRequestParameters({
          state: 'ready',
          value: { tonProof: data.value },
        });
        tonConnectUI.openModal();
        setIsRequestingProof(false);
      }

      if (data.type === 'error_proof') {
        setError(data.message || 'Ошибка получения tonProof');
        tonConnectUI.setConnectRequestParameters(null);
        setIsRequestingProof(false);
      }
    };

    socket.onclose = () => {};
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

      {delayedCheck && (
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
