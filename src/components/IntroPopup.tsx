import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, TrendingUp, X, ChevronRight, ChevronLeft, Crown, Lock, Gem, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { usePremium } from '@/hooks/usePremium';
import { PixelAvatar } from '@/components/PixelAvatar';

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
            className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
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

            {/* Step 1 - Welcome with Avatar */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex justify-center mb-6"
                  >
                    <PixelAvatar size="lg" level={25} gender="male" />
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('intro.step1.title', 'Bienvenue sur Journeys 👋')}
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                    Crée ton personnage, progresse chaque jour et débloque des récompenses exclusives !
                  </p>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-base py-6 flex items-center justify-center"
                  onClick={handleNext}
                >
                  <span className="flex items-center justify-center gap-2">
                    Découvrir l'aventure
                    <ChevronRight size={20} />
                  </span>
                </Button>
              </motion.div>
            )}

            {/* Step 2 - Free Features */}
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
                    Tout ce dont tu as besoin pour commencer ton parcours
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <BookOpen size={24} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">📝 Ton Journal</h3>
                      <p className="text-sm text-muted-foreground">Écris tes pensées, garde une trace de ton humeur</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <TrendingUp size={24} className="text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">🎮 Ton Personnage</h3>
                      <p className="text-sm text-muted-foreground">Crée ton avatar pixel art et fais-le évoluer chaque jour</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Star size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1">🔥 Streaks & Niveaux</h3>
                      <p className="text-sm text-muted-foreground">Reste motivé et visualise ta progression quotidienne</p>
                    </div>
                  </motion.div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center"
                    onClick={handleBack}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ChevronLeft size={18} />
                      Retour
                    </span>
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center"
                    onClick={handleNext}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Voir Premium ✨
                      <ChevronRight size={18} />
                    </span>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3 - Premium with Avatar showcase */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  {/* Premium Avatar Showcase */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex justify-center mb-4"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent)',
                          filter: 'blur(15px)',
                          transform: 'scale(2.5)',
                        }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <PixelAvatar size="lg" level={100} gender="male" />
                    </div>
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Journeys Premium
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Débloque ton héros intérieur et tous les items exclusifs
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/30"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Crown size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">👑 Personnage Légendaire</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Évolutions exclusives, auras, couronnes et tenues épiques pour ton avatar
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/30"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Gem size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">💎 Coffres & Items Rares</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ouvre des coffres légendaires et collectionne des items pour personnaliser ton héros
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/30"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Lock size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">🛡️ Suivi Multi-Addictions</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reprends le contrôle avec un suivi intelligent, badges et économies calculées
                      </p>
                    </div>
                  </motion.div>
                </div>

                <p className="text-center text-sm text-muted-foreground mb-6">
                  ✨ Chaque connexion te rapproche de ta transformation Journeys Premium
                </p>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-base py-6 flex items-center justify-center"
                    onClick={handlePremiumCTA}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isPremium ? 'Accéder à Premium' : 'Découvrir Journeys Premium'}
                      <Crown size={18} />
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center"
                    onClick={handleClose}
                  >
                    Continuer gratuitement
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex items-center justify-center"
                    onClick={handleBack}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <ChevronLeft size={16} />
                      Retour
                    </span>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Progress bar */}
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
