import React from 'react';
import { TrendingUp, Crown, Star, Target } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">{t('premium.features.title')}</span>
        </div>
        <div className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-bold">
          {t('premium.features.available')}
        </div>
      </div>

      {/* Comparaison fonctionnalités */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold text-muted-foreground mb-2">{t('premium.features.free')}</div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div>• {t('premium.features.basicJournal')}</div>
            <div>• {t('premium.features.simpleNotes')}</div>
            <div>• {t('premium.features.limitedFeatures')}</div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-primary mb-2">{t('premium.features.premium')}</div>
          <div className="space-y-2 text-xs text-foreground">
            <div className="text-success">✓ {t('premium.features.multiAddictionTracking')}</div>
            <div className="text-success">✓ {t('premium.features.fullHistory')}</div>
            <div className="text-success">✓ {t('premium.features.badgesGamification')}</div>
          </div>
        </div>
      </div>

      {/* Indicateur de valeur */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium text-warning">{t('premium.features.untappedPotential')}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('premium.features.untappedPotentialDesc')}
        </p>
      </div>

      {/* CTA subtil */}
      <button 
        onClick={showUpgradeModal}
        className="w-full text-left p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {t('premium.features.unlockAll')}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="line-through opacity-60 mr-1">{t('premium.oldPrice')}</span>
              {t('premium.features.fullAccess')}
            </div>
          </div>
          <Star className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    </div>
  );
};