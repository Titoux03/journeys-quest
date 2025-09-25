import React, { useState } from 'react';
import { DailyQuote } from '@/components/DailyQuote';
import { Sparkles, TrendingUp, Target, Brain, Shield, Dumbbell, Crown } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';

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

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayEntry = entries.find(entry => entry.date === todayStr);

  return (
    <div className="min-h-screen p-6 pb-24 flex flex-col">
      {/* Header avec salutation */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="floating-element inline-block">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
        </div>
        <h1 className="text-4xl font-bold text-gradient-primary mb-2">
          Bonsoir ! 🌙
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Bienvenue dans votre sanctuaire premium de bien-être
        </p>
      </div>

      {/* Premium Status Banner */}
      {isPremium && (
        <div className="journey-card-glow mb-6">
          <div className="flex items-center justify-center space-x-3">
            <Crown className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-gradient-primary">
              Journeys Premium
            </span>
            <Crown className="w-6 h-6 text-primary" />
          </div>
        </div>
      )}

      {/* Daily Quote */}
      <DailyQuote />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Journal - Always Free */}
        <button
          onClick={() => onNavigate('journal')}
          className="journey-card hover:journey-card-glow transition-all duration-300 p-6 text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-2">Journal Quotidien</h3>
          <p className="text-sm text-muted-foreground">
            Notez votre journée et suivez votre bien-être
          </p>
        </button>

        {/* Meditation - Now Premium */}
        <button
          onClick={() => isPremium ? onNavigate('meditation') : showUpgradeModal()}
          className={`journey-card transition-all duration-300 p-6 text-left group relative ${
            isPremium ? 'hover:journey-card-glow' : 'opacity-80'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Crown className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl transition-colors ${
              isPremium 
                ? 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground'
                : 'bg-muted/20 text-muted-foreground'
            }`}>
              <Brain className="w-6 h-6" />
            </div>
          </div>
          <h3 className={`font-semibold text-lg mb-2 ${!isPremium && 'text-muted-foreground'}`}>
            Méditation & Deep Work
          </h3>
          <p className="text-sm text-muted-foreground">
            Minuteurs premium pour concentration
          </p>
        </button>

        {/* Premium Features */}
        <button
          onClick={() => isPremium ? onNavigate('abstinence') : showUpgradeModal()}
          className={`journey-card transition-all duration-300 p-6 text-left group relative ${
            isPremium ? 'hover:journey-card-glow' : 'opacity-80'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Crown className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl transition-colors ${
              isPremium 
                ? 'bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground'
                : 'bg-muted/20 text-muted-foreground'
            }`}>
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <h3 className={`font-semibold text-lg mb-2 ${!isPremium && 'text-muted-foreground'}`}>
            Compteur d'abstinence
          </h3>
          <p className="text-sm text-muted-foreground">
            Suivez vos progrès jour par jour
          </p>
        </button>

        <button
          onClick={() => isPremium ? onNavigate('stretching') : showUpgradeModal()}
          className={`journey-card transition-all duration-300 p-6 text-left group relative ${
            isPremium ? 'hover:journey-card-glow' : 'opacity-80'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Crown className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl transition-colors ${
              isPremium 
                ? 'bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground'
                : 'bg-muted/20 text-muted-foreground'
            }`}>
              <Dumbbell className="w-6 h-6" />
            </div>
          </div>
          <h3 className={`font-semibold text-lg mb-2 ${!isPremium && 'text-muted-foreground'}`}>
            Routine Stretching
          </h3>
          <p className="text-sm text-muted-foreground">
            5 exercices guidés pour votre bien-être
          </p>
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
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        <div className="flex items-center space-x-4 p-6">
          <div className={`p-4 rounded-xl transition-colors ${
            isPremium 
              ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
              : 'bg-muted/20 text-muted-foreground'
          }`}>
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-xl mb-2 ${!isPremium && 'text-muted-foreground'}`}>
              Progression & Statistiques
            </h3>
            <p className="text-muted-foreground">
              {isPremium 
                ? `Vous avez complété ${entries.length} jours de journal`
                : 'Débloquez l\'historique complet et les statistiques avancées'
              }
            </p>
          </div>
        </div>
      </button>

      {/* Premium Upgrade CTA (for free users) */}
      {!isPremium && (
        <button
          onClick={showUpgradeModal}
          className="journey-card-premium w-full text-center p-8 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-gradient-primary mb-2">
              Débloquez Journeys Premium
            </h3>
            <p className="text-muted-foreground mb-4">
              Accès à vie à toutes les fonctionnalités pour seulement 14,99€
            </p>
            <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary/10 text-primary font-medium group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-5 h-5" />
              <span>Paiement unique</span>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};