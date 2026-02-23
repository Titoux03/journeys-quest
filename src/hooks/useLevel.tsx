import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LevelData {
  level: number;
  xp: number;
  title: string;
  xpForNextLevel: number;
  progressPercentage: number;
}

interface LevelUpdateResult {
  new_level: number;
  new_xp: number;
  xp_gained: number;
  level_up: boolean;
  title: string;
}

export const useLevel = (userId: string | undefined) => {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Calculate XP needed for next level
  const calculateXpForLevel = (level: number): number => {
    return Math.floor(50 * Math.pow(level, 1.15));
  };

  // Load user level data
  const loadLevel = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const xpForNextLevel = calculateXpForLevel(data.level);
        const progressPercentage = (data.xp / xpForNextLevel) * 100;

        setLevelData({
          level: data.level,
          xp: data.xp,
          title: '', // Will be fetched from the function
          xpForNextLevel,
          progressPercentage
        });

        // Get title from function
        const { data: titleData } = await supabase.rpc('get_level_title', {
          user_level: data.level
        });

        if (titleData) {
          setLevelData(prev => prev ? { ...prev, title: titleData } : null);
        }
      }
    } catch (error) {
      console.error('Error loading level:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update level on activity
  const updateLevel = async (activityType: 'login' | 'journal' | 'meditation' | 'addiction' = 'login') => {
    if (!userId || isUpdating) return null;

    setIsUpdating(true);

    try {
      const { data, error } = await supabase.rpc('update_user_level', {
        user_id_param: userId,
        activity_type: activityType
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0] as LevelUpdateResult;
        const xpForNextLevel = calculateXpForLevel(result.new_level);
        const progressPercentage = (result.new_xp / xpForNextLevel) * 100;

        setLevelData({
          level: result.new_level,
          xp: result.new_xp,
          title: result.title,
          xpForNextLevel,
          progressPercentage
        });

        // Show level up notification
        if (result.level_up) {
          toast({
            title: `✨ Niveau ${result.new_level} atteint !`,
            description: `${result.title}\n+${result.xp_gained} XP`,
            duration: 5000,
          });
        }

        return result;
      }
    } catch (error) {
      console.error('Error updating level:', error);
      return null;
    } finally {
      setIsUpdating(false);
    }

    return null;
  };

  // Convenience functions
  const updateLevelOnLogin = () => updateLevel('login');
  const updateLevelOnJournal = () => updateLevel('journal');
  const updateLevelOnMeditation = () => updateLevel('meditation');
  const updateLevelOnAddiction = () => updateLevel('addiction');

  useEffect(() => {
    loadLevel();
  }, [userId]);

  return {
    levelData,
    loading,
    isUpdating,
    updateLevelOnLogin,
    updateLevelOnJournal,
    updateLevelOnMeditation,
    updateLevelOnAddiction,
    loadLevel
  };
};
