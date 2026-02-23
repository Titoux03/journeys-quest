import React from 'react';
import { Crown, Star, Zap, Target, Gem } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useGongSounds } from '@/hooks/useGongSounds';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PixelAvatar } from '@/components/PixelAvatar';

interface PremiumProgressInterruptorProps {
  journalDay: number;
  onClose: () => void;
  className?: string;
}

export const PremiumProgressInterruptor: React.FC<PremiumProgressInterruptorProps> = ({ 
  journalDay, 
  onClose,
  className = ""
}) => {
  const { isPremium, showUpgradeModal } = usePremium();
  const { user } = useAuth();
  const { playPremium } = useGongSounds();

  const handleUpgrade = () => {
    playPremium();
    showUpgradeModal();
  };

  if (isPremium || !user) return null;

  const shouldShow = journalDay === 3 || journalDay === 7 || journalDay === 14 || journalDay === 21 || (journalDay > 21 && journalDay % 7 === 0);
  
  if (!shouldShow) return null;

  // Avatar level based on journal day to show progression
  const avatarLevel = Math.min(journalDay * 3, 100);

  return (
    <div className={`fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full journey-card-premium p-8 text-center relative overflow-hidden"
      >
        {/* Shimmer animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm z-10"
        >
          ✕
        </button>

        <div className="relative z-10">
          {/* Day badge */}
          <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
            Jour {journalDay} 🎯
          </div>

          {/* Animated Avatar */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--primary) / 0.25), transparent)',
                  filter: 'blur(15px)',
                  transform: 'scale(2.5)',
                }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <PixelAvatar size="lg" level={avatarLevel} gender="male" />
            </div>
          </motion.div>

          {/* Messages contextuels liés au personnage */}
          {journalDay === 3 && (
            <>
              <h2 className="text-2xl font-bold text-gradient-primary mb-3">
                Bravo ! 3 jours de suite 🔥
              </h2>
              <p className="text-muted-foreground mb-6">
                Ton personnage progresse ! Passe Premium pour débloquer des <strong className="text-foreground">items exclusifs</strong> et des évolutions visuelles.
              </p>
            </>
          )}

          {journalDay === 7 && (
            <>
              <h2 className="text-2xl font-bold text-gradient-primary mb-3">
                1 semaine ! Ton héros évolue 🚀
              </h2>
              <p className="text-muted-foreground mb-6">
                Ton personnage peut maintenant porter des <strong className="text-foreground">tenues légendaires</strong> ! Passe Premium pour débloquer tous les styles.
              </p>
            </>
          )}

          {journalDay === 14 && (
            <>
              <h2 className="text-2xl font-bold text-gradient-primary mb-3">
                2 semaines d'affilée ! 👑
              </h2>
              <p className="text-muted-foreground mb-6">
                Tu mérites des <strong className="text-foreground">coffres épiques</strong> ! Avec Premium, ouvre des coffres et équipe des items rares.
              </p>
            </>
          )}

          {journalDay >= 21 && (
            <>
              <h2 className="text-2xl font-bold text-gradient-primary mb-3">
                {journalDay} jours ! Héros légendaire 🏆
              </h2>
              <p className="text-muted-foreground mb-6">
                Ta discipline est exceptionnelle ! Avec Premium, débloque l'<strong className="text-foreground">aura légendaire</strong> et tous les items exclusifs.
              </p>
            </>
          )}

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-lg font-bold text-muted-foreground mb-1">Gratuit</div>
              <div className="text-xs text-muted-foreground">Avatar basique</div>
              <div className="text-xs text-warning">Items limités</div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="text-lg font-bold text-gradient-primary mb-1">Premium</div>
              <div className="text-xs text-foreground">Items exclusifs</div>
              <div className="text-xs text-success">Coffres & quêtes</div>
            </div>
          </div>

          {/* CTA */}
          <Button 
            onClick={handleUpgrade}
            className="journey-button-primary w-full group relative overflow-hidden mb-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Crown className="w-5 h-5 mr-2" />
            S'abonner — dès 12,50€/mois
          </Button>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex flex-col items-center">
              <Star className="w-4 h-4 text-success mb-1" />
              <span>Sans engagement</span>
            </div>
            <div className="flex flex-col items-center">
              <Gem className="w-4 h-4 text-primary mb-1" />
              <span>Items exclusifs</span>
            </div>
            <div className="flex flex-col items-center">
              <Target className="w-4 h-4 text-accent mb-1" />
              <span>Quêtes premium</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
