import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Trophy, Plus, Sparkles, Zap, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useStreakBadges } from '@/hooks/useStreakBadges';
import { useStreak } from '@/hooks/useStreak';

interface LoginStreakDisplayProps {
  className?: string;
}

export const LoginStreakDisplay: React.FC<LoginStreakDisplayProps> = ({ 
  className = "" 
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { streak, loading } = useStreak(user?.id);
  const [previousStreak, setPreviousStreak] = useState<number | null>(null);
  const [showIncrement, setShowIncrement] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentStreak = streak?.current_streak || 0;
  useStreakBadges(user?.id, currentStreak);

  // Detect streak increment and show animation
  useEffect(() => {
    if (streak && previousStreak !== null && streak.current_streak > previousStreak) {
      setShowIncrement(true);
      setShowCelebration(true);
      const incrementTimer = setTimeout(() => setShowIncrement(false), 2000);
      const celebrationTimer = setTimeout(() => setShowCelebration(false), 3000);
      return () => {
        clearTimeout(incrementTimer);
        clearTimeout(celebrationTimer);
      };
    }
    if (streak) {
      setPreviousStreak(streak.current_streak);
    }
  }, [streak?.current_streak, previousStreak]);

  if (loading) {
    return (
      <div className={`journey-card-glow p-6 text-center ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto" />
          <div className="h-8 bg-primary/10 rounded w-20 mx-auto" />
          <div className="h-4 bg-muted/50 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!streak) {
    return (
      <div className={`journey-card-glow p-6 text-center ${className}`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Flame className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold text-lg mb-2">{t('streak.title')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('streak.loginDaily')}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span>{t('streak.startToday')}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const getStreakEmoji = (days: number) => {
    if (days >= 365) return '🏆';
    if (days >= 180) return '🔮';
    if (days >= 90) return '👑';
    if (days >= 60) return '💎';
    if (days >= 30) return '⭐';
    if (days >= 14) return '🔥';
    if (days >= 7) return '⚡';
    if (days >= 3) return '🌟';
    return '✨';
  };

  const getStreakTitle = (days: number) => {
    if (days >= 365) return t('streak.legend');
    if (days >= 180) return t('streak.eternalLegend');
    if (days >= 90) return t('streak.masterJourneyer');
    if (days >= 60) return t('streak.passionate');
    if (days >= 30) return t('streak.devoted');
    if (days >= 14) return t('streak.perseverant');
    if (days >= 7) return t('streak.consistent');
    if (days >= 3) return t('streak.faithfulJourneyer');
    return t('streak.beginner');
  };

  const getProgressToNextMilestone = (days: number) => {
    const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
    const nextMilestone = milestones.find(m => m > days) || 365;
    const prevMilestone = milestones.filter(m => m <= days).pop() || 0;
    const progress = ((days - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
    return { nextMilestone, progress: Math.min(progress, 100) };
  };

  const { nextMilestone, progress } = getProgressToNextMilestone(streak.current_streak);
  const lastActivityType = streak.last_activity_type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative journey-card-glow p-6 overflow-hidden ${className}`}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, hsl(var(--primary)) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, hsl(var(--primary)) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, hsl(var(--primary)) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Celebration sparkles */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-10"
          >
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 16) * 120,
                  y: Math.sin((i * Math.PI * 2) / 16) * 120,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute"
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center relative z-10">
        {/* Header */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <motion.div
            animate={showIncrement ? { 
              scale: [1, 1.3, 1],
              rotate: [0, 10, -10, 0]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            <Flame className="w-7 h-7 text-primary drop-shadow-lg" />
          </motion.div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('streak.title')}
          </h3>
        </div>
        
        {/* Main streak display */}
        <div className="mb-6">
          <motion.div 
            className="text-6xl mb-3"
            animate={showIncrement ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {getStreakEmoji(streak.current_streak)}
          </motion.div>
          
          <div className="relative">
            <motion.div
              className="text-6xl font-black"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 12px hsl(var(--primary)/0.3))',
              }}
              animate={showIncrement ? { 
                scale: [1, 1.15, 1],
                filter: [
                  'drop-shadow(0 4px 12px hsl(var(--primary)/0.3))',
                  'drop-shadow(0 8px 24px hsl(var(--primary)/0.6))',
                  'drop-shadow(0 4px 12px hsl(var(--primary)/0.3))',
                ]
              } : {}}
              transition={{ duration: 0.6 }}
            >
              {streak.current_streak}
            </motion.div>
            
            {/* +1 Animation */}
            <AnimatePresence>
              {showIncrement && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    y: [-10, -30, -50],
                    scale: [0.5, 1.3, 1.5, 1.2]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                >
                  <div className="flex items-center text-success font-black text-3xl"
                    style={{
                      filter: 'drop-shadow(0 4px 8px hsl(var(--success)/0.5))',
                    }}
                  >
                    <Plus className="w-8 h-8" />
                    <span>1</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-2 mt-3">
            {streak.current_streak === 1 ? t('streak.consecutiveDay') : t('streak.consecutiveDays')}
          </div>
          
          <motion.div 
            className="text-xl font-bold text-primary mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {getStreakTitle(streak.current_streak)}
          </motion.div>

          {/* Activity indicator */}
          {lastActivityType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4"
            >
              <Target className="w-3 h-3" />
              <span>
                {lastActivityType === 'journal' 
                  ? t('streak.lastActivityJournal')
                  : t('streak.lastActivityLogin')}
              </span>
            </motion.div>
          )}
          
          {/* Progress to next milestone */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{t('streak.nextMilestone')}</span>
              <span className="font-semibold text-primary">{nextMilestone} {t('streak.days')}</span>
            </div>
            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            <div className="text-xs text-center text-muted-foreground">
              {nextMilestone - streak.current_streak} {t('streak.daysToGo')}
            </div>
          </div>

          {/* Motivational message */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10"
          >
            <p className="text-xs text-muted-foreground italic">
              {t('streak.motivationalMessage')}
            </p>
          </motion.div>
        </div>

        {/* Stats cards */}
        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
            <Trophy className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{streak.longest_streak}</div>
            <div className="text-xs text-muted-foreground font-medium">{t('streak.bestStreak')}</div>
          </div>
          <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 backdrop-blur-sm rounded-xl p-4 border border-primary/10">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-sm font-bold text-primary">
              {new Date(streak.streak_start_date).toLocaleDateString(i18n.language || 'fr', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-muted-foreground font-medium">{t('streak.streakStart')}</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
