import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_value: number;
}

export const useStreakBadges = (userId: string | undefined, currentStreak: number) => {
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || currentStreak <= 0) return;

    const checkForNewBadges = async () => {
      try {
        // Check if user just earned a badge
        const { data: earnedBadges } = await supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', userId);

        const earnedBadgeIds = earnedBadges?.map(b => b.badge_id) || [];

        // Get all streak badges the user should have
        const { data: eligibleBadges } = await supabase
          .from('badges')
          .select('*')
          .eq('requirement_type', 'login_streak')
          .lte('requirement_value', currentStreak);

        if (!eligibleBadges) return;

        // Find badges that are eligible but not yet earned
        const newlyEligible = eligibleBadges.filter(
          badge => !earnedBadgeIds.includes(badge.id)
        );

        if (newlyEligible.length > 0) {
          // Award the badges
          for (const badge of newlyEligible) {
            await supabase
              .from('user_badges')
              .insert({ user_id: userId, badge_id: badge.id });

            setNewBadges(prev => [...prev, badge]);

            // Show celebration toast
            toast({
              title: `🎉 New Badge Unlocked!`,
              description: `${badge.icon} ${badge.name}: ${badge.description}`,
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('Error checking badges:', error);
      }
    };

    checkForNewBadges();
  }, [userId, currentStreak, toast]);

  return { newBadges };
};
