// AudioContext global réutilisable pour éviter les erreurs de navigateur
let globalAudioContext: AudioContext | null = null;

const getAudioContext = async (): Promise<AudioContext> => {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Reprendre le contexte si suspendu (nécessite une interaction utilisateur)
  if (globalAudioContext.state === 'suspended') {
    try {
      await globalAudioContext.resume();
    } catch (error) {
      console.warn('Could not resume AudioContext:', error);
    }
  }
  
  return globalAudioContext;
};

// Son de chime doux et agréable (style notification iOS)
const createChimeSound = async (
  frequency: number = 880,
  duration: number = 0.3,
  volume: number = 0.25
): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const audioContext = await getAudioContext();
      
      // Créer un chime avec harmoniques douces
      const frequencies = [frequency, frequency * 1.5, frequency * 2];
      
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        // Filtre pour adoucir
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, audioContext.currentTime);
        filter.Q.setValueAtTime(1, audioContext.currentTime);
        
        // Enveloppe rapide et douce
        const vol = volume * (1 / (index + 1));
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(vol, audioContext.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + duration);
      });
      
      setTimeout(resolve, duration * 1000);
    } catch (error) {
      console.warn('Audio playback error:', error);
      resolve();
    }
  });
};

// Son de pop satisfaisant (style bulle/like)
const createPopSound = async (
  frequency: number = 600,
  duration: number = 0.15,
  volume: number = 0.3
): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const audioContext = await getAudioContext();
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine';
      // Glissement de fréquence vers le haut pour effet "pop"
      osc.frequency.setValueAtTime(frequency * 0.8, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.2, audioContext.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(frequency, audioContext.currentTime + duration);
      
      // Enveloppe très courte
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + duration);
      
      setTimeout(resolve, duration * 1000);
    } catch (error) {
      console.warn('Audio playback error:', error);
      resolve();
    }
  });
};

// Son de succès ascendant (style achievement)
const createSuccessSound = async (volume: number = 0.25): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const audioContext = await getAudioContext();
      
      // Notes ascendantes harmonieuses (accord majeur)
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const duration = 0.4;
      
      notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        const delay = index * 0.08;
        const vol = volume * (1 - index * 0.15);
        
        gain.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol, audioContext.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + duration);
      });
      
      setTimeout(resolve, 500);
    } catch (error) {
      console.warn('Audio playback error:', error);
      resolve();
    }
  });
};

// Son de sparkle/magie (style premium)
const createSparkleSound = async (volume: number = 0.2): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const audioContext = await getAudioContext();
      
      // Notes scintillantes rapides
      const notes = [1047, 1319, 1568, 2093]; // C6, E6, G6, C7
      const duration = 0.5;
      
      notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, audioContext.currentTime);
        
        const delay = index * 0.06;
        const vol = volume * (0.8 + index * 0.1);
        
        gain.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol, audioContext.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 0.25);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + duration);
      });
      
      setTimeout(resolve, duration * 1000);
    } catch (error) {
      console.warn('Audio playback error:', error);
      resolve();
    }
  });
};

// Double chime harmonieux
const createDoubleChime = async (volume: number = 0.2): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      await createChimeSound(880, 0.25, volume);
      await new Promise(r => setTimeout(r, 100));
      await createChimeSound(1100, 0.3, volume * 0.8);
      resolve();
    } catch (error) {
      console.warn('Audio playback error:', error);
      resolve();
    }
  });
};

// =============================================
// EXPORTS PUBLICS (remplace les gongs)
// =============================================

// Génère un son de bol tibétain synthétique (pour méditation)
export const createMeditationSound = async (frequency: number = 440, duration: number = 2): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const audioContext = await getAudioContext();
    
      // Harmoniques pour un son plus riche
      const harmonics = [1, 2.5, 4.2, 6.8];
      
      harmonics.forEach((harmonic, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.frequency.setValueAtTime(frequency * harmonic, audioContext.currentTime);
        osc.type = 'sine';
        
        const volume = 0.3 / (index + 1);
        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + duration);
      });
      
      setTimeout(resolve, duration * 1000);
    } catch (error) {
      console.warn('Audio playback error:', error);
      resolve();
    }
  });
};

// Son d'accueil - chime doux et accueillant
export const playWelcomeGong = (): Promise<void> => {
  return createDoubleChime(0.25);
};

// Son de début - pop satisfaisant
export const playStartGong = (): Promise<void> => {
  return createPopSound(700, 0.2, 0.3);
};

// Son de fin - succession de chimes harmonieux
export const playEndGong = (): Promise<void> => {
  return createSuccessSound(0.25);
};

// Son premium - sparkle magique
export const playPremiumGong = (): Promise<void> => {
  return createSparkleSound(0.25);
};

// Alias pour compatibilité
export const playStartSound = (): Promise<void> => playStartGong();
export const playEndSound = (): Promise<void> => playEndGong();
