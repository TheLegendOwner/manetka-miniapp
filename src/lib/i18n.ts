// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// your translations
const resources = {
  en: {
    translation: {
      wallet: 'Wallet',
      token_assets: 'Token Assets',
      balance: 'Balance',
      balance_usd: 'USD Balance',
      balance_ton: 'TON Balance',
      rewards: 'Rewards',
      buy_sell: 'Buy / Sell',
      refs: 'Referrals',
      socials: 'Socials',
      account: 'Account',
      join_manetka: 'Join MANETKA',
      share_not_supported: 'Sharing not supported on this device',
      number_of_referrals: 'Number of referrals',
      referral_share: 'Your referral earnings',
      your_referral_link: 'Your referral link',
      copy: 'Copy',
      connect: 'Connect',
      disconnect: 'Disconnect',
      your_wallet_address: 'Your wallet address',
      no_wallet_connected: 'No wallet connected',
      // …add any other keys you use…
    },
  },
  ru: {
    translation: {
      wallet: 'Кошелек',
      token_assets: 'Токен-активы',
      balance: 'Баланс',
      balance_usd: 'Баланс в USD',
      balance_ton: 'Баланс в TON',
      rewards: 'Награды',
      buy_sell: 'Купить / Продать',
      refs: 'Рефералы',
      socials: 'Социальные сети',
      account: 'Аккаунт',
      join_manetka: 'Присоединяйтесь к MANETKA',
      share_not_supported: 'Шэринг не поддерживается на этом устройстве',
      number_of_referrals: 'Количество рефералов',
      referral_share: 'Заработано по рефералам',
      your_referral_link: 'Ваша реферальная ссылка',
      copy: 'Копировать',
      connect: 'Подключить',
      disconnect: 'Отключить',
      your_wallet_address: 'Ваш адрес кошелька',
      no_wallet_connected: 'Кошелек не подключен',
      // …добавьте остальные ключи…
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',                // язык по умолчанию
    fallbackLng: 'en',        // если в текущем нет перевода
    interpolation: {
      escapeValue: false,     // react уже безопасно экранирует
    },
    react: {
      useSuspense: false,     // отключаем suspense, чтобы не ждать лениво
    },
  });

export default i18n;
