/**
 * AvatarRenderer - Pure pixel art CSS Grid renderer
 * Renders base sprite + color customization + equipped item overlays
 * Enhanced with: eye blink, cumulative glow, equip sparkle
 * No emojis - 100% pixel art
 */
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AvatarConfig,
  AvatarColors,
  getAvatarColors,
  getBaseSprite,
  getHairStyleSprite,
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
  /** Show sparkle burst (e.g. after equipping item) */
  showSparkle?: boolean;
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
    case 9: return '#FFFFFF'; // eye sparkle highlight
    case 10: return blendColor(colors.skin, '#CC7777', 0.45); // mouth/lip
    case 11: return lightenColor(colors.skin, 0.12); // skin highlight / blush
    default: return null;
  }
}

// Simple color blending helpers
function lightenColor(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, r + 255 * amount)}, ${Math.min(255, g + 255 * amount)}, ${Math.min(255, b + 255 * amount)})`;
}

function blendColor(hex1: string, hex2: string, t: number): string {
  const parse = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const c1 = parse(hex1), c2 = parse(hex2);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(c1[0], c2[0])}, ${mix(c1[1], c2[1])}, ${mix(c1[2], c2[2])})`;
}

// Get cumulative glow tier based on equipped item count
function getEquipTier(count: number): { glowIntensity: number; glowHue: string } | null {
  if (count >= 5) return { glowIntensity: 0.4, glowHue: 'hsl(45 100% 65% / 0.35)' };
  if (count >= 3) return { glowIntensity: 0.25, glowHue: 'hsl(200 80% 60% / 0.2)' };
  if (count >= 1) return { glowIntensity: 0.12, glowHue: 'hsl(220 60% 60% / 0.1)' };
  return null;
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
  showSparkle = false,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const colors = useMemo(() => getAvatarColors(config), [config]);
  const baseSprite = useMemo(() => {
    const base = getBaseSprite(config.gender);
    const hairRows = getHairStyleSprite(config.gender, config.hairStyleIndex ?? 0);
    if (!hairRows) return base;
    return base.map((row, r) => r < hairRows.length ? hairRows[r] : row);
  }, [config.gender, config.hairStyleIndex]);

  // Eye blink state
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    if (!animate || size === 'xs') return;
    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 4000;
      return setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        timerRef.current = scheduleNextBlink();
      }, delay);
    };
    const timerRef: { current: ReturnType<typeof setTimeout> | null } = { current: scheduleNextBlink() };
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [animate, size]);

  // Merge base sprite with equipped overlays
  const mergedPixels = useMemo(() => {
    const result: (string | null)[][] = baseSprite.map(row =>
      row.map(idx => resolveBaseColor(idx, colors))
    );

    // Eye blink: replace eye row pixels with skin color
    if (isBlinking) {
      // Row 5 has eyes (indices 5 and 9)
      for (let c = 0; c < GRID_COLS; c++) {
        const origIdx = baseSprite[5]?.[c];
        if (origIdx === 5 || origIdx === 9) {
          result[5][c] = colors.skin; // close eyes = skin color
        }
      }
    }

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
  }, [baseSprite, colors, equippedOverlays, isBlinking]);

  const flat = mergedPixels.flat();

  // Cumulative equip glow
  const equipTier = useMemo(() => getEquipTier(equippedOverlays.length), [equippedOverlays.length]);
  const effectiveGlow = showGlow || (equipTier !== null && size !== 'xs');
  const effectiveGlowColor = glowColor || equipTier?.glowHue || 'hsl(45 100% 65% / 0.2)';

  const gridWidth = sizeConfig.pixelSize * GRID_COLS;
  const gridHeight = sizeConfig.pixelSize * GRID_ROWS;

  return (
    <motion.div
      className={`relative cursor-pointer flex items-center justify-center ${className}`}
      onClick={onClick}
      whileHover={animate ? { scale: 1.06 } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
    >
      {/* Cumulative glow (grows with items) */}
      {effectiveGlow && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: gridWidth + 20,
            height: gridHeight + 20,
            background: `radial-gradient(circle, ${effectiveGlowColor}, transparent)`,
            filter: `blur(${equipTier && equippedOverlays.length >= 5 ? 10 : 6}px)`,
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
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

      {/* Sparkle effect on equip */}
      <AnimatePresence>
        {showSparkle && size !== 'xs' && (
          <>
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const dist = gridWidth * 0.6;
              return (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    width: sizeConfig.pixelSize * 1.5,
                    height: sizeConfig.pixelSize * 1.5,
                    backgroundColor: i % 2 === 0 ? '#FFD700' : '#FFFFFF',
                    borderRadius: '50%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    opacity: 0,
                    scale: 1.5,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>
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