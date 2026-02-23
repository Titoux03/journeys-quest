import React from 'react';
import { Crown, Sparkles, Zap, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { useGongSounds } from '@/hooks/useGongSounds';
import { useTranslation } from 'react-i18next';
import { playSound } from '@/utils/soundManager';
import { motion } from 'framer-motion';
import { PixelAvatar } from '@/components/PixelAvatar';

interface PremiumCTAProps {
  context?: 'sidebar' | 'footer' | 'inline';
  className?: string;
}

export const PremiumCTA: React.FC<PremiumCTAProps> = ({ 
  context = 'inline',
  className = ""
}) => {
  const { t } = useTranslation();
  const { isPremium, showUpgradeModal } = usePremium();
  const { playPremium } = useGongSounds();

  if (isPremium) return null;

  const handleUpgrade = () => {
    playSound('click');
    playPremium();
    showUpgradeModal();
  };

  if (context === 'sidebar') {
    return (
      <div className={`p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20 rounded-xl ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <PixelAvatar size="sm" level={50} gender="male" />
          </motion.div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">Passe Premium</h4>
            <p className="text-xs text-muted-foreground">Débloque ton héros ✨</p>
          </div>
        </div>
        <Button 
          onClick={handleUpgrade}
          size="sm"
          className="w-full journey-button-primary text-xs"
        >
          <Crown className="w-3 h-3 mr-1" />
          Dès 12,50€/mois
        </Button>
      </div>
    );
  }

  if (context === 'footer') {
    return (
      <div className={`text-center p-6 border-t border-border/30 ${className}`}>
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <PixelAvatar size="sm" level={100} gender="male" />
            </motion.div>
            <span className="text-sm font-medium text-foreground">Fais évoluer ton personnage</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Items exclusifs • Coffres légendaires • Quêtes premium
          </p>
          <Button 
            onClick={handleUpgrade}
            size="sm"
            className="journey-button-primary"
          >
            <Gem className="w-4 h-4 mr-2" />
            S'abonner — dès 12,50€/mois
          </Button>
        </div>
      </div>
    );
  }

  // context === 'inline'
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-glow/5 border-2 border-primary/30 text-center relative overflow-hidden ${className}`}>
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center mb-4"
        >
          <PixelAvatar size="lg" level={100} gender="male" />
        </motion.div>
        
        <h3 className="text-xl font-bold text-gradient-primary mb-2">
          Débloquez votre héros intérieur 💛
        </h3>
        
        <p className="text-muted-foreground mb-6">
          Personnalisez votre avatar, débloquez des items exclusifs et accomplissez des quêtes premium.
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
          <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Items légendaires</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Coffres exclusifs</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Quêtes & récompenses</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span>Suivi d'addictions</span>
          </div>
        </div>
        
        <Button 
          onClick={handleUpgrade}
          className="journey-button-primary w-full group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <Crown className="w-4 h-4 mr-2" />
          S'abonner — dès 12,50€/mois
        </Button>
        
        <p className="text-xs text-muted-foreground mt-3">
          ⚡ Sans engagement • Annulable à tout moment
        </p>
      </div>
    </div>
  );
};
