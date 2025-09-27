import React from 'react';
import { Lock, Crown, Sparkles, UserPlus } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGongSounds } from '@/hooks/useGongSounds';
import { PremiumPreviewProvider } from '@/contexts/PremiumPreviewContext';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playPremium } = useGongSounds();

  const handlePremiumAction = (action: () => void) => {
    playPremium();
    action();
  };

  if (isPremium) {
    return (
      <PremiumPreviewProvider isPreviewMode={false}>
        {children}
      </PremiumPreviewProvider>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Blurred/Dimmed Content */}
      <div className="opacity-50 pointer-events-none filter blur-[2px] scale-95 transform-gpu">
        <PremiumPreviewProvider isPreviewMode={true}>
          {children}
        </PremiumPreviewProvider>
      </div>

      {/* Premium Overlay avec FOMO */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/85 to-background/70 backdrop-blur-sm">
        <div className="text-center p-6 max-w-sm mx-4">
          {/* Premium Icon avec effet de brillance */}
          <div className="relative mb-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/40 transition-all duration-300 pulse-glow">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-primary-glow to-primary flex items-center justify-center animate-pulse">
              <Lock className="w-3 h-3 text-primary-foreground" />
            </div>
            {/* Badge d'offre limitée */}
            <div className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              -50%
            </div>
          </div>

          {/* Text avec urgence */}
          <h3 className="font-bold text-lg text-gradient-primary mb-2">
            🔒 Fonctionnalité Premium
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3">
            {feature} transforme votre parcours
          </p>

          {/* Indicateur de valeur sociale */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
            <p className="text-xs text-primary font-medium">
              ⚡ +2,847 utilisateurs cette semaine
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ne ratez pas cette progression
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!user ? (
              <>
                <button
                  onClick={() => handlePremiumAction(() => navigate('/auth'))}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Créer un compte</span>
                </button>
                <button
                  onClick={() => handlePremiumAction(() => showUpgradeModal())}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Acheter Premium</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handlePremiumAction(() => showUpgradeModal())}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Débloquer Premium</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};