import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingProps {
  onConnect: () => void;
}

export function Onboarding({ onConnect }: OnboardingProps) {
  const { t, language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 flex flex-col items-center justify-center p-6">
      <div className="max-w-sm mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="text-6xl mb-4">💎</div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-semibold text-foreground">{t.welcome}</h1>
          </div>
          <h1 className="text-3xl font-semibold text-primary">MANETKA</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {language === 'ru' 
              ? 'Стейблкоин, который работает, пока ты спишь'
              : 'The stablecoin that works while you sleep'
            }
          </p>
        </div>

        {/* Connect Button */}
        <Button 
          onClick={onConnect}
          className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
        >
          {t.connectWallet}
        </Button>

        {/* Info Dialog */}
        <Dialog>
          <DialogTrigger className="text-primary hover:text-primary/80 transition-colors cursor-pointer">
            {language === 'ru' ? 'Что такое MANETKA? 📖' : 'What is MANETKA? 📖'}
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>
                {language === 'ru' ? 'Что такое MANETKA?' : 'What is MANETKA?'}
              </DialogTitle>
              <DialogDescription>
                {language === 'ru' 
                  ? 'Узнайте больше о возможностях и особенностях стейблкоина MANETKA'
                  : 'Learn more about the features and capabilities of MANETKA stablecoin'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <p>
                {language === 'ru'
                  ? 'MANETKA - это инновационный стейблкоин в экосистеме TON, который приносит пассивный доход.'
                  : 'MANETKA is an innovative stablecoin in the TON ecosystem that generates passive income.'
                }
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">
                  {language === 'ru' ? 'Особенности:' : 'Features:'}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>{language === 'ru' ? 'Пассивный доход в TON' : 'Passive income in TON'}</li>
                  <li>{language === 'ru' ? 'NFT-бусты для увеличения прибыли' : 'NFT boosts to increase profits'}</li>
                  <li>{language === 'ru' ? 'Реферальная система' : 'Referral system'}</li>
                  <li>{language === 'ru' ? 'Стабильность и надежность' : 'Stability and reliability'}</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}