/**
 * Sound Manager - Système de sons gamifiés pour Journeys
 * Inspiré du design sonore de Clash Royale : sons courts, stimulants et addictifs
 */

let audioContext: AudioContext | null = null;
let currentSound: { stop: () => void } | null = null;
let soundEnabled = true;

// Initialiser l'AudioContext (lazy loading)
const getContext = async (): Promise<AudioContext> => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  return audioContext;
};

// Arrêter le son précédent si actif
const stopCurrentSound = () => {
  if (currentSound) {
    currentSound.stop();
    currentSound = null;
  }
};

/**
 * Son cristallin d'ouverture de modale Premium
 * Court, brillant, évoque la découverte
 */
const createPremiumOpenSound = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const ctx = await getContext();
      const now = ctx.currentTime;
      const duration = 0.4;

      // Oscillateur principal - fréquence haute et cristalline
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.15);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);

      currentSound = { stop: () => osc.stop() };

      setTimeout(() => {
        currentSound = null;
        resolve();
      }, duration * 1000);
    } catch (error) {
      console.warn('Sound error:', error);
      resolve();
    }
  });
};

/**
 * Son doux de fermeture de modale
 * Fade-out rapide et apaisant
 */
const createPremiumCloseSound = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const ctx = await getContext();
      const now = ctx.currentTime;
      const duration = 0.25;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + duration);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);

      currentSound = { stop: () => osc.stop() };

      setTimeout(() => {
        currentSound = null;
        resolve();
      }, duration * 1000);
    } catch (error) {
      console.warn('Sound error:', error);
      resolve();
    }
  });
};

/**
 * Son de click premium
 * Très court, précis, satisfaisant
 */
const createClickSound = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const ctx = await getContext();
      const now = ctx.currentTime;
      const duration = 0.08;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);

      currentSound = { stop: () => osc.stop() };

      setTimeout(() => {
        currentSound = null;
        resolve();
      }, duration * 1000);
    } catch (error) {
      console.warn('Sound error:', error);
      resolve();
    }
  });
};

/**
 * Son de victoire/badge
 * Ascendant, triomphant, court
 */
const createVictorySound = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const ctx = await getContext();
      const now = ctx.currentTime;
      const duration = 0.6;

      // Trois notes ascendantes rapides
      const frequencies = [523, 659, 784]; // Do, Mi, Sol
      const noteGap = 0.12;

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + i * noteGap;
        const noteDuration = 0.25;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });

      setTimeout(() => {
        currentSound = null;
        resolve();
      }, duration * 1000);
    } catch (error) {
      console.warn('Sound error:', error);
      resolve();
    }
  });
};

/**
 * Gong de progression
 * Version courte et stimulante du gong classique
 */
const createProgressGong = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const ctx = await getContext();
      const now = ctx.currentTime;
      const duration = 1.2;

      // Harmoniques du gong, version courte
      const harmonics = [
        { freq: 120, vol: 1 },
        { freq: 194, vol: 0.6 },
        { freq: 252, vol: 0.4 },
      ];

      harmonics.forEach((h) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(h.freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.exponentialRampToValueAtTime(0.25 * h.vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });

      currentSound = { stop: () => {} };

      setTimeout(() => {
        currentSound = null;
        resolve();
      }, duration * 1000);
    } catch (error) {
      console.warn('Sound error:', error);
      resolve();
    }
  });
};

/**
 * Interface publique du Sound Manager
 */
export type SoundType = 
  | 'premium_open' 
  | 'premium_close' 
  | 'click' 
  | 'victory' 
  | 'progress_gong'
  | 'level_up'
  | 'level_up_major'; // For major milestones (25, 50, 100, etc.)

export const playSound = async (type: SoundType): Promise<void> => {
  if (!soundEnabled) return;

  // Arrêter le son précédent
  stopCurrentSound();

  try {
    switch (type) {
      case 'premium_open':
        await createPremiumOpenSound();
        break;
      case 'premium_close':
        await createPremiumCloseSound();
        break;
      case 'click':
        await createClickSound();
        break;
      case 'victory':
        await createVictorySound();
        break;
      case 'progress_gong':
        await createProgressGong();
        break;
      case 'level_up':
        await createLevelUpSound();
        break;
      case 'level_up_major':
        await createMajorLevelUpSound();
        break;
    }
  } catch (error) {
    console.warn('Failed to play sound:', type, error);
  }
};

/**
 * Son de montée de niveau - futuriste et gratifiant
 */
const createLevelUpSound = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const ctx = await getContext();
      const now = ctx.currentTime;
      const duration = 0.5;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.4);

      gain.gain.setValueAtTime(0, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);

      currentSound = { stop: () => osc.stop() };

      setTimeout(() => {
        currentSound = null;
        resolve();
      }, duration * 1000);
    } catch (error) {
      console.warn('Sound error:', error);
      resolve();
    }
  });
};

/**
 * Son de montée de niveau majeure - épique et cosmique
 */
const createMajorLevelUpSound = async (): Promise<void> => {
  return new Promise(async (resolve) => {
    try {
      const ctx = await getContext();
      const now = ctx.currentTime;
      const duration = 1.0;

      // Créer plusieurs oscillateurs pour un son plus riche
      const oscs = [
        ctx.createOscillator(),
        ctx.createOscillator(),
        ctx.createOscillator()
      ];

      const mainGain = ctx.createGain();
      mainGain.connect(ctx.destination);

      // Ton de base
      oscs[0].type = 'sine';
      oscs[0].frequency.setValueAtTime(220, now);
      oscs[0].frequency.exponentialRampToValueAtTime(880, now + 0.6);

      // Harmonique
      oscs[1].type = 'sine';
      oscs[1].frequency.setValueAtTime(330, now);
      oscs[1].frequency.exponentialRampToValueAtTime(1320, now + 0.6);

      // Étincelle haute
      oscs[2].type = 'sine';
      oscs[2].frequency.setValueAtTime(1760, now + 0.2);
      oscs[2].frequency.exponentialRampToValueAtTime(2640, now + 0.8);

      oscs.forEach(osc => {
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(mainGain);
        gain.gain.setValueAtTime(0, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      });

      mainGain.gain.setValueAtTime(0.5, now);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscs.forEach(osc => {
        osc.start(now);
        osc.stop(now + duration);
      });

      currentSound = { stop: () => oscs.forEach(o => o.stop()) };

      setTimeout(() => {
        currentSound = null;
        resolve();
      }, duration * 1000);
    } catch (error) {
      console.warn('Sound error:', error);
      resolve();
    }
  });
}

// Activer/désactiver les sons
export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
  if (!enabled) {
    stopCurrentSound();
  }
};

export const isSoundEnabled = () => soundEnabled;
