import React from 'react';
import { Crown, Sparkles, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { useGongSounds } from '@/hooks/useGongSounds';

interface PremiumTeaserProps {
  title: string;
  description: string;
  variant?: 'compact' | 'full' | 'success';
  feature?: string;
  className?: string;
}

export const PremiumTeaser: React.FC<PremiumTeaserProps> = ({ 
  title, 
  description, 
  variant = 'compact',
  feature,
  className = ""
}) => {
  const { showUpgradeModal } = usePremium();
  const { playPremium } = useGongSounds();

  const handleUpgrade = () => {
    playPremium();
    showUpgradeModal();
  };

  if (variant === 'compact') {
    return (
      <div className={`p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary-glow/10 border border-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <button
            onClick={handleUpgrade}
            className="text-primary hover:text-primary-glow transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'success') {
    return (
      <div className={`p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary-glow/5 border-2 border-primary/20 text-center ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-bold text-gradient-primary mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Button
          onClick={handleUpgrade}
          className="journey-button-primary group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <Crown className="w-4 h-4 mr-2" />
          Débloque Journeys Premium
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Visualise ton évolution complète ✨
        </p>
      </div>
    );
  }

  // variant === 'full'
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
          <Eye className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gradient-primary mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleUpgrade}
              size="sm"
              className="journey-button-primary group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Crown className="w-4 h-4 mr-1" />
              Découvrir
            </Button>
            <div className="flex items-center space-x-1 text-xs text-primary">
              <TrendingUp className="w-3 h-3" />
              <span>Accès premium requis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour les badges premium visibles partout
export const PremiumBadge: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-full border border-primary/30 ${className}`}>
      <Crown className="w-3 h-3 text-primary" />
      <span className="text-xs font-medium text-primary">Premium</span>
    </div>
  );
};

// Composant pour les features verrouillées élégamment
export const PremiumLockOverlay: React.FC<{ feature: string; children: React.ReactNode }> = ({ 
  feature, 
  children 
}) => {
  const { showUpgradeModal } = usePremium();
  const { playPremium } = useGongSounds();

  const handleUnlock = () => {
    playPremium();
    showUpgradeModal();
  };

  return (
    <div className="relative group">
      <div className="opacity-60 pointer-events-none filter blur-[0.5px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button 
          onClick={handleUnlock}
          className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 transition-transform duration-200"
        >
          <Crown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};