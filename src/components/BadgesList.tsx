import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserBadge } from '@/hooks/useAddictions';

interface BadgesListProps {
  userBadges: UserBadge[];
  className?: string;
}

export const BadgesList: React.FC<BadgesListProps> = ({ userBadges, className = "" }) => {
  const addictionBadges = userBadges.filter(ub => ub.badge.category === 'addiction');
  const loginStreakBadges = userBadges.filter(ub => ub.badge.category === 'login_streak');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (userBadges.length === 0) {
    return (
      <div className={`journey-card p-6 text-center ${className}`}>
        <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Aucun badge pour le moment</h3>
        <p className="text-muted-foreground">
          Continuez vos efforts pour débloquer vos premiers badges !
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Badges d'abstinence */}
      {addictionBadges.length > 0 && (
        <div className="journey-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-primary" />
            Badges d'Abstinence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addictionBadges.map((userBadge) => (
              <div
                key={userBadge.id}
                className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary-glow/5 border border-primary/20"
              >
                <div className="text-2xl">{userBadge.badge.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{userBadge.badge.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Obtenu le {formatDate(userBadge.earned_at)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {userBadge.badge.description}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  {userBadge.badge.requirement_value} jour{userBadge.badge.requirement_value > 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges de connexion */}
      {loginStreakBadges.length > 0 && (
        <div className="journey-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-accent" />
            Badges de Fidélité Journeys
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loginStreakBadges.map((userBadge) => (
              <div
                key={userBadge.id}
                className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-accent/10 to-accent-glow/5 border border-accent/20"
              >
                <div className="text-2xl">{userBadge.badge.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{userBadge.badge.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Obtenu le {formatDate(userBadge.earned_at)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {userBadge.badge.description}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
                  {userBadge.badge.requirement_value} jour{userBadge.badge.requirement_value > 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};