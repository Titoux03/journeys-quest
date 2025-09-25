import React, { useState } from 'react';
import { Sparkles, Target, Calendar, Award, ArrowRight } from 'lucide-react';
import { DailyQuote } from './DailyQuote';

interface JournalEntry {
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  reflection?: string;
  mood: 'low' | 'medium' | 'high';
}

interface HomePageProps {
  onNavigate: (screen: 'home' | 'journal' | 'reflection' | 'progress') => void;
  entries: JournalEntry[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, entries }) => {
  const [perplexityApiKey, setPerplexityApiKey] = useState<string>(() => {
    return localStorage.getItem('perplexity-api-key') || '';
  });

  const handleApiKeyChange = (newKey: string) => {
    setPerplexityApiKey(newKey);
    localStorage.setItem('perplexity-api-key', newKey);
  };
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayEntry = entries.find(entry => entry.date === todayStr);
  
  const weekData = entries.slice(-7);
  const averageScore = weekData.length > 0 
    ? (weekData.reduce((sum, entry) => sum + entry.totalScore, 0) / weekData.length).toFixed(1)
    : '0';
  
  const streak = calculateStreak(entries);
  const totalPoints = entries.reduce((sum, entry) => sum + Math.round(entry.totalScore * 10), 0);

  const inspirationalQuotes = [
    "Chaque jour est une nouvelle page à écrire ✨",
    "Votre croissance personnelle commence par un simple pas 🌱",
    "Aujourd'hui est rempli de possibilités infinies 🌟",
    "Votre bien-être mérite toute votre attention 💫",
    "Transformez vos habitudes, transformez votre vie 🦋"
  ];

  const todayQuote = inspirationalQuotes[today.getDate() % inspirationalQuotes.length];

  return (
    <div className="min-h-screen p-6 pb-24 flex flex-col">
      {/* Header avec salutation */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="floating-element inline-block">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
        </div>
        <h1 className="text-4xl font-bold text-gradient-primary mb-2">
          Bonsoir ! 🌙
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Bienvenue dans votre sanctuaire premium de bien-être
        </p>
      </div>

      {/* Citation du jour */}
      <div className="mb-8">
        <DailyQuote 
          apiKey={perplexityApiKey}
          onApiKeyChange={handleApiKeyChange}
        />
      </div>

      {/* Statut du jour */}
      <div className="journey-card-premium mb-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">Aujourd'hui</h2>
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        
        {todayEntry ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Score du jour</span>
              <div className={`score-indicator ${
                todayEntry.mood === 'high' ? 'score-high' : 
                todayEntry.mood === 'medium' ? 'score-medium' : 'score-low'
              }`}>
                {todayEntry.totalScore.toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <p className="text-success font-medium">✅ Journal complété !</p>
              <button
                onClick={() => onNavigate('reflection')}
                className="journey-button-accent mt-2 text-sm px-4 py-2"
              >
                Voir la réflexion
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Commencez votre journée par une note de bien-être
            </p>
            <button
              onClick={() => onNavigate('journal')}
              className="journey-button-primary flex items-center gap-2 mx-auto pulse-glow"
            >
              <Target className="w-5 h-5" />
              Évaluer ma journée
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="journey-card-premium text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Award className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
          <div className="text-xs text-muted-foreground">Points totaux</div>
        </div>
        
        <div className="journey-card-premium text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-2xl font-bold text-primary">{streak}</div>
          <div className="text-xs text-muted-foreground">Jours consécutifs</div>
        </div>
        
        <div className="journey-card-premium text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-2xl font-bold text-accent-light">{averageScore}</div>
          <div className="text-xs text-muted-foreground">Moyenne 7j</div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="space-y-4 mt-auto">
        <h3 className="text-lg font-semibold text-card-foreground mb-3">Actions rapides</h3>
        
        <button
          onClick={() => onNavigate('progress')}
          className="w-full journey-card-premium hover:journey-card-glow transition-all duration-300 p-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-card-foreground">Voir mes progrès</h4>
              <p className="text-sm text-muted-foreground">Analysez votre évolution</p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
          </div>
        </button>
        
        <button
          onClick={() => onNavigate('journal')}
          className="w-full journey-card-premium hover:journey-card-glow transition-all duration-300 p-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-card-foreground">Nouvelle évaluation</h4>
              <p className="text-sm text-muted-foreground">Noter votre journée actuelle</p>
            </div>
            <Target className="w-5 h-5 text-primary" />
          </div>
        </button>
      </div>
    </div>
  );
};

function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let currentDate = new Date();
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }
  
  return streak;
}