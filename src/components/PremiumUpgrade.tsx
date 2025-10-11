import React, { useState } from 'react';
import { X, Crown, Sparkles, TrendingUp, Shield, Dumbbell, Brain, Heart, Calendar, Loader2, UserPlus, ExternalLink } from 'lucide-react';
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
      icon: <Brain className="w-6 h-6" />,
      title: "Focus & Deep Work Premium",
      description: "Sessions de méditation illimitées avec gongs personnalisés",
      benefits: ["Historique complet", "Analyses de progression", "Sons exclusifs"],
      value: "Améliore concentration +300%",
      highlight: true
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Contrôle Multi-Addictions",
      description: "Surmontez cigarette, porno, réseaux sociaux, procrastination",
      benefits: ["Compteurs motivants", "Badges de progression", "Streaks visuels"],
      value: "Taux de réussite 89%",
      highlight: true
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Profil de Développement Radar",
      description: "Diagramme radar évolutif de vos 5 compétences de vie",
      benefits: ["Historique illimité", "Analyses IA", "Rapports personnalisés"],
      value: "Vision claire progression",
      highlight: true
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Système de Badges Exclusifs",
      description: "Gamification avancée pour maintenir votre motivation",
      benefits: ["60+ badges uniques", "Streaks de fidélité", "Récompenses visuelles"],
      value: "Motivation +250%",
      highlight: false
    },
    {
      icon: <Dumbbell className="w-6 h-6" />,
      title: "Routines Stretching Guidées",
      description: "Programmes d'exercices personnalisés avec suivi",
      benefits: ["6 exercices guidés", "Progression trackée", "Rappels intelligents"],
      value: "Bien-être physique optimisé",
      highlight: false
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Citations IA Personnalisées",
      description: "Citations motivantes générées selon votre humeur du jour",
      benefits: ["IA adaptative", "Contenu exclusif", "Inspiration quotidienne"],
      value: "Boost moral quotidien",
      highlight: false
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Historique & Statistiques Avancées",
      description: "Sauvegarde illimitée et analyses détaillées",
      benefits: ["Données illimitées", "Graphiques évolutifs", "Export possible"],
      value: "Vision long terme",
      highlight: false
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Support Premium & Mises à Jour",
      description: "Accès prioritaire et nouvelles fonctionnalités",
      benefits: ["Support prioritaire", "Nouvelles features", "Accès anticipé"],
      value: "Toujours à la pointe",
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
      <div className="journey-card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center pulse-glow">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-gradient-primary mb-3">
            {t('premiumModal.transformYourLife')}
          </h1>
          
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
              ✨ Votre Profil de Développement Personnel
            </h2>
            <p className="text-muted-foreground mb-6">
              Visualisez vos 5 compétences de vie avec notre diagramme radar exclusif
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
                PREMIUM
              </div>
              <h3 className="font-semibold text-primary mb-3 text-center">Journeys Premium</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <span className="text-xs text-success-foreground">✓</span>
                  </div>
                  <span>8 fonctionnalités exclusives</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <span className="text-xs text-success-foreground">✓</span>
                  </div>
                  <span>Suivi multi-addictions complet</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <span className="text-xs text-success-foreground">✓</span>
                  </div>
                  <span>Historique illimité + analyses</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                    <span className="text-xs text-success-foreground">✓</span>
                  </div>
                  <span>Système de badges motivant</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <span className="text-xl text-muted-foreground line-through opacity-60">29,99€</span>
                  <div className="text-3xl font-bold text-gradient-primary">14,99€</div>
                </div>
                <div className="text-sm font-bold text-success">Accès à vie</div>
                <div className="text-xs text-muted-foreground">Aucun abonnement</div>
              </div>
            </div>
          </div>

          {/* Calcul de valeur */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              💡 <strong>Calcul intelligent</strong> : Si vous utilisez l'app 1 an
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div>
                <div className="font-bold text-foreground">14,99€ ÷ 365 jours</div>
                <div className="text-xs text-success">= 0,04€ par jour</div>
              </div>
              <div className="text-muted-foreground">vs</div>
              <div>
                <div className="font-bold text-muted-foreground">Un café</div>
                <div className="text-xs text-muted-foreground">= 2,50€</div>
              </div>
            </div>
            <p className="text-xs text-accent mt-2 font-medium">
              Un investissement 62x moins cher qu'un café pour transformer votre vie
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

        {/* CTA amélioré */}
        <div className="space-y-4">
          {!user ? (
            <div className="space-y-3">
              <Button
                onClick={() => { navigate('/auth'); onClose(); }}
                disabled={!acceptedTerms}
                className="journey-button-primary w-full text-lg py-6 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <UserPlus className="w-5 h-5 mr-2" />
                {t('premiumModal.createPremiumAccount')}
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
              className="journey-button-primary w-full text-lg py-6 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirection vers le paiement...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  🚀 Débloquer mes 8 fonctionnalités (14,99€)
                </>
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