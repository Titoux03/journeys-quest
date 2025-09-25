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

// Son de début (plus aigu et court)
export const playStartSound = (): Promise<void> => {
  return createMeditationSound(528, 1.5); // Fréquence 528 Hz (fréquence de guérison)
};

// Son de fin (plus grave et long)
export const playEndSound = (): Promise<void> => {
  return createMeditationSound(396, 2.5); // Fréquence 396 Hz (libération des peurs)
};