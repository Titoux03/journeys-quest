import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Flame, Crown, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface OnboardingModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isVisible, onClose }) => {
  const [step, setStep] = useState(0);
  const { showUpgradeModal } = usePremium();
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePremium = () => {
    handleClose();
    showUpgradeModal();
  };

  const steps = [
    {
      icon: BookOpen,
      title: t('onboarding.step1.title', 'Ton journal personnel'),
      description: t('onboarding.step1.desc', 'Écris et visualise ton humeur chaque jour. Exprime-toi librement et suis ton évolution émotionnelle.'),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Flame,
      title: t('onboarding.step2.title', 'Tes streaks et badges'),
      description: t('onboarding.step2.desc', 'Garde la motivation en maintenant ta streak quotidienne. Débloque des badges uniques à chaque étape franchie.'),
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      icon: Crown,
      title: t('onboarding.step3.title', 'Journeys Premium'),
      description: t('onboarding.step3.desc', 'Débloque le suivi multi-addictions, un historique illimité et des fonctionnalités exclusives pour progresser encore plus.'),
      color: 'text-primary',
      bg: 'bg-primary/10'
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md px-4"
        >
          <motion.div
            key={step}
            initial={{ scale: 0.9, opacity: 0, x: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.9, opacity: 0, x: -50 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground"
              onClick={handleClose}
            >
              <X size={18} />
            </Button>

            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className={`inline-flex w-16 h-16 sm:w-20 sm:h-20 rounded-full ${currentStep.bg} items-center justify-center mb-4`}
              >
                <Icon size={32} className={`${currentStep.color} sm:w-10 sm:h-10`} />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {currentStep.title}
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed px-2">
                {currentStep.description}
              </p>
            </div>

            <div className="flex gap-2 justify-center mb-6">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === step ? 'w-8 bg-primary' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="space-y-3">
              {step === 2 ? (
                <>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-sm"
                    onClick={handlePremium}
                  >
                    {t('onboarding.cta.premium', 'Découvrir Premium')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={handleClose}
                  >
                    {t('onboarding.cta.later', 'Plus tard')}
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full text-sm"
                  onClick={handleNext}
                >
                  {t('onboarding.cta.next', 'Suivant')}
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {step + 1} / {steps.length}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
