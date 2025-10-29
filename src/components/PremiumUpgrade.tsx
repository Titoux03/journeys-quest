import React, { useState, useEffect } from 'react';
import { X, Crown, Sparkles, TrendingUp, Shield, Dumbbell, Brain, Heart, Calendar, Loader2, UserPlus, ExternalLink, Coins } from 'lucide-react';
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
  const { isPremium, purchasePremium, loading } = usePremium();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playPremium } = useGongSounds();
  const { getAffiliateCode } = useAffiliation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Jouer le son d'ouverture de modale
  useEffect(() => {
    if (isVisible && !isPremium) {
      playSound('premium_open');
    }
  }, [isVisible, isPremium]);

  if (!isVisible || isPremium) return null;

  const handleUpgrade = async () => {
    if (!acceptedTerms) {
      return; // Ne pas permettre l'achat sans accepter les conditions
    }

    // Jouer le gong premium
    playPremium();
    
    if (!user) {
      // Rediriger vers la page d'authentification
      navigate('/auth');
      onClose();
      return;
    }
    
    // Récupérer le code d'affiliation s'il existe
    const affiliateCode = getAffiliateCode();
    await purchasePremium(affiliateCode || undefined);
    onClose();
  };

  const premiumFeatures = [
    {
      icon: <Coins className="w-6 h-6" />,
      title: t('premiumModal.features.savings.title'),
      description: t('premiumModal.features.savings.description'),
      benefits: [
        t('premiumModal.features.savings.benefits.0'),
        t('premiumModal.features.savings.benefits.1'),
        t('premiumModal.features.savings.benefits.2')
      ],
      value: t('premiumModal.features.savings.value'),
      highlight: true
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('premiumModal.features.addictions.title'),
      description: t('premiumModal.features.addictions.description'),
      benefits: [
        t('premiumModal.features.addictions.benefits.0'),
        t('premiumModal.features.addictions.benefits.1'),
        t('premiumModal.features.addictions.benefits.2')
      ],
      value: t('premiumModal.features.addictions.value'),
      highlight: true
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: t('premiumModal.features.focus.title'),
      description: t('premiumModal.features.focus.description'),
      benefits: [
        t('premiumModal.features.focus.benefits.0'),
        t('premiumModal.features.focus.benefits.1'),
        t('premiumModal.features.focus.benefits.2')
      ],
      value: t('premiumModal.features.focus.value'),
      highlight: true
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: t('premiumModal.features.radar.title'),
      description: t('premiumModal.features.radar.description'),
      benefits: [
        t('premiumModal.features.radar.benefits.0'),
        t('premiumModal.features.radar.benefits.1'),
        t('premiumModal.features.radar.benefits.2')
      ],
      value: t('premiumModal.features.radar.value'),
      highlight: false
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: t('premiumModal.features.badges.title'),
      description: t('premiumModal.features.badges.description'),
      benefits: [
        t('premiumModal.features.badges.benefits.0'),
        t('premiumModal.features.badges.benefits.1'),
        t('premiumModal.features.badges.benefits.2')
      ],
      value: t('premiumModal.features.badges.value'),
      highlight: false
    },
    {
      icon: <Dumbbell className="w-6 h-6" />,
      title: t('premiumModal.features.stretching.title'),
      description: t('premiumModal.features.stretching.description'),
      benefits: [
        t('premiumModal.features.stretching.benefits.0'),
        t('premiumModal.features.stretching.benefits.1'),
        t('premiumModal.features.stretching.benefits.2')
      ],
      value: t('premiumModal.features.stretching.value'),
      highlight: false
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: t('premiumModal.features.quotes.title'),
      description: t('premiumModal.features.quotes.description'),
      benefits: [
        t('premiumModal.features.quotes.benefits.0'),
        t('premiumModal.features.quotes.benefits.1'),
        t('premiumModal.features.quotes.benefits.2')
      ],
      value: t('premiumModal.features.quotes.value'),
      highlight: false
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t('premiumModal.features.history.title'),
      description: t('premiumModal.features.history.description'),
      benefits: [
        t('premiumModal.features.history.benefits.0'),
        t('premiumModal.features.history.benefits.1'),
        t('premiumModal.features.history.benefits.2')
      ],
      value: t('premiumModal.features.history.value'),
      highlight: false
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: t('premiumModal.features.support.title'),
      description: t('premiumModal.features.support.description'),
      benefits: [
        t('premiumModal.features.support.benefits.0'),
        t('premiumModal.features.support.benefits.1'),
        t('premiumModal.features.support.benefits.2')
      ],
      value: t('premiumModal.features.support.value'),
      highlight: false
    }
  ];

  // Mock data pour le diagramme de démonstration
  const mockJournalEntries = [
    {
      date: '2024-01-20',
      scores: { meditation: 8, sport: 7, wellbeing: 9, learning: 6, social: 8, creativity: 7 },
      totalScore: 7.5,
      mood: 'high' as const
    },
    {
      date: '2024-01-19',
      scores: { meditation: 9, sport: 6, wellbeing: 8, learning: 8, social: 7, creativity: 8 },
      totalScore: 7.7,
      mood: 'high' as const
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg">
      <div className="journey-card-premium max-w-2xl w-full modal-container overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={() => {
            playSound('premium_close');
            onClose();
          }}
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

          {/* Social Proof Badge */}
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
          
          <p className="text-muted-foreground leading-relaxed">
            {!user 
              ? t('premiumModal.createAccountDesc')
              : t('premiumModal.unlockDesc')
            }
          </p>

          {/* Loss Aversion Badge */}
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-warning font-medium">
              ⚠️ {t('premiumModal.lossAversion')}
            </p>
          </div>
        </div>

        {/* Fonctionnalités Premium - Grid amélioré */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center text-foreground mb-6">
            {t('premiumModal.whatYouUnlock')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-primary/10 to-primary-glow/5 border-primary/30 shadow-lg' 
                    : 'bg-secondary/30 border-border/50 hover:border-primary/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    feature.highlight ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                    
                    {/* Bénéfices spécifiques */}
                    <div className="space-y-1 mb-2">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-success rounded-full"></div>
                          <span className="text-xs text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Valeur ajoutée */}
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      feature.highlight 
                        ? 'bg-success/20 text-success' 
                        : 'bg-accent/20 text-accent'
                    }`}>
                      {feature.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagramme Premium Showcase */}
        <div className="mb-8">
          <div className="journey-card-premium p-6 text-center">
            <h2 className="text-2xl font-bold text-gradient-primary mb-2">
              ✨ {t('premiumModal.developmentProfile')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('premiumModal.visualizeSkills')}
            </p>
            <div className="relative max-w-md mx-auto">
              <SkillsRadarChart entries={mockJournalEntries} />
            </div>
          </div>
        </div>

        {/* Pricing amélioré avec comparaison */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center text-foreground mb-6">
            {t('premiumModal.investmentTitle')}
          </h2>
          
          {/* Comparaison Gratuit vs Premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
              <h3 className="font-semibold text-muted-foreground mb-3 text-center">{t('premiumModal.freeVersion')}</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-muted-foreground/30 flex items-center justify-center">
                    <span className="text-xs">✗</span>
                  </div>
                  <span>{t('premiumModal.basicJournalOnly')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-muted-foreground/30 flex items-center justify-center">
                    <span className="text-xs">✗</span>
                  </div>
                  <span>{t('premiumModal.noAddictionTracking')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-muted-foreground/30 flex items-center justify-center">
                    <span className="text-xs">✗</span>
                  </div>
                  <span>{t('premiumModal.limitedData')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 rounded-full bg-muted-foreground/30 flex items-center justify-center">
                    <span className="text-xs">✗</span>
                  </div>
                  <span>{t('premiumModal.noGamification')}</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="text-2xl font-bold text-muted-foreground">0€</div>
                <div className="text-xs text-muted-foreground">Limité</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/10 border-2 border-primary/30 relative">
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {t('premiumModal.premiumLabel')}
              </div>
              <h3 className="font-semibold text-primary mb-3 text-center">Journeys Premium</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <span className="text-xs text-success-foreground">✓</span>
                  </div>
                  <span>{t('premiumModal.premiumFeatures')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <span className="text-xs text-success-foreground">✓</span>
                  </div>
                  <span>{t('premiumModal.multiAddictionTracking')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <span className="text-xs text-success-foreground">✓</span>
                  </div>
                  <span>{t('premiumModal.unlimitedHistory')}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <span className="text-xs text-success-foreground">✓</span>
                  </div>
                  <span>{t('premiumModal.motivatingBadges')}</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <span className="text-xl text-muted-foreground line-through opacity-60">29,99€</span>
                  <div className="text-3xl font-bold text-gradient-primary">14,99€</div>
                </div>
                <div className="text-sm font-bold text-success">{t('premiumModal.lifetimeAccess')}</div>
                <div className="text-xs text-muted-foreground">{t('premiumModal.noSubscription')}</div>
              </div>
            </div>
          </div>

          {/* Calcul de valeur */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              💡 <strong>{t('premiumModal.smartCalculation')}</strong> : {t('premiumModal.oneYearUsage')}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div>
                <div className="font-bold text-foreground">{t('premiumModal.pricePerDay')}</div>
                <div className="text-xs text-success">= 0,04€ {t('premiumModal.perDay')}</div>
              </div>
              <div className="text-muted-foreground">{t('premiumModal.vs')}</div>
              <div>
                <div className="font-bold text-muted-foreground">{t('premiumModal.coffee')}</div>
                <div className="text-xs text-muted-foreground">{t('premiumModal.coffeePrice')}</div>
              </div>
            </div>
            <p className="text-xs text-accent mt-2 font-medium">
              {t('premiumModal.investmentComparison')}
            </p>
          </div>
        </div>

        {/* Conditions d'utilisation */}
        <div className="mb-6">
          <div className="flex items-start space-x-3 p-4 bg-secondary/30 rounded-lg border border-border/50">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                {t('premiumModal.acceptTerms')}{' '}
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-primary hover:text-primary-glow font-medium underline inline-flex items-center"
                >
                  {t('premiumModal.termsOfService')}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
                {' '} {t('premiumModal.confirmDataProcessing')}
              </label>
            </div>
          </div>
        </div>

        {/* Authority & Commitment Progress */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('premiumModal.progressToUnlock')}</span>
            <span className="font-semibold text-primary">80%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-gradient-to-r from-primary to-primary-glow animate-pulse"></div>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            💡 {t('premiumModal.authorityBadge')}
          </p>
        </div>

        {/* CTA amélioré */}
        <div className="space-y-4">
          {!user ? (
            <div className="space-y-3">
              <Button
                onClick={() => { navigate('/auth'); onClose(); }}
                disabled={!acceptedTerms}
                className="journey-button-primary w-full text-base sm:text-lg py-6 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed animate-pulse flex items-center justify-center whitespace-normal leading-tight"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="flex items-center justify-center gap-2 break-words">
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                  <span>{t('premiumModal.ctaCreate')}</span>
                </span>
              </Button>
              
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Déjà un compte ? 
                  <button 
                    onClick={handleUpgrade}
                    disabled={!acceptedTerms}
                    className="text-primary hover:text-primary-glow ml-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                {t('premiumModal.unlockPremium')}
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleUpgrade}
              disabled={loading || !acceptedTerms}
              className="journey-button-primary w-full text-base sm:text-lg py-6 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed animate-pulse flex items-center justify-center whitespace-normal leading-tight"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              {loading ? (
                <span className="flex items-center justify-center gap-2 break-words">
                  <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                  <span>{t('premiumModal.processing')}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 break-words">
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                  <span>{t('premiumModal.ctaUnlock')}</span>
                </span>
              )}
            </Button>
          )}
          
          {!acceptedTerms && (
            <p className="text-xs text-warning text-center bg-warning/10 border border-warning/20 rounded-lg p-2">
              ⚠️ Veuillez accepter les conditions d'utilisation pour continuer
            </p>
          )}
          
          {/* Garantie et urgence douce */}
          <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
            <p className="text-sm text-success font-medium mb-1">
              ✅ Garantie satisfaction 100%
            </p>
            <p className="text-xs text-muted-foreground">
              Accès immédiat à toutes les fonctionnalités dès le paiement
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continuer avec les fonctions limitées
            </button>
          </div>
        </div>

        {/* Trust Indicators améliorés */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-foreground mb-2">Pourquoi choisir Journeys Premium ?</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
            <div className="flex flex-col items-center space-y-1 text-center">
              <Shield className="w-4 h-4 text-success" />
              <span>Paiement 100% sécurisé</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-center">
              <Heart className="w-4 h-4 text-success" />
              <span>Accès à vie garanti</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-center">
              <Calendar className="w-4 h-4 text-success" />
              <span>Aucun abonnement</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-center">
              <Sparkles className="w-4 h-4 text-success" />
              <span>Mises à jour incluses</span>
            </div>
          </div>
        </div>

        {/* Modal des conditions d'utilisation */}
        <TermsOfService 
          isVisible={showTerms} 
          onClose={() => setShowTerms(false)} 
        />
      </div>
    </div>
  );
};