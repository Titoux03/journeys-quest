import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Flame, TrendingUp, X, ChevronRight, ChevronLeft, Crown, Lock, Brain, Moon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { usePremium } from '@/hooks/usePremium';

interface IntroPopupProps {
  onClose: () => void;
}

export const IntroPopup: React.FC<IntroPopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const { t } = useTranslation();
  const { showUpgradeModal, isPremium } = usePremium();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePremiumCTA = () => {
    handleClose();
    setTimeout(() => showUpgradeModal(), 400);
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
            key={step}
            initial={{ scale: 0.9, opacity: 0, x: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.9, opacity: 0, x: -50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground z-10"
              onClick={handleClose}
            >
              <X size={18} />
            </Button>

            {/* Écran 1 - Introduction */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="inline-flex w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6"
                  >
                    <BookOpen size={40} className="text-primary" />
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('intro.step1.title', 'Bienvenue sur Journeys 👋')}
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                    {t('intro.step1.subtitle', 'Le journal intime nouvelle génération pour booster ton bien-être et suivre ton évolution.')}
                  </p>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-base py-6"
                  onClick={handleNext}
                >
                  {t('intro.step1.cta', 'Découvrir les fonctionnalités')}
                  <ChevronRight size={20} className="ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Écran 2 - Fonctionnalités gratuites */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                    {t('intro.step2.title', 'Fonctionnalités Gratuites')}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {t('intro.step2.subtitle', 'Tout ce dont tu as besoin pour commencer')}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <BookOpen size={24} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">
                        {t('intro.step2.feature1.title', '📝 Ton Journal')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('intro.step2.feature1.desc', 'Écris tes pensées, garde une trace de ton humeur')}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Flame size={24} className="text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">
                        {t('intro.step2.feature2.title', '🔥 Tes Streaks')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('intro.step2.feature2.desc', 'Progresse jour après jour sans t\'arrêter')}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">
                        {t('intro.step2.feature3.title', '🎯 Suivi de tes habitudes')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('intro.step2.feature3.desc', 'Reste motivé et visualise ton parcours')}
                      </p>
                    </div>
                  </motion.div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleBack}
                  >
                    <ChevronLeft size={18} className="mr-2" />
                    {t('common.back', 'Retour')}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                    onClick={handleNext}
                  >
                    {t('intro.step2.cta', 'Voir Premium ✨')}
                    <ChevronRight size={18} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Écran 3 - Fonctionnalités Premium */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="inline-flex w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/60 items-center justify-center mb-4"
                  >
                    <Crown size={32} className="text-white" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('intro.step3.title', 'Journeys Premium')}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {t('intro.step3.subtitle', 'Débloque tout ton potentiel')}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/30 overflow-hidden"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">
                          {t('intro.step3.feature1.title', '💎 Coaching AI Bien-Être')}
                        </h3>
                        <Lock size={14} className="text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('intro.step3.feature1.desc', 'Reçois des conseils personnalisés selon ton humeur')}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/30 overflow-hidden"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Moon size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">
                          {t('intro.step3.feature2.title', '🌙 Journal Guidé Premium')}
                        </h3>
                        <Lock size={14} className="text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('intro.step3.feature2.desc', 'Accède à des exercices introspectifs exclusifs')}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/30 overflow-hidden"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bell size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">
                          {t('intro.step3.feature3.title', '🔔 Rappels & Statistiques')}
                        </h3>
                        <Lock size={14} className="text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('intro.step3.feature3.desc', 'Suis ton évolution sur le long terme')}
                      </p>
                    </div>
                  </motion.div>
                </div>

                <p className="text-center text-sm text-muted-foreground mb-6">
                  {t('intro.step3.motivational', '✨ Débloque tout ton potentiel avec Journeys Premium')}
                </p>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-base py-6"
                    onClick={handlePremiumCTA}
                  >
                    {t('intro.step3.cta.premium', isPremium ? 'Accéder à Premium' : 'Découvrir Journeys Premium')}
                    <Crown size={18} className="ml-2" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleClose}
                  >
                    {t('intro.step3.cta.free', 'Continuer gratuitement')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={handleBack}
                  >
                    <ChevronLeft size={16} className="mr-2" />
                    {t('common.back', 'Retour')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Barre de progression */}
            <div className="flex gap-2 justify-center mt-6">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === step ? 'w-8 bg-primary' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
