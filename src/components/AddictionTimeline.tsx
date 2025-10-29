import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Award, Star, Crown, Sparkles, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AddictionTimelineProps {
  currentDay: number;
  addictionName: string;
  totalSavings?: number;
  className?: string;
}

interface Milestone {
  day: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  glowColor: string;
}

export const AddictionTimeline: React.FC<AddictionTimelineProps> = ({
  currentDay,
  addictionName,
  totalSavings,
  className = ""
}) => {
  const { t } = useTranslation();
  
  const milestones: Milestone[] = useMemo(() => [
    {
      day: 7,
      icon: <Star className="w-5 h-5" />,
      title: t('addiction.milestone7Title', 'Première victoire'),
      subtitle: t('addiction.milestone7Subtitle', '1 semaine de liberté'),
      color: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-blue-500/50'
    },
    {
      day: 30,
      icon: <Award className="w-5 h-5" />,
      title: t('addiction.milestone30Title', 'Résilience confirmée'),
      subtitle: t('addiction.milestone30Subtitle', '1 mois accompli'),
      color: 'from-purple-500 to-pink-500',
      glowColor: 'shadow-purple-500/50'
    },
    {
      day: 60,
      icon: <Flame className="w-5 h-5" />,
      title: t('addiction.milestone60Title', 'Nouvelle habitude ancrée'),
      subtitle: t('addiction.milestone60Subtitle', '2 mois de force'),
      color: 'from-orange-500 to-red-500',
      glowColor: 'shadow-orange-500/50'
    },
    {
      day: 90,
      icon: <Crown className="w-5 h-5" />,
      title: t('addiction.milestone90Title', 'Transformation complète'),
      subtitle: t('addiction.milestone90Subtitle', '3 mois de maîtrise'),
      color: 'from-yellow-500 to-amber-500',
      glowColor: 'shadow-yellow-500/50'
    }
  ], [t]);

  const progressPercentage = Math.min((currentDay / 90) * 100, 100);
  const nextMilestone = milestones.find(m => m.day > currentDay) || milestones[milestones.length - 1];
  const lastAchievedMilestone = milestones.filter(m => m.day <= currentDay).pop();

  const motivationalMessage = useMemo(() => {
    if (currentDay === 0) return t('addiction.motivationStart', 'Chaque voyage commence par un premier pas. Tu peux le faire ! 💪');
    if (currentDay < 7) return t('addiction.motivationWeek1', 'Continue ! Chaque jour compte. Tu es sur la bonne voie 🌟');
    if (currentDay < 30) return t('addiction.motivationWeek2to4', 'Tu tiens bon 💪 — Les premiers jours sont les plus difficiles. Bravo !');
    if (currentDay < 60) return t('addiction.motivationMonth2', 'Incroyable progression ! Tu prouves chaque jour ta détermination 🔥');
    if (currentDay < 90) return t('addiction.motivationMonth3', 'Tu approches du cap des 3 mois. C\'est une transformation réelle ! 👑');
    return t('addiction.motivation90Plus', 'Tu as atteint les 90 jours ! C\'est une victoire majeure. Continue cette liberté ! 🎉');
  }, [currentDay, t]);

  return (
    <div className={cn("journey-card-glow p-6 space-y-6", className)}>
      {/* Header avec jour actuel */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-xl"
            />
            <div className="relative bg-gradient-to-br from-primary to-primary/60 text-primary-foreground rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-lg">
              <motion.div
                key={currentDay}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="text-5xl font-black"
              >
                {currentDay}
              </motion.div>
              <div className="text-xs font-semibold uppercase tracking-wider">
                {currentDay === 1 ? t('common.day') : t('common.days')}
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold"
        >
          {addictionName}
        </motion.h3>
        
        {totalSavings !== undefined && totalSavings > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-success font-semibold"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{totalSavings.toFixed(2)}€ économisés</span>
          </motion.div>
        )}
      </div>

      {/* Barre de progression principale */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-bold text-primary">{progressPercentage.toFixed(0)}%</span>
        </div>
        
        <div className="relative h-3 bg-secondary/30 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Jour 1</span>
          <span>Jour 90</span>
        </div>
      </div>

      {/* Timeline des jalons */}
      <div className="relative py-6">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary via-primary/30 to-secondary" />
        
        <div className="relative flex justify-between">
          {milestones.map((milestone, index) => {
            const isAchieved = currentDay >= milestone.day;
            const isCurrent = milestone.day === nextMilestone?.day && currentDay < milestone.day;
            
            return (
              <motion.div
                key={milestone.day}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="flex flex-col items-center gap-2 relative z-10"
              >
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
                    isAchieved 
                      ? `bg-gradient-to-br ${milestone.color} text-white ${milestone.glowColor} shadow-xl`
                      : "bg-secondary/50 text-muted-foreground border-2 border-secondary"
                  )}
                >
                  {isAchieved && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                    >
                      {milestone.icon}
                    </motion.div>
                  )}
                  {!isAchieved && (
                    <span className="text-xs font-bold">{milestone.day}</span>
                  )}
                </motion.div>
                
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full"
                  />
                )}
                
                <div className="text-center max-w-[80px]">
                  <div className="text-xs font-semibold text-foreground">J{milestone.day}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Prochain jalon */}
      {currentDay < 90 && nextMilestone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg bg-gradient-to-br", nextMilestone.color, "text-white shadow-lg")}>
              {nextMilestone.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-foreground mb-1">{nextMilestone.title}</div>
              <div className="text-sm text-muted-foreground mb-2">{nextMilestone.subtitle}</div>
              <div className="text-xs text-primary font-semibold">
                Plus que {nextMilestone.day - currentDay} jour{nextMilestone.day - currentDay > 1 ? 's' : ''} à tenir !
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dernier jalon atteint */}
      {lastAchievedMilestone && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-4 border border-success/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-success" />
            <span className="font-bold text-success">Dernier succès débloqué !</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {lastAchievedMilestone.title} — {lastAchievedMilestone.subtitle}
          </div>
        </motion.div>
      )}

      {/* Message motivant */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl p-4 border border-primary/10"
      >
        <div className="flex items-start gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            💬
          </motion.div>
          <p className="text-sm text-foreground italic leading-relaxed">
            {motivationalMessage}
          </p>
        </div>
      </motion.div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg p-3 text-center"
        >
          <div className="text-2xl font-black text-primary">{currentDay}</div>
          <div className="text-xs text-muted-foreground mt-1">Jours</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg p-3 text-center"
        >
          <div className="text-2xl font-black text-primary">{Math.floor((currentDay / 90) * 100)}</div>
          <div className="text-xs text-muted-foreground mt-1">% objectif</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg p-3 text-center"
        >
          <div className="text-2xl font-black text-primary">{90 - currentDay}</div>
          <div className="text-xs text-muted-foreground mt-1">Jours restants</div>
        </motion.div>
      </div>
    </div>
  );
};
