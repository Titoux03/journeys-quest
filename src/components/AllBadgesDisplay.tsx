import React from 'react';
import { Target, Lock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddictionType, Badge as BadgeType, UserBadge } from '@/hooks/useAddictions';

interface AllBadgesDisplayProps {
  addictionTypes: AddictionType[];
  badges: BadgeType[];
  userBadges: UserBadge[];
  className?: string;
}

export const AllBadgesDisplay: React.FC<AllBadgesDisplayProps> = ({ 
  addictionTypes, 
  badges, 
  userBadges, 
  className = "" 
}) => {
  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
  
  const getBadgesByType = (addictionTypeId: string) => {
    return badges.filter(b => b.addiction_type_id === addictionTypeId);
  };

  const getLoginStreakBadges = () => {
    return badges.filter(b => b.category === 'login_streak');
  };

  const isBadgeEarned = (badgeId: string) => {
    return earnedBadgeIds.includes(badgeId);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center">
          <Target className="w-6 h-6 mr-2 text-primary" />
          Badges Disponibles
        </h3>
        <p className="text-muted-foreground">
          Découvrez tous les badges que vous pouvez débloquer
        </p>
      </div>

      {/* Badges de Fidélité Journeys */}
      <div className="journey-card p-6">
        <h4 className="text-lg font-semibold mb-4 text-accent">
          🌟 Badges de Fidélité Journeys
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {getLoginStreakBadges().map((badge) => {
            const earned = isBadgeEarned(badge.id);
            return (
              <div
                key={badge.id}
                className={`relative p-4 rounded-xl border transition-all ${
                  earned 
                    ? 'bg-gradient-to-br from-accent/20 to-accent-glow/10 border-accent/40' 
                    : 'bg-card border-border hover:border-accent/20'
                }`}
              >
                {earned && (
                  <CheckCircle className="absolute -top-2 -right-2 w-5 h-5 text-accent bg-background rounded-full" />
                )}
                <div className="text-center">
                  <div className={`text-3xl mb-2 ${!earned ? 'grayscale opacity-50' : ''}`}>
                    {badge.icon}
                  </div>
                  <div className="text-sm font-medium">{badge.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {badge.requirement_value} jour{badge.requirement_value > 1 ? 's' : ''}
                  </div>
                  {!earned && (
                    <Lock className="w-4 h-4 mx-auto mt-2 text-muted-foreground" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges par Addiction */}
      {addictionTypes.map((addictionType) => {
        const typeBadges = getBadgesByType(addictionType.id);
        if (typeBadges.length === 0) return null;

        return (
          <div key={addictionType.id} className="journey-card p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-2">{addictionType.icon}</span>
              Badges {addictionType.name}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {typeBadges.map((badge) => {
                const earned = isBadgeEarned(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`relative p-4 rounded-xl border transition-all ${
                      earned 
                        ? 'bg-gradient-to-br from-primary/20 to-primary-glow/10 border-primary/40' 
                        : 'bg-card border-border hover:border-primary/20'
                    }`}
                  >
                    {earned && (
                      <CheckCircle className="absolute -top-2 -right-2 w-5 h-5 text-primary bg-background rounded-full" />
                    )}
                    <div className="text-center">
                      <div className={`text-3xl mb-2 ${!earned ? 'grayscale opacity-50' : ''}`}>
                        {badge.icon}
                      </div>
                      <div className="text-sm font-medium">{badge.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {badge.requirement_value} jour{badge.requirement_value > 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {badge.description}
                      </div>
                      {!earned && (
                        <Lock className="w-4 h-4 mx-auto mt-2 text-muted-foreground" />
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
  );
};