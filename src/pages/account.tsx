'use client';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { Wallet, Gamepad2, Image as ImageIcon, Users, Share2, ArrowLeft } from 'lucide-react';
import { Address } from '@ton/core';
import '../lib/i18n';
import { useTelegram } from '../context/TelegramContext';

export default function AccountPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user, ready } = useTelegram();
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();

  if (!ready) {
    return <p>Инициализация Telegram...</p>;
  }

  // Если нет данных Telegram и нет кошелька — показываем сообщение
  if (!user && !tonAddress) {
    return <p>Данные пользователя недоступны.</p>;
  }

  // Фолбэк-аватар при отсутствии photo_url
  const avatarSrc = user?.photo_url || `/icons/avatar${Math.floor(Math.random() * 11) + 1}.svg`;
  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const username = user?.username;

  const walletAddress = tonAddress || (
    tonConnectUI.account?.address
      ? Address.parseRaw(tonConnectUI.account.address).toString({ urlSafe: true, bounceable: true, testOnly: false })
      : ''
  );

  const disconnect = async () => {
    await tonConnectUI.disconnect();
    router.replace('/');
  };

  const copyAddress = () => {
    if (walletAddress) navigator.clipboard.writeText(walletAddress);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] font-['Aboreto']">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 py-4 px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="text-gray-700"><ArrowLeft size={24} /></button>
          <h1 className="text-[20px] font-semibold text-[#171A1F] uppercase">{t('account')}</h1>
        </div>
        <div className="flex gap-2 bg-gray-200 rounded-full p-1">
          <button
            onClick={() => i18n.changeLanguage('ru')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              i18n.language === 'ru' ? 'bg-[#EBB923] text-black' : 'text-gray-500'
            }`}
          >RU</button>
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              i18n.language === 'en' ? 'bg-[#EBB923] text-black' : 'text-gray-500'
            }`}
          >EN</button>
        </div>
      </div>

      {/* User Info */}
      <div className="flex flex-col gap-4 px-4 pt-6 pb-24">
        <div className="flex items-center gap-4">
          <div className="w-[75px] h-[75px] rounded-full overflow-hidden border border-gray-300">
            <Image src={avatarSrc} alt="avatar" width={75} height={75} unoptimized />
          </div>
          <div>
            {user ? (
              <>
                <p className="text-[16px] font-medium text-[#171A1F]">{firstName} {lastName}</p>
                {username && <p className="text-[14px] text-[#9095A1]">@{username}</p>}
              </>
            ) : (
              <p className="text-[16px] font-medium text-[#171A1F]">Wallet User</p>
            )}
          </div>
        </div>

        {/* Wallet Address */}
        <div>
          <p className="text-[14px] text-[#171A1F] font-semibold">{t('your_wallet_address')}:</p>
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
            <p className="text-[14px] text-[#171A1F] break-all">{walletAddress || t('no_wallet_connected')}</p>
            {walletAddress && (
              <button onClick={copyAddress} className="ml-4 px-3 py-1 text-sm font-medium rounded-full bg-[#EBB923] text-black">
                {t('copy')}
              </button>
            )}
          </div>
        </div>

        {/* Connect / Disconnect Button */}
        {tonConnectUI.account ? (
          <button onClick={disconnect} className="w-full bg-black text-white text-sm py-3 rounded-full uppercase">{t('disconnect')}</button>
        ) : (
          <button onClick={() => tonConnectUI.openModal()} className="w-full bg-black text-white text-sm py-3 rounded-full uppercase">{t('connect')}</button>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-2 px-4 flex justify-between items-center shadow-md">
        <button onClick={() => router.push('/wallet')} className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Wallet size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('wallet')}</span>
        </button>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <Gamepad2 size={24} className="mb-1 opacity-50" />
          <span className="text-[12px] font-medium">{t('games')}</span>
        </div>
        <div className="w-1/5 flex flex-col items-center text-gray-300 cursor-not-allowed">
          <ImageIcon size={24} className="mb-1 opacity-50" />
          <span className="text-[12px] font-medium">{t('nfts')}</span>
        </div>
        <button onClick={() => router.push('/social')} className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Share2 size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('social')}</span>
        </button>
        <button onClick={() => router.push('/refs')} className="w-1/5 flex flex-col items-center text-gray-500 hover:text-yellow-600">
          <Users size={24} className="mb-1" />
          <span className="text-[12px] font-medium">{t('refs')}</span>
        </button>
      </div>
    </div>
  );
}