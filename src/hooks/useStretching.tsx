import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  completed: boolean;
}

interface StretchingSession {
  id: string;
  session_date: string;
  exercises_completed: string[] | null;
  total_exercises: number;
  completed_count: number;
  is_completed: boolean;
}

export const useStretching = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<StretchingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Étirement des trapèzes supérieurs',
      description: 'Inclinez la tête sur le côté en plaçant la main opposée derrière le dos. Réduit les tensions cervicales et améliore la mobilité du cou.',
      duration: '45 sec',
      completed: false
    },
    {
      id: '2',
      name: 'Ouverture thoracique',
      description: 'Bras tendus dans le dos, entrelacez les doigts et poussez vers le haut. Corrige la posture, ouvre la cage thoracique et libère les tensions des épaules.',
      duration: '1 min',
      completed: false
    },
    {
      id: '3',
      name: 'Flexion avant debout',
      description: 'Pieds écartés largeur d\'épaules, penchez-vous en avant en laissant pendre les bras. Étire toute la chaîne postérieure et décompresse la colonne vertébrale.',
      duration: '1 min',
      completed: false
    },
    {
      id: '4',
      name: 'Rotation du rachis',
      description: 'Assis jambes croisées, placez une main au sol derrière vous et tournez le buste. Améliore la mobilité vertébrale et masse les organes internes.',
      duration: '45 sec',
      completed: false
    },
    {
      id: '5',
      name: 'Étirement des ischio-jambiers',
      description: 'Debout, posez un talon sur un support bas et penchez-vous vers l\'avant. Prévient les blessures et améliore la flexibilité des jambes.',
      duration: '45 sec',
      completed: false
    },
    {
      id: '6',
      name: 'Étirement des fléchisseurs de hanche',
      description: 'En fente, poussez le bassin vers l\'avant. Compense la position assise prolongée et améliore la posture globale.',
      duration: '45 sec',
      completed: false
    }
  ];

  const loadTodaySession = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('stretching_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading stretching session:', error);
        return;
      }

      if (data) {
        setCurrentSession({
          ...data,
          exercises_completed: Array.isArray(data.exercises_completed) 
            ? data.exercises_completed as string[]
            : []
        });
      } else {
        // Create new session for today
        const { data: newSession, error: createError } = await supabase
          .from('stretching_sessions')
          .insert({
            user_id: user.id,
            session_date: today,
            exercises_completed: [],
            total_exercises: exercises.length,
            completed_count: 0,
            is_completed: false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating stretching session:', createError);
          return;
        }

        setCurrentSession({
          ...newSession,
          exercises_completed: Array.isArray(newSession.exercises_completed) 
            ? newSession.exercises_completed as string[]
            : []
        });
      }
    } catch (error) {
      console.error('Error in loadTodaySession:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExercise = async (exerciseId: string) => {
    if (!currentSession || !user) return;

    try {
      const currentCompleted = currentSession.exercises_completed || [];
      const isCompleted = currentCompleted.includes(exerciseId);
      
      let updatedCompleted: string[];
      if (isCompleted) {
        updatedCompleted = currentCompleted.filter(id => id !== exerciseId);
      } else {
        updatedCompleted = [...currentCompleted, exerciseId];
      }

      const completedCount = updatedCompleted.length;
      const isSessionCompleted = completedCount === exercises.length;

      const { data, error } = await supabase
        .from('stretching_sessions')
        .update({
          exercises_completed: updatedCompleted,
          completed_count: completedCount,
          is_completed: isSessionCompleted
        })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating stretching session:', error);
        toast.error('Erreur lors de la sauvegarde');
        return;
      }

      setCurrentSession({
        ...data,
        exercises_completed: Array.isArray(data.exercises_completed) 
          ? data.exercises_completed as string[]
          : []
      });

      if (isSessionCompleted && !currentSession.is_completed) {
        toast.success('Félicitations ! Routine de stretching terminée ! 🎉');
      }
    } catch (error) {
      console.error('Error in toggleExercise:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetSession = async () => {
    if (!currentSession || !user) return;

    try {
      const { data, error } = await supabase
        .from('stretching_sessions')
        .update({
          exercises_completed: [],
          completed_count: 0,
          is_completed: false
        })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) {
        console.error('Error resetting stretching session:', error);
        toast.error('Erreur lors de la réinitialisation');
        return;
      }

      setCurrentSession({
        ...data,
        exercises_completed: Array.isArray(data.exercises_completed) 
          ? data.exercises_completed as string[]
          : []
      });
      toast.success('Routine réinitialisée');
    } catch (error) {
      console.error('Error in resetSession:', error);
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  const getExercisesWithCompletion = (): Exercise[] => {
    if (!currentSession) return exercises;

    return exercises.map(exercise => ({
      ...exercise,
      completed: currentSession.exercises_completed?.includes(exercise.id) || false
    }));
  };

  useEffect(() => {
    if (user) {
      loadTodaySession();
    } else {
      setCurrentSession(null);
      setIsLoading(false);
    }
  }, [user]);

  return {
    exercises: getExercisesWithCompletion(),
    currentSession,
    isLoading,
    toggleExercise,
    resetSession,
    completedCount: currentSession?.completed_count || 0,
    totalCount: exercises.length,
    isCompleted: currentSession?.is_completed || false
  };
};