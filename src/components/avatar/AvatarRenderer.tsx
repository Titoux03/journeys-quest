/**
 * AvatarRenderer - Pure pixel art CSS Grid renderer
 * Renders base sprite + color customization + equipped item overlays
 * Pets render as separate companion sprites beside the character
 * Enhanced with: eye blink, cumulative glow, equip sparkle, ground shadow
 * No emojis - 100% pixel art
 */
import React, { useMemo, useState, useEffect } from 'react';
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
    case 0: return null;
    case 1: return colors.skin;
    case 2: return colors.skinShadow;
    case 3: return colors.clothing;
    case 4: return colors.shoes;
    case 5: return colors.eyes;
    case 6: return colors.hair;
    case 7: return colors.hairShadow;
    case 8: return colors.clothingShadow;
    case 9: return '#FFFFFF';
    case 10: return blendColor(colors.skin, '#CC7777', 0.45);
    case 11: return lightenColor(colors.skin, 0.12);
    default: return null;
  }
}

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

function getEquipTier(count: number): { glowIntensity: number; glowHue: string } | null {
  if (count >= 5) return { glowIntensity: 0.4, glowHue: 'hsl(45 100% 65% / 0.35)' };
  if (count >= 3) return { glowIntensity: 0.25, glowHue: 'hsl(200 80% 60% / 0.2)' };
  if (count >= 1) return { glowIntensity: 0.12, glowHue: 'hsl(220 60% 60% / 0.1)' };
  return null;
}

/** Pad an overlay's pixel array to exactly GRID_ROWS rows of GRID_COLS */
function padOverlay(pixels: number[][]): number[][] {
  const padded: number[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    if (r < pixels.length) {
      const row = pixels[r];
      if (row.length < GRID_COLS) {
        padded.push([...row, ...new Array(GRID_COLS - row.length).fill(0)]);
      } else {
        padded.push(row.slice(0, GRID_COLS));
      }
    } else {
      padded.push(new Array(GRID_COLS).fill(0));
    }
  }
  return padded;
}

/** Extract the bounding box of non-zero pixels from a pet overlay */
function extractPetSprite(overlay: PixelItemOverlay): { pixels: number[][]; cols: number; rows: number } {
  const padded = padOverlay(overlay.pixels);
  
  // Find bounding box of non-zero pixels
  let minR = GRID_ROWS, maxR = 0, minC = GRID_COLS, maxC = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (padded[r][c] !== 0) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }
  
  if (minR > maxR) return { pixels: [[0]], cols: 1, rows: 1 };
  
  // Extract cropped sprite
  const cropped: number[][] = [];
  for (let r = minR; r <= maxR; r++) {
    cropped.push(padded[r].slice(minC, maxC + 1));
  }
  
  return { pixels: cropped, cols: maxC - minC + 1, rows: maxR - minR + 1 };
}

