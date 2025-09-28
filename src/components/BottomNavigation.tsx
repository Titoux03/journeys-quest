import React from 'react';
import { Calendar, Clock, Target, Dumbbell, TrendingUp, Crown } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'calendar', name: 'Calendrier', icon: Calendar, free: true },
  { id: 'meditation', name: 'Méditation', icon: Clock, free: true },
  { id: 'abstinence', name: 'Abstinence', icon: Target, free: false },
  { id: 'stretching', name: 'Stretching', icon: Dumbbell, free: false },
  { id: 'progress', name: 'Progrès', icon: TrendingUp, free: false },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { isPremium } = usePremium();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Safe area pour les appareils avec encoche */}
      <div className="safe-area-bottom" />
      
      {/* Barre de navigation */}
      <div className="bg-card/95 backdrop-blur-lg border-t border-border/50">
        <div className="grid grid-cols-5 items-center px-2 py-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.id;
            const isPremiumFeature = !tab.free && !isPremium;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex flex-col items-center justify-center py-2 px-1 rounded-xl
                  transition-all duration-300 min-h-[60px]
                  ${isActive 
                    ? 'bg-primary/20 text-primary' 
                    : isPremiumFeature
                      ? 'text-muted-foreground/50'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
                disabled={isPremiumFeature}
              >
                {/* Icône avec effet premium */}
                <div className="relative">
                  <IconComponent className={`w-5 h-5 mb-1 ${isActive ? 'animate-pulse-glow' : ''}`} />
                  
                  {/* Badge Premium */}
                  {isPremiumFeature && (
                    <Crown className="w-3 h-3 text-primary absolute -top-1 -right-1" />
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                  {tab.name}
                </span>
                
                {/* Indicateur actif */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
                
                {/* Effet de survol premium */}
                {!isPremiumFeature && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};