import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Navigation } from './components/Navigation';
import { Wallet } from './components/Wallet';
import { Apps } from './components/Apps';
import { Refs } from './components/Refs';
import { Social } from './components/Social';
import { NFT } from './components/NFT';
import { Profile } from './components/Profile';
import { DatePickerDemo } from './components/DatePickerDemo';

type Screen = 'onboarding' | 'dashboard' | 'wallet' | 'apps' | 'refs' | 'social' | 'nft' | 'profile' | 'datepicker';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // For development: skip onboarding
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Uncomment to skip to date picker demo
      // setCurrentScreen('datepicker');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleConnect = () => {
    setCurrentScreen('dashboard');
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentScreen(tab as Screen);
  };

  const handleProfileClick = () => {
    setCurrentScreen('profile');
  };

  const handleProfileClose = () => {
    setCurrentScreen('dashboard');
    setActiveTab('dashboard');
  };

  const handleSocialAccess = () => {
    setCurrentScreen('social');
  };

  const handleRefsAccess = () => {
    setCurrentScreen('refs');
    setActiveTab('refs');
  };

  // Development helper to access date picker demo
  const handleDatePickerDemo = () => {
    setCurrentScreen('datepicker');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <Onboarding onConnect={handleConnect} />;
      case 'dashboard':
        return (
          <Dashboard 
            onProfileClick={handleProfileClick} 
            onSocialClick={handleSocialAccess}
            onRefsClick={handleRefsAccess}
          />
        );
      case 'wallet':
        return <Wallet />;
      case 'apps':
        return <Apps onDatePickerDemo={handleDatePickerDemo} />;
      case 'refs':
        return <Refs />;
      case 'social':
        return <Social />;
      case 'nft':
        return <NFT />;
      case 'profile':
        return (
          <Profile 
            onClose={handleProfileClose} 
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        );
      case 'datepicker':
        return <DatePickerDemo />;
      default:
        return (
          <Dashboard 
            onProfileClick={handleProfileClick} 
            onSocialClick={handleSocialAccess}
            onRefsClick={handleRefsAccess}
          />
        );
    }
  };

  const showNavigation = currentScreen !== 'onboarding' && currentScreen !== 'profile' && currentScreen !== 'datepicker';

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background max-w-md mx-auto relative">
        {renderScreen()}
        {showNavigation && (
          <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
        )}
        <Toaster />
      </div>
    </LanguageProvider>
  );
}