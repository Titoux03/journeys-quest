import React from 'react';
import { TrendingUp, Users, Crown, Star, Target } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';

interface SuccessStory {
  name: string;
  age: number;
  achievement: string;
  days: number;
  avatar: string;
}

interface PremiumSuccessIndicatorProps {
  className?: string;
}

export const PremiumSuccessIndicator: React.FC<PremiumSuccessIndicatorProps> = ({ 
  className = ""
}) => {
  const { isPremium, showUpgradeModal } = usePremium();
  const { user } = useAuth();

  if (isPremium || !user) return null;

  const successStories: SuccessStory[] = [
    {
      name: "Alex",
      age: 29,
      achievement: "Arrêt cigarette",
      days: 127,
      avatar: "🧑‍💼"
    },
    {
      name: "Marie",
      age: 24,
      achievement: "Pas de scroll",
      days: 89,
      avatar: "👩‍🎓"
    },
    {
      name: "Tom",
      age: 31,
      achievement: "NoFap streak",
      days: 203,
      avatar: "👨‍💻"
    }
  ];

  return (
    <div className={`journey-card p-6 border-l-4 border-l-success ${className}`}>
      {/* Header avec stats impressionnantes */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-success" />
          <span className="font-semibold text-foreground">Membres Premium</span>
        </div>
        <div className="bg-success/20 text-success px-2 py-1 rounded-full text-xs font-bold">
          94% succès
        </div>
      </div>

      {/* Stats de comparaison visuelle */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-muted-foreground mb-1">Gratuit</div>
          <div className="w-full bg-muted-foreground/20 rounded-full h-2 mb-2">
            <div className="bg-muted-foreground h-2 rounded-full" style={{ width: '23%' }}></div>
          </div>
          <div className="text-xs text-muted-foreground">23% atteignent 7 jours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">Premium</div>
          <div className="w-full bg-primary/20 rounded-full h-2 mb-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
          </div>
          <div className="text-xs text-primary">94% dépassent 30 jours</div>
        </div>
      </div>

      {/* Success Stories en temps réel */}
      <div className="space-y-3 mb-6">
        <div className="text-sm font-medium text-foreground mb-2 flex items-center">
          <Users className="w-4 h-4 mr-2 text-accent" />
          Succès cette semaine:
        </div>
        
        {successStories.map((story, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 bg-secondary/30 rounded-lg">
            <span className="text-lg">{story.avatar}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">{story.name}, {story.age} ans</span>
                <div className="bg-success/20 text-success px-2 py-0.5 rounded text-xs">
                  {story.days} jours
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{story.achievement}</div>
            </div>
            <Crown className="w-4 h-4 text-primary" />
          </div>
        ))}
      </div>

      {/* Indicateur de perte d'opportunité */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium text-warning">Opportunité manquée</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Chaque jour sans Premium, tu perds des données précieuses sur tes habitudes et ton évolution.
        </p>
      </div>

      {/* CTA subtil mais efficace */}
      <button 
        onClick={showUpgradeModal}
        className="w-full text-left p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              Rejoindre ces success stories
            </div>
            <div className="text-xs text-muted-foreground">
              3x plus de chances de réussir
            </div>
          </div>
          <Star className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    </div>
  );
};