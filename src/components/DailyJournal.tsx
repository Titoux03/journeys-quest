import React, { useState } from 'react';
import { Check, Users, Heart, Dumbbell, BookOpen, Brain, Plus } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface DailyJournalProps {
  onComplete: (scores: Record<string, number>, totalScore: number) => void;
}

interface LifeCriterion {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const defaultCriteria: LifeCriterion[] = [
  {
    key: 'social',
    label: 'Vie sociale',
    icon: Users,
    description: 'Relations avec mes amis et collègues',
    color: 'text-blue-500'
  },
  {
    key: 'family',
    label: 'Famille',
    icon: Heart,
    description: 'Moments avec ma famille',
    color: 'text-red-500'
  },
  {
    key: 'love',
    label: 'Amour',
    icon: Heart,
    description: 'Relations amoureuses et intimité',
    color: 'text-pink-500'
  },
  {
    key: 'sport',
    label: 'Sport',
    icon: Dumbbell,
    description: 'Activité physique et mouvement',
    color: 'text-green-500'
  },
  {
    key: 'learning',
    label: 'Apprentissage',
    icon: BookOpen,
    description: 'Nouvelles connaissances et compétences',
    color: 'text-purple-500'
  },
  {
    key: 'meditation',
    label: 'Méditation',
    icon: Brain,
    description: 'Pleine conscience et détente',
    color: 'text-indigo-500'
  }
];

export const DailyJournal: React.FC<DailyJournalProps> = ({ onComplete }) => {
  const [scores, setScores] = useState<Record<string, number>>(
    defaultCriteria.reduce((acc, criterion) => ({
      ...acc,
      [criterion.key]: 5
    }), {})
  );
  
  const [criteria, setCriteria] = useState(defaultCriteria);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customCriterion, setCustomCriterion] = useState('');

  const handleScoreChange = (key: string, value: number[]) => {
    setScores(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  const addCustomCriterion = () => {
    if (customCriterion.trim() && !criteria.find(c => c.key === customCriterion.toLowerCase())) {
      const newCriterion: LifeCriterion = {
        key: customCriterion.toLowerCase(),
        label: customCriterion,
        icon: Plus,
        description: 'Critère personnalisé',
        color: 'text-accent'
      };
      
      setCriteria(prev => [...prev, newCriterion]);
      setScores(prev => ({
        ...prev,
        [newCriterion.key]: 5
      }));
      setCustomCriterion('');
      setShowAddCustom(false);
    }
  };

  const calculateTotalScore = () => {
    const totalPoints = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return totalPoints / criteria.length;
  };

  const handleComplete = () => {
    const totalScore = calculateTotalScore();
    onComplete(scores, totalScore);
  };

  const totalScore = calculateTotalScore();
  const mood = totalScore >= 7 ? 'high' : totalScore >= 4 ? 'medium' : 'low';

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Comment s'est passée votre journée ?
          </h1>
          <p className="text-muted-foreground">
            Évaluez chaque aspect de votre vie sur 10
          </p>
        </div>

        {/* Score global */}
        <div className="journey-card mb-8 text-center animate-scale-in">
          <h3 className="text-lg font-medium mb-4">Score global</h3>
          <div className={`score-indicator mx-auto ${
            mood === 'high' ? 'score-high' : 
            mood === 'medium' ? 'score-medium' : 'score-low'
          }`}>
            {totalScore.toFixed(1)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {mood === 'high' && 'Excellente journée ! 🌟'}
            {mood === 'medium' && 'Journée équilibrée 😊'}
            {mood === 'low' && 'Prenez soin de vous 💙'}
          </p>
        </div>

        {/* Critères d'évaluation */}
        <div className="space-y-6 mb-8">
          {criteria.map((criterion, index) => {
            const IconComponent = criterion.icon;
            return (
              <div 
                key={criterion.key}
                className="journey-card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <IconComponent className={`w-6 h-6 ${criterion.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-card-foreground">{criterion.label}</h3>
                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {scores[criterion.key]}
                  </div>
                </div>
                
                <div className="px-4">
                  <Slider
                    value={[scores[criterion.key]]}
                    onValueChange={(value) => handleScoreChange(criterion.key, value)}
                    max={10}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>0 - Difficile</span>
                    <span>5 - Correct</span>
                    <span>10 - Parfait</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ajouter un critère personnalisé */}
        {showAddCustom ? (
          <div className="journey-card mb-6 animate-scale-in">
            <h3 className="font-medium mb-4">Ajouter un critère personnalisé</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ex: Créativité, Travail..."
                value={customCriterion}
                onChange={(e) => setCustomCriterion(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-foreground"
                onKeyPress={(e) => e.key === 'Enter' && addCustomCriterion()}
              />
              <button
                onClick={addCustomCriterion}
                className="journey-button-accent"
              >
                Ajouter
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCustom(true)}
            className="w-full journey-card hover:journey-card-glow transition-all duration-300 p-4 text-center mb-6"
          >
            <Plus className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Ajouter un critère personnalisé</p>
          </button>
        )}

        {/* Bouton de validation */}
        <button
          onClick={handleComplete}
          className="w-full journey-button-primary text-lg py-4 flex items-center justify-center gap-3 pulse-glow"
        >
          <Check className="w-6 h-6" />
          Terminer l'évaluation
        </button>
      </div>
    </div>
  );
};