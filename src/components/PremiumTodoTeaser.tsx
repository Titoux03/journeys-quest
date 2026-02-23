import React from 'react';
import { CheckSquare, Crown, Sparkles, TrendingUp, Target, ArrowRight, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePremium } from '@/hooks/usePremium';
import { useGongSounds } from '@/hooks/useGongSounds';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PixelAvatar } from '@/components/PixelAvatar';

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
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        
        <div className="relative z-10">
          {/* Header with avatar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <PixelAvatar size="sm" level={50} gender="male" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-gradient-primary">{t('home.morningTasks')}</h3>
                <p className="text-sm text-muted-foreground">Accomplissez des quêtes, gagnez des items</p>
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>

          {/* Emotional message */}
          <div className="mb-6">
            <h4 className="text-xl font-bold text-foreground mb-3">
              🌅 {t('home.morningTasksTitle')}
            </h4>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Chaque tâche accomplie rapproche ton personnage de sa prochaine évolution. <strong className="text-foreground">Débloquez des items exclusifs</strong> en atteignant vos objectifs quotidiens.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Quêtes quotidiennes</p>
                <p className="text-xs text-muted-foreground">Gagnez des coffres</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                <Gem className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Items exclusifs</p>
                <p className="text-xs text-muted-foreground">Personnalisez votre héros</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Suivi motivant</p>
                <p className="text-xs text-muted-foreground">Progression visible</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-background/60 rounded-lg border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Animations premium</p>
                <p className="text-xs text-muted-foreground">Feedback gamifié</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-lg p-4 mb-6 border border-success/20">
            <p className="text-sm italic text-foreground">
              "Mon personnage a atteint le niveau Légende grâce aux tâches quotidiennes ! L'expérience est incroyable." ⭐⭐⭐⭐⭐
            </p>
            <p className="text-xs text-muted-foreground mt-2">- Héros Journeys Premium</p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              onClick={handleUpgrade}
              className="journey-button-primary w-full group relative overflow-hidden mb-3"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Crown className="w-5 h-5 mr-2" />
              S'abonner — dès 12,50€/mois
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                ⚡ Sans engagement
              </span>
              <span className="flex items-center gap-1">
                🔒 Annulable à tout moment
              </span>
              <span className="flex items-center gap-1">
                💪 Items exclusifs
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
