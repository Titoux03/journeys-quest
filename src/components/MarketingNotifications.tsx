import React, { useEffect, useState } from 'react';
import { Crown, TrendingUp, Sparkles, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { useGongSounds } from '@/hooks/useGongSounds';
import { useTranslation } from 'react-i18next';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'streak' | 'progress' | 'feature' | 'motivation';
  delay: number; // en millisecondes  
  triggerCondition?: () => boolean;
}

// Notifications will use translation keys
const getMarketingNotifications = (t: any): NotificationData[] => [
  {
    id: 'welcome-back',
    title: t('marketing.welcomeBack'),
    message: t('marketing.unlockHistory'),
    type: 'progress',
    delay: 10000,
  },
  {
    id: 'progress-tease',
    title: t('marketing.youreProgressing'),
    message: t('marketing.visualizeEvolution'),
    type: 'feature',
    delay: 30000,
  },
  {
    id: 'streak-motivation',
    title: t('marketing.dontStop'),
    message: t('marketing.streaksHelp'),
    type: 'streak',
    delay: 60000,
  }
];

interface MarketingNotificationProps {
  onClose: () => void;
  notification: NotificationData;
}

const MarketingNotification: React.FC<MarketingNotificationProps> = ({ 
  onClose, 
  notification 
}) => {
  const { t } = useTranslation();
  const { showUpgradeModal } = usePremium();
  const { playPremium } = useGongSounds();

  const handleUpgrade = () => {
    playPremium();
    showUpgradeModal();
    onClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'streak': return <Target className="w-5 h-5" />;
      case 'progress': return <TrendingUp className="w-5 h-5" />;
      case 'feature': return <Sparkles className="w-5 h-5" />;
      default: return <Crown className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="journey-card-premium max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start space-x-3 pr-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {notification.message}
            </p>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleUpgrade}
                size="sm"
                className="journey-button-primary text-xs px-3 py-1 h-auto"
              >
                <Crown className="w-3 h-3 mr-1" />
                {t('marketing.discover')}
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="text-xs px-3 py-1 h-auto"
              >
                {t('marketing.later')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MarketingNotifications: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [activeNotification, setActiveNotification] = useState<NotificationData | null>(null);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Ne pas afficher les notifications si l'utilisateur est premium
    if (isPremium || !user) return;

    // Vérifier quelles notifications ont déjà été montrées aujourd'hui
    const today = new Date().toDateString();
    const todayKey = `notifications_${today}`;
    const todayShown = JSON.parse(localStorage.getItem(todayKey) || '[]') as string[];
    const todaySet = new Set(todayShown);
    setShownNotifications(todaySet);

    // Programmer les notifications
    const timers: NodeJS.Timeout[] = [];
    const marketingNotifications = getMarketingNotifications(t);

    marketingNotifications.forEach(notification => {
      if (todaySet.has(notification.id)) return;

      const timer = setTimeout(() => {
        if (!isPremium) { // Vérifier encore au moment de l'affichage
          setActiveNotification(notification);
          
          // Marquer comme affiché
          const newShown = [...todayShown, notification.id];
          localStorage.setItem(todayKey, JSON.stringify(newShown));
          setShownNotifications(new Set(newShown));
        }
      }, notification.delay);

      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [user, isPremium]);

  const handleCloseNotification = () => {
    setActiveNotification(null);
  };

  if (!activeNotification) return null;

  return (
    <MarketingNotification 
      notification={activeNotification} 
      onClose={handleCloseNotification}
    />
  );
};