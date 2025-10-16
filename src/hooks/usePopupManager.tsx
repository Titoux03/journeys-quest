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
      // Si connecté, forcer tous les flags à true - pas de pop-up
      setPreferences({
        hasSeenIntroPopup: true,
        hasSeenTutorial: true,
      });
      
      // Marquer localement aussi
      localStorage.setItem('hasSeenIntroPopup', 'true');
      localStorage.setItem('hasSeenTutorial', 'true');
      
      // Mettre à jour en base si nécessaire
      try {
        void supabase
          .from('profiles')
          .update({ 
            has_seen_intro_popup: true,
            has_seen_tutorial: true 
          })
          .eq('user_id', user.id);
      } catch {}
      
      setIsNewUser(false);
    } else {
      // Si non connecté, utiliser localStorage
      const localIntro = localStorage.getItem('hasSeenIntroPopup') === 'true';
      
      setPreferences({
        hasSeenIntroPopup: localIntro,
        hasSeenTutorial: true,
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
  const shouldShowTutorial = false; // Désactivé complètement - pas de pop-up après connexion

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
