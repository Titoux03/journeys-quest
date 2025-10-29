import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface StreakData {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_login_date: string;
  last_activity_date: string | null;
  last_activity_type: string | null;
  streak_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface StreakUpdateResult {
  current_streak: number;
  longest_streak: number;
  streak_start_date: string;
  is_new_streak: boolean;
}

export const useStreak = (userId: string | undefined) => {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Charger le streak initial
  const loadStreak = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('login_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setStreak(data);
    } catch (error) {
      console.error('Error loading streak:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mettre à jour le streak (appelé lors d'une activité)
  const updateStreak = useCallback(async (activityType: 'login' | 'journal' = 'login') => {
    if (!userId || isUpdating) return null;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.rpc('update_user_streak_on_activity', {
        user_id_param: userId,
        activity_type: activityType
      });

      if (error) throw error;

      const result = data?.[0] as StreakUpdateResult;
      
      if (result) {
        // Recharger les données complètes du streak
        await loadStreak();

        // Afficher une notification si le streak a été incrémenté
        if (result.is_new_streak && result.current_streak > 1) {
          toast({
            title: `🔥 ${t('streak.streakIncremented')} !`,
            description: `${result.current_streak} ${result.current_streak === 1 ? t('streak.consecutiveDay') : t('streak.consecutiveDays')}`,
            duration: 4000,
          });
        } else if (result.is_new_streak && result.current_streak === 1) {
          // Premier jour ou streak réinitialisé
          toast({
            title: `✨ ${t('streak.newStreakStarted')}`,
            description: t('streak.keepItUp'),
            duration: 3000,
          });
        }

        return result;
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      toast({
        title: t('common.error'),
        description: t('streak.updateError'),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }

    return null;
  }, [userId, isUpdating, loadStreak, toast, t]);

  // Vérifier et mettre à jour le streak au login
  const updateStreakOnLogin = useCallback(async () => {
    return await updateStreak('login');
  }, [updateStreak]);

  // Vérifier et mettre à jour le streak lors d'une entrée journal
  const updateStreakOnJournal = useCallback(async () => {
    return await updateStreak('journal');
  }, [updateStreak]);

  // Calculer les statistiques du streak
  const getStreakStats = useCallback(() => {
    if (!streak) return null;

    const daysSinceStart = streak.last_activity_date
      ? Math.floor(
          (new Date().getTime() - new Date(streak.last_activity_date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const isAtRisk = daysSinceStart >= 1; // Plus de 24h sans activité

    return {
      current: streak.current_streak,
      longest: streak.longest_streak,
      startDate: new Date(streak.streak_start_date),
      lastActivity: streak.last_activity_date ? new Date(streak.last_activity_date) : null,
      lastActivityType: streak.last_activity_type,
      daysSinceStart,
      isAtRisk,
    };
  }, [streak]);

  // Charger au montage
  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  return {
    streak,
    loading,
    isUpdating,
    updateStreakOnLogin,
    updateStreakOnJournal,
    loadStreak,
    getStreakStats,
  };
};
