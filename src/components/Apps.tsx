import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, Gamepad2, TrendingUp, Users, Calendar, Zap, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AppsProps {
  onDatePickerDemo?: () => void;
}

export function Apps({ onDatePickerDemo }: AppsProps) {
  const { t } = useLanguage();

  const apps = [
    {
      id: 'datepicker',
      name: t.language === 'ru' ? 'Демо: Выбор дат' : 'Demo: Date Pickers',
      description: t.language === 'ru' ? 'Демонстрация компонентов выбора дат' : 'Date picker components showcase',
      icon: Calendar,
      category: 'demo',
      status: 'available',
      onClick: onDatePickerDemo
    },
    {
      id: 'staking',
      name: t.language === 'ru' ? 'MANETKA Стейкинг' : 'MANETKA Staking',
      description: t.language === 'ru' ? 'Заблокируйте токены и получайте награды' : 'Lock tokens and earn rewards',
      icon: TrendingUp,
      category: 'defi',
      status: 'available'
    },
    {
      id: 'gaming',
      name: t.language === 'ru' ? 'MANETKA Игры' : 'MANETKA Gaming',
      description: t.language === 'ru' ? 'Играйте и зарабатывайте токены' : 'Play games and earn tokens',
      icon: Gamepad2,
      category: 'gaming',
      status: 'coming_soon'
    },
    {
      id: 'governance',
      name: t.language === 'ru' ? 'Управление' : 'Governance',
      description: t.language === 'ru' ? 'Голосуйте за предложения сообщества' : 'Vote on community proposals',
      icon: Users,
      category: 'dao',
      status: 'available'
    },
    {
      id: 'yield',
      name: t.language === 'ru' ? 'Yield Farming' : 'Yield Farming',
      description: t.language === 'ru' ? 'Зарабатывайте на ликвидности' : 'Earn from liquidity provision',
      icon: Zap,
      category: 'defi',
      status: 'coming_soon'
    },
    {
      id: 'insurance',
      name: t.language === 'ru' ? 'Страхование' : 'Insurance',
      description: t.language === 'ru' ? 'Защитите свои активы' : 'Protect your assets',
      icon: Shield,
      category: 'defi',
      status: 'coming_soon'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
            {t.language === 'ru' ? 'Доступно' : 'Available'}
          </Badge>
        );
      case 'coming_soon':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
            {t.language === 'ru' ? 'Скоро' : 'Coming Soon'}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'demo':
        return t.language === 'ru' ? 'Демо' : 'Demo';
      case 'defi':
        return 'DeFi';
      case 'gaming':
        return t.language === 'ru' ? 'Игры' : 'Gaming';
      case 'dao':
        return 'DAO';
      default:
        return category;
    }
  };

  const handleAppClick = (app: typeof apps[0]) => {
    if (app.onClick) {
      app.onClick();
    } else if (app.status === 'available') {
      // Handle other app clicks
      console.log(`Opening app: ${app.id}`);
    }
  };

  const groupedApps = apps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, typeof apps>);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{t.apps}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.language === 'ru' 
                ? 'Исследуйте экосистему MANETKA' 
                : 'Explore the MANETKA ecosystem'}
            </p>
          </div>
        </div>

        {/* App Categories */}
        <div className="space-y-6">
          {Object.entries(groupedApps).map(([category, categoryApps]) => (
            <div key={category}>
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                {getCategoryName(category)}
                <Badge variant="outline" className="text-xs">
                  {categoryApps.length}
                </Badge>
              </h2>
              
              <div className="grid gap-4">
                {categoryApps.map((app) => {
                  const IconComponent = app.icon;
                  const isClickable = app.status === 'available' || app.onClick;
                  
                  return (
                    <Card 
                      key={app.id} 
                      className={`transition-all ${
                        isClickable 
                          ? 'hover:shadow-md cursor-pointer' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => isClickable && handleAppClick(app)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <IconComponent size={24} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{app.name}</h3>
                                {getStatusBadge(app.status)}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {app.description}
                              </p>
                            </div>
                          </div>
                          {isClickable && (
                            <ExternalLink size={16} className="text-muted-foreground ml-2" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <Zap size={32} className="mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">
              {t.language === 'ru' ? 'Больше приложений скоро!' : 'More apps coming soon!'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t.language === 'ru' 
                ? 'Мы постоянно расширяем экосистему MANETKA новыми возможностями' 
                : 'We are constantly expanding the MANETKA ecosystem with new features'}
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              {t.language === 'ru' ? 'Узнать больше' : 'Learn more'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}