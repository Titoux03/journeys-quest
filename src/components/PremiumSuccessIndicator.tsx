import React from 'react';
import { TrendingUp, Crown, Star, Target, Gem } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PixelAvatar } from '@/components/PixelAvatar';

interface PremiumSuccessIndicatorProps {
  className?: string;
}

export const PremiumSuccessIndicator: React.FC<PremiumSuccessIndicatorProps> = ({ 
  className = ""
}) => {
  const { isPremium, showUpgradeModal } = usePremium();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (isPremium || !user) return null;

  return (
    <div className={`journey-card p-6 border-l-4 border-l-primary ${className}`}>
      {/* Header with Avatar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <PixelAvatar size="sm" level={50} gender="male" />
          </motion.div>
          <span className="font-semibold text-foreground">Ton héros t'attend</span>
        </div>
        <div className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-bold">
          Premium
        </div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold text-muted-foreground mb-2">Gratuit</div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>• Avatar basique</div>
            <div>• Items limités</div>
            <div>• Fonctions de base</div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary mb-2">Premium</div>
          <div className="space-y-2 text-xs text-foreground">
            <div className="text-success">✓ Items légendaires</div>
            <div className="text-success">✓ Coffres & quêtes</div>
            <div className="text-success">✓ Suivi multi-addictions</div>
          </div>
        </div>
      </div>

      {/* Motivational */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Gem className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Fais évoluer ton personnage</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Chaque jour avec Premium te rapproche de nouvelles évolutions, items et quêtes exclusives.
        </p>
      </div>

      {/* CTA */}
      <button 
        onClick={showUpgradeModal}
        className="w-full text-left p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              S'abonner — dès 12,50€/mois
            </div>
            <div className="text-xs text-muted-foreground">
              Sans engagement • Annulable à tout moment
            </div>
          </div>
          <Crown className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    </div>
  );
};
