// 1. Установите SDK в проекте
//    npm install @tonconnect/sdk

// 2. Создайте файл lib/ton.ts:
//    src/lib/ton.ts

import { TonConnect, WalletInfo, WalletConnectionSource, isWalletInfoCurrentlyInjected, isWalletInfoRemote } from '@tonconnect/sdk';
import { useState, useEffect } from 'react';

export const connector = new TonConnect({
  manifestUrl: 'https://your-app.com/tonconnect-manifest.json'
});

export function useTon() {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);

  useEffect(() => {
    // Восстановление сессии
    connector.restoreConnection();
    // Подписка на изменение статуса
    const unsub = connector.onStatusChange((info) => {
      setWalletInfo(info);
    });
    // Получение списка кошельков
    connector.getWallets().then(setWallets);

    return () => { unsub(); };
  }, []);

  // Подключение выбранного кошелька
  const connect = async (w: WalletInfo) => {
    let source: WalletConnectionSource;
    if (isWalletInfoCurrentlyInjected(w)) {
      source = { jsBridgeKey: w.jsBridgeKey! };
    } else if (isWalletInfoRemote(w)) {
      source = { universalLink: w.universalLink!, bridgeUrl: w.bridgeUrl! };
    } else {
      console.warn('Unsupported wallet type', w);
      return;
    }

    if (connector.connected) {
      await connector.disconnect();
    }
    await connector.connect(source);
  };

  const disconnect = () => connector.disconnect();

  return { wallets, walletInfo, connect, disconnect };
}


// 3. Добавьте манифест TON Connect:
//    public/tonconnect-manifest.json

// {
//   "name": "Manetka MiniApp",
//   "description": "Telegram Mini App for managing tasks",
//   "iconUrl": "https://your-app.com/icon.png",
//   "permissions": ["tonClient.wallet_events"]
// }


// 4. Обновите главный экран: src/pages/index.tsx

import { useTon } from '@/lib/ton';

export default function MainPage() {
  const { wallets, walletInfo, connect, disconnect } = useTon();

  return (
    <div className="p-8">
      {walletInfo ? (
        <div>
          <p>Вы подключены как: <b>{walletInfo.account.address}</b></p>
          <button
            onClick={disconnect}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full shadow"
          >
            Отключить кошелёк
          </button>
        </div>
      ) : (
        <>
          <h2 className="mb-4 text-xl font-semibold">Выберите кошелёк для подключения</h2>
          <ul className="space-y-2">
            {wallets.map((w) => (
              <li key={w.name}>
                <button
                  onClick={() => connect(w)}
                  className="flex items-center px-4 py-2 border rounded-2xl shadow hover:bg-gray-100"
                >
                  <img src={w.imageUrl} alt={w.name} className="w-6 h-6 mr-2" />
                  {w.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
