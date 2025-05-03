import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    resources: {
      en: {
        translation: {
          account: 'Account',
          disconnect: 'Disconnect wallet',
          copy: 'Copy',
          wallet: 'Wallet',
          games: 'Games',
          nfts: 'NFTs',
          socials: 'Socials',
          social: 'Socials',
          refs: 'Refs',
		  your_wallet_address: 'Your wallet address',
		  token_assets: "Token Assets",
		  balance: "Balance",
		  balance_usd: "Balance in USD",
		  balance_ton: "Balance in TON",
		  rewards: "Rewards",
		  buy_sell: "Buy | Sell",
		  number_of_referrals: "Number of referrals",
		  referral_share: "Total referral reward",
		  your_referral_link: "Your referral link"
        }
      },
      ru: {
        translation: {
          account: 'Аккаунт',
          disconnect: 'Отключить кошелёк',
          copy: 'Копировать',
          wallet: 'Кошелёк',
          games: 'Игры',
          nfts: 'NFTs',
          social: 'Соцсети',
          socials: 'Социальные сети',
          refs: 'Рефералы',
		  your_wallet_address: 'Адрес вашего кошелька',
		  token_assets: "Токены",
		  balance: "Баланс",
		  balance_usd: "Баланс в USD",
		  balance_ton: "Баланс в TON",
		  rewards: "Награды",
		  buy_sell: "Купить | Продать",
		  number_of_referrals: "Кол-во рефералов",
		  referral_share: "Всего доход от рефералов",
		  your_referral_link: "Ваша реферальная ссылка"
        }
      }
    }
  });

export default i18n;
