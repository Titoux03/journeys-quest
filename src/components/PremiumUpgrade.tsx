import React, { useState, useEffect } from 'react';
import { X, Crown, Sparkles, TrendingUp, Shield, Dumbbell, Brain, Heart, Calendar, Loader2, UserPlus, ExternalLink, Coins, Check, Settings } from 'lucide-react';
import Lottie from 'lottie-react';
import crownAnimation from '@/assets/animations/crown-animation.json';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGongSounds } from '@/hooks/useGongSounds';
import { SkillsRadarChart } from '@/components/SkillsRadarChart';
import { TermsOfService } from '@/components/TermsOfService';
import { useAffiliation } from '@/hooks/useAffiliation';
import { useTranslation } from 'react-i18next';
import { playSound } from '@/utils/soundManager';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumUpgradeProps {
  isVisible: boolean;
  onClose: () => void;
  feature?: string;
}

export const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({ 
  isVisible, 
  onClose, 
  feature 
}) => {
  const { t } = useTranslation();
  const { isPremium, isLegacy, plan: currentPlan, subscriptionEnd, purchasePremium, manageSubscription, loading } = usePremium();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playPremium } = useGongSounds();
  const { getAffiliateCode } = useAffiliation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    if (isVisible && !isPremium) {
      playSound('premium_open');
    }
  }, [isVisible, isPremium]);

  if (!isVisible) return null;

  // If already premium, show management view
  if (isPremium) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="journey-card-premium max-w-md w-full p-6 relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4">
              <Lottie animationData={crownAnimation} loop={true} />
            </div>
            <h2 className="text-2xl font-bold text-gradient-primary mb-2">
              👑 Journeys Premium
            </h2>
            <p className="text-muted-foreground">
              {isLegacy 
                ? 'Accès à vie (achat unique)' 
                : `Abonnement ${currentPlan === 'annual' ? 'annuel' : 'mensuel'}`
              }
            </p>
            {subscriptionEnd && !isLegacy && (
              <p className="text-sm text-muted-foreground mt-2">
                Prochain renouvellement : {new Date(subscriptionEnd).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          {!isLegacy && (
            <Button onClick={manageSubscription} disabled={loading} variant="outline" className="w-full mb-3">
              <Settings className="w-4 h-4 mr-2" />
              Gérer mon abonnement
            </Button>
          )}
          
          <Button onClick={onClose} className="w-full journey-button-primary">
            Continuer
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleUpgrade = async () => {
    if (!acceptedTerms) return;
    playPremium();
    
    if (!user) {
      navigate('/auth');
      onClose();
      return;
    }
    
    const affiliateCode = getAffiliateCode();
    await purchasePremium(selectedPlan, affiliateCode || undefined);
  };

  const monthlyPrice = 14.99;
  const annualPrice = 149.99;
  const annualMonthly = (annualPrice / 12).toFixed(2);
  const savings = Math.round(((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100);

  const premiumFeatures = [
    { icon: <Coins className="w-6 h-6" />, title: t('premiumModal.features.savings.title'), description: t('premiumModal.features.savings.description'), highlight: true },
    { icon: <Shield className="w-6 h-6" />, title: t('premiumModal.features.addictions.title'), description: t('premiumModal.features.addictions.description'), highlight: true },
    { icon: <Brain className="w-6 h-6" />, title: t('premiumModal.features.focus.title'), description: t('premiumModal.features.focus.description'), highlight: true },
    { icon: <TrendingUp className="w-6 h-6" />, title: t('premiumModal.features.radar.title'), description: t('premiumModal.features.radar.description'), highlight: false },
    { icon: <Crown className="w-6 h-6" />, title: t('premiumModal.features.badges.title'), description: t('premiumModal.features.badges.description'), highlight: false },
    { icon: <Dumbbell className="w-6 h-6" />, title: t('premiumModal.features.stretching.title'), description: t('premiumModal.features.stretching.description'), highlight: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="journey-card-premium max-w-2xl w-full modal-container overflow-y-auto relative"
      >
        <button
          onClick={() => { playSound('premium_close'); onClose(); }}
          className="absolute top-6 right-6 p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="w-20 h-20 mx-auto mb-6">
            <Lottie animationData={crownAnimation} loop={true} />
          </div>
          
          <h1 className="text-3xl font-bold text-gradient-primary mb-3">
            {t('premiumModal.transformYourLife')}
          </h1>

          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-success/10 border border-success/20">
            <UserPlus className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">
              {t('premiumModal.socialProof')}
            </span>
          </div>
          
          {feature && (
            <p className="text-lg text-muted-foreground mb-4">
              <span className="text-primary font-semibold">{feature}</span> {t('premiumModal.featureAndMore')}
            </p>
          )}
        </div>

        {/* Plan Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center text-foreground mb-6">
            Choisissez votre plan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Plan */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                selectedPlan === 'monthly'
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                  : 'border-border/50 bg-secondary/20 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Mensuel</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'monthly' ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                }`}>
                  {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{monthlyPrice}€</div>
              <div className="text-sm text-muted-foreground">par mois</div>
            </button>

            {/* Annual Plan */}
            <button
              onClick={() => setSelectedPlan('annual')}
              className={`p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                selectedPlan === 'annual'
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                  : 'border-border/50 bg-secondary/20 hover:border-primary/30'
              }`}
            >
              <div className="absolute top-0 right-0 bg-success text-success-foreground text-xs px-3 py-1 rounded-bl-lg font-bold">
                -{savings}%
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Annuel</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'annual' ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                }`}>
                  {selectedPlan === 'annual' && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-foreground">{annualMonthly}€</div>
                <span className="text-sm text-muted-foreground">/mois</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {annualPrice}€ facturé annuellement
              </div>
              <div className="mt-2 text-xs font-medium text-success">
                ✨ Meilleur rapport qualité/prix
              </div>
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center text-foreground mb-6">
            {t('premiumModal.whatYouUnlock')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {premiumFeatures.map((feat, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all ${
                  feat.highlight 
                    ? 'bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/30' 
                    : 'bg-secondary/30 border-border/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    feat.highlight ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    {feat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm mb-1">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground">{feat.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="mb-6">
          <div className="flex items-start space-x-3 p-4 bg-secondary/30 rounded-lg border border-border/50">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              {t('premiumModal.acceptTerms')}{' '}
              <button
                onClick={() => setShowTerms(true)}
                className="text-primary hover:text-primary-glow font-medium underline inline-flex items-center"
              >
                {t('premiumModal.termsOfService')}
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
              {' '}{t('premiumModal.confirmDataProcessing')}
            </label>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          {!user ? (
            <div className="space-y-3">
              <Button
                onClick={() => { navigate('/auth'); onClose(); }}
                disabled={!acceptedTerms}
                className="journey-button-primary w-full text-lg py-6 relative overflow-hidden group disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Sparkles className="w-5 h-5 mr-2" />
                Créer un compte et s'abonner
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleUpgrade}
              disabled={loading || !acceptedTerms}
              className="journey-button-primary w-full text-lg py-6 relative overflow-hidden group disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t('premiumModal.processing')}
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  S'abonner — {selectedPlan === 'annual' ? `${annualPrice}€/an` : `${monthlyPrice}€/mois`}
                </>
              )}
            </Button>
          )}
          
          {!acceptedTerms && (
            <p className="text-xs text-warning text-center bg-warning/10 border border-warning/20 rounded-lg p-2">
              ⚠️ Veuillez accepter les conditions d'utilisation pour continuer
            </p>
          )}

          <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
            <p className="text-sm text-success font-medium mb-1">
              ✅ Annulable à tout moment
            </p>
            <p className="text-xs text-muted-foreground">
              Accès immédiat • Résiliation en 1 clic • Sans engagement
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
          >
            Continuer avec les fonctions limitées
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="flex flex-col items-center space-y-2 text-center">
              <Shield className="w-5 h-5 text-success" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <Heart className="w-5 h-5 text-success" />
              <span>Sans engagement</span>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <Sparkles className="w-5 h-5 text-success" />
              <span>Mises à jour incluses</span>
            </div>
          </div>
        </div>

        <TermsOfService isVisible={showTerms} onClose={() => setShowTerms(false)} />
      </motion.div>
    </div>
  );
};
