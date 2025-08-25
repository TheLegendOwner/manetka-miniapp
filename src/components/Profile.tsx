import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';

import { ArrowLeft, User, Settings, Moon, Sun, LogOut, MessageSquare, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileProps {
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Profile({ onClose, isDarkMode, onToggleTheme }: ProfileProps) {
  const { language, setLanguage, t } = useLanguage();
  
  // Mock Telegram user data
  const telegramUser = {
    firstName: "Максим",
    lastName: "Андреев",
    username: "@max_andreev",
    id: "123456789",
    avatar: "/placeholder-avatar.jpg"
  };

  const handleLogout = () => {
    // Здесь будет логика выхода
    console.log("Logout");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <Button variant="ghost" onClick={onClose} className="hover:bg-muted bg-[rgba(0,0,0,0)] px-2 text-primary">
          ← {t.back || 'Back'}
        </Button>
        <h1 className="text-xl font-semibold">{t.profile}</h1>
        <div className="w-10" />
      </div>

      <div className="p-6 space-y-6">
        {/* Telegram User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              {t.telegramAccount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={telegramUser.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {telegramUser.firstName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {telegramUser.firstName} {telegramUser.lastName}
                </h3>
                <p className="text-muted-foreground">{telegramUser.username}</p>
                <p className="text-sm text-muted-foreground">ID: {telegramUser.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} className="text-primary" />
              {t.settings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon size={20} className="text-primary" />
                ) : (
                  <Sun size={20} className="text-primary" />
                )}
                <div>
                  <div className="font-medium">{isDarkMode ? t.darkTheme : t.lightTheme}</div>
                </div>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={onToggleTheme}
              />
            </div>

            {/* Language Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Languages size={20} className="text-primary" />
                <div>
                  <div className="font-medium">{t.language}</div>
                </div>
              </div>
              <div className="flex items-center bg-muted rounded-md p-1">
                <button
                  onClick={() => setLanguage('ru')}
                  className={`px-3 py-1 rounded-sm transition-colors ${
                    language === 'ru' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  RU
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-sm transition-colors ${
                    language === 'en' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="p-4">
            <Button 
              variant="destructive" 
              className="w-full flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              {t.logout}
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>{t.appVersion}</p>
          <p>{t.appDescription}</p>
        </div>
      </div>
    </div>
  );
}