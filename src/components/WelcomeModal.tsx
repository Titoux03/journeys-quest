import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { useTranslation } from 'react-i18next';

export const WelcomeModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { showUpgradeModal } = usePremium();
  const { t } = useTranslation();

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setTimeout(() => setIsVisible(true), 800);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenWelcome', 'true');
  };

  const handlePremium = () => {
    handleClose();
    showUpgradeModal();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground"
              onClick={handleClose}
            >
              <X size={20} />
            </Button>

            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-block mb-4"
              >
                <Sparkles size={40} className="text-primary sm:w-12 sm:h-12" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t('welcome.title', 'Bienvenue dans Journeys')}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {t('welcome.subtitle', 'Ton journal intime gamifié pour progresser chaque jour')}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">
                    {t('welcome.feature1.title', 'Note ton humeur et tes pensées')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('welcome.feature1.desc', 'Suivi quotidien de ton bien-être avec un journal visuel et intuitif')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">
                    {t('welcome.feature2.title', 'Garde ta streak et vois tes progrès')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('welcome.feature2.desc', 'Débloquer des badges et maintiens ta motivation jour après jour')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-primary/20"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">
                    {t('welcome.feature3.title', 'Débloque plus avec Journeys Premium')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('welcome.feature3.desc', 'Suivi multi-addictions, historique complet, badges exclusifs')}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 text-sm"
                onClick={handleClose}
              >
                {t('welcome.cta.start', 'Commencer mon Journal')}
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-sm"
                onClick={handlePremium}
              >
                {t('welcome.cta.premium', 'Découvrir Premium')}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {t('welcome.users', '+15 000 utilisateurs tiennent déjà leur journal chaque jour')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
