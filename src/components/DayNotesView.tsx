import React, { useState } from 'react';
import { Send, BookOpen, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { useDailyNotes, DailyNote } from '@/hooks/useDailyNotes';
import { toast } from '@/hooks/use-toast';

interface DayNotesViewProps {
  selectedDate: Date;
}

export const DayNotesView: React.FC<DayNotesViewProps> = ({ selectedDate }) => {
  const { notes, loading, saveNote, updateNote, deleteNote } = useDailyNotes();
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingNote, setEditingNote] = useState<DailyNote | null>(null);
  const [editContent, setEditContent] = useState('');

  // Filtrer les notes pour la date sélectionnée
  const dateString = selectedDate.toISOString().split('T')[0];
  const dayNotes = notes.filter(note => 
    note.created_at.startsWith(dateString)
  );

  const handleSave = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire quelque chose avant de sauvegarder",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      const result = await saveNote(noteContent.trim());

      if (result?.success) {
        toast({
          title: "Succès",
          description: "Note sauvegardée !",
        });
        setNoteContent('');
      } else {
        toast({
          title: "Erreur",
          description: result?.error || "Erreur lors de la sauvegarde",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive"
      });
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
      toast({
        title: "Erreur",
        description: "Veuillez écrire quelque chose avant de sauvegarder",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      const result = await updateNote(editingNote.id, editContent.trim());

      if (result?.success) {
        toast({
          title: "Succès",
          description: "Note modifiée !",
        });
        setEditingNote(null);
        setEditContent('');
      } else {
        toast({
          title: "Erreur",
          description: result?.error || "Erreur lors de la modification",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note: DailyNote) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      const result = await deleteNote(note.id);
      if (result?.success) {
        toast({
          title: "Succès",
          description: "Note supprimée",
        });
        if (editingNote?.id === note.id) {
          setEditingNote(null);
          setEditContent('');
        }
      } else {
        toast({
          title: "Erreur",
          description: result?.error || "Erreur lors de la suppression",
          variant: "destructive"
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingNote(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <Card className="journey-card">
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Chargement des notes...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="journey-card">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">
              Notes du {selectedDate.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
          </div>

          {/* Zone d'écriture */}
          <div className="space-y-4">
            <Textarea
              value={editingNote ? editContent : noteContent}
              onChange={(e) => editingNote ? setEditContent(e.target.value) : setNoteContent(e.target.value)}
              placeholder="Écrivez vos pensées, émotions, découvertes..."
              className="min-h-[120px] resize-none"
            />
            
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
              <Button
                onClick={editingNote ? handleUpdate : handleSave}
                disabled={editingNote ? !editContent.trim() || saving : !noteContent.trim() || saving}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {saving ? 'Sauvegarde...' : (editingNote ? 'Modifier' : 'Sauvegarder')}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes existantes pour cette date */}
      {dayNotes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            {dayNotes.length} note{dayNotes.length > 1 ? 's' : ''} ce jour
          </h4>
          
          {dayNotes.map((note) => (
            <Card key={note.id} className="journey-card">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(note.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {note.updated_at !== note.created_at && (
                        <span className="ml-2 px-2 py-1 text-xs bg-accent/10 text-accent rounded-full">
                          Modifiée
                        </span>
                      )}
                    </div>
                    <p className="text-sm break-words">
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
            </Card>
          ))}
        </div>
      )}

      {/* Message si aucune note */}
      {dayNotes.length === 0 && !editingNote && (
        <Card className="journey-card">
          <div className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-medium mb-2">Aucune note pour ce jour</h4>
            <p className="text-sm text-muted-foreground">
              Commencez à écrire vos pensées et émotions
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};