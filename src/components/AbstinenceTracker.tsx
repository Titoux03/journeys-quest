import React, { useState, useEffect } from 'react';
import { Calendar, RotateCcw, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AbstinenceTrackerProps {
  onNavigate: (screen: string) => void;
}

export const AbstinenceTracker: React.FC<AbstinenceTrackerProps> = ({ onNavigate }) => {
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

  const getMotivationalMessage = () => {
    if (days === 0) return "Chaque voyage commence par un premier pas";
    if (days < 7) return "Tu reprends le contrôle";
    if (days < 30) return "Chaque jour compte";
    if (days < 90) return "Force et détermination";
    return "Maître de ton destin";
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
        <p className="text-muted-foreground">
          Reprends le contrôle de tes habitudes
        </p>
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
          <p className="text-lg font-medium text-foreground mb-2">
            {getMotivationalMessage()}
          </p>
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
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Milestones */}
      {startDate && (
        <div className="journey-card">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Objectifs</h3>
          <div className="space-y-3">
            {[
              { days: 7, label: "1 semaine", icon: "🌱" },
              { days: 30, label: "1 mois", icon: "🌿" },
              { days: 90, label: "3 mois", icon: "🌳" },
              { days: 365, label: "1 an", icon: "🏆" }
            ].map((milestone) => (
              <div
                key={milestone.days}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  days >= milestone.days
                    ? 'bg-success/10 border border-success/20'
                    : 'bg-secondary/30 border border-border/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{milestone.icon}</span>
                  <span className={`font-medium ${
                    days >= milestone.days ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {milestone.label}
                  </span>
                </div>
                {days >= milestone.days && (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};