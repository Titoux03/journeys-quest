import React from 'react';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';

interface PremiumLockProps {
  children: React.ReactNode;
  feature: string;
  className?: string;
}

export const PremiumLock: React.FC<PremiumLockProps> = ({ 
  children, 
  feature, 
  className = "" 
}) => {
  const { isPremium, showUpgradeModal } = usePremium();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred/Dimmed Content */}
      <div className="opacity-60 pointer-events-none filter blur-[1px]">
        {children}
      </div>

      {/* Premium Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm">
        <button
          onClick={() => showUpgradeModal()}
          className="journey-card-premium text-center hover:scale-105 transition-all duration-300 p-6 max-w-xs mx-4 group"
        >
          {/* Premium Icon */}
          <div className="relative mb-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-primary-glow to-primary flex items-center justify-center animate-pulse">
              <Lock className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>

          {/* Text */}
          <h3 className="font-bold text-lg text-gradient-primary mb-2">
            Fonctionnalité Premium
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            {feature} est disponible avec Journeys Premium
          </p>

          {/* CTA */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm group-hover:bg-primary/20 transition-colors">
            <Sparkles className="w-4 h-4" />
            <span>Débloquer</span>
          </div>
        </button>
      </div>
    </div>
  );
};