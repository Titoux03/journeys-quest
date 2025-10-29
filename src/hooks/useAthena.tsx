import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AthenaMessage {
  id: string;
  message: string;
  type: 'milestone' | 'encouragement' | 'warning' | 'celebration' | 'return';
  timestamp: Date;
  read: boolean;
}

export const useAthena = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AthenaMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<AthenaMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Calculer les jours d'inactivité
  const getDaysSinceLastActivity = useCallback(async (): Promise<number> => {
    if (!user) return 0;

    try {
      const { data: streak } = await supabase
        .from('login_streaks')
        .select('last_activity_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!streak?.last_activity_date) return 0;

      const lastActivity = new Date(streak.last_activity_date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error('Error calculating inactivity days:', error);
      return 0;
    }
  }, [user]);

  // Obtenir le contexte utilisateur
  const getUserContext = useCallback(async () => {
    if (!user) return null;

    try {
      // Récupérer le streak
      const { data: streak } = await supabase
        .from('login_streaks')
        .select('current_streak, last_activity_date')
        .eq('user_id', user.id)
        .maybeSingle();

      // Récupérer l'addiction active
      const { data: addictions } = await supabase
        .from('user_addictions')
        .select('current_streak, addiction_type:addiction_types(name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      const daysSinceLastActivity = await getDaysSinceLastActivity();

      return {
        currentDay: streak?.current_streak || 0,
        lastActivityDays: daysSinceLastActivity,
        addictionName: addictions?.addiction_type?.name || null,
        userName: user.email?.split('@')[0] || null,
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }, [user, getDaysSinceLastActivity]);

  // Générer un message Athena
  const generateMessage = useCallback(async (context?: string) => {
    if (!user || isLoading) return null;

    setIsLoading(true);
    try {
      const userContext = await getUserContext();
      if (!userContext) return null;

      const { data, error } = await supabase.functions.invoke('athena-coach', {
        body: {
          ...userContext,
          context: context || null,
        },
      });

      if (error) {
        console.error('Error generating Athena message:', error);
        return null;
      }

      const newMessage: AthenaMessage = {
        id: `athena-${Date.now()}`,
        message: data.message,
        type: userContext.lastActivityDays > 4 ? 'warning' 
             : userContext.lastActivityDays >= 2 ? 'return'
             : [7, 30, 60, 90].includes(userContext.currentDay) ? 'milestone'
             : 'encouragement',
        timestamp: new Date(),
        read: false,
      };

      setMessages(prev => [newMessage, ...prev]);
      setCurrentMessage(newMessage);
      setLastCheck(new Date());

      return newMessage;
    } catch (error) {
      console.error('Error in generateMessage:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, getUserContext]);

  // Marquer un message comme lu
  const markAsRead = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
    if (currentMessage?.id === messageId) {
      setCurrentMessage(prev => prev ? { ...prev, read: true } : null);
    }
  }, [currentMessage]);

  // Fermer le message actuel
  const dismissCurrentMessage = useCallback(() => {
    if (currentMessage) {
      markAsRead(currentMessage.id);
      setCurrentMessage(null);
    }
  }, [currentMessage, markAsRead]);

  // Vérifier si on doit montrer un message
  const shouldShowMessage = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    // Vérifier la dernière vérification (ne pas montrer trop souvent)
    if (lastCheck) {
      const timeSinceLastCheck = Date.now() - lastCheck.getTime();
      const hoursSinceLastCheck = timeSinceLastCheck / (1000 * 60 * 60);
      
      // Ne montrer qu'une fois toutes les 4 heures minimum
      if (hoursSinceLastCheck < 4) return false;
    }

    const daysSinceLastActivity = await getDaysSinceLastActivity();
    
    // Montrer un message si inactif depuis 2+ jours
    if (daysSinceLastActivity >= 2) return true;

    // Vérifier les jalons
    const { data: streak } = await supabase
      .from('login_streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentDay = streak?.current_streak || 0;
    
    // Montrer aux jalons importants
    if ([7, 30, 60, 90].includes(currentDay)) return true;

    return false;
  }, [user, lastCheck, getDaysSinceLastActivity]);

  // Vérifier automatiquement au montage
  useEffect(() => {
    const checkAndShow = async () => {
      if (await shouldShowMessage()) {
        await generateMessage();
      }
    };

    checkAndShow();
  }, [user]); // Seulement au changement d'utilisateur

  return {
    messages,
    currentMessage,
    isLoading,
    generateMessage,
    markAsRead,
    dismissCurrentMessage,
    shouldShowMessage,
    getDaysSinceLastActivity,
  };
};
