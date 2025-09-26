import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './useAuth';

export interface AddictionType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface UserAddiction {
  id: string;
  addiction_type_id: string;
  start_date: string;
  current_streak: number;
  longest_streak: number;
  total_relapses: number;
  is_active: boolean;
  last_relapse_date?: string;
  addiction_type?: AddictionType;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  addiction_type_id?: string;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export interface LoginStreak {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_login_date: string;
  streak_start_date: string;
}

export const useAddictions = () => {
  const { user } = useAuth();
  const [addictionTypes, setAddictionTypes] = useState<AddictionType[]>([]);
  const [userAddictions, setUserAddictions] = useState<UserAddiction[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loginStreak, setLoginStreak] = useState<LoginStreak | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les types d'addictions
  const loadAddictionTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('addiction_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setAddictionTypes(data || []);
    } catch (error) {
      console.error('Error loading addiction types:', error);
    }
  };

  // Charger les addictions de l'utilisateur
  const loadUserAddictions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_addictions')
        .select(`
          *,
          addiction_type:addiction_types(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      const processedData = (data || []).map(addiction => ({
        ...addiction,
        addiction_type: addiction.addiction_type as AddictionType
      }));
      
      setUserAddictions(processedData);
    } catch (error) {
      console.error('Error loading user addictions:', error);
    }
  };

  // Charger les badges
  const loadBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_value');

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  // Charger les badges de l'utilisateur
  const loadUserBadges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      
      const processedData = (data || []).map(userBadge => ({
        ...userBadge,
        badge: userBadge.badge as Badge
      }));
      
      setUserBadges(processedData);
    } catch (error) {
      console.error('Error loading user badges:', error);
    }
  };

  // Charger le streak de connexion
  const loadLoginStreak = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('login_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      setLoginStreak(data);
    } catch (error) {
      console.error('Error loading login streak:', error);
    }
  };

  // Démarrer le suivi d'une addiction
  const startAddictionTracking = async (addictionTypeId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_addictions')
        .insert({
          user_id: user.id,
          addiction_type_id: addictionTypeId,
          start_date: today,
          current_streak: 0,
          longest_streak: 0,
          is_active: true
        })
        .select(`
          *,
          addiction_type:addiction_types(*)
        `)
        .single();

      if (error) throw error;

      const newAddiction = {
        ...data,
        addiction_type: data.addiction_type as AddictionType
      };

      setUserAddictions(prev => [...prev, newAddiction]);
      return { success: true };
    } catch (error) {
      console.error('Error starting addiction tracking:', error);
      return { success: false, error };
    }
  };

  // Marquer un relapse
  const markRelapse = async (addictionId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const today = new Date().toISOString().split('T')[0];
      const addiction = userAddictions.find(a => a.id === addictionId);
      if (!addiction) return { success: false, error: 'Addiction not found' };

      const newLongestStreak = Math.max(addiction.longest_streak, addiction.current_streak);

      const { error } = await supabase
        .from('user_addictions')
        .update({
          current_streak: 0,
          longest_streak: newLongestStreak,
          total_relapses: addiction.total_relapses + 1,
          last_relapse_date: today,
          start_date: today
        })
        .eq('id', addictionId);

      if (error) throw error;

      setUserAddictions(prev => prev.map(a => 
        a.id === addictionId 
          ? {
              ...a,
              current_streak: 0,
              longest_streak: newLongestStreak,
              total_relapses: a.total_relapses + 1,
              last_relapse_date: today,
              start_date: today
            }
          : a
      ));

      return { success: true };
    } catch (error) {
      console.error('Error marking relapse:', error);
      return { success: false, error };
    }
  };

  // Désactiver une addiction
  const deactivateAddiction = async (addictionId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('user_addictions')
        .update({ is_active: false })
        .eq('id', addictionId);

      if (error) throw error;

      setUserAddictions(prev => prev.filter(a => a.id !== addictionId));
      return { success: true };
    } catch (error) {
      console.error('Error deactivating addiction:', error);
      return { success: false, error };
    }
  };

  // Charger toutes les addictions (actives et inactives)
  const loadAllUserAddictions = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_addictions')
        .select(`
          *,
          addiction_type:addiction_types(*)
        `)
        .eq('user_id', user.id)
        .order('is_active', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(addiction => ({
        ...addiction,
        addiction_type: addiction.addiction_type as AddictionType
      }));
    } catch (error) {
      console.error('Error loading all user addictions:', error);
      return [];
    }
  };
  const updateStreaks = async () => {
    if (!user) return;

    try {
      // Calculer les nouveaux streaks pour chaque addiction active
      for (const addiction of userAddictions) {
        const startDate = new Date(addiction.start_date);
        const today = new Date();
        const daysSince = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince !== addiction.current_streak) {
          const newLongestStreak = Math.max(addiction.longest_streak, daysSince);
          
          await supabase
            .from('user_addictions')
            .update({
              current_streak: daysSince,
              longest_streak: newLongestStreak
            })
            .eq('id', addiction.id);
        }
      }

      // Mettre à jour le streak de connexion
      await updateLoginStreak();

      // Recharger les données
      await loadUserAddictions();
      await checkAndAwardBadges();
    } catch (error) {
      console.error('Error updating streaks:', error);
    }
  };

  // Mettre à jour le streak de connexion
  const updateLoginStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      if (!loginStreak) {
        // Créer un nouveau streak
        const { data, error } = await supabase
          .from('login_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_login_date: today,
            streak_start_date: today
          })
          .select()
          .single();

        if (error) throw error;
        setLoginStreak(data);
      } else {
        const lastLogin = new Date(loginStreak.last_login_date);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          // Streak continue
          const newStreak = loginStreak.current_streak + 1;
          const newLongestStreak = Math.max(loginStreak.longest_streak, newStreak);

          const { error } = await supabase
            .from('login_streaks')
            .update({
              current_streak: newStreak,
              longest_streak: newLongestStreak,
              last_login_date: today
            })
            .eq('id', loginStreak.id);

          if (error) throw error;

          setLoginStreak(prev => prev ? {
            ...prev,
            current_streak: newStreak,
            longest_streak: newLongestStreak,
            last_login_date: today
          } : null);
        } else if (daysDiff > 1) {
          // Streak cassé, recommencer
          const { error } = await supabase
            .from('login_streaks')
            .update({
              current_streak: 1,
              last_login_date: today,
              streak_start_date: today
            })
            .eq('id', loginStreak.id);

          if (error) throw error;

          setLoginStreak(prev => prev ? {
            ...prev,
            current_streak: 1,
            last_login_date: today,
            streak_start_date: today
          } : null);
        }
        // Si daysDiff === 0, l'utilisateur s'est déjà connecté aujourd'hui
      }
    } catch (error) {
      console.error('Error updating login streak:', error);
    }
  };

  // Vérifier et attribuer les badges
  const checkAndAwardBadges = async () => {
    if (!user) return;

    try {
      const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
      
      for (const badge of badges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        let shouldAward = false;

        if (badge.category === 'addiction' && badge.addiction_type_id) {
          const addiction = userAddictions.find(a => a.addiction_type_id === badge.addiction_type_id);
          if (addiction && addiction.current_streak >= badge.requirement_value) {
            shouldAward = true;
          }
        } else if (badge.category === 'login_streak') {
          if (loginStreak && loginStreak.current_streak >= badge.requirement_value) {
            shouldAward = true;
          }
        }

        if (shouldAward) {
          await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: badge.id
            });
        }
      }

      // Recharger les badges utilisateur
      await loadUserBadges();
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
    }
  };

  // Charger toutes les données
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAddictionTypes(),
        loadBadges(),
        loadUserAddictions(),
        loadUserBadges(),
        loadLoginStreak()
      ]);
      
      if (user) {
        await updateStreaks();
      }
    } catch (error) {
      console.error('Error loading addiction data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setUserAddictions([]);
      setUserBadges([]);
      setLoginStreak(null);
    }
  }, [user]);

  // Mettre à jour les streaks au montage pour les utilisateurs connectés
  useEffect(() => {
    if (user && !loading) {
      updateLoginStreak();
    }
  }, [user, loading]);

  return {
    addictionTypes,
    userAddictions,
    badges,
    userBadges,
    loginStreak,
    loading,
    startAddictionTracking,
    markRelapse,
    deactivateAddiction,
    loadAllUserAddictions,
    updateStreaks,
    checkAndAwardBadges,
    loadAllData
  };
};