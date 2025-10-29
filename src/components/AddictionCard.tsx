import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Sparkles, TrendingUp } from 'lucide-react';
import type { AddictionType, UserAddiction } from '@/hooks/useAddictions';
import { AddictionTimeline } from './AddictionTimeline';

interface AddictionCardProps {
  addictionType: AddictionType;
  userAddiction?: UserAddiction;
  onStart: () => void;
  onRelapse: () => void;
  onDeactivate?: () => void;
  className?: string;
}

export const AddictionCard: React.FC<AddictionCardProps> = ({
  addictionType,
  userAddiction,
  onStart,
  onRelapse,
  onDeactivate,
  className = ""
}) => {
  const { t } = useTranslation();
  const [showTimeline, setShowTimeline] = useState(false);

  // Calcul des économies pour les cigarettes
  const calculateSavings = () => {
    if (!userAddiction?.daily_cigarettes || !userAddiction?.cigarette_price) {
      return { dailySavings: 0, totalSavings: 0, potentialTotalSavings: 0 };
    }

    const dailySavings = userAddiction.daily_cigarettes * userAddiction.cigarette_price;
    const totalSavings = dailySavings * userAddiction.current_streak;
    const potentialTotalSavings = dailySavings * 90; // Objectif 90 jours

    return { dailySavings, totalSavings, potentialTotalSavings };
  };

  const { dailySavings, totalSavings, potentialTotalSavings } = calculateSavings();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="journey-card-glow p-6 space-y-4 cursor-pointer hover:shadow-xl transition-shadow"
        style={{
          borderColor: addictionType.color
        }}
        onClick={() => userAddiction && setShowTimeline(!showTimeline)}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="text-4xl flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary border border-primary/20"
              animate={userAddiction ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {addictionType.icon}
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{addictionType.name}</h3>
              <p className="text-sm text-muted-foreground">{addictionType.description}</p>
            </div>
          </div>
        </div>

        {/* Stats actives */}
        {userAddiction && (
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-lg text-center border border-primary/20 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="text-3xl font-bold text-primary mb-1"
                  key={userAddiction.current_streak}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                >
                  {userAddiction.current_streak}
                </motion.div>
                <div className="text-xs text-muted-foreground">
                  {t('addictions.currentStreak')}
                </div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-success/20 to-success/10 p-4 rounded-lg text-center border border-success/20 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl font-bold text-success mb-1">
                  {userAddiction.longest_streak}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('addictions.longestStreak')}
                </div>
              </motion.div>
            </div>

            {/* Savings pour les cigarettes */}
            {totalSavings > 0 && (
              <motion.div 
                className="bg-gradient-to-r from-success/20 to-success/10 p-4 rounded-lg border border-success/30 shadow-lg"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-semibold text-success">{t('addictions.totalSavings')}</span>
                  </div>
                  <motion.span 
                    className="text-2xl font-bold text-success"
                    key={totalSavings}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    {totalSavings.toFixed(2)}€
                  </motion.span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {dailySavings > 0 && `${dailySavings.toFixed(2)}€ ${t('addictions.perDay')}`}
                </div>
                {potentialTotalSavings > totalSavings && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('addictions.potentialSavings')}: {potentialTotalSavings.toFixed(2)}€
                  </div>
                )}
              </motion.div>
            )}

            <motion.div 
              className="flex gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onRelapse();
                }}
                className="flex-1"
              >
                {t('addictions.markRelapse')}
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeactivate?.();
                }}
                className="flex-1"
              >
                {t('addictions.stopTracking')}
              </Button>
            </motion.div>
            
            {/* Indicateur pour voir la timeline */}
            <motion.div
              className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3" />
              <span>{t('addictions.viewDetailedProgress')}</span>
            </motion.div>
          </motion.div>
        )}

        {/* Bouton de démarrage */}
        {!userAddiction && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              className="w-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {t('addictions.start')}
            </Button>
          </motion.div>
        )}
      </motion.div>
      
      {/* Modal Timeline */}
      <AnimatePresence>
        {showTimeline && userAddiction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTimeline(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AddictionTimeline
                currentDay={userAddiction.current_streak}
                addictionName={addictionType.name}
                totalSavings={totalSavings}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4"
              >
                <Button
                  variant="outline"
                  onClick={() => setShowTimeline(false)}
                  className="w-full"
                >
                  Fermer
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
