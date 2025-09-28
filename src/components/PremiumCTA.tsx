import React from 'react';
import { Crown, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { useGongSounds } from '@/hooks/useGongSounds';

interface PremiumCTAProps {
  context?: 'sidebar' | 'footer' | 'inline';
  className?: string;
}

export const PremiumCTA: React.FC<PremiumCTAProps> = ({ 
  context = 'inline',
  className = ""
}) => {
  const { isPremium, showUpgradeModal } = usePremium();
  const { playPremium } = useGongSounds();

  if (isPremium) return null;

  const handleUpgrade = () => {
    playPremium();
    showUpgradeModal();
  };

  if (context === 'sidebar') {
    return (
      <div className={`p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20 rounded-xl ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">Premium</h4>
            <p className="text-xs text-muted-foreground">Toutes les fonctionnalités</p>
          </div>
        </div>
        <Button 
          onClick={handleUpgrade}
          size="sm"
          className="w-full journey-button-primary text-xs"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Débloquer
        </Button>
      </div>
    );
  }

  if (context === 'footer') {
    return (
      <div className={`text-center p-6 border-t border-border/30 ${className}`}>
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Débloquez tout le potentiel</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Accès illimité • Suivi complet • Gamification
          </p>
          <Button 
            onClick={handleUpgrade}
            size="sm"
            className="journey-button-primary"
          >
            <Crown className="w-4 h-4 mr-2" />
            Journeys Premium
          </Button>
        </div>
      </div>
    );
  }

  // context === 'inline'
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-glow/5 border-2 border-primary/30 text-center relative overflow-hidden ${className}`}>
      
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center pulse-glow">
        <Crown className="w-8 h-8 text-primary-foreground" />
      </div>
      
      <h3 className="text-xl font-bold text-gradient-primary mb-2">
        Développez tout votre potentiel 📈
      </h3>
      
      <p className="text-muted-foreground mb-6">
        Débloquez l'historique complet, les routines premium et la gamification avancée pour transformer chaque jour en victoire.
      </p>
      
      <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
        <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-lg">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>Historique illimité</span>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-lg">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>Suivi d'abstinence</span>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-lg">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>Tâches matinales</span>
        </div>
        <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-lg">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>Routines premium</span>
        </div>
      </div>
      
      <Button 
        onClick={handleUpgrade}
        className="journey-button-primary w-full group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        <Crown className="w-4 h-4 mr-2" />
        Débloquer Premium (14,99€)
      </Button>
      
      <p className="text-xs text-muted-foreground mt-3">
        ⚡ Paiement unique • Pas d'abonnement • Accès à vie
      </p>
    </div>
  );
};