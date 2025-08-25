import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Users, Gift, Share, Copy, CheckCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../contexts/LanguageContext';

export function Refs() {
  const { t, language } = useLanguage();
  
  const [referralStats] = useState({
    totalReferrals: 12,
    totalRewards: '24.7',
    unclaimed: '3.2',
    percentage: '5'
  });

  const [referrals] = useState([
    { name: 'Алексей М.', avatar: '', rewards: '5.2', active: true },
    { name: 'Мария К.', avatar: '', rewards: '8.1', active: true },
    { name: 'Дмитрий П.', avatar: '', rewards: '2.4', active: false },
    { name: 'Елена С.', avatar: '', rewards: '6.8', active: true },
    { name: 'Андрей Т.', avatar: '', rewards: '2.2', active: false },
  ]);

  const referralLink = 'https://manetka.app/ref/user123';

  const handleClaim = () => {
    toast.success(language === 'ru' 
      ? 'Награды успешно выведены на кошелёк!' 
      : 'Rewards successfully withdrawn to wallet!'
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MANETKA Wallet',
        text: language === 'ru' 
          ? 'Присоединяйся к MANETKA и получай пассивный доход!'
          : 'Join MANETKA and earn passive income!',
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      toast.success(language === 'ru' 
        ? 'Ссылка скопирована в буфер обмена!' 
        : 'Link copied to clipboard!'
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">{t.refs}</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Users size={16} />
                {t.refs}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{referralStats.totalReferrals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Gift size={16} />
                {t.totalEarned}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{referralStats.totalRewards} TON</div>
            </CardContent>
          </Card>
        </div>

        {/* Unclaimed Rewards */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
              <Gift size={20} />
              {language === 'ru' ? 'Доступно к выводу' : 'Available to Withdraw'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-green-700 dark:text-green-300">{t.pending}:</span>
              <span className="text-2xl font-semibold text-green-800 dark:text-green-200">{referralStats.unclaimed} TON</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700 dark:text-green-300">
                {language === 'ru' ? 'Процент от рефералов:' : 'Percentage from referrals:'}
              </span>
              <span className="text-lg font-semibold text-green-800 dark:text-green-200">{referralStats.percentage}%</span>
            </div>
            <Button 
              onClick={handleClaim}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={parseFloat(referralStats.unclaimed) === 0}
            >
              <Gift size={16} />
              {language === 'ru' ? 'Вывести награды' : 'Withdraw Rewards'}
            </Button>
          </CardContent>
        </Card>

        {/* Referral Link */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share size={20} />
              {t.yourReferralLink}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="flex-1 text-sm font-mono truncate">{referralLink}</span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  toast.success(language === 'ru' ? 'Ссылка скопирована!' : 'Link copied!');
                }}
              >
                <Copy size={16} />
              </Button>
            </div>
            <Button onClick={handleShare} className="w-full">
             <Share size={16} /> {t.shareLink}
            </Button>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ru' ? 'Мои рефералы' : 'My Referrals'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={referral.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {referral.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {referral.name}
                        {referral.active && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {referral.active 
                          ? (language === 'ru' ? 'Активен' : 'Active')
                          : (language === 'ru' ? 'Неактивен' : 'Inactive')
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">+{referral.rewards} TON</div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ru' ? 'награды' : 'rewards'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}