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

// Génère un son de gong profond et résonnant avec variations
export const createGongSound = (
  baseFrequency: number = 120, 
  duration: number = 3,
  volume: number = 0.4,
  variation: number = 0
): Promise<void> => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Variations aléatoires légères basées sur l'interaction
    const frequencyVariation = 1 + (Math.random() - 0.5) * 0.1 + variation;
    const durationVariation = 1 + (Math.random() - 0.5) * 0.2;
    
    // Harmoniques complexes du gong avec plus de résonance
    const harmonics = [
      { freq: 1, vol: 1, decay: 0.9 },        // Fondamentale plus longue
      { freq: 1.618, vol: 0.8, decay: 0.85 }, // Ratio doré pour harmonie
      { freq: 2.1, vol: 0.7, decay: 0.8 },    // Deuxième harmonique
      { freq: 3.3, vol: 0.6, decay: 0.7 },    // Troisième harmonique
      { freq: 4.8, vol: 0.4, decay: 0.6 },    // Quatrième harmonique
      { freq: 6.2, vol: 0.3, decay: 0.5 },    // Cinquième harmonique
      { freq: 8.1, vol: 0.25, decay: 0.4 },   // Sixième harmonique
      { freq: 10.7, vol: 0.2, decay: 0.3 }    // Harmonique supplémentaire pour richesse
    ];
    
    // Créer un delay/reverb naturel avec plusieurs oscillateurs décalés
    const reverbNodes = 3;
    
    harmonics.forEach((harmonic) => {
      // Oscillateur principal
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      const compressor = audioContext.createDynamicsCompressor();
      
      // Fréquence avec variation
      const finalFreq = baseFrequency * harmonic.freq * frequencyVariation;
      osc.frequency.setValueAtTime(finalFreq, audioContext.currentTime);
      
      // Légère modulation de fréquence pour effet naturel
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.frequency.setValueAtTime(0.5 + Math.random() * 0.5, audioContext.currentTime);
      lfoGain.gain.setValueAtTime(finalFreq * 0.002, audioContext.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(audioContext.currentTime);
      lfo.stop(audioContext.currentTime + duration * durationVariation);
      
      osc.type = 'sine';
      
      // Filtre passe-bas avec résonance pour plus de chaleur
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500 + Math.random() * 1000, audioContext.currentTime);
      filter.Q.setValueAtTime(2 + Math.random(), audioContext.currentTime);
      
      // Compresseur pour adoucir et enrichir le son
      compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
      compressor.knee.setValueAtTime(30, audioContext.currentTime);
      compressor.ratio.setValueAtTime(12, audioContext.currentTime);
      compressor.attack.setValueAtTime(0.003, audioContext.currentTime);
      compressor.release.setValueAtTime(0.25, audioContext.currentTime);
      
      // Enveloppe plus complexe pour résonance
      const finalVolume = volume * harmonic.vol * (0.8 + Math.random() * 0.4);
      const adjustedDuration = duration * durationVariation;
      
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(finalVolume, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        finalVolume * 0.8, 
        audioContext.currentTime + adjustedDuration * 0.1
      );
      gain.gain.exponentialRampToValueAtTime(
        finalVolume * harmonic.decay * 0.6, 
        audioContext.currentTime + adjustedDuration * 0.4
      );
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + adjustedDuration);
      
      // Connexions audio avec compression
      osc.connect(filter);
      filter.connect(compressor);
      compressor.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + adjustedDuration);
      
      // Créer des échos naturels pour plus de résonance
      for (let i = 1; i <= reverbNodes; i++) {
        const delayNode = audioContext.createDelay();
        const delayGain = audioContext.createGain();
        const delayTime = (i * 0.05) + Math.random() * 0.03;
        const delayVolume = finalVolume * (0.3 / i) * harmonic.decay;
        
        delayNode.delayTime.setValueAtTime(delayTime, audioContext.currentTime);
        delayGain.gain.setValueAtTime(0, audioContext.currentTime);
        delayGain.gain.exponentialRampToValueAtTime(delayVolume, audioContext.currentTime + delayTime);
        delayGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + adjustedDuration);
        
        filter.connect(delayNode);
        delayNode.connect(delayGain);
        delayGain.connect(audioContext.destination);
      }
    });
    
    // Résoudre quand le son se termine
    setTimeout(() => {
      resolve();
    }, duration * durationVariation * 1000);
  });
};

// Son d'accueil - gong majestueux avec variation douce
export const playWelcomeGong = (): Promise<void> => {
  return createGongSound(100, 4, 0.3, -0.02);
};

// Son de début de méditation/deepwork - gong centrant avec variation focalisante
export const playStartGong = (): Promise<void> => {
  return createGongSound(128, 2.5, 0.35, 0.01);
};

// Son de fin - triple gong harmonieux avec variations progressives
export const playEndGong = (): Promise<void> => {
  return new Promise(async (resolve) => {
    await createGongSound(110, 1.8, 0.3, -0.01);
    await new Promise(r => setTimeout(r, 500));
    await createGongSound(130, 1.8, 0.25, 0.005);
    await new Promise(r => setTimeout(r, 500));
    await createGongSound(150, 2.2, 0.2, 0.02);
    resolve();
  });
};

// Son premium - gong cristallin et élégant avec variation premium
export const playPremiumGong = (): Promise<void> => {
  return createGongSound(200, 2, 0.25, 0.03);
};

// Sons existants (compatibilité)
export const playStartSound = (): Promise<void> => {
  return playStartGong();
};

export const playEndSound = (): Promise<void> => {
  return playEndGong();
};