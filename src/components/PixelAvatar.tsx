import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLevel } from '@/hooks/useLevel';
import { useAuth } from '@/hooks/useAuth';

interface PixelAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  level?: number;
}

// Each evolution stage has a different pixel art sprite
// 0 = transparent, 1-9 = color palette index
const EVOLUTION_STAGES: { minLevel: number; name: string; pixels: number[][]; palette: string[] }[] = [
  {
    minLevel: 0,
    name: 'Initié',
    palette: [
      '', // 0 = transparent
      '#8B9DC3', // 1 = skin light
      '#6B7FA3', // 2 = skin shadow
      '#3B4F73', // 3 = outfit
      '#2C3E5A', // 4 = outfit dark
      '#FFD700', // 5 = eyes/accent
      '#1A2744', // 6 = hair
      '#4A6491', // 7 = mid tone
      '#FFE066', // 8 = glow
    ],
    pixels: [
      [0,0,0,0,6,6,6,0,0,0,0],
      [0,0,0,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,0,0],
      [0,0,1,1,1,1,1,1,1,0,0],
      [0,1,1,5,1,1,1,5,1,1,0],
      [0,1,1,1,1,2,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,7,7,7,1,0,0,0],
      [0,0,3,3,3,3,3,3,3,0,0],
      [0,3,3,3,4,3,4,3,3,3,0],
      [0,3,3,3,4,3,4,3,3,3,0],
      [0,0,3,3,3,3,3,3,3,0,0],
      [0,0,0,3,3,0,3,3,0,0,0],
      [0,0,0,4,4,0,4,4,0,0,0],
    ],
  },
  {
    minLevel: 10,
    name: 'Voyageur',
    palette: [
      '',
      '#A8C0D8', // skin
      '#7A9BBD', // skin shadow
      '#2E5090', // outfit (blue armor)
      '#1D3A6E', // outfit dark
      '#FFD700', // eyes
      '#1A2744', // hair
      '#5A8AC0', // mid
      '#FFE066', // glow
      '#C0A040', // belt/accent
    ],
    pixels: [
      [0,0,0,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,0,0],
      [0,0,6,6,6,6,6,6,6,0,0],
      [0,0,1,1,1,1,1,1,1,0,0],
      [0,1,1,5,1,1,1,5,1,1,0],
      [0,1,1,1,1,2,1,1,1,1,0],
      [0,0,1,1,2,2,2,1,1,0,0],
      [0,0,0,1,7,7,7,1,0,0,0],
      [0,9,3,3,3,3,3,3,3,9,0],
      [0,3,3,3,4,3,4,3,3,3,0],
      [3,3,3,3,4,3,4,3,3,3,3],
      [0,3,3,9,3,3,3,9,3,3,0],
      [0,0,0,3,3,0,3,3,0,0,0],
      [0,0,0,4,4,0,4,4,0,0,0],
    ],
  },
  {
    minLevel: 25,
    name: 'Guerrier',
    palette: [
      '',
      '#B8CDE0', // skin
      '#8AACC8', // skin shadow
      '#4A4A8A', // purple armor
      '#2E2E6E', // armor dark
      '#FF6B35', // fire eyes
      '#2A2A4A', // hair
      '#6A6AAA', // mid
      '#FFE066', // glow
      '#C0A040', // gold trim
      '#FF4444', // cape red
    ],
    pixels: [
      [0,0,0,6,6,6,6,6,0,0,0],
      [0,0,6,9,6,6,6,9,6,0,0],
      [0,0,6,6,6,6,6,6,6,0,0],
      [0,0,1,1,1,1,1,1,1,0,0],
      [0,1,1,5,1,1,1,5,1,1,0],
      [0,1,1,5,1,2,1,5,1,1,0],
      [0,0,1,1,2,2,2,1,1,0,0],
      [10,0,0,1,7,7,7,1,0,0,10],
      [10,9,3,3,9,3,9,3,3,9,10],
      [10,3,3,3,4,9,4,3,3,3,10],
      [0,3,3,3,4,3,4,3,3,3,0],
      [0,3,3,9,3,3,3,9,3,3,0],
      [0,0,0,3,3,0,3,3,0,0,0],
      [0,0,0,4,4,0,4,4,0,0,0],
    ],
  },
  {
    minLevel: 50,
    name: 'Maître',
    palette: [
      '',
      '#D0D8E8', // skin glowing
      '#A0B8D0', // skin shadow
      '#6030A0', // royal purple
      '#401880', // dark purple
      '#00FFFF', // cyan eyes
      '#301060', // dark hair
      '#8050C0', // mid purple
      '#FFE066', // crown gold
      '#FFD700', // gold
      '#00DDFF', // aura cyan
    ],
    pixels: [
      [0,0,0,8,9,8,9,8,0,0,0],
      [0,0,9,8,9,8,9,8,9,0,0],
      [0,0,6,6,6,6,6,6,6,0,0],
      [0,0,1,1,1,1,1,1,1,0,0],
      [10,1,1,5,1,1,1,5,1,1,10],
      [0,1,1,5,1,2,1,5,1,1,0],
      [0,0,1,1,2,2,2,1,1,0,0],
      [10,0,0,1,7,7,7,1,0,0,10],
      [10,9,3,3,9,3,9,3,3,9,10],
      [10,3,3,3,4,9,4,3,3,3,10],
      [10,3,3,3,4,3,4,3,3,3,10],
      [0,3,3,9,3,3,3,9,3,3,0],
      [0,0,0,3,3,0,3,3,0,0,0],
      [0,0,0,4,4,0,4,4,0,0,0],
    ],
  },
  {
    minLevel: 100,
    name: 'Légende',
    palette: [
      '',
      '#E8E0FF', // ethereal skin
      '#C0B0FF', // skin shadow
      '#2020AA', // cosmic blue
      '#1010CC', // cosmic dark
      '#FFFF00', // golden eyes
      '#100880', // dark
      '#6060DD', // mid
      '#FFD700', // crown
      '#FF8C00', // gold accent
      '#FF00FF', // magic aura
      '#00FFFF', // secondary aura
    ],
    pixels: [
      [11,0,8,9,8,9,8,9,8,0,11],
      [0,11,9,8,9,8,9,8,9,11,0],
      [0,0,6,6,6,6,6,6,6,0,0],
      [10,0,1,1,1,1,1,1,1,0,10],
      [10,1,1,5,1,1,1,5,1,1,10],
      [0,1,1,5,1,2,1,5,1,1,0],
      [0,0,1,1,2,2,2,1,1,0,0],
      [10,0,9,1,7,7,7,1,9,0,10],
      [10,9,3,3,9,3,9,3,3,9,10],
      [10,3,3,3,4,9,4,3,3,3,10],
      [11,3,3,3,4,3,4,3,3,3,11],
      [0,3,3,9,3,3,3,9,3,3,0],
      [0,0,0,3,3,0,3,3,0,0,0],
      [0,0,11,4,4,0,4,4,11,0,0],
    ],
  },
];

const SIZE_CONFIG = {
  sm: { pixelSize: 3, containerClass: 'w-14 h-14' },
  md: { pixelSize: 5, containerClass: 'w-24 h-24' },
  lg: { pixelSize: 8, containerClass: 'w-40 h-44' },
};

export const PixelAvatar: React.FC<PixelAvatarProps> = ({ size = 'md', onClick, className = '', level: levelProp }) => {
  const { user } = useAuth();
  const { levelData } = useLevel(user?.id);
  
  const currentLevel = levelProp ?? levelData?.level ?? 1;
  const config = SIZE_CONFIG[size];

  // Find the right evolution stage
  const stage = useMemo(() => {
    const sorted = [...EVOLUTION_STAGES].sort((a, b) => b.minLevel - a.minLevel);
    return sorted.find(s => currentLevel >= s.minLevel) || EVOLUTION_STAGES[0];
  }, [currentLevel]);

  const isLegendary = currentLevel >= 100;
  const isMaster = currentLevel >= 50;

  return (
    <motion.div
      className={`relative cursor-pointer group flex items-center justify-center ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Aura glow for high levels */}
      {isMaster && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: config.pixelSize * 15,
            height: config.pixelSize * 18,
            background: isLegendary 
              ? 'radial-gradient(circle, hsl(280 100% 70% / 0.3), hsl(200 100% 60% / 0.1), transparent)'
              : 'radial-gradient(circle, hsl(45 100% 65% / 0.2), transparent)',
            filter: 'blur(8px)',
          }}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Pixel art character */}
      <div
        className="relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${stage.pixels[0]?.length || 11}, ${config.pixelSize}px)`,
          gridTemplateRows: `repeat(${stage.pixels.length}, ${config.pixelSize}px)`,
          imageRendering: 'pixelated',
        }}
      >
        {stage.pixels.flat().map((colorIdx, i) => {
          if (colorIdx === 0) {
            return <div key={i} style={{ width: config.pixelSize, height: config.pixelSize }} />;
          }
          const color = stage.palette[colorIdx] || '#FF00FF';
          return (
            <motion.div
              key={i}
              style={{
                width: config.pixelSize,
                height: config.pixelSize,
                backgroundColor: color,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: (i % (stage.pixels[0]?.length || 11)) * 0.01 + Math.floor(i / (stage.pixels[0]?.length || 11)) * 0.02,
                duration: 0.15,
              }}
            />
          );
        })}
      </div>

      {/* Floating particles for legendary */}
      {isLegendary && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: i === 0 ? '#FFD700' : i === 1 ? '#FF00FF' : '#00FFFF',
                left: `${20 + i * 30}%`,
                bottom: '20%',
              }}
              animate={{
                y: [-20, -50, -20],
                opacity: [0, 1, 0],
                x: [0, (i - 1) * 10, 0],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.7,
              }}
            />
          ))}
        </>
      )}

      {/* Idle breathing animation */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ pointerEvents: 'none' }}
      />
    </motion.div>
  );
};
