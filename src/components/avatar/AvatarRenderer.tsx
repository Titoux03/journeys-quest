/**
 * AvatarRenderer - Pure pixel art CSS Grid renderer
 * Renders base sprite + color customization + equipped item overlays
 * No emojis - 100% pixel art
 */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AvatarConfig,
  AvatarColors,
  getAvatarColors,
  getBaseSprite,
  GRID_COLS,
  GRID_ROWS,
  PixelItemOverlay,
} from './AvatarEngine';

interface AvatarRendererProps {
  config: AvatarConfig;
  equippedOverlays?: PixelItemOverlay[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  animate?: boolean;
  showGlow?: boolean;
  glowColor?: string;
}

const SIZE_CONFIG = {
  xs: { pixelSize: 2, className: 'w-8 h-10' },
  sm: { pixelSize: 3, className: 'w-12 h-14' },
  md: { pixelSize: 5, className: 'w-20 h-24' },
  lg: { pixelSize: 7, className: 'w-28 h-32' },
  xl: { pixelSize: 9, className: 'w-36 h-44' },
};

// Map color indices from base sprite to actual colors
function resolveBaseColor(idx: number, colors: AvatarColors): string | null {
  switch (idx) {
    case 0: return null; // transparent
    case 1: return colors.skin;
    case 2: return colors.skinShadow;
    case 3: return colors.clothing;
    case 4: return colors.shoes;
    case 5: return colors.eyes;
    case 6: return colors.hair;
    case 7: return colors.hairShadow;
    case 8: return colors.clothingShadow;
    case 9: return '#FFFFFF'; // highlight
    default: return null;
  }
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  config,
  equippedOverlays = [],
  size = 'md',
  onClick,
  className = '',
  animate = true,
  showGlow = false,
  glowColor,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const colors = useMemo(() => getAvatarColors(config), [config]);
  const baseSprite = useMemo(() => getBaseSprite(config.gender), [config.gender]);

  // Merge base sprite with equipped overlays
  const mergedPixels = useMemo(() => {
    const result: (string | null)[][] = baseSprite.map(row =>
      row.map(idx => resolveBaseColor(idx, colors))
    );

    // Layer overlays (background first, then foreground)
    const slotOrder = ['background', 'aura', 'cape', 'outfit', 'head', 'face', 'weapon', 'pet'];
    const sorted = [...equippedOverlays].sort(
      (a, b) => slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot)
    );

    for (const overlay of sorted) {
      for (let r = 0; r < Math.min(overlay.pixels.length, GRID_ROWS); r++) {
        for (let c = 0; c < Math.min(overlay.pixels[r].length, GRID_COLS); c++) {
          const idx = overlay.pixels[r][c];
          if (idx !== 0 && overlay.palette[idx]) {
            result[r][c] = overlay.palette[idx];
          }
        }
      }
    }
    return result;
  }, [baseSprite, colors, equippedOverlays]);

  const flat = mergedPixels.flat();

  return (
    <motion.div
      className={`relative cursor-pointer flex items-center justify-center ${className}`}
      onClick={onClick}
      whileHover={animate ? { scale: 1.06 } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
    >
      {/* Optional glow */}
      {showGlow && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: sizeConfig.pixelSize * GRID_COLS + 16,
            height: sizeConfig.pixelSize * GRID_ROWS + 16,
            background: `radial-gradient(circle, ${glowColor || 'hsl(45 100% 65% / 0.25)'}, transparent)`,
            filter: 'blur(6px)',
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Pixel grid */}
      <motion.div
        className="relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, ${sizeConfig.pixelSize}px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${sizeConfig.pixelSize}px)`,
          imageRendering: 'pixelated' as any,
        }}
        animate={animate ? { y: [0, -1.5, 0] } : undefined}
        transition={animate ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        {flat.map((color, i) => (
          <div
            key={i}
            style={{
              width: sizeConfig.pixelSize,
              height: sizeConfig.pixelSize,
              backgroundColor: color || 'transparent',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// Small pixel art icon renderer for slot icons
export const PixelIcon: React.FC<{
  pixels: number[][];
  palette: string[];
  pixelSize?: number;
}> = ({ pixels, palette, pixelSize = 4 }) => {
  const cols = pixels[0]?.length || 0;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
        imageRendering: 'pixelated' as any,
      }}
    >
      {pixels.flat().map((idx, i) => (
        <div
          key={i}
          style={{
            width: pixelSize,
            height: pixelSize,
            backgroundColor: idx === 0 ? 'transparent' : (palette[idx] || 'transparent'),
          }}
        />
      ))}
    </div>
  );
};
