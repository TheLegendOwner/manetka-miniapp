import { Home, Wallet, Grid3X3, Users, Image } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { t } = useLanguage();
  
  const tabs = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'wallet', label: t.wallet, icon: Wallet },
    { id: 'apps', label: t.apps, icon: Grid3X3 },
    { id: 'refs', label: t.refs, icon: Users },
    { id: 'nft', label: t.nft, icon: Image },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}