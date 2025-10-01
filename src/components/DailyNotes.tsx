import React, { useState } from 'react';
import { Send, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDailyNotes, DailyNote } from '@/hooks/useDailyNotes';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface DailyNotesProps {
  onNavigate: (screen: string) => void;
}

export const DailyNotes: React.FC<DailyNotesProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notes, loading, saveNote, updateNote, deleteNote } = useDailyNotes();
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNote | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSave = async () => {
    if (!noteContent.trim()) {
      toast.error('Veuillez écrire quelque chose avant de sauvegarder');
      return;
    }

    setSaving(true);
    
    try {
      const result = await saveNote(noteContent.trim());

      if (result?.success) {
        toast.success('Note sauvegardée !');
        setNoteContent('');
      } else {
        toast.error(result?.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: DailyNote) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const handleUpdate = async () => {
    if (!editingNote || !editContent.trim()) {
      toast.error('Veuillez écrire quelque chose avant de sauvegarder');
      return;
    }

    setSaving(true);
    
    try {
      const result = await updateNote(editingNote.id, editContent.trim());

      if (result?.success) {
        toast.success('Note modifiée !');
        setEditingNote(null);
        setEditContent('');
      } else {
        toast.error(result?.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note: DailyNote) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      const result = await deleteNote(note.id);
      if (result?.success) {
        toast.success('Note supprimée');
        if (editingNote?.id === note.id) {
          setEditingNote(null);
          setEditContent('');
        }
      } else {
        toast.error(result?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const handleCancel = () => {
    setEditingNote(null);
    setEditContent('');
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

  if (loading) {
    return (
      <div className="min-h-screen p-6 pb-24">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-muted-foreground">Chargement de vos notes...</p>
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
              {editingNote ? 'Modifier votre note' : 'Vos notes quotidiennes'}
            </h1>
            <p className="text-muted-foreground">
              {editingNote 
                ? 'Modifiez votre note personnelle'
                : 'Écrivez autant de notes que vous voulez, elles restent toutes sauvegardées'
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
                {editingNote ? 'Modifier votre note' : 'Nouvelle note'}
              </h3>
            </div>
            <textarea
              value={editingNote ? editContent : noteContent}
              onChange={(e) => editingNote ? setEditContent(e.target.value) : setNoteContent(e.target.value)}
              placeholder="Écrivez vos pensées, vos émotions, vos découvertes... Chaque note est sauvegardée séparément."
              className="w-full h-64 p-4 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ fontSize: '16px', lineHeight: '1.6' }}
            />
            <div className="text-xs text-muted-foreground mt-2">
              {editingNote ? editContent.length : noteContent.length} caractères
            </div>
          </div>

          <div className="flex gap-3">
            {editingNote && (
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Annuler
              </Button>
            )}
            <button
              onClick={editingNote ? handleUpdate : handleSave}
              disabled={editingNote ? !editContent.trim() || saving : !noteContent.trim() || saving}
              className={`flex-1 py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                (editingNote ? editContent.trim() : noteContent.trim()) && !saving
                  ? 'journey-button-primary' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed rounded-xl'
              }`}
            >
              <Send className="w-5 h-5" />
              {saving ? 'Sauvegarde...' : (editingNote ? 'Modifier' : 'Sauvegarder')}
            </button>
          </div>
        </div>

        {/* Historique des notes */}
        {notes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Toutes vos notes ({notes.length})
            </h2>
            
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="journey-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {note.updated_at !== note.created_at && (
                          <span className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full">
                            Modifiée
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
                        onClick={() => handleDelete(note)}
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
        {notes.length === 0 && !editingNote && (
          <div className="journey-card text-center py-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Commencez votre journal</h3>
            <p className="text-muted-foreground">
              Écrivez votre première note pour commencer votre journal personnel.<br />
              Vous pourrez créer autant de notes que vous voulez !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};