import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DailyNote {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useDailyNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('daily_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notes:', error);
        toast.error('Erreur lors du chargement des notes');
        return;
      }

      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (content: string) => {
    if (!user || !content.trim()) {
      return { success: false, error: 'Contenu requis' };
    }

    try {
      const { data, error } = await supabase
        .from('daily_notes')
        .insert({
          user_id: user.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving note:', error);
        return { success: false, error: error.message };
      }

      // Ajouter la nouvelle note au début de la liste
      setNotes(prev => [data, ...prev]);
      return { success: true, data };
    } catch (error) {
      console.error('Error saving note:', error);
      return { success: false, error: 'Erreur lors de la sauvegarde' };
    }
  };

  const updateNote = async (id: string, content: string) => {
    if (!user || !content.trim()) {
      return { success: false, error: 'Contenu requis' };
    }

    try {
      const { data, error } = await supabase
        .from('daily_notes')
        .update({ content: content.trim() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating note:', error);
        return { success: false, error: error.message };
      }

      // Mettre à jour la note dans la liste
      setNotes(prev => 
        prev.map(note => 
          note.id === id ? data : note
        )
      );
      return { success: true, data };
    } catch (error) {
      console.error('Error updating note:', error);
      return { success: false, error: 'Erreur lors de la modification' };
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      const { error } = await supabase
        .from('daily_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting note:', error);
        return { success: false, error: error.message };
      }

      // Retirer la note de la liste
      setNotes(prev => prev.filter(note => note.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  return {
    notes,
    loading,
    saveNote,
    updateNote,
    deleteNote,
    loadNotes
  };
};