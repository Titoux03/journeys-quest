import { useCallback, useState } from 'react';
import { 
  playWelcomeGong, 
  playStartGong, 
  playEndGong, 
  playPremiumGong 
} from '@/utils/audioUtils';

export const useGongSounds = () => {
  const [isPlayingGong, setIsPlayingGong] = useState(false);

  const playWelcome = useCallback(async () => {
    if (isPlayingGong) return;
    
    try {
      setIsPlayingGong(true);
      await playWelcomeGong();
    } catch (error) {
      console.log('Son de bienvenue non disponible:', error);
    } finally {
      setIsPlayingGong(false);
    }
  }, [isPlayingGong]);

  const playStart = useCallback(async () => {
    if (isPlayingGong) return;
    
    try {
      setIsPlayingGong(true);
      await playStartGong();
    } catch (error) {
      console.log('Son de démarrage non disponible:', error);
    } finally {
      setIsPlayingGong(false);
    }
  }, [isPlayingGong]);

  const playEnd = useCallback(async () => {
    if (isPlayingGong) return;
    
    try {
      setIsPlayingGong(true);
      await playEndGong();
    } catch (error) {
      console.log('Son de fin non disponible:', error);
    } finally {
      setIsPlayingGong(false);
    }
  }, [isPlayingGong]);

  const playPremium = useCallback(async () => {
    if (isPlayingGong) return;
    
    try {
      setIsPlayingGong(true);
      await playPremiumGong();
    } catch (error) {
      console.log('Son premium non disponible:', error);
    } finally {
      setIsPlayingGong(false);
    }
  }, [isPlayingGong]);

  return {
    playWelcome,
    playStart,
    playEnd,
    playPremium,
    isPlayingGong
  };
};