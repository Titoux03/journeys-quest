import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Save } from 'lucide-react';

interface JournalEntry {
  id?: string;
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  reflection?: string;
  mood: 'low' | 'medium' | 'high';
}

interface EditJournalEntryProps {
  entry: JournalEntry;
  onSave: (updatedEntry: JournalEntry) => void;
  onCancel: () => void;
}

const commonCategories = [
  'sport',
  'meditation',
  'wellbeing',
  'social',
  'learning',
  'work',
  'creativity',
  'family',
  'love'
];

export const EditJournalEntry: React.FC<EditJournalEntryProps> = ({ entry, onSave, onCancel }) => {
  const [scores, setScores] = useState(entry.scores);
  const [reflection, setReflection] = useState(entry.reflection || '');
  const [mood, setMood] = useState(entry.mood);

  const handleScoreChange = (category: string, value: string) => {
    const numValue = Math.max(0, Math.min(10, parseInt(value) || 0));
    setScores(prev => ({ ...prev, [category]: numValue }));
  };

  const calculateTotalScore = () => {
    const values = Object.values(scores);
    return values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
  };

  const handleSave = () => {
    const updatedEntry: JournalEntry = {
      ...entry,
      scores,
      totalScore: calculateTotalScore(),
      reflection,
      mood
    };
    onSave(updatedEntry);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Modifier l'entrée du {new Date(entry.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Scores */}
        <div>
          <h3 className="text-sm font-medium mb-3">Scores par catégorie</h3>
          <div className="grid grid-cols-2 gap-4">
            {commonCategories.map(category => (
              <div key={category} className="space-y-2">
                <Label htmlFor={category} className="text-sm capitalize">
                  {category}
                </Label>
                <Input
                  id={category}
                  type="number"
                  min="0"
                  max="10"
                  value={scores[category] || ''}
                  onChange={(e) => handleScoreChange(category, e.target.value)}
                  className="text-center"
                />
              </div>
            ))}
          </div>
          
          {/* Catégories personnalisées */}
          {Object.keys(scores).filter(key => !commonCategories.includes(key)).map(category => (
            <div key={category} className="space-y-2 mt-4">
              <Label className="text-sm capitalize">{category}</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={scores[category]}
                onChange={(e) => handleScoreChange(category, e.target.value)}
                className="text-center"
              />
            </div>
          ))}
        </div>

        {/* Humeur */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Humeur</Label>
          <div className="flex space-x-2">
            {[
              { value: 'low', label: '😔 Difficile', color: 'text-red-500' },
              { value: 'medium', label: '😐 Neutre', color: 'text-yellow-500' },
              { value: 'high', label: '😊 Positive', color: 'text-green-500' }
            ].map(({ value, label, color }) => (
              <Button
                key={value}
                variant={mood === value ? "default" : "outline"}
                size="sm"
                onClick={() => setMood(value as any)}
                className={mood === value ? '' : color}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Réflexion */}
        <div>
          <Label htmlFor="reflection" className="text-sm font-medium mb-3 block">
            Réflexion du jour
          </Label>
          <Textarea
            id="reflection"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Comment s'est passée votre journée ?"
            rows={4}
          />
        </div>

        {/* Score total */}
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <div className="text-2xl font-bold text-primary mb-1">
            {calculateTotalScore()}
          </div>
          <div className="text-sm text-muted-foreground">
            Score total
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Annuler
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};