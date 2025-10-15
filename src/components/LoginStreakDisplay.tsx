import React, { useState, useEffect } from 'react';
import { Flame, Calendar, Trophy, Plus } from 'lucide-react';
import { LoginStreak } from '@/hooks/useAddictions';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginStreakDisplayProps {
  loginStreak: LoginStreak | null;
  className?: string;
}

export const LoginStreakDisplay: React.FC<LoginStreakDisplayProps> = ({ 
  loginStreak, 
  className = "" 
}) => {
  const { t } = useTranslation();
  const [previousStreak, setPreviousStreak] = useState<number | null>(null);
  const [showIncrement, setShowIncrement] = useState(false);

  // Detect streak increment and show animation
  useEffect(() => {
    if (loginStreak && previousStreak !== null && loginStreak.current_streak > previousStreak) {
      setShowIncrement(true);
      setTimeout(() => setShowIncrement(false), 2000);
    }
    if (loginStreak) {
      setPreviousStreak(loginStreak.current_streak);
    }
  }, [loginStreak?.current_streak]);

  if (!loginStreak) {
    return (
      <div className={`journey-card-glow p-4 text-center ${className}`}>
        <Flame className="w-8 h-8 mx-auto mb-2 text-primary" />
        <h3 className="font-semibold text-lg mb-1">{t('streak.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('streak.loginDaily')}
        </p>
      </div>
    );
  }

  const getStreakEmoji = (days: number) => {
    if (days >= 90) return '🔮';
    if (days >= 60) return '👑';
    if (days >= 30) return '💎';
    if (days >= 14) return '⭐';
    if (days >= 7) return '🔥';
    if (days >= 3) return '🌟';
    return '✨';
  };

  const getStreakTitle = (days: number) => {
    if (days >= 90) return t('streak.eternalLegend');
    if (days >= 60) return t('streak.masterJourneyer');
    if (days >= 30) return t('streak.passionate');
    if (days >= 14) return t('streak.devoted');
    if (days >= 7) return t('streak.perseverant');
    if (days >= 3) return t('streak.faithfulJourneyer');
    return t('streak.beginner');
  };

  return (
    <div className={`journey-card-glow p-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Flame className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">{t('streak.title')}</h3>
        </div>
        
        <div className="mb-4">
          <div className="text-4xl mb-2">{getStreakEmoji(loginStreak.current_streak)}</div>
          <div className="relative">
            <div className="text-3xl font-bold text-gradient-primary mb-1">
              {loginStreak.current_streak}
            </div>
            
            {/* +1 Pulse Animation */}
            <AnimatePresence>
              {showIncrement && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -20, scale: 1.2 }}
                  exit={{ opacity: 0, y: -40, scale: 0.8 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                >
                  <div className="flex items-center text-success font-bold text-2xl drop-shadow-lg">
                    <Plus className="w-6 h-6" />
                    <span>1</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            {loginStreak.current_streak === 1 ? t('streak.consecutiveDay') : t('streak.consecutiveDays')}
          </div>
          <div className="text-lg font-semibold text-primary">
            {getStreakTitle(loginStreak.current_streak)}
          </div>
          
          {/* Motivational message about growth */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-xs text-muted-foreground italic"
          >
            🔥 {t('streak.growingDaily')}
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/20 rounded-lg p-3">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-accent" />
            <div className="text-lg font-semibold">{loginStreak.longest_streak}</div>
            <div className="text-xs text-muted-foreground">{t('streak.bestStreak')}</div>
          </div>
          <div className="bg-secondary/20 rounded-lg p-3">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-accent" />
            <div className="text-lg font-semibold">
              {new Date(loginStreak.streak_start_date).toLocaleDateString(t('common.locale'))}
            </div>
            <div className="text-xs text-muted-foreground">{t('streak.streakStart')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};