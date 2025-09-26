import React, { useState } from 'react';
import { TrendingUp, Calendar, Award, Target, Edit3 } from 'lucide-react';
import { PremiumLock } from '@/components/PremiumLock';
import { SkillsRadarChart } from '@/components/SkillsRadarChart';
import { EditJournalEntry } from '@/components/EditJournalEntry';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  onUpdateEntry?: (updatedEntry: JournalEntry) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ entries, onNavigate, onUpdateEntry }) => {
  return (
    <PremiumLock feature="Historique et statistiques avancées" className="min-h-screen">
      <ProgressScreenContent entries={entries} onNavigate={onNavigate} onUpdateEntry={onUpdateEntry} />
    </PremiumLock>
  );
};

const ProgressScreenContent: React.FC<ProgressScreenProps> = ({ entries, onNavigate, onUpdateEntry }) => {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const getScoreClass = (score: number) => {
    if (score >= 7) return 'score-high';
    if (score >= 4) return 'score-medium';
    return 'score-low';
  };

  const getAverageScore = () => {
    if (entries.length === 0) return 0;
    return entries.reduce((acc, entry) => acc + entry.totalScore, 0) / entries.length;
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
  };

  const handleSaveEntry = (updatedEntry: JournalEntry) => {
    if (onUpdateEntry) {
      onUpdateEntry(updatedEntry);
    }
    setEditingEntry(null);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const getStreakCount = () => {
    let streak = 0;
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const entry of sortedEntries) {
      if (entry.totalScore >= 7) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="min-h-screen p-6 pb-24 bg-background">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="mb-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-gradient-primary mb-2">
          Votre Progression
        </h1>
        <p className="text-muted-foreground">
          Analysez votre parcours de bien-être
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="journey-card text-center">
          <div className="p-4 rounded-full bg-primary/10 text-primary w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="text-2xl font-bold text-gradient-primary mb-1">
            {entries.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Jours complétés
          </div>
        </div>

        <div className="journey-card text-center">
          <div className="p-4 rounded-full bg-accent/10 text-accent w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="text-2xl font-bold text-gradient-accent mb-1">
            {getAverageScore().toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">
            Score moyen
          </div>
        </div>
      </div>

      {/* Diagramme des compétences */}
      <div className="journey-card-premium mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
          ✨ Votre Profil de Développement Personnel
        </h3>
        <SkillsRadarChart entries={entries} />
      </div>

      {/* Recent Entries */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Historique récent
        </h3>
        
        {entries.length === 0 ? (
          <div className="journey-card text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Aucune donnée disponible
            </h3>
            <p className="text-sm text-muted-foreground">
              Commencez votre journal pour voir vos progrès
            </p>
          </div>
        ) : (
          entries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map(entry => (
              <div key={entry.date} className="journey-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {new Date(entry.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                    {entry.reflection && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                        {entry.reflection}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`score-indicator ${getScoreClass(entry.totalScore)} !w-12 !h-12 !text-sm`}>
                      {entry.totalScore > 10 ? Math.round(entry.totalScore) : entry.totalScore}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEntry(entry)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Modal d'édition */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
          {editingEntry && (
            <EditJournalEntry
              entry={editingEntry}
              onSave={handleSaveEntry}
              onCancel={handleCancelEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};