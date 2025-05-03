import { useState, useEffect } from 'react';
import { TonConnect, type WalletInfo, type WalletConnectionSource, type Wallet } from '@tonconnect/sdk';
import { isWalletInfoCurrentlyInjected, isWalletInfoRemote } from '@tonconnect/sdk';

// Инициализация один раз на уровне модуля
export const connector = new TonConnect({
  manifestUrl: 'https://your-app.com/tonconnect-manifest.json'
});

export function useTon() {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [walletInfo, setWalletInfo] = useState<Wallet | null>(null);

  useEffect(() => {
    // Восстанавливаем сессию
    connector.restoreConnection();
    // Слушаем изменения статуса (возвращает Wallet или null)
    const unsub = connector.onStatusChange((w: Wallet | null) => {
      setWalletInfo(w);
    });
    // Загружаем список кошельков (WalletInfo[])
    connector.getWallets().then(setWallets);
    return () => {
      unsub();
    };
  }, []);

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