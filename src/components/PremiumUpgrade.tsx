import React from 'react';
import { X, Crown, Sparkles, TrendingUp, Shield, Dumbbell, Brain, Heart, Calendar, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useGongSounds } from '@/hooks/useGongSounds';

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
      title: "Focus & Deep Work",
      description: "Méditation et minuteurs premium pour concentration et sérénité"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Abstinence Multi-Addictions",
      description: "Cigarette, porno, scroll, procrastination - Surmontez toutes vos dépendances"
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Système de Badges",
      description: "Débloquez des récompenses et suivez vos accomplissements"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Streaks de Fidélité",
      description: "Gagnez des badges spéciaux en vous connectant quotidiennement"
    },
    {
      icon: <Dumbbell className="w-6 h-6" />,
      title: "Routine stretching",
      description: "5 exercices guidés pour votre bien-être physique"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Statistiques avancées",
      description: "Analyse complète avec historique détaillé et tendances"
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
            {!user ? 'Créez votre compte Premium' : 'Débloque ton potentiel complet'}
          </h1>
          
          {feature && (
            <p className="text-lg text-muted-foreground mb-4">
              Accédez à <span className="text-primary font-semibold">{feature}</span> et bien plus
            </p>
          )}
          
          <p className="text-muted-foreground">
            {!user 
              ? 'Créez un compte pour sauvegarder vos progrès et débloquer toutes les fonctionnalités premium'
              : 'Transformez votre routine quotidienne en véritable parcours de développement personnel'
            }
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {premiumFeatures.map((feature, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border/30 hover:border-primary/20 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="text-center mb-8">
          <div className="journey-card bg-gradient-to-br from-primary/5 to-primary-glow/5 border-2 border-primary/20 mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div>
                <div className="text-4xl font-bold text-gradient-primary">14,99€</div>
                <div className="text-sm text-muted-foreground">paiement unique</div>
              </div>
              <div className="h-12 w-px bg-border"></div>
              <div className="text-left">
                <div className="text-sm text-success font-medium">Accès à vie</div>
                <div className="text-xs text-muted-foreground">Aucun abonnement</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-success" />
              <span>Achat unique</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4 text-success" />
              <span>Accès permanent</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-success" />
              <span>Toutes les fonctionnalités</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          {!user ? (
            <div className="space-y-3">
              <Button
                onClick={() => { navigate('/auth'); onClose(); }}
                className="journey-button-primary w-full text-lg py-6 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <UserPlus className="w-5 h-5 mr-2" />
                Créer un compte
              </Button>
              
              <Button
                onClick={handleUpgrade}
                variant="outline"
                className="w-full text-lg py-6 border-primary/20 hover:bg-primary/5"
              >
                <Crown className="w-5 h-5 mr-2" />
                Acheter sans compte
              </Button>
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
                  Redirection...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Acheter Journeys Premium
                </>
              )}
            </Button>
          )}
          
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continuer en version limitée
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