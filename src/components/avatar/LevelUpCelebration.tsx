/**
 * LevelUpCelebration - Avatar popup on level-up
 * Shows avatar doing a celebratory gesture with confetti
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarRenderer } from './AvatarRenderer';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG, getEvolutionStage, RARITY_COLORS } from './AvatarEngine';
import { playSound } from '@/utils/soundManager';

interface LevelUpCelebrationProps {
  level: number;
  xpGained: number;
  title: string;
  show: boolean;
  onDone: () => void;
}

function loadAvatarConfig(): AvatarConfig {
  try {
    const saved = localStorage.getItem('avatar_config');
    if (saved) return { ...DEFAULT_AVATAR_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_AVATAR_CONFIG;
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  level,
  xpGained,
  title,
  show,
  onDone,
}) => {
  const [config] = useState(loadAvatarConfig);
  const evolution = getEvolutionStage(level);

  useEffect(() => {
    if (!show) return;
    if (level % 10 === 0) {
      playSound('level_up_major');
    } else {
      playSound('level_up');
    }
    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
  }, [show, level, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-24 right-4 z-50 pointer-events-none"
          initial={{ x: 80, opacity: 0, scale: 0.5 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 80, opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="relative">
            {/* Confetti particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-sm"
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF69B4' : '#00BFFF',
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: (Math.random() - 0.5) * 100,
                  y: -30 - Math.random() * 80,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 1, delay: 0.2 + Math.random() * 0.3 }}
              />
            ))}

            {/* Avatar with jump animation */}
            <motion.div
              animate={{
                y: [0, -12, 0, -6, 0],
                rotate: [0, -5, 5, -3, 0],
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <AvatarRenderer
                config={config}
                size="md"
                animate={false}
                showGlow
                glowColor={evolution.glowColor || 'hsl(45 100% 65% / 0.3)'}
              />
            </motion.div>

            {/* Level badge */}
            <motion.div
              className={`absolute -top-3 -right-2 bg-gradient-to-r ${evolution.color} text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg`}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Nv.{level} !
            </motion.div>

            {/* XP text */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-primary font-bold text-sm whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 1, 0], y: [10, -5, -5, -20] }}
              transition={{ duration: 2, delay: 0.5 }}
            >
              +{xpGained} XP
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
