import React, { useState } from 'react';
import { ArrowLeft, Edit3, Save, TrendingUp, Heart, Users, Dumbbell, Brain, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { DayNotesView } from './DayNotesView';
import { PremiumTeaser } from './PremiumTeaser';
import { usePremium } from '@/hooks/usePremium';
import { useProgress } from '@/hooks/useProgress';

interface DayDetailViewProps {
  selectedDate: Date;
  onBack: () => void;
}

const CATEGORIES = [
  { id: 'social', name: 'Social', icon: Users, color: 'from-blue-500 to-blue-600' },
  { id: 'famille', name: 'Famille', icon: Heart, color: 'from-pink-500 to-pink-600' },
  { id: 'amour', name: 'Amour', icon: Heart, color: 'from-red-500 to-red-600' },
  { id: 'sport', name: 'Sport', icon: Dumbbell, color: 'from-green-500 to-green-600' },
  { id: 'apprentissage', name: 'Apprentissage', icon: Brain, color: 'from-purple-500 to-purple-600' },
  { id: 'meditation', name: 'Méditation', icon: Sparkles, color: 'from-yellow-500 to-yellow-600' },
];

export const DayDetailView: React.FC<DayDetailViewProps> = ({
  selectedDate,
  onBack
}) => {
  const { isPremium } = usePremium();
  const { journalEntries, saveJournalEntry } = useProgress();
  const [isEditing, setIsEditing] = useState(false);
  
  // Trouver l'entrée existante pour cette date
  const dateString = selectedDate.toISOString().split('T')[0];
  const existingEntry = journalEntries.find(entry => entry.date === dateString);
  
  const [scores, setScores] = useState(
    existingEntry?.scores || {
      social: 50,
      famille: 50,
      amour: 50,
      sport: 50,
      apprentissage: 50,
      meditation: 50,
    }
  );
  
  const [mood, setMood] = useState(existingEntry?.mood || 'neutre');
  const [reflection, setReflection] = useState(existingEntry?.reflection || '');

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 6;

  const handleSave = async () => {
    if (!isPremium && existingEntry) {
      // En mode freemium, on peut créer une seule entrée par jour
      return;
    }

    const entryData = {
      date: dateString,
      scores,
      mood,
      reflection,
      total_score: Math.round(totalScore)
    };

    const result = await saveJournalEntry(entryData.scores, entryData.total_score, entryData.mood as 'low' | 'medium' | 'high', entryData.reflection || '');
    if (result?.success) {
      setIsEditing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    if (score >= 40) return 'text-orange-500';
    return 'text-destructive';
  };

  const getMoodEmoji = (moodValue: string) => {
    const moods = {
      'tres-mauvais': '😢',
      'mauvais': '😞',
      'neutre': '😐',
      'bon': '😊',
      'excellent': '😄'
    };
    return moods[moodValue] || '😐';
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="journey-card-glow">
        <div className="flex items-center justify-between p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gradient-primary">
              {selectedDate.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h2>
            {isToday && <span className="text-sm text-accent">Aujourd'hui</span>}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Score global */}
      <Card className="journey-card">
        <div className="p-6 text-center">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(totalScore)}`}>
            {Math.round(totalScore)}%
          </div>
          <p className="text-sm text-muted-foreground">Score global du jour</p>
          
          {/* Indicateur visuel du score */}
          <div className="mt-4 w-full bg-muted rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                totalScore >= 80 ? 'bg-success' :
                totalScore >= 60 ? 'bg-warning' :
                totalScore >= 40 ? 'bg-orange-500' : 'bg-destructive'
              }`}
              style={{ width: `${Math.max(totalScore, 5)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Catégories de notation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Évaluations</h3>
        
        {!isPremium && existingEntry && !isEditing ? (
          <PremiumTeaser 
            title="Modifier votre journée"
            description="Passez en Premium pour modifier vos évaluations après les avoir créées"
          />
        ) : (
          <div className="grid gap-4">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="journey-card">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className={`font-bold ${getScoreColor(scores[category.id])}`}>
                        {scores[category.id]}%
                      </span>
                    </div>
                    
                    {isEditing ? (
                      <Slider
                        value={[scores[category.id]]}
                        onValueChange={(value) => setScores(prev => ({
                          ...prev,
                          [category.id]: value[0]
                        }))}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    ) : (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                          style={{ width: `${Math.max(scores[category.id], 5)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Humeur */}
      <Card className="journey-card">
        <div className="p-4">
          <h4 className="font-medium mb-3">Humeur du jour</h4>
          {isEditing ? (
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: 'tres-mauvais', emoji: '😢', label: 'Très mauvais' },
                { value: 'mauvais', emoji: '😞', label: 'Mauvais' },
                { value: 'neutre', emoji: '😐', label: 'Neutre' },
                { value: 'bon', emoji: '😊', label: 'Bon' },
                { value: 'excellent', emoji: '😄', label: 'Excellent' },
              ].map((moodOption) => (
                <button
                  key={moodOption.value}
                  onClick={() => setMood(moodOption.value)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    mood === moodOption.value
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-muted/50 border-2 border-transparent hover:border-muted'
                  }`}
                >
                  <div className="text-2xl mb-1">{moodOption.emoji}</div>
                  <div className="text-xs">{moodOption.label}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">{getMoodEmoji(mood)}</div>
              <p className="text-sm text-muted-foreground capitalize">{mood.replace('-', ' ')}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Réflexion */}
      {isEditing && (
        <Card className="journey-card">
          <div className="p-4">
            <h4 className="font-medium mb-3">Réflexion du jour</h4>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Comment s'est passée votre journée ? Qu'avez-vous appris ?"
              className="min-h-[100px]"
            />
          </div>
        </Card>
      )}

      {/* Notes quotidiennes */}
      <DayNotesView selectedDate={selectedDate} />

      {/* Bouton de sauvegarde */}
      {isEditing && (
        <Card className="journey-card">
          <div className="p-4">
            <Button
              onClick={handleSave}
              className="w-full journey-button-primary"
            >
              <Save className="w-5 h-5 mr-2" />
              Sauvegarder la journée
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};