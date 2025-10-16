import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PopupPreferences {
  hasSeenIntroPopup: boolean;
  hasSeenTutorial: boolean;
}

export const usePopupManager = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PopupPreferences>({
    hasSeenIntroPopup: false,
    hasSeenTutorial: false,
  });
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Charger les préférences au chargement et détecter les nouveaux utilisateurs
  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    setLoading(true);
    
    if (user) {
      // Si connecté, récupérer depuis le serveur
      const { data, error } = await supabase
        .from('profiles')
        .select('has_seen_intro_popup, has_seen_tutorial, created_at')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setPreferences({
          hasSeenIntroPopup: data.has_seen_intro_popup || false,
          hasSeenTutorial: data.has_seen_tutorial || false,
        });

        // Une fois connecté, ne jamais ré-afficher l'intro sur cet appareil
        try { localStorage.setItem('hasSeenIntroPopup', 'true'); } catch {}

        // Détecter si c'est un nouvel utilisateur (compte créé il y a moins de 2 minutes)
        const createdAt = new Date(data.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        
        setIsNewUser(diffMinutes < 2 && !data.has_seen_tutorial);
      }
    } else {
      // Si non connecté, utiliser localStorage
      const localIntro = localStorage.getItem('hasSeenIntroPopup') === 'true';
      const localTutorial = localStorage.getItem('hasSeenTutorial') === 'true';
      
      setPreferences({
        hasSeenIntroPopup: localIntro,
        hasSeenTutorial: localTutorial,
      });
      setIsNewUser(false);
    }
    
    setLoading(false);
  };

  const updatePreference = async (key: keyof PopupPreferences, value: boolean) => {
    // Mettre à jour l'état local
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Sauvegarder dans localStorage
    const storageKey = key === 'hasSeenIntroPopup' ? 'hasSeenIntroPopup' : 'hasSeenTutorial';
    localStorage.setItem(storageKey, String(value));

    // Si connecté, synchroniser avec le serveur
    if (user) {
      const dbKey = key === 'hasSeenIntroPopup' ? 'has_seen_intro_popup' : 'has_seen_tutorial';
      
      await supabase
        .from('profiles')
        .update({ [dbKey]: value })
        .eq('user_id', user.id);
    }
  };

  const markIntroSeen = () => updatePreference('hasSeenIntroPopup', true);
  const markTutorialSeen = () => updatePreference('hasSeenTutorial', true);

  const shouldShowIntro = !preferences.hasSeenIntroPopup && !user;
  const shouldShowTutorial = user && isNewUser && !preferences.hasSeenTutorial;

  return {
    preferences,
    loading,
    shouldShowIntro,
    shouldShowTutorial,
    markIntroSeen,
    markTutorialSeen,
    refreshPreferences: loadPreferences,
  };
};