// ── Slot render order (back-to-front) ──
const SLOT_RENDER_ORDER = ['background', 'aura', 'cape', 'outfit', 'head', 'face', 'weapon'];

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

  // Separate pet overlays from character overlays
  const { characterOverlays, petOverlays } = useMemo(() => {
    const chars: PixelItemOverlay[] = [];
    const pets: PixelItemOverlay[] = [];
    for (const o of equippedOverlays) {
      if (o.slot === 'pet') pets.push(o);
      else chars.push(o);
    }
    return { characterOverlays: chars, petOverlays: pets };
  }, [equippedOverlays]);

  // Eye blink
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

  // Merge base sprite with character overlays (NOT pets)
  const mergedPixels = useMemo(() => {
    const result: (string | null)[][] = baseSprite.map(row =>
      row.map(idx => resolveBaseColor(idx, colors))
    );

    // Eye blink
    if (isBlinking) {
      for (let c = 0; c < GRID_COLS; c++) {
        const origIdx = baseSprite[5]?.[c];
        if (origIdx === 5 || origIdx === 9) {
          result[5][c] = colors.skin;
        }
      }
    }

    // Layer character overlays (sorted back-to-front)
    const sorted = [...characterOverlays].sort(
      (a, b) => SLOT_RENDER_ORDER.indexOf(a.slot) - SLOT_RENDER_ORDER.indexOf(b.slot)
    );

    for (const overlay of sorted) {
      const padded = padOverlay(overlay.pixels);
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const idx = padded[r][c];
          if (idx !== 0 && overlay.palette[idx]) {
            result[r][c] = overlay.palette[idx];
          }
        }
      }
    }
    return result;
  }, [baseSprite, colors, characterOverlays, isBlinking]);

  const flat = mergedPixels.flat();

  // Cumulative glow (count all overlays including pets)
  const equipTier = useMemo(() => getEquipTier(equippedOverlays.length), [equippedOverlays.length]);
  const effectiveGlow = showGlow || (equipTier !== null && size !== 'xs');
  const effectiveGlowColor = glowColor || equipTier?.glowHue || 'hsl(45 100% 65% / 0.2)';

  const gridWidth = sizeConfig.pixelSize * GRID_COLS;
  const gridHeight = sizeConfig.pixelSize * GRID_ROWS;

  // Pet companion sprite data
  const petSpriteData = useMemo(() => {
    if (petOverlays.length === 0) return null;
    // Use the first pet overlay
    const pet = petOverlays[0];
    return { ...extractPetSprite(pet), palette: pet.palette, rarity: pet.rarity };
  }, [petOverlays]);

  // Pet pixel size scales with character size but slightly smaller
  const petPixelSize = Math.max(1, Math.floor(sizeConfig.pixelSize * 0.85));

  return (
    <motion.div
      className={`relative cursor-pointer flex items-end justify-center gap-0 ${className}`}
      onClick={onClick}
      whileHover={animate ? { scale: 1.06 } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
    >
      {/* Cumulative glow */}
      {effectiveGlow && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: gridWidth + 20,
            height: gridHeight + 20,
            background: `radial-gradient(circle, ${effectiveGlowColor}, transparent)`,
            filter: `blur(${equipTier && equippedOverlays.length >= 5 ? 10 : 6}px)`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main character pixel grid */}
      <motion.div
        className="relative z-10"
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

      {/* Pet companion - rendered as separate sprite beside character */}
      {petSpriteData && size !== 'xs' && (
        <motion.div
          className="relative z-10"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${petSpriteData.cols}, ${petPixelSize}px)`,
            gridTemplateRows: `repeat(${petSpriteData.rows}, ${petPixelSize}px)`,
            imageRendering: 'pixelated' as any,
            alignSelf: 'flex-end',
            marginLeft: -sizeConfig.pixelSize,
            marginBottom: sizeConfig.pixelSize,
          }}
          animate={animate ? { 
            y: [0, -1, 0, -0.5, 0],
          } : undefined}
          transition={animate ? { 
            duration: 2.5, 
            repeat: Infinity, 
            ease: 'easeInOut',
            delay: 0.5,
          } : undefined}
        >
          {petSpriteData.pixels.flat().map((idx, i) => (
            <div
              key={`pet-${i}`}
              style={{
                width: petPixelSize,
                height: petPixelSize,
                backgroundColor: idx === 0 ? 'transparent' : (petSpriteData.palette[idx] || 'transparent'),
              }}
            />
          ))}
          {/* Pet rarity glow */}
          {(petSpriteData.rarity === 'legendary' || petSpriteData.rarity === 'mythic') && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: petSpriteData.rarity === 'mythic' 
                  ? 'radial-gradient(circle, hsl(340 100% 60% / 0.25), transparent)'
                  : 'radial-gradient(circle, hsl(45 100% 55% / 0.2), transparent)',
                filter: 'blur(3px)',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      )}

      {/* Ground shadow */}
      {size !== 'xs' && size !== 'sm' && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: gridWidth * 0.7,
            height: sizeConfig.pixelSize,
            background: 'radial-gradient(ellipse, hsl(0 0% 0% / 0.12), transparent)',
            borderRadius: '50%',
          }}
        />
      )}

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
                  className="absolute pointer-events-none z-20"
                  style={{
                    width: sizeConfig.pixelSize * 1.5,
                    height: sizeConfig.pixelSize * 1.5,
                    backgroundColor: i % 2 === 0 ? '#FFD700' : '#FFFFFF',
                    borderRadius: '50%',
                    left: '50%',
                    top: '50%',
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
