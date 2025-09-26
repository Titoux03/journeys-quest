import React from 'react';
import { Flame, Calendar, Trophy } from 'lucide-react';
import { LoginStreak } from '@/hooks/useAddictions';

interface LoginStreakDisplayProps {
  loginStreak: LoginStreak | null;
  className?: string;
}

export const LoginStreakDisplay: React.FC<LoginStreakDisplayProps> = ({ 
  loginStreak, 
  className = "" 
}) => {
  if (!loginStreak) {
    return (
      <div className={`journey-card-glow p-4 text-center ${className}`}>
        <Flame className="w-8 h-8 mx-auto mb-2 text-primary" />
        <h3 className="font-semibold text-lg mb-1">Streak Journeys</h3>
        <p className="text-sm text-muted-foreground">
          Connectez-vous quotidiennement pour construire votre streak !
        </p>
      </div>
    );
  }

  const getStreakEmoji = (days: number) => {
    if (days >= 90) return '🔮';
    if (days >= 60) return '👑';
    if (days >= 30) return '💎';
    if (days >= 14) return '⭐';
    if (days >= 7) return '🔥';
    if (days >= 3) return '🌟';
    return '✨';
  };

  const getStreakTitle = (days: number) => {
    if (days >= 90) return 'Légende Éternelle';
    if (days >= 60) return 'Maître Journeyer';
    if (days >= 30) return 'Passionné';
    if (days >= 14) return 'Dévoué';
    if (days >= 7) return 'Persévérant';
    if (days >= 3) return 'Fidèle Journeyer';
    return 'Débutant';
  };

  return (
    <div className={`journey-card-glow p-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Flame className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Streak Journeys</h3>
        </div>
        
        <div className="mb-4">
          <div className="text-4xl mb-2">{getStreakEmoji(loginStreak.current_streak)}</div>
          <div className="text-3xl font-bold text-gradient-primary mb-1">
            {loginStreak.current_streak}
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            {loginStreak.current_streak === 1 ? 'Jour consécutif' : 'Jours consécutifs'}
          </div>
          <div className="text-lg font-semibold text-primary">
            {getStreakTitle(loginStreak.current_streak)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/20 rounded-lg p-3">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-accent" />
            <div className="text-lg font-semibold">{loginStreak.longest_streak}</div>
            <div className="text-xs text-muted-foreground">Meilleur streak</div>
          </div>
          <div className="bg-secondary/20 rounded-lg p-3">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-accent" />
            <div className="text-lg font-semibold">
              {new Date(loginStreak.streak_start_date).toLocaleDateString('fr-FR')}
            </div>
            <div className="text-xs text-muted-foreground">Début du streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};