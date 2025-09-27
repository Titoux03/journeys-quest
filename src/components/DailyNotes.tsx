import React, { useState, useEffect } from 'react';
import { Send, BookOpen, Edit3, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { toast } from 'sonner';

interface DailyNotesProps {
  onNavigate: (screen: string) => void;
}

interface Note {
  date: string;
  content: string;
}

export const DailyNotes: React.FC<DailyNotesProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { saveJournalEntry, journalEntries, deleteJournalEntry } = useProgress();
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  
  // Extraire les notes libres (totalScore = 0) des entrées
  const dailyNotes = journalEntries
    .filter(entry => entry.total_score === 0)
    .map(entry => ({
      date: entry.date,
      content: entry.reflection || ''
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Charger la note du jour si elle existe
  useEffect(() => {
    const todayNote = dailyNotes.find(note => note.date === today);
    if (todayNote && !editingDate) {
      setNoteContent(todayNote.content);
    }
  }, [dailyNotes, today, editingDate]);

  const handleSave = async () => {
    if (!noteContent.trim()) {
      toast.error('Veuillez écrire quelque chose avant de sauvegarder');
      return;
    }

    setSaving(true);
    
    try {
      const targetDate = editingDate || today;
      const result = await saveJournalEntry(
        {}, // Scores vides pour les notes libres
        0,  // Score total à 0 pour les notes libres
        'medium', // Mood neutre par défaut
        noteContent.trim()
      );

      if (result?.success) {
        toast.success(editingDate ? 'Note modifiée !' : 'Note sauvegardée !');
        setEditingDate(null);
        if (!editingDate) {
          setNoteContent('');
        }
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingDate(note.date);
    setNoteContent(note.content);
  };

  const handleDelete = async (date: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      const result = await deleteJournalEntry(date);
      if (result?.success) {
        toast.success('Note supprimée');
        if (editingDate === date) {
          setEditingDate(null);
          setNoteContent('');
        }
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleCancel = () => {
    setEditingDate(null);
    const todayNote = dailyNotes.find(note => note.date === today);
    setNoteContent(todayNote?.content || '');
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6 pb-24">
        <div className="max-w-2xl mx-auto text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connectez-vous pour accéder à vos notes</h2>
          <p className="text-muted-foreground mb-6">
            Créez un compte pour sauvegarder et synchroniser vos notes personnelles
          </p>
          <Button onClick={() => onNavigate('home')} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="mb-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour
          </button>
          <div className="text-center">
            <div className="inline-block mb-4">
              <BookOpen className="w-12 h-12 text-primary mx-auto" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-2">
              {editingDate ? 'Modifier votre note' : 'Vos notes du jour'}
            </h1>
            <p className="text-muted-foreground">
              {editingDate 
                ? `Note du ${new Date(editingDate).toLocaleDateString('fr-FR')}`
                : 'Écrivez vos pensées et réflexions personnelles'
              }
            </p>
          </div>
        </div>

        {/* Zone d'écriture */}
        <div className="journey-card mb-6 animate-scale-in">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Edit3 className="w-5 h-5 text-primary" />
              <h3 className="font-medium">
                {editingDate ? 'Modifier votre note' : 'Nouvelle note'}
              </h3>
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Écrivez vos pensées, vos émotions, vos découvertes du jour... C'est votre espace personnel."
              className="w-full h-64 p-4 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ fontSize: '16px', lineHeight: '1.6' }}
            />
            <div className="text-xs text-muted-foreground mt-2">
              {noteContent.length} caractères
            </div>
          </div>

          <div className="flex gap-3">
            {editingDate && (
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            )}
            <button
              onClick={handleSave}
              disabled={!noteContent.trim() || saving}
              className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                noteContent.trim() && !saving
                  ? 'journey-button-primary' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed rounded-xl'
              }`}
            >
              <Send className="w-5 h-5" />
              {saving ? 'Sauvegarde...' : (editingDate ? 'Modifier' : 'Sauvegarder')}
            </button>
          </div>
        </div>

        {/* Historique des notes */}
        {dailyNotes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Mes notes précédentes ({dailyNotes.length})
            </h2>
            
            <div className="space-y-3">
              {dailyNotes.map((note) => (
                <div key={note.date} className="journey-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-medium text-primary">
                          {new Date(note.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                        {note.date === today && (
                          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            Aujourd'hui
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 break-words">
                        {note.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(note)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(note.date)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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

        {/* Message si aucune note */}
        {dailyNotes.length === 0 && !noteContent && (
          <div className="journey-card text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Commencez votre journal</h3>
            <p className="text-muted-foreground">
              Écrivez votre première note pour commencer votre journal personnel
            </p>
          </div>
        )}
      </div>
    </div>
  );
};