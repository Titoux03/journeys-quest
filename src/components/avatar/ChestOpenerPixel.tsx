/**
 * ChestOpenerPixel - Pixel art chest opening animation
 * No emojis - pure pixel art
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AvatarItem } from '@/hooks/useAvatar';
import { playSound } from '@/utils/soundManager';
import { PixelIcon } from './AvatarRenderer';
import { RARITY_COLORS, RARITY_LABELS, RARITY_GRADIENTS, PIXEL_ITEMS } from './AvatarEngine';

interface ChestOpenerPixelProps {
  reward: AvatarItem | null;
  onClose: () => void;
}

// Pixel art chest sprite
const CHEST_PIXELS = [
  [0,0,1,1,1,1,1,1,0,0],
  [0,1,2,2,2,2,2,2,1,0],
  [1,2,2,3,2,2,3,2,2,1],
  [1,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,3,3,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1],
  [1,2,2,2,2,2,2,2,2,1],
  [0,1,1,1,1,1,1,1,1,0],
];

// Open chest sprite
const CHEST_OPEN_PIXELS = [
  [0,1,1,1,1,1,1,1,1,0],
  [1,2,2,2,2,2,2,2,2,1],
  [0,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0],
  [1,2,2,2,3,3,2,2,2,1],
  [1,2,2,2,2,2,2,2,2,1],
  [1,2,2,2,2,2,2,2,2,1],
  [0,1,1,1,1,1,1,1,1,0],
];

export const ChestOpenerPixel: React.FC<ChestOpenerPixelProps> = ({ reward, onClose }) => {
  const [phase, setPhase] = useState<'shaking' | 'opening' | 'reveal'>('shaking');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('opening');
      playSound('chest_open');
    }, 1500);
    const t2 = setTimeout(() => {
      setPhase('reveal');
      if (reward?.rarity === 'legendary' || reward?.rarity === 'epic') {
        playSound('level_up_major');
      } else {
        playSound('level_up');
      }
    }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reward]);

  const rarityColor = reward ? (RARITY_COLORS[reward.rarity] || RARITY_COLORS.common) : RARITY_COLORS.common;
  const chestPalette = ['', rarityColor, '#8B4513', '#FFD700'];

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
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-sm"
              style={{
                width: 4 + Math.random() * 4,
                height: 4 + Math.random() * 4,
                background: rarityColor,
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: (Math.random() - 0.5) * 350,
                y: (Math.random() - 0.5) * 350,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.2, delay: Math.random() * 0.3 }}
            />
          ))}
        </>
      )}

      <div className="text-center">
        {/* Shaking chest */}
        {phase === 'shaking' && (
          <motion.div
            animate={{
              rotate: [-5, 5, -5, 5, -8, 8, -8, 8, 0],
              scale: [1, 1.05, 1, 1.05, 1.1, 1, 1.1, 1, 1.15],
            }}
            transition={{ duration: 1.5 }}
          >
            <PixelIcon pixels={CHEST_PIXELS} palette={chestPalette} pixelSize={8} />
          </motion.div>
        )}

        {/* Opening */}
        {phase === 'opening' && (
          <motion.div
            animate={{ scale: [1.15, 1.8, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.8 }}
          >
            <PixelIcon pixels={CHEST_OPEN_PIXELS} palette={chestPalette} pixelSize={8} />
          </motion.div>
        )}

        {/* Reveal */}
        {phase === 'reveal' && reward && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Rarity glow ring with pixel item preview */}
            <motion.div
              className={`w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br ${RARITY_GRADIENTS[reward.rarity] || RARITY_GRADIENTS.common} flex items-center justify-center`}
              animate={{ boxShadow: [`0 0 30px ${rarityColor}44`, `0 0 60px ${rarityColor}88`, `0 0 30px ${rarityColor}44`] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {(() => {
                const overlayKey = (reward.pixel_art_data as any)?.overlay_key;
                const pixelItem = overlayKey ? PIXEL_ITEMS.find(p => p.key === overlayKey) : null;
                if (pixelItem) {
                  return <PixelIcon pixels={pixelItem.pixels.slice(0, 8)} palette={pixelItem.palette} pixelSize={5} />;
                }
                return <div className="w-12 h-12 bg-white/20 rounded-lg" />;
              })()}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-foreground">{reward.name_fr}</h2>
              <div className="text-lg font-bold" style={{ color: rarityColor }}>
                {RARITY_LABELS[reward.rarity] || 'Commun'}
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
