import React, { useState } from 'react';
import { TrendingUp, Calendar, Award, Target, Edit3, Trash2, FileText } from 'lucide-react';
import { PremiumLock } from '@/components/PremiumLock';
import { SkillsRadarChart } from '@/components/SkillsRadarChart';
import { EditJournalEntry } from '@/components/EditJournalEntry';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { toast } from 'sonner';

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

interface FreeNotesProps {
  freeNotes: JournalEntry[];
  onNavigate: (screen: 'home' | 'journal' | 'reflection' | 'progress') => void;
  onUpdateEntry?: (updatedEntry: JournalEntry) => void;
}

// Composant pour afficher uniquement les notes libres (utilisateurs non-premium)
const FreeNotesContent: React.FC<FreeNotesProps> = ({ freeNotes, onNavigate, onUpdateEntry }) => {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const { deleteJournalEntry } = useProgress();

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
  };

  const handleSaveEntry = (updatedEntry: JournalEntry) => {
    if (onUpdateEntry) {
      onUpdateEntry(updatedEntry);
    }
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (entry: JournalEntry) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      const result = await deleteJournalEntry(entry.date);
      if (result?.success) {
        toast.success('Note supprimée');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
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
          Vos Notes du Jour
        </h1>
        <p className="text-muted-foreground">
          Consultez et gérez vos notes quotidiennes
        </p>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {freeNotes.length === 0 ? (
          <div className="journey-card text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Aucune note disponible
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez à écrire vos notes quotidiennes
            </p>
            <Button onClick={() => onNavigate('reflection')} variant="outline">
              Écrire une note
            </Button>
          </div>
        ) : (
          freeNotes
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(entry => (
              <div key={entry.date} className="journey-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="font-medium text-foreground">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </div>
                    </div>
                    {entry.reflection && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {entry.reflection}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEntry(entry)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
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

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ entries, onNavigate, onUpdateEntry }) => {
  const { isPremium } = usePremium();
  const { user } = useAuth();
  
  // Séparer les notes libres (score total = 0) des entrées normales
  const freeNotes = entries.filter(entry => entry.totalScore === 0);
  const journalEntries = entries.filter(entry => entry.totalScore > 0);
  
  // Les notes libres sont toujours accessibles aux utilisateurs connectés
  if (!isPremium && user && freeNotes.length > 0) {
    return <FreeNotesContent 
      freeNotes={freeNotes} 
      onNavigate={onNavigate} 
      onUpdateEntry={onUpdateEntry} 
    />;
  }
  
  // Mode complet premium ou utilisateur non connecté
  return (
    <PremiumLock feature="Historique et statistiques avancées" className="min-h-screen">
      <ProgressScreenContent 
        entries={entries} 
        onNavigate={onNavigate} 
        onUpdateEntry={onUpdateEntry} 
      />
    </PremiumLock>
  );
};

const ProgressScreenContent: React.FC<ProgressScreenProps> = ({ entries, onNavigate, onUpdateEntry }) => {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const { deleteJournalEntry } = useProgress();
  
  const getScoreClass = (score: number) => {
    if (score >= 7) return 'score-high';
    if (score >= 4) return 'score-medium';
    return 'score-low';
  };

  const getAverageScore = () => {
    const journalEntries = entries.filter(entry => entry.totalScore > 0);
    if (journalEntries.length === 0) return 0;
    return journalEntries.reduce((acc, entry) => acc + entry.totalScore, 0) / journalEntries.length;
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

  const handleDeleteEntry = async (entry: JournalEntry) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      const result = await deleteJournalEntry(entry.date);
      if (result?.success) {
        toast.success('Entrée supprimée');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const getStreakCount = () => {
    let streak = 0;
    const journalEntries = entries.filter(entry => entry.totalScore > 0);
    const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const entry of sortedEntries) {
      if (entry.totalScore >= 7) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Séparer les entrées journal et les notes libres
  const journalEntries = entries.filter(entry => entry.totalScore > 0);
  const freeNotes = entries.filter(entry => entry.totalScore === 0);

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
            {journalEntries.length}
          </div>
          <div className="text-sm text-muted-foreground">
            Jours d'évaluation
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

      {/* Compteur de notes libres si présentes */}
      {freeNotes.length > 0 && (
        <div className="journey-card mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="p-3 rounded-full bg-secondary/10 text-secondary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {freeNotes.length} note{freeNotes.length > 1 ? 's' : ''} libre{freeNotes.length > 1 ? 's' : ''}
              </div>
              <div className="text-sm text-muted-foreground">
                Vos réflexions quotidiennes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagramme des compétences - seulement pour les entrées journal */}
      {journalEntries.length > 0 && (
        <div className="journey-card-premium mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            ✨ Votre Profil de Développement Personnel
          </h3>
          <SkillsRadarChart entries={journalEntries} />
        </div>
      )}

      {/* Recent Entries */}
      <div className="space-y-6">
        {/* Entrées de journal */}
        {journalEntries.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Historique des évaluations
            </h3>
            <div className="space-y-4">
              {journalEntries
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Notes libres */}
        {freeNotes.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Notes du jour
            </h3>
            <div className="space-y-4">
              {freeNotes
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(entry => (
                  <div key={entry.date} className="journey-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <div className="font-medium text-foreground">
                            {new Date(entry.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </div>
                        </div>
                        {entry.reflection && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {entry.reflection}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEntry(entry)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Message si aucune donnée */}
        {journalEntries.length === 0 && freeNotes.length === 0 && (
          <div className="journey-card text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Aucune donnée disponible
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez votre journal ou écrivez vos premières notes
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => onNavigate('journal')} variant="outline">
                Journal d'évaluation
              </Button>
              <Button onClick={() => onNavigate('reflection')} variant="outline">
                Écrire une note
              </Button>
            </div>
          </div>
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