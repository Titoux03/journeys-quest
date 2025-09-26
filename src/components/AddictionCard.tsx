import React from 'react';
import { Play, RotateCcw, Target, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AddictionType, UserAddiction } from '@/hooks/useAddictions';

interface AddictionCardProps {
  addictionType: AddictionType;
  userAddiction?: UserAddiction;
  onStart: () => void;
  onRelapse: () => void;
  className?: string;
}

export const AddictionCard: React.FC<AddictionCardProps> = ({
  addictionType,
  userAddiction,
  onStart,
  onRelapse,
  className = ""
}) => {
  const isActive = !!userAddiction;
  const currentStreak = userAddiction?.current_streak || 0;
  const longestStreak = userAddiction?.longest_streak || 0;

  const getTitleAndMessage = (days: number) => {
    if (days === 0) return { title: "Nouveau départ", emoji: "🌱" };
    if (days < 3) return { title: "Débutant", emoji: "🌿" };
    if (days < 7) return { title: "Combattant", emoji: "⚔️" };
    if (days < 14) return { title: "Persévérant", emoji: "🛡️" };
    if (days < 30) return { title: "Guerrier", emoji: "🏹" };
    if (days < 60) return { title: "Champion", emoji: "🏆" };
    if (days < 90) return { title: "Légende", emoji: "👑" };
    if (days < 180) return { title: "Maître", emoji: "⚡" };
    if (days < 365) return { title: "Sage", emoji: "🔮" };
    return { title: "Immortel", emoji: "💫" };
  };

  const getProgressPercentage = (days: number) => {
    const target = 90;
    return Math.min((days / target) * 100, 100);
  };

  const status = getTitleAndMessage(currentStreak);

  return (
    <div className={`journey-card p-6 ${className}`} style={{ borderColor: addictionType.color + '30' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: addictionType.color + '20' }}
          >
            {addictionType.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg capitalize">{addictionType.name}</h3>
            <p className="text-sm text-muted-foreground">{addictionType.description}</p>
          </div>
        </div>
        {isActive && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Actif
          </Badge>
        )}
      </div>

      {/* Progress Section */}
      {isActive ? (
        <>
          {/* Current Streak */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold mb-2" style={{ color: addictionType.color }}>
              {currentStreak}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
              {currentStreak === 1 ? 'Jour' : 'Jours'}
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-2xl">{status.emoji}</span>
              <span className="text-lg font-semibold">{status.title}</span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <Progress 
                value={getProgressPercentage(currentStreak)} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Objectif: 90 jours ({Math.round(getProgressPercentage(currentStreak))}%)
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">Meilleur streak</div>
            </div>
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold">{userAddiction.total_relapses}</div>
              <div className="text-xs text-muted-foreground">Rechutes totales</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={onRelapse}
              variant="outline"
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Rechute
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Not Started State */}
          <div className="text-center py-8">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: addictionType.color + '20', color: addictionType.color }}
            >
              <Play className="w-8 h-8" />
            </div>
            <p className="text-muted-foreground mb-6">
              Commencez votre parcours vers la liberté
            </p>
            <Button
              onClick={onStart}
              className="journey-button-primary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Commencer maintenant
            </Button>
          </div>
        </>
      )}
    </div>
  );
};