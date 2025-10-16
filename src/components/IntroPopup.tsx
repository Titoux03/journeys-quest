import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Flame, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface IntroPopupProps {
  onClose: () => void;
}

export const IntroPopup: React.FC<IntroPopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Afficher avec un délai pour une meilleure UX
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground"
              onClick={handleClose}
            >
              <X size={18} />
            </Button>

            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="inline-flex w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 items-center justify-center mb-4"
              >
                <BookOpen size={32} className="text-primary sm:w-10 sm:h-10" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t('intro.title', 'Bienvenue sur Journeys')}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {t('intro.subtitle', 'Ton journal intime gamifié.')}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/30"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    {t('intro.feature1.title', 'Écris ton humeur')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('intro.feature1.desc', 'Note ton humeur quotidienne et vois ton évolution')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/30"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Flame size={20} className="text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    {t('intro.feature2.title', 'Garde ta streak')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('intro.feature2.desc', 'Maintiens ta progression jour après jour')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/30"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    {t('intro.feature3.title', 'Vois ton évolution')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('intro.feature3.desc', 'Découvre ton espace bien-être et progresse chaque jour')}
                  </p>
                </div>
              </motion.div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-primary to-primary/80"
              onClick={handleClose}
            >
              {t('intro.cta', 'Commencer mon journal')}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {t('intro.footer', '✨ Rejoins des milliers d\'utilisateurs')}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
