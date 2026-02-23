import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AvatarItem, getRarityColor, getRarityLabel } from '@/hooks/useAvatar';
import { playSound } from '@/utils/soundManager';

interface ChestOpenerProps {
  reward: AvatarItem | null;
  onClose: () => void;
}

export const ChestOpener: React.FC<ChestOpenerProps> = ({ reward, onClose }) => {
  const [phase, setPhase] = useState<'shaking' | 'opening' | 'reveal'>('shaking');

  useEffect(() => {
    // Shaking phase
    const timer1 = setTimeout(() => {
      setPhase('opening');
      playSound('click');
    }, 1500);

    const timer2 = setTimeout(() => {
      setPhase('reveal');
      if (reward?.rarity === 'legendary' || reward?.rarity === 'epic') {
        playSound('level_up_major');
      } else {
        playSound('level_up');
      }
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [reward]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={phase === 'reveal' ? onClose : undefined}
    >
      {/* Particles */}
      {phase === 'reveal' && (
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `hsl(${Math.random() * 60 + 30}, 100%, ${50 + Math.random() * 30}%)`,
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.5, delay: Math.random() * 0.3 }}
            />
          ))}
        </>
      )}

      <div className="text-center">
        {/* Chest */}
        {phase === 'shaking' && (
          <motion.div
            className="text-8xl"
            animate={{
              rotate: [-5, 5, -5, 5, -10, 10, -10, 10, 0],
              scale: [1, 1.05, 1, 1.05, 1.1, 1, 1.1, 1, 1.2],
            }}
            transition={{ duration: 1.5 }}
          >
            📦
          </motion.div>
        )}

        {/* Opening */}
        {phase === 'opening' && (
          <motion.div
            className="text-8xl"
            animate={{ scale: [1.2, 2, 0], opacity: [1, 1, 0], rotate: [0, 0, 180] }}
            transition={{ duration: 1 }}
          >
            💥
          </motion.div>
        )}

        {/* Reveal */}
        {phase === 'reveal' && reward && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Rarity glow ring */}
            <motion.div
              className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getRarityColor(reward.rarity)} flex items-center justify-center`}
              animate={{ boxShadow: ['0 0 30px rgba(255,200,0,0.3)', '0 0 60px rgba(255,200,0,0.6)', '0 0 30px rgba(255,200,0,0.3)'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-6xl">{reward.preview_emoji}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-foreground">{reward.name_fr}</h2>
              <div className={`text-lg font-bold bg-gradient-to-r ${getRarityColor(reward.rarity)} bg-clip-text text-transparent`}>
                {getRarityLabel(reward.rarity)}
              </div>
              {reward.description_fr && (
                <p className="text-sm text-muted-foreground mt-2">{reward.description_fr}</p>
              )}
            </motion.div>

            <motion.p
              className="text-xs text-muted-foreground mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ delay: 1 }}
            >
              Touche pour continuer
            </motion.p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
