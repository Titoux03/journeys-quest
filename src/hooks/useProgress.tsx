import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './useAuth';

interface JournalEntry {
  id: string;
  date: string;
  scores: Record<string, number>;
  total_score: number;
  mood: 'low' | 'medium' | 'high';
  reflection?: string;
}

interface MeditationSession {
  id: string;
  mode: 'meditation' | 'deepwork';
  duration: number;
  completed_at: string;
}

interface AbstinenceData {
  id: string;
  start_date: string;
  current_streak: number;
  is_active: boolean;
}

export const useProgress = () => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [meditationSessions, setMeditationSessions] = useState<MeditationSession[]>([]);
  const [abstinenceData, setAbstinenceData] = useState<AbstinenceData | null>(null);
  const [loading, setLoading] = useState(false);

  // Sauvegarder une entrée de journal
  const saveJournalEntry = async (
    scores: Record<string, number>,
    totalScore: number,
    mood: 'low' | 'medium' | 'high',
    reflection?: string
  ) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .upsert({
          user_id: user.id,
          date: today,
          scores,
          total_score: totalScore,
          mood,
          reflection
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Mettre à jour l'état local
      setJournalEntries(prev => {
        const filtered = prev.filter(entry => entry.date !== today);
        const newEntry: JournalEntry = {
          ...data,
          scores: data.scores as Record<string, number>,
          mood: data.mood as 'low' | 'medium' | 'high'
        };
        return [newEntry, ...filtered].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      return { success: true };
    } catch (error) {
      console.error('Error saving journal entry:', error);
      return { success: false, error };
    }
  };

  // Nouvelle fonction pour supprimer une entrée
  const deleteJournalEntry = async (date: string) => {
    if (!user) return { success: false };
    
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .match({ user_id: user.id, date });

      if (error) throw error;

      // Mettre à jour l'état local
      setJournalEntries(prev => prev.filter(entry => entry.date !== date));
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return { success: false, error };
    }
  };

  // Sauvegarder une session de méditation
  const saveMeditationSession = async (mode: 'meditation' | 'deepwork', duration: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .insert({
          user_id: user.id,
          mode,
          duration
        })
        .select()
        .single();

      if (error) throw error;
      
      // Mettre à jour l'état local
      setMeditationSessions(prev => {
        const newSession: MeditationSession = {
          ...data,
          mode: data.mode as 'meditation' | 'deepwork'
        };
        return [newSession, ...prev];
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error saving meditation session:', error);
      return { success: false, error };
    }
  };

  // Sauvegarder/mettre à jour le suivi d'abstinence
  const saveAbstinenceData = async (startDate: string, currentStreak: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('abstinence_tracking')
        .upsert({
          user_id: user.id,
          start_date: startDate,
          current_streak: currentStreak,
          is_active: true
        }, {
          onConflict: 'user_id'  // Assuming we want one active record per user
        })
        .select()
        .single();

      if (error) throw error;
      
      setAbstinenceData(data);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving abstinence data:', error);
      return { success: false, error };
    }
  };

  // Réinitialiser le suivi d'abstinence
  const resetAbstinenceData = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('abstinence_tracking')
        .upsert({
          user_id: user.id,
          start_date: today,
          current_streak: 0,
          is_active: true
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      
      setAbstinenceData(data);
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting abstinence data:', error);
      return { success: false, error };
    }
  };

  // Charger toutes les données de progression
  const loadProgressData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Charger les entrées de journal
      const { data: journalData, error: journalError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (journalError) throw journalError;
      const mappedJournalData: JournalEntry[] = (journalData || []).map(entry => ({
        ...entry,
        scores: entry.scores as Record<string, number>,
        mood: entry.mood as 'low' | 'medium' | 'high'
      }));
      setJournalEntries(mappedJournalData);

      // Charger les sessions de méditation
      const { data: meditationData, error: meditationError } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (meditationError) throw meditationError;
      const mappedMeditationData: MeditationSession[] = (meditationData || []).map(session => ({
        ...session,
        mode: session.mode as 'meditation' | 'deepwork'
      }));
      setMeditationSessions(mappedMeditationData);

      // Charger les données d'abstinence
      const { data: abstinenceDataResult, error: abstinenceError } = await supabase
        .from('abstinence_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (abstinenceError) throw abstinenceError;
      setAbstinenceData(abstinenceDataResult);

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadProgressData();
    } else {
      setJournalEntries([]);
      setMeditationSessions([]);
      setAbstinenceData(null);
    }
  }, [user]);

  return {
    journalEntries,
    meditationSessions,
    abstinenceData,
    loading,
    saveJournalEntry,
    deleteJournalEntry,
    saveMeditationSession,
    saveAbstinenceData,
    resetAbstinenceData,
    loadProgressData
  };
};