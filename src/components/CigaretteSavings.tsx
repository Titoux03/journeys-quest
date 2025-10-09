import React from 'react';
import { TrendingUp, Coins, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface CigaretteSavingsProps {
  dailyCigarettes: number;
  cigarettePrice: number;
  currentStreak: number;
  className?: string;
}

export const CigaretteSavings: React.FC<CigaretteSavingsProps> = ({
  dailyCigarettes,
  cigarettePrice,
  currentStreak,
  className = ""
}) => {
  const { t } = useTranslation();
  
  const dailySavings = dailyCigarettes * cigarettePrice;
  const totalSavings = dailySavings * currentStreak;
  
  const getMilestoneMessage = (amount: number) => {
    if (amount >= 1000) return { message: t('savings.milestone.legendary'), emoji: "💎", color: "#9333ea" };
    if (amount >= 500) return { message: t('savings.milestone.champion'), emoji: "👑", color: "#eab308" };
    if (amount >= 250) return { message: t('savings.milestone.expert'), emoji: "🏆", color: "#f59e0b" };
    if (amount >= 100) return { message: t('savings.milestone.warrior'), emoji: "⚔️", color: "#3b82f6" };
    if (amount >= 50) return { message: t('savings.milestone.progress'), emoji: "🌟", color: "#10b981" };
    return { message: t('savings.milestone.start'), emoji: "🌱", color: "#6366f1" };
  };
  
  const milestone = getMilestoneMessage(totalSavings);
  
  const getMotivationalMessage = () => {
    if (totalSavings >= 100) {
      return t('savings.motivation.celebrate', { amount: totalSavings.toFixed(2) });
    }
    return t('savings.motivation.keep');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`journey-card bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200/50 dark:border-emerald-800/30 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
            {t('savings.title')}
          </h3>
        </div>
        <div className="text-2xl">{milestone.emoji}</div>
      </div>

      {/* Daily Savings */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            {t('savings.today')}
          </span>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
          {dailySavings.toFixed(2)} €
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t('savings.perDay', { count: dailyCigarettes, price: cigarettePrice.toFixed(2) })}
        </p>
      </div>

      {/* Total Savings */}
      <div className="mb-6 p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-200/50 dark:border-emerald-800/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            {t('savings.total')}
          </span>
          <Target className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
          {totalSavings.toFixed(2)} €
        </div>
        <div 
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: milestone.color + '20', color: milestone.color }}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {milestone.message}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-300/30 dark:border-emerald-700/30">
        <p className="text-sm text-center text-emerald-800 dark:text-emerald-200 font-medium">
          {getMotivationalMessage()}
        </p>
      </div>

      {/* What you could buy */}
      {totalSavings >= 50 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/30"
        >
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-2 font-medium">
            {t('savings.couldBuy')}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {totalSavings >= 50 && (
              <div className="p-2 rounded bg-white/50 dark:bg-black/20 text-center">
                <div className="text-lg mb-1">🍽️</div>
                <div className="text-emerald-900 dark:text-emerald-100">
                  {t('savings.examples.restaurant')}
                </div>
              </div>
            )}
            {totalSavings >= 100 && (
              <div className="p-2 rounded bg-white/50 dark:bg-black/20 text-center">
                <div className="text-lg mb-1">👕</div>
                <div className="text-emerald-900 dark:text-emerald-100">
                  {t('savings.examples.clothes')}
                </div>
              </div>
            )}
            {totalSavings >= 250 && (
              <div className="p-2 rounded bg-white/50 dark:bg-black/20 text-center">
                <div className="text-lg mb-1">🎮</div>
                <div className="text-emerald-900 dark:text-emerald-100">
                  {t('savings.examples.console')}
                </div>
              </div>
            )}
            {totalSavings >= 500 && (
              <div className="p-2 rounded bg-white/50 dark:bg-black/20 text-center">
                <div className="text-lg mb-1">✈️</div>
                <div className="text-emerald-900 dark:text-emerald-100">
                  {t('savings.examples.trip')}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};