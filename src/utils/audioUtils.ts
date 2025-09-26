// Génère un son de bol tibétain synthétique
export const createMeditationSound = (frequency: number = 440, duration: number = 2): Promise<void> => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Oscillateur principal (ton fondamental)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Harmoniques pour un son plus riche
    const harmonics = [1, 2.5, 4.2, 6.8]; // Rapports harmoniques du bol tibétain
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    
    harmonics.forEach((harmonic, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.frequency.setValueAtTime(frequency * harmonic, audioContext.currentTime);
      osc.type = 'sine';
      
      // Volume décroissant pour les harmoniques
      const volume = 0.3 / (index + 1);
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + duration);
      
      oscillators.push(osc);
      gains.push(gain);
    });
    
    // Résoudre la promesse quand le son se termine
    setTimeout(() => {
      resolve();
    }, duration * 1000);
  });
};

// Génère un son de gong profond et résonnant
export const createGongSound = (
  baseFrequency: number = 120, 
  duration: number = 3,
  volume: number = 0.4
): Promise<void> => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Harmoniques complexes du gong
    const harmonics = [
      { freq: 1, vol: 1, decay: 0.8 },      // Fondamentale
      { freq: 2.1, vol: 0.7, decay: 0.6 },  // Deuxième harmonique
      { freq: 3.3, vol: 0.5, decay: 0.4 },  // Troisième harmonique
      { freq: 4.8, vol: 0.3, decay: 0.3 },  // Quatrième harmonique
      { freq: 6.2, vol: 0.2, decay: 0.2 },  // Cinquième harmonique
      { freq: 8.1, vol: 0.15, decay: 0.15 } // Sixième harmonique
    ];
    
    harmonics.forEach((harmonic) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      // Fréquence avec légère modulation
      osc.frequency.setValueAtTime(
        baseFrequency * harmonic.freq, 
        audioContext.currentTime
      );
      osc.type = 'sine';
      
      // Filtre passe-bas pour adoucir le son
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, audioContext.currentTime);
      filter.Q.setValueAtTime(1, audioContext.currentTime);
      
      // Enveloppe du gong : attaque rapide, déclin exponentiel
      const finalVolume = volume * harmonic.vol;
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(finalVolume, audioContext.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(
        finalVolume * harmonic.decay, 
        audioContext.currentTime + duration * 0.3
      );
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      // Connexions audio
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + duration);
    });
    
    // Résoudre quand le son se termine
    setTimeout(() => {
      resolve();
    }, duration * 1000);
  });
};

// Son d'accueil - gong majestueux
export const playWelcomeGong = (): Promise<void> => {
  return createGongSound(100, 4, 0.3);
};

// Son de début de méditation/deepwork - gong centrant
export const playStartGong = (): Promise<void> => {
  return createGongSound(128, 2.5, 0.35);
};

// Son de fin - triple gong harmonieux
export const playEndGong = (): Promise<void> => {
  return new Promise(async (resolve) => {
    await createGongSound(110, 1.8, 0.3);
    await new Promise(r => setTimeout(r, 500));
    await createGongSound(130, 1.8, 0.25);
    await new Promise(r => setTimeout(r, 500));
    await createGongSound(150, 2.2, 0.2);
    resolve();
  });
};

// Son premium - gong cristallin et élégant
export const playPremiumGong = (): Promise<void> => {
  return createGongSound(200, 2, 0.25);
};

// Sons existants (compatibilité)
export const playStartSound = (): Promise<void> => {
  return playStartGong();
};

export const playEndSound = (): Promise<void> => {
  return playEndGong();
};