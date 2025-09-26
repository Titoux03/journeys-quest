import React from 'react';
import { X, Crown, Sparkles, TrendingUp, Shield, Dumbbell, Brain, Heart, Calendar, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGongSounds } from '@/hooks/useGongSounds';
import { SkillsRadarChart } from '@/components/SkillsRadarChart';

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
  const { isPremium, purchasePremium, loading } = usePremium();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playPremium } = useGongSounds();

  if (!isVisible || isPremium) return null;

  const handleUpgrade = async () => {
    // Jouer le gong premium
    playPremium();
    
    if (!user) {
      // Rediriger vers la page d'authentification
      navigate('/auth');
      onClose();
      return;
    }
    
    await purchasePremium();
    onClose();
  };

  const premiumFeatures = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Focus & Deep Work Premium",
      description: "Historique des sessions, analyses de progression et gongs exclusifs",
      highlight: true
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Contrôle Multi-Addictions",
      description: "Cigarette, porno, scroll, procrastination - Surmontez toutes vos dépendances avec des compteurs motivants",
      highlight: false
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Profil de Développement Complet",
      description: "Diagramme radar évolutif + historique illimité + analyses personnalisées",
      highlight: true
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Gamification Avancée",
      description: "Système de badges exclusifs, streaks de fidélité et récompenses motivantes",
      highlight: false
    },
    {
      icon: <Dumbbell className="w-6 h-6" />,
      title: "Routines Stretching Premium",
      description: "Exercices guidés avec suivi de progression et programmes personnalisés",
      highlight: true
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Citations Inspirantes Exclusives",
      description: "Citations premium quotidiennes générées par IA selon votre humeur",
      highlight: true
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-gradient-primary mb-3">
            Débloque ton potentiel complet
          </h1>
          
          {feature && (
            <p className="text-lg text-muted-foreground mb-4">
              <span className="text-primary font-semibold">{feature}</span> est disponible avec Journeys Premium
            </p>
          )}
          
          <p className="text-muted-foreground leading-relaxed">
            {!user 
              ? 'Créez un compte pour sauvegarder vos progrès et transformez votre routine quotidienne en véritable parcours de développement personnel'
              : 'Transformez chaque jour en victoire. Ne laissez pas votre potentiel inexploité — débloquez toutes les fonctionnalités qui font la différence.'
            }
          </p>
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

        {/* Pricing amélioré */}
        <div className="text-center mb-8">
          <div className="journey-card bg-gradient-to-br from-primary/10 to-primary-glow/10 border-2 border-primary/30 mb-6 relative overflow-hidden">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-gradient-primary">14,99€</div>
                <div className="text-lg font-bold text-success mt-2">Accès à vie</div>
                <div className="text-sm text-muted-foreground">Aucun abonnement</div>
                <div className="text-xs text-primary">Toutes les futures mises à jour</div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground mb-6">
            <div className="flex items-center space-x-1">
              <div className="flex -space-x-1">
                <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background"></div>
                <div className="w-6 h-6 rounded-full bg-primary-glow/20 border-2 border-background"></div>
                <div className="w-6 h-6 rounded-full bg-success/20 border-2 border-background"></div>
              </div>
              <span>+1000 utilisateurs actifs</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4 text-success" />
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </div>

        {/* CTA amélioré */}
        <div className="space-y-4">
          {!user ? (
            <div className="space-y-3">
              <Button
                onClick={() => { navigate('/auth'); onClose(); }}
                className="journey-button-primary w-full text-lg py-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <UserPlus className="w-5 h-5 mr-2" />
                Créer un compte Premium
              </Button>
              
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Déjà un compte ? 
                  <button 
                    onClick={handleUpgrade}
                    className="text-primary hover:text-primary-glow ml-1 font-medium"
                  >
                    Débloquer Premium
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="journey-button-primary w-full text-lg py-6 relative overflow-hidden group"
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
                  Débloquer maintenant (-50%)
                </>
              )}
            </Button>
          )}
          
              <div className="text-center space-y-2">
                <button
                  onClick={onClose}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Rester en version limitée
                </button>
              </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <div className="flex items-center justify-center space-x-8 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>Accès à vie garanti</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Aucun abonnement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};