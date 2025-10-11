import React from 'react';
import { CheckSquare, Crown, Sparkles, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePremium } from '@/hooks/usePremium';
import { useGongSounds } from '@/hooks/useGongSounds';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface PremiumTodoTeaserProps {
  className?: string;
}

export const PremiumTodoTeaser: React.FC<PremiumTodoTeaserProps> = ({ className = "" }) => {
  const { showUpgradeModal } = usePremium();
  const { playPremium } = useGongSounds();
  const { t } = useTranslation();

  const handleUpgrade = () => {
    playPremium();
    showUpgradeModal();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary-glow/5 to-background border-2 border-primary/30 relative overflow-hidden">
        {/* Effet de brillance animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -skew-x-12 animate-pulse"></div>
        
        <div className="relative z-10">
          {/* Header avec badge premium */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gradient-primary">{t('home.morningTasks')}</h3>
                <p className="text-sm text-muted-foreground">{t('home.morningTasksDesc')}</p>
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>

          {/* Message d'accroche puissant */}
          <div className="mb-6">
            <h4 className="text-xl font-bold text-foreground mb-3">
              🌅 Transformez chaque matin en victoire
            </h4>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              <strong>Fini la procrastination !</strong> Notre système de tâches matinales révolutionnaire vous aide à structurer vos journées et atteindre vos objectifs. 
              Notez vos tâches chaque matin avec Journeys et changez vraiment votre vie.
            </p>
          </div>

          {/* Fonctionnalités clés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Priorités intelligentes</p>
                <p className="text-xs text-muted-foreground">Système 1-3 niveaux</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Suivi motivant</p>
                <p className="text-xs text-muted-foreground">Progress & gamification</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Report automatique</p>
                <p className="text-xs text-muted-foreground">Tâches importantes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Feedback ludique</p>
                <p className="text-xs text-muted-foreground">Animations & encouragements</p>
              </div>
            </div>
          </div>

          {/* Témoignage court */}
          <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-lg p-4 mb-6 border border-success/20">
            <p className="text-sm italic text-foreground">
              "Depuis que j'utilise les tâches matinales de Journeys, ma productivité a explosé ! 
              Fini les journées perdues, chaque matin j'ai un plan clair." ⭐⭐⭐⭐⭐
            </p>
            <p className="text-xs text-muted-foreground mt-2">- Utilisateur Journeys Premium</p>
          </div>

          {/* Call to action */}
          <div className="text-center">
            <Button 
              onClick={handleUpgrade}
              className="journey-button-primary w-full group relative overflow-hidden mb-3"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Crown className="w-5 h-5 mr-2" />
              {t('premiumModal.unlockPremium')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                ⚡ {t('premiumModal.noSubscription')}
              </span>
              <span className="flex items-center gap-1">
                🔒 {t('premiumModal.lifetimeAccess')}
              </span>
              <span className="flex items-center gap-1">
                💪 {t('home.unlockPotential')}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};