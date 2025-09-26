import React, { useState } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Plus, Heart, Users, Dumbbell, BookOpen, Brain, Check, Sparkles, X } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { toast } from 'sonner';
import { PremiumTeaser } from '@/components/PremiumTeaser';

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

const motivationalPhrases = [
  "🌟 Incroyable ! Vous rayonnez aujourd'hui !",
  "🚀 Vous êtes sur la bonne voie, continuez !",
  "💪 Cette énergie positive vous mènera loin !",
  "✨ Quelle belle journée ! Savourez ce moment !",
  "🎯 Vous dépassez vos objectifs, bravo !",
  "🔥 Cette motivation est contagieuse !",
  "🌈 Vous créez votre propre bonheur !",
  "🏆 Champion aujourd'hui, légende demain !",
  "💎 Vous brillez de mille feux !",
  "🌟 Cette excellence mérite d'être célébrée !",
  "⚡ Votre potentiel est illimité !",
  "🎊 Continuez, vous touchez aux étoiles !"
];

const getRandomMotivationalPhrase = () => {
  return motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
};

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
  },
  {
    key: 'wellbeing',
    label: 'Bien-être',
    icon: Sparkles,
    description: 'Sentiment général de bien-être et épanouissement',
    color: 'text-yellow-500'
  }
];

export const DailyJournal: React.FC<DailyJournalProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { saveJournalEntry } = useProgress();
  const [scores, setScores] = useState<Record<string, number>>(
    defaultCriteria.reduce((acc, criterion) => ({
      ...acc,
      [criterion.key]: 5
    }), {})
  );
  
  const [criteria, setCriteria] = useState(defaultCriteria);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customCriterion, setCustomCriterion] = useState('');
  const [saving, setSaving] = useState(false);

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

  const removeCriterion = (key: string) => {
    // Ne pas permettre de supprimer si moins de 3 critères
    if (criteria.length <= 3) {
      toast.error('Vous devez garder au moins 3 critères');
      return;
    }
    
    setCriteria(prev => prev.filter(c => c.key !== key));
    setScores(prev => {
      const newScores = { ...prev };
      delete newScores[key];
      return newScores;
    });
    toast.success('Critère supprimé');
  };

  const calculateTotalScore = () => {
    const totalPoints = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return totalPoints / criteria.length;
  };

  const handleComplete = async () => {
    const totalScore = calculateTotalScore();
    
    // Sauvegarder en base si l'utilisateur est connecté
    if (user) {
      setSaving(true);
      const mood = totalScore <= 4 ? 'low' : totalScore <= 7 ? 'medium' : 'high';
      const result = await saveJournalEntry(scores, totalScore, mood);
      
      if (result?.success) {
        toast.success('Votre journal a été sauvegardé !');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
      setSaving(false);
    } else {
      // Indiquer que les données sont sauvegardées localement
      toast.success('Journal sauvegardé ! Créez un compte pour synchroniser vos données.');
    }
    
    onComplete(scores, totalScore);
  };

  const totalScore = calculateTotalScore();
  const mood = totalScore >= 7 ? 'high' : totalScore >= 4 ? 'medium' : 'low';

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-2">
            Comment s'est passée votre journée ?
          </h1>
          {!isPremium && (
            <>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                ✨ Visualise ta progression complète avec Journeys Premium
              </p>
              
              <PremiumTeaser 
                title="Débloque ton historique complet"
                description="Transforme chaque jour en victoire visible"
                variant="compact"
                className="mb-6"
              />
            </>
          )}
        </div>

        {/* Score global */}
        <div className="journey-card-premium mb-8 text-center animate-scale-in">
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
          
          {/* Phrase motivante pour score > 7 */}
          {totalScore > 7 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 animate-pulse-glow">
              <p className="text-primary font-medium text-lg">
                {getRandomMotivationalPhrase()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Continuez sur cette voie exceptionnelle ! 💫
              </p>
            </div>
          )}
        </div>

        {/* Critères d'évaluation */}
        <div className="space-y-6 mb-8">
          {criteria.map((criterion, index) => {
            const IconComponent = criterion.icon;
            return (
              <div 
                key={criterion.key}
                className="journey-card-premium animate-slide-up"
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
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-primary">
                      {scores[criterion.key]}
                    </div>
                    {criteria.length > 3 && (
                      <button
                        onClick={() => removeCriterion(criterion.key)}
                        className="w-8 h-8 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    )}
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
          <div className="journey-card-premium mb-6 animate-scale-in">
            <h3 className="font-medium mb-4">Ajouter un critère personnalisé</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ex: Créativité, Travail..."
                value={customCriterion}
                onChange={(e) => setCustomCriterion(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-input bg-input text-foreground placeholder-muted-foreground"
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
            className="w-full journey-card-premium hover:journey-card-glow transition-all duration-300 p-4 text-center mb-6"
          >
            <Plus className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Ajouter un critère personnalisé</p>
          </button>
        )}

        {/* Bouton de validation */}
        <button
          onClick={handleComplete}
          className={`w-full journey-button-primary text-lg py-4 flex items-center justify-center gap-3 pulse-glow ${saving ? 'opacity-50' : ''}`}
          disabled={saving}
        >
          <Plus className="w-6 h-6" />
          {saving ? 'Sauvegarde...' : 'Terminer l\'évaluation'}
        </button>
      </div>
    </div>
  );
};