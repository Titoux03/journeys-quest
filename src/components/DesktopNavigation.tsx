import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  TrendingUp, 
  Timer, 
  Shield, 
  Leaf,
  LogOut,
  LogIn,
  PenTool,
  CheckSquare,
  BarChart3,
  User,
  Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LanguageToggle } from '@/components/LanguageToggle';


interface DesktopNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ 
  currentScreen, 
  onNavigate 
}) => {
  const { user, signOut } = useAuth();
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: t('navigation.home') },
    { id: 'avatar', icon: User, label: 'Avatar' },
    { id: 'journal', icon: TrendingUp, label: 'Score' },
    { id: 'todos', icon: CheckSquare, label: t('navigation.todos') },
    { id: 'notes', icon: PenTool, label: t('navigation.notes') },
    { id: 'meditation', icon: Timer, label: 'Focus' },
    { id: 'abstinence', icon: Shield, label: t('navigation.addictions') },
    { id: 'stretching', icon: Leaf, label: t('navigation.stretching') },
    { id: 'progress', icon: BarChart3, label: t('navigation.progress') },
  ];

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:bg-card/95 lg:backdrop-blur-md lg:border-r lg:border-border/50">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient-primary">Journeys</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('authPage.subtitle')}</p>
          </div>
          <LanguageToggle />
        </div>

        {/* User Info with GlobalAvatar */}
        {user && (
          <button
            onClick={() => onNavigate('avatar')}
            className="w-full flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPremium ? t('userStatus.premium') : t('userStatus.freeVersion')}
              </p>
            </div>
          </button>
        )}

        {!user && (
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-sm font-medium mb-2">{t('userStatus.guestMode')}</p>
            <Button
              onClick={() => navigate('/auth')}
              size="sm"
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t('userStatus.signIn')}
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onNavigate(item.id)}
                className={`w-full justify-start gap-3 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={handleAuthAction}
          className={`w-full justify-start gap-3 ${
            user 
              ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
          }`}
        >
          {user ? (
            <>
              <LogOut size={20} />
              <span className="font-medium">{t('navigation.signOut')}</span>
            </>
          ) : (
            <>
              <LogIn size={20} />
              <span className="font-medium">{t('navigation.signIn')}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
