import React, { useState } from 'react';
import { DailyQuote } from '@/components/DailyQuote';
import { LoginStreakDisplay } from '@/components/LoginStreakDisplay';
import { AddictionCard } from '@/components/AddictionCard';
import { Sparkles, TrendingUp, Target, Brain, Shield, Dumbbell, Crown, Star, Flame, Timer, BarChart3, Leaf } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useAddictions } from '@/hooks/useAddictions';
import { PremiumTeaser, PremiumBadge, PremiumLockOverlay } from '@/components/PremiumTeaser';
import { JourneyCard } from '@/components/JourneyCard';
import { PremiumSuccessIndicator } from '@/components/PremiumSuccessIndicator';

interface JournalEntry {
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  reflection?: string;
  mood: 'low' | 'medium' | 'high';
}

interface HomePageProps {
  onNavigate: (screen: string) => void;
  entries: JournalEntry[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, entries }) => {
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const { isPremium, showUpgradeModal } = usePremium();
  const { user } = useAuth();
  const { 
    addictionTypes, 
    userAddictions, 
    userBadges, 
    loginStreak,
    startAddictionTracking,
    markRelapse,
    deactivateAddiction
  } = useAddictions();

  const handleDeactivateAddiction = async (addictionId: string) => {
    await deactivateAddiction(addictionId);
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayEntry = entries.find(entry => entry.date === todayStr);

  // Déterminer le message d'accueil selon l'heure
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return { message: 'Bonjour !', emoji: '☀️' };
    } else {
      return { message: 'Bonsoir !', emoji: '🌙' };
    }
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24 flex flex-col">
      {/* Header avec salutation */}
      <div className="text-center mb-6 sm:mb-8 animate-slide-up">
        <div className="floating-element inline-block">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-4" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-gradient-primary mb-2">
          {greeting.message} {greeting.emoji}
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground max-w-md mx-auto">
          {user 
            ? 'Bienvenue dans votre espace de bien-être quotidien' 
            : 'Commencez votre parcours de bien-être dès aujourd\'hui'
          }
        </p>
        
        {!user && (
          <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary-glow/5 rounded-xl border border-primary/20 relative overflow-hidden">
            <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
              🚀 Créez un compte pour sauvegarder vos progrès
            </p>
            <p className="text-xs text-muted-foreground">
              Accédez ensuite aux fonctionnalités premium qui changent tout
            </p>
          </div>
        )}

        {user && !isPremium && (
          <div className="mt-4 p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-xl border border-warning/20">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-warning">Compte Gratuit</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Débloquez le suivi avancé et les fonctionnalités premium
            </p>
          </div>
        )}
      </div>

      {/* Premium Status & Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {isPremium && (
          <div className="journey-card-glow">
            <div className="flex items-center justify-center space-x-3">
              <Crown className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold text-gradient-primary">
                Journeys Premium
              </span>
              <Crown className="w-6 h-6 text-primary" />
            </div>
          </div>
        )}
        
        {user && (
          <LoginStreakDisplay loginStreak={loginStreak} />
        )}
      </div>

      {/* Featured Addictions Preview */}
      {isPremium && user && userAddictions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Mes Addictions Actives</h2>
            <button
              onClick={() => onNavigate('abstinence')}
              className="text-primary hover:text-primary-glow transition-colors text-sm font-medium"
            >
              Voir tout →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userAddictions.slice(0, 2).map((userAddiction) => {
              const addictionType = addictionTypes.find(at => at.id === userAddiction.addiction_type_id);
              if (!addictionType) return null;
              
              return (
                <AddictionCard
                  key={userAddiction.id}
                  addictionType={addictionType}
                  userAddiction={userAddiction}
                  onStart={() => {}}
                  onRelapse={() => markRelapse(userAddiction.id)}
                  onDeactivate={() => handleDeactivateAddiction(userAddiction.id)}
                  className="cursor-pointer"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Badges */}
      {isPremium && user && userBadges.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center">
              <Star className="w-6 h-6 mr-2 text-accent" />
              Derniers Badges Débloqués
            </h2>
            <button
              onClick={() => onNavigate('abstinence')}
              className="text-accent hover:text-accent-glow transition-colors text-sm font-medium"
            >
              Voir tous les badges →
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userBadges.slice(0, 4).map((userBadge) => (
              <div
                key={userBadge.id}
                className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-accent/10 to-accent-glow/5 border border-accent/20"
              >
                <div className="text-2xl">{userBadge.badge.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm">{userBadge.badge.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {userBadge.badge.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Quote */}
      <DailyQuote />

      {/* Success Indicator for Free Users */}
      {!isPremium && user && (
        <div className="mb-8">
          <PremiumSuccessIndicator />
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Journal - Always Free */}
        <button
          onClick={() => onNavigate('journal')}
          className="journey-card hover:journey-card-glow transition-all duration-300 p-4 sm:p-6 text-left group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Target className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Journal Quotidien</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
            Notez votre journée et suivez votre bien-être
          </p>
        </button>

        {/* Notes Libres - Always Free */}
        <button
          onClick={() => onNavigate('reflection')}
          className="journey-card hover:journey-card-glow transition-all duration-300 p-4 sm:p-6 text-left group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Notes du Jour</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
            Écrivez librement vos pensées et réflexions
          </p>
        </button>

        {/* Meditation - Now Premium */}
        <button
          onClick={() => isPremium ? onNavigate('meditation') : showUpgradeModal()}
          className={`journey-card transition-all duration-300 p-4 sm:p-6 text-left group relative ${
            isPremium ? 'hover:journey-card-glow' : 'opacity-80'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center">
              <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl transition-colors ${
              isPremium 
                ? 'bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-indigo-50'
                : 'bg-muted/20 text-muted-foreground'
            }`}>
              <Brain className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <h3 className={`font-semibold text-base sm:text-lg mb-1 sm:mb-2 ${!isPremium && 'text-muted-foreground'}`}>
            Focus & Deep Work
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
            Méditation et minuteurs premium
          </p>
        </button>

        {/* Premium Features */}
        <button
          onClick={() => isPremium ? onNavigate('abstinence') : showUpgradeModal()}
          className={`journey-card transition-all duration-300 p-4 sm:p-6 text-left group relative ${
            isPremium ? 'hover:journey-card-glow' : 'hover:border-primary/40 opacity-90'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center pulse-glow">
              <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl transition-colors ${
              isPremium 
                ? 'bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground'
                : 'bg-destructive/10 text-destructive group-hover:bg-destructive/20'
            }`}>
              <Shield className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <h3 className={`font-semibold text-base sm:text-lg mb-1 sm:mb-2 ${!isPremium ? 'text-foreground' : 'text-foreground'}`}>
            Suivi Multi-Addictions
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
            Cigarette, porno, réseaux sociaux + badges
          </p>
        </button>
      </div>

      {/* Secondary Actions - Full Width */}
      <div className="space-y-4 mb-8">
        <button
          onClick={() => isPremium ? onNavigate('stretching') : showUpgradeModal()}
          className={`journey-card w-full transition-all duration-300 p-4 sm:p-6 text-left group relative ${
            isPremium ? 'hover:journey-card-glow' : 'opacity-80'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-4 right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center space-x-4">
            <div className={`p-3 sm:p-4 rounded-xl transition-colors ${
              isPremium 
                ? 'bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground'
                : 'bg-muted/20 text-muted-foreground'
            }`}>
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg sm:text-xl mb-1 sm:mb-2 ${!isPremium && 'text-muted-foreground'}`}>
                Routine Stretching
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                5 exercices guidés pour votre bien-être physique
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Progress Overview */}
      <button
        onClick={() => isPremium ? onNavigate('progress') : showUpgradeModal()}
        className={`journey-card w-full text-left mb-6 transition-all duration-300 group relative ${
          isPremium ? 'hover:journey-card-glow' : 'opacity-80'
        }`}
      >
        {!isPremium && (
          <div className="absolute top-4 right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center">
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
          </div>
        )}
        <div className="flex items-center space-x-4 p-4 sm:p-6">
          <div className={`p-3 sm:p-4 rounded-xl transition-colors ${
            isPremium 
              ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
              : 'bg-muted/20 text-muted-foreground'
          }`}>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-lg sm:text-xl mb-1 sm:mb-2 ${!isPremium && 'text-muted-foreground'}`}>
              Progression & Statistiques
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {isPremium 
                ? `Vous avez complété ${entries.length} jours de journal`
                : 'Débloquez l\'historique complet et les statistiques avancées'
              }
            </p>
          </div>
        </div>
      </button>

      {/* Premium Upgrade CTA (for free users) */}
      {!isPremium && user && (
        <button
          onClick={showUpgradeModal}
          className="journey-card-premium w-full text-center p-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center pulse-glow">
              <Crown className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h3 className="text-2xl font-bold text-gradient-primary mb-3">
              Développez tout votre potentiel
            </h3>
            
            <p className="text-muted-foreground mb-6">
              Accédez à toutes les fonctionnalités avancées pour un suivi complet de votre développement personnel.
            </p>

            {/* Comparaison avant/après */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-secondary/30 rounded-lg p-3">
                <div className="text-muted-foreground font-medium mb-1">Gratuit</div>
                <div className="text-xs text-muted-foreground">• Journal de base</div>
                <div className="text-xs text-muted-foreground">• Fonctions limitées</div>
                <div className="text-xs text-muted-foreground">• Pas de suivi</div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <div className="text-primary font-medium mb-1">Premium</div>
                <div className="text-xs text-success">✅ Suivi complet</div>
                <div className="text-xs text-success">✅ Badges exclusifs</div>
                <div className="text-xs text-success">✅ Historique illimité</div>
              </div>
            </div>
            
            <div className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg group-hover:scale-105 transition-transform">
              <Crown className="w-6 h-6" />
              <span>Débloquer Premium (14,99€)</span>
            </div>
            
            <p className="text-xs text-muted-foreground mt-3">
              ⚡ Paiement unique • Accès à vie • Pas d'abonnement
            </p>
          </div>
        </button>
      )}
    </div>
  );
};