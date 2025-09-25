import React, { useState, useEffect } from 'react';
import { Shield, RotateCcw, Trophy, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumLock } from '@/components/PremiumLock';

interface AbstinenceTrackerProps {
  onNavigate: (screen: string) => void;
}

export const AbstinenceTracker: React.FC<AbstinenceTrackerProps> = ({ onNavigate }) => {
  return (
    <PremiumLock feature="Compteur d'abstinence" className="min-h-screen">
      <AbstinenceTrackerContent onNavigate={onNavigate} />
    </PremiumLock>
  );
};

const AbstinenceTrackerContent: React.FC<AbstinenceTrackerProps> = ({ onNavigate }) => {
  const [days, setDays] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('abstinence-start-date');
    if (savedStartDate) {
      setStartDate(savedStartDate);
      const start = new Date(savedStartDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - start.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDays(diffDays);
    }
  }, []);

  const handleReset = () => {
    const today = new Date().toISOString();
    setStartDate(today);
    setDays(0);
    localStorage.setItem('abstinence-start-date', today);
  };

  const handleStart = () => {
    if (!startDate) {
      const today = new Date().toISOString();
      setStartDate(today);
      setDays(0);
      localStorage.setItem('abstinence-start-date', today);
    }
  };

  const getTitleAndMessage = () => {
    if (days === 0) return { 
      title: "Novice", 
      message: "Chaque voyage commence par un premier pas",
      emoji: "🌱"
    };
    if (days < 3) return { 
      title: "Débutant", 
      message: "Tu commences à reprendre le contrôle",
      emoji: "🌿"
    };
    if (days < 7) return { 
      title: "Combattant", 
      message: "Ta volonté se renforce jour après jour",
      emoji: "⚔️"
    };
    if (days < 14) return { 
      title: "Persévérant", 
      message: "Chaque jour est une victoire",
      emoji: "🛡️"
    };
    if (days < 30) return { 
      title: "Guerrier", 
      message: "Ta discipline forge ton caractère",
      emoji: "🏹"
    };
    if (days < 60) return { 
      title: "Champion", 
      message: "Force et détermination t'habitent",
      emoji: "🏆"
    };
    if (days < 90) return { 
      title: "Légende", 
      message: "Tu inspires par ton exemple",
      emoji: "👑"
    };
    if (days < 180) return { 
      title: "Maître", 
      message: "Maître de ton destin et de tes choix",
      emoji: "⚡"
    };
    if (days < 365) return { 
      title: "Sage", 
      message: "Ta sagesse éclaire ton chemin",
      emoji: "🔮"
    };
    return { 
      title: "Immortel", 
      message: "Tu as transcendé tes limites",
      emoji: "💫"
    };
  };

  const getProgressPercentage = () => {
    const target = 90; // 90 days target
    return Math.min((days / target) * 100, 100);
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="mb-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-gradient-primary mb-2">
          Contrôle & Liberté
        </h1>
        <p className="text-muted-foreground mb-3">
          Reprends le contrôle de tes habitudes
        </p>
        <div className="journey-card-premium">
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="mb-2">
              <strong className="text-foreground">Libère-toi des mauvaises habitudes :</strong>
            </p>
            <ul className="space-y-1 pl-4">
              <li>• Films pour adultes et contenus addictifs</li>
              <li>• Scroll infini sur les réseaux sociaux</li>
              <li>• Dérive et procrastination</li>
              <li>• Toute habitude qui t'empêche d'avancer</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Counter */}
      <div className="journey-card-premium mb-8 text-center">
        <div className="relative mb-6">
          <div className="w-48 h-48 mx-auto relative">
            {/* Background Circle */}
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="hsl(var(--border))"
                strokeWidth="8"
                fill="transparent"
                className="opacity-20"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - getProgressPercentage() / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gradient-primary mb-2">
                {days}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                {days === 1 ? 'Jour' : 'Jours'}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{getTitleAndMessage().emoji}</div>
            <h2 className="text-2xl font-bold text-gradient-primary mb-1">
              {getTitleAndMessage().title}
            </h2>
            <p className="text-lg font-medium text-foreground mb-2">
              {getTitleAndMessage().message}
            </p>
          </div>
          {days >= 7 && (
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4 text-primary" />
                <span>{Math.floor(days / 7)} semaine{Math.floor(days / 7) > 1 ? 's' : ''}</span>
              </div>
              {days >= 30 && (
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-primary" />
                  <span>{Math.floor(days / 30)} mois</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          {!startDate ? (
            <Button
              onClick={handleStart}
              className="journey-button-primary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Commencer
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:scale-105 transition-all duration-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Recommencer
              </Button>
              <Button
                onClick={() => {
                  // Add motivational boost
                  const today = new Date().toISOString();
                  localStorage.setItem('last-motivation-boost', today);
                }}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 hover:scale-105 transition-all duration-300"
              >
                💪 Boost
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Milestones with Rewards */}
      {startDate && (
        <div className="space-y-4">
          {/* Next Goal */}
          <div className="journey-card-glow">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Prochain objectif
            </h3>
            {(() => {
              const nextGoals = [3, 7, 14, 30, 60, 90, 180, 365, 730];
              const nextGoal = nextGoals.find(goal => goal > days) || nextGoals[nextGoals.length - 1];
              const progress = days >= nextGoal ? 100 : (days / nextGoal) * 100;
              const remaining = nextGoal - days;
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {nextGoal} jours {nextGoal >= 365 ? `(${Math.floor(nextGoal/365)} an${nextGoal > 365 ? 's' : ''})` : 
                       nextGoal >= 30 ? `(${Math.floor(nextGoal/30)} mois)` : 
                       nextGoal >= 7 ? `(${Math.floor(nextGoal/7)} semaine${nextGoal > 7 ? 's' : ''})` : ''}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {remaining > 0 ? `Plus que ${remaining} jour${remaining > 1 ? 's' : ''}` : 'Objectif atteint! 🎉'}
                    </span>
                  </div>
                  <div className="w-full bg-secondary/30 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Achievement Gallery */}
          <div className="journey-card">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-primary" />
              Galerie des réussites
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { days: 3, title: "Premier pas", icon: "🌱", reward: "Débutant" },
                { days: 7, title: "Une semaine", icon: "⚔️", reward: "Combattant" },
                { days: 14, title: "Deux semaines", icon: "🛡️", reward: "Persévérant" },
                { days: 30, title: "Un mois", icon: "🏹", reward: "Guerrier" },
                { days: 60, title: "Deux mois", icon: "🏆", reward: "Champion" },
                { days: 90, title: "Trois mois", icon: "👑", reward: "Légende" },
                { days: 180, title: "Six mois", icon: "⚡", reward: "Maître" },
                { days: 365, title: "Un an", icon: "🔮", reward: "Sage" }
              ].map((achievement) => (
                <div
                  key={achievement.days}
                  className={`p-4 rounded-xl transition-all duration-500 relative overflow-hidden ${
                    days >= achievement.days
                      ? 'bg-gradient-to-br from-primary/20 to-primary-glow/10 border-2 border-primary/30 shadow-lg'
                      : 'bg-secondary/20 border border-border/30 opacity-60'
                  }`}
                >
                  {days >= achievement.days && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse" />
                  )}
                  <div className="relative z-10 text-center">
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <div className={`text-xs font-semibold mb-1 ${
                      days >= achievement.days ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {achievement.reward}
                    </div>
                    <div className={`text-xs ${
                      days >= achievement.days ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </div>
                    {days >= achievement.days && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motivation Section */}
          <div className="journey-card-premium">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Motivation quotidienne
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-primary/10">
                <div className="text-2xl">💪</div>
                <div>
                  <div className="font-medium text-foreground">Force intérieure</div>
                  <div className="text-sm text-muted-foreground">
                    Tu as résisté {days} jour{days > 1 ? 's' : ''} - ta volonté est plus forte que jamais
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-accent/10">
                <div className="text-2xl">🎯</div>
                <div>
                  <div className="font-medium text-foreground">Vision claire</div>
                  <div className="text-sm text-muted-foreground">
                    Chaque jour te rapproche de la personne que tu veux devenir
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};