import React from 'react';
import { Play, RotateCcw, Target, Trophy, Calendar, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AddictionType, UserAddiction } from '@/hooks/useAddictions';
import { CigaretteSavings } from './CigaretteSavings';
import { useTranslation } from 'react-i18next';

interface AddictionCardProps {
  addictionType: AddictionType;
  userAddiction?: UserAddiction;
  onStart: () => void;
  onRelapse: () => void;
  onDeactivate?: () => void;
  className?: string;
}

export const AddictionCard: React.FC<AddictionCardProps> = ({
  addictionType,
  userAddiction,
  onStart,
  onRelapse,
  onDeactivate,
  className = ""
}) => {
  const { t } = useTranslation();
  const isActive = !!userAddiction;
  const currentStreak = userAddiction?.current_streak || 0;
  const longestStreak = userAddiction?.longest_streak || 0;
  const hasCigaretteData = userAddiction?.daily_cigarettes && userAddiction?.cigarette_price;

  const getTitleAndMessage = (days: number) => {
    if (days === 0) return { title: t('addictions.status.newStart'), emoji: "🌱" };
    if (days < 3) return { title: t('addictions.status.beginner'), emoji: "🌿" };
    if (days < 7) return { title: t('addictions.status.fighter'), emoji: "⚔️" };
    if (days < 14) return { title: t('addictions.status.perseverant'), emoji: "🛡️" };
    if (days < 30) return { title: t('addictions.status.warrior'), emoji: "🏹" };
    if (days < 60) return { title: t('addictions.status.champion'), emoji: "🏆" };
    if (days < 90) return { title: t('addictions.status.legend'), emoji: "👑" };
    if (days < 180) return { title: t('addictions.status.master'), emoji: "⚡" };
    if (days < 365) return { title: t('addictions.status.sage'), emoji: "🔮" };
    return { title: t('addictions.status.immortal'), emoji: "💫" };
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
            {t('addictions.active')}
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
              {currentStreak === 1 ? t('addictions.day') : t('addictions.days')}
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
                {t('addictions.goal')} ({Math.round(getProgressPercentage(currentStreak))}%)
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">{t('addictions.longestStreak')}</div>
            </div>
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-semibold">{userAddiction.total_relapses}</div>
              <div className="text-xs text-muted-foreground">{t('addictions.totalRelapses')}</div>
            </div>
          </div>

          {/* Cigarette Savings - if available */}
          {hasCigaretteData && (
            <CigaretteSavings
              dailyCigarettes={userAddiction.daily_cigarettes!}
              cigarettePrice={userAddiction.cigarette_price!}
              currentStreak={currentStreak}
              className="mb-6"
            />
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onRelapse}
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('addictions.relapse')}
            </Button>
            {onDeactivate && (
              <Button
                onClick={onDeactivate}
                variant="outline"
                className="border-muted-foreground/30 text-muted-foreground hover:bg-muted/20"
                size="sm"
              >
                <Pause className="w-4 h-4 mr-2" />
                {t('addictions.deactivate')}
              </Button>
            )}
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
              {t('addictions.startJourney')}
            </p>
            <Button
              onClick={onStart}
              className="journey-button-primary"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t('addiction.startNow')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};