import React from 'react';
import { Lock, Crown, Sparkles, UserPlus, Gem } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGongSounds } from '@/hooks/useGongSounds';
import { PremiumPreviewProvider } from '@/contexts/PremiumPreviewContext';
import { motion } from 'framer-motion';
import { PixelAvatar } from '@/components/PixelAvatar';

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

      {/* Premium Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/85 to-background/70 backdrop-blur-sm">
        <div className="text-center p-6 max-w-sm mx-4">
          {/* Animated Avatar */}
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <PixelAvatar size="md" level={50} gender="male" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-primary-glow to-primary flex items-center justify-center animate-pulse">
                <Lock className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <h3 className="font-bold text-lg text-gradient-primary mb-2">
            🔒 Fonctionnalité Premium
          </h3>
          
          <p className="text-sm text-muted-foreground mb-2">
            {feature} — débloquez cette fonctionnalité et faites évoluer votre personnage !
          </p>
          
          <p className="text-xs text-primary mb-4 animate-pulse">
            <Gem className="w-3 h-3 inline mr-1" />
            Dès 12,50€/mois
          </p>

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
                  <span>Découvrir Premium</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handlePremiumAction(() => showUpgradeModal())}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                <Crown className="w-4 h-4" />
                <span>Débloquer avec Premium</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
