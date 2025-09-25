import React from 'react';
import { TrendingUp, Award, Calendar, ArrowLeft, Star } from 'lucide-react';

interface JournalEntry {
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  reflection?: string;
  mood: 'low' | 'medium' | 'high';
}

interface ProgressScreenProps {
  entries: JournalEntry[];
  onNavigate: (screen: 'home' | 'journal' | 'reflection' | 'progress') => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ entries, onNavigate }) => {
  const last7Days = entries.slice(-7);
  const last30Days = entries.slice(-30);
  
  const calculateAverage = (data: JournalEntry[]) => 
    data.length > 0 ? (data.reduce((sum, entry) => sum + entry.totalScore, 0) / data.length) : 0;

  const weekAverage = calculateAverage(last7Days);
  const monthAverage = calculateAverage(last30Days);
  
  const bestDay = entries.length > 0 
    ? entries.reduce((best, entry) => entry.totalScore > best.totalScore ? entry : best)
    : null;

  const totalPoints = entries.reduce((sum, entry) => sum + Math.round(entry.totalScore * 10), 0);
  
  const getMoodEmoji = (mood: 'low' | 'medium' | 'high') => {
    switch (mood) {
      case 'high': return '🌟';
      case 'medium': return '😊';
      case 'low': return '💙';
    }
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8 animate-slide-up">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">Vos Progrès</h1>
            <p className="text-muted-foreground">Suivez votre évolution personnelle</p>
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="journey-card text-center animate-scale-in">
            <Award className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-accent">{totalPoints}</div>
            <div className="text-sm text-muted-foreground">Points totaux</div>
          </div>
          
          <div className="journey-card text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-primary">{entries.length}</div>
            <div className="text-sm text-muted-foreground">Jours enregistrés</div>
          </div>
        </div>

        {/* Moyennes */}
        <div className="journey-card mb-8 animate-slide-up">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" />
            Moyennes des scores
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">7 derniers jours</span>
              <div className={`score-indicator ${
                weekAverage >= 7 ? 'score-high' : 
                weekAverage >= 4 ? 'score-medium' : 'score-low'
              }`}>
                {weekAverage.toFixed(1)}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">30 derniers jours</span>
              <div className={`score-indicator ${
                monthAverage >= 7 ? 'score-high' : 
                monthAverage >= 4 ? 'score-medium' : 'score-low'
              }`}>
                {monthAverage.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Meilleur jour */}
        {bestDay && (
          <div className="journey-card-glow mb-8 animate-scale-in">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-accent" />
              Votre meilleur jour
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-medium text-card-foreground">
                  {new Date(bestDay.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  Score parfait de {bestDay.totalScore.toFixed(1)}/10
                </div>
              </div>
              <div className="text-4xl">
                {getMoodEmoji(bestDay.mood)}
              </div>
            </div>
            
            {bestDay.reflection && (
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-card-foreground italic">
                  "{bestDay.reflection.substring(0, 100)}..."
                </p>
              </div>
            )}
          </div>
        )}

        {/* Historique récent */}
        <div className="journey-card animate-slide-up">
          <h3 className="text-xl font-semibold mb-6">Historique récent</h3>
          
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune entrée pour le moment</p>
              <button
                onClick={() => onNavigate('journal')}
                className="journey-button-primary mt-4"
              >
                Créer votre première entrée
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {entries.slice().reverse().map((entry, index) => (
                <div 
                  key={entry.date}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getMoodEmoji(entry.mood)}
                    </div>
                    <div>
                      <div className="font-medium text-card-foreground">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.reflection ? 'Avec réflexion' : 'Évaluation seule'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`score-indicator ${
                    entry.mood === 'high' ? 'score-high' : 
                    entry.mood === 'medium' ? 'score-medium' : 'score-low'
                  }`}>
                    {entry.totalScore.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Encouragement */}
        {entries.length > 0 && (
          <div className="journey-card bg-accent/10 border-accent/20 mt-6 animate-slide-up">
            <div className="text-center">
              <Star className="w-8 h-8 text-accent mx-auto mb-3" />
              <h4 className="font-semibold text-card-foreground mb-2">
                Félicitations ! 🎉
              </h4>
              <p className="text-muted-foreground">
                Vous avez déjà parcouru {entries.length} jour{entries.length > 1 ? 's' : ''} de votre voyage personnel.
                Continuez ainsi !
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};