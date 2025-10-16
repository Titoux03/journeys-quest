import React from 'react';
import { X, Lock, CheckCircle, Star, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AddictionType, Badge as BadgeType, UserBadge } from '@/hooks/useAddictions';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  addictionTypes: AddictionType[];
  badges: BadgeType[];
  userBadges: UserBadge[];
  currentStreaks?: Record<string, number>;
  loginStreak?: number;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  addictionTypes,
  badges,
  userBadges,
  currentStreaks = {},
  loginStreak = 0
}) => {
  if (!isOpen) return null;

  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

  const isBadgeEarned = (badgeId: string) => earnedBadgeIds.includes(badgeId);

  const getBadgeProgress = (badge: BadgeType) => {
    if (badge.category === 'login_streak') {
      return Math.min((loginStreak / badge.requirement_value) * 100, 100);
    }
    if (badge.addiction_type_id) {
      const streak = currentStreaks[badge.addiction_type_id] || 0;
      return Math.min((streak / badge.requirement_value) * 100, 100);
    }
    return 0;
  };

  const getBadgeStatus = (badge: BadgeType) => {
    const earned = isBadgeEarned(badge.id);
    const progress = getBadgeProgress(badge);
    
    if (earned) return 'earned';
    if (progress > 0) return 'in-progress';
    return 'locked';
  };

  const loginStreakBadges = badges.filter(b => b.category === 'login_streak');
  const addictionBadges = badges.filter(b => b.category === 'addiction');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg">
      <div className="journey-card-premium w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/50 p-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Vos Badges Journeys</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="p-6 border-b border-border/30">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-success/20 to-success/10 border border-success/30">
              <div className="text-3xl font-bold text-success">{earnedBadgeIds.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Badges Obtenus</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 border border-warning/30">
              <div className="text-3xl font-bold text-warning">
                {badges.filter(b => getBadgeStatus(b) === 'in-progress').length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">En Cours</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-muted/20 to-muted/10 border border-border">
              <div className="text-3xl font-bold text-muted-foreground">{badges.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Total Disponible</div>
            </div>
          </div>
        </div>

        {/* Login Streak Badges */}
        <div className="p-6 border-b border-border/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-accent">
            <Star className="w-5 h-5 mr-2" />
            🌟 Badges de Fidélité Journeys
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loginStreakBadges.map((badge) => {
              const status = getBadgeStatus(badge);
              const progress = getBadgeProgress(badge);
              const earned = status === 'earned';
              const inProgress = status === 'in-progress';

              return (
                <div
                  key={badge.id}
                  className={`relative p-4 rounded-xl border transition-all ${
                    earned
                      ? 'bg-gradient-to-br from-accent/20 to-accent-glow/10 border-accent/40'
                      : inProgress
                      ? 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30'
                      : 'bg-card border-border'
                  }`}
                >
                  {earned && (
                    <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-accent bg-background rounded-full p-0.5" />
                  )}
                  <div className="text-center">
                    <div className={`text-4xl mb-2 ${!earned && !inProgress ? 'grayscale opacity-40' : ''}`}>
                      {badge.icon}
                    </div>
                    <div className="text-sm font-medium text-foreground mb-1">{badge.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {badge.requirement_value} jour{badge.requirement_value > 1 ? 's' : ''}
                    </div>
                    
                    {inProgress && !earned && (
                      <div className="space-y-1">
                        <Progress value={progress} className="h-1.5" />
                        <div className="text-xs text-warning font-medium">
                          {loginStreak}/{badge.requirement_value}
                        </div>
                      </div>
                    )}
                    
                    {!earned && !inProgress && (
                      <Lock className="w-4 h-4 mx-auto text-muted-foreground" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Addiction Badges by Type */}
        {addictionTypes.map((addictionType) => {
          const typeBadges = addictionBadges.filter(b => b.addiction_type_id === addictionType.id);
          if (typeBadges.length === 0) return null;

          return (
            <div key={addictionType.id} className="p-6 border-b border-border/30 last:border-0">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">{addictionType.icon}</span>
                Badges {addictionType.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {typeBadges.map((badge) => {
                  const status = getBadgeStatus(badge);
                  const progress = getBadgeProgress(badge);
                  const earned = status === 'earned';
                  const inProgress = status === 'in-progress';
                  const currentStreak = currentStreaks[badge.addiction_type_id || ''] || 0;

                  return (
                    <div
                      key={badge.id}
                      className={`relative p-4 rounded-xl border transition-all ${
                        earned
                          ? 'bg-gradient-to-br from-primary/20 to-primary-glow/10 border-primary/40'
                          : inProgress
                          ? 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30'
                          : 'bg-card border-border'
                      }`}
                    >
                      {earned && (
                        <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-primary bg-background rounded-full p-0.5" />
                      )}
                      <div className="text-center">
                        <div className={`text-4xl mb-2 ${!earned && !inProgress ? 'grayscale opacity-40' : ''}`}>
                          {badge.icon}
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">{badge.name}</div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {badge.requirement_value} jour{badge.requirement_value > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {badge.description}
                        </div>
                        
                        {inProgress && !earned && (
                          <div className="space-y-1">
                            <Progress value={progress} className="h-1.5" />
                            <div className="text-xs text-warning font-medium">
                              {currentStreak}/{badge.requirement_value}
                            </div>
                          </div>
                        )}
                        
                        {!earned && !inProgress && (
                          <Lock className="w-4 h-4 mx-auto text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
