import React from 'react';
import { motion } from 'framer-motion';
import { useAvatar, getRarityColor } from '@/hooks/useAvatar';
import { useAuth } from '@/hooks/useAuth';

interface PixelAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

const SLOT_ORDER = ['background', 'aura', 'body', 'outfit', 'cape', 'head', 'face', 'weapon', 'pet'] as const;

const SLOT_POSITIONS: Record<string, { x: number; y: number; scale: number }> = {
  background: { x: 50, y: 50, scale: 2.5 },
  aura: { x: 50, y: 45, scale: 1.8 },
  body: { x: 50, y: 50, scale: 1.2 },
  outfit: { x: 50, y: 55, scale: 1.1 },
  cape: { x: 30, y: 45, scale: 0.9 },
  head: { x: 50, y: 20, scale: 1.0 },
  face: { x: 50, y: 35, scale: 0.8 },
  weapon: { x: 75, y: 55, scale: 0.9 },
  pet: { x: 78, y: 78, scale: 0.8 },
};

const SIZE_MAP = {
  sm: { container: 'w-20 h-20', emoji: 'text-lg', aura: 'text-2xl' },
  md: { container: 'w-36 h-36', emoji: 'text-2xl', aura: 'text-4xl' },
  lg: { container: 'w-52 h-52', emoji: 'text-4xl', aura: 'text-6xl' },
};

export const PixelAvatar: React.FC<PixelAvatarProps> = ({ size = 'md', onClick, className = '' }) => {
  const { user } = useAuth();
  const { getEquippedForSlot, loading } = useAvatar(user?.id);

  const sizeConfig = SIZE_MAP[size];

  const equippedSlots = SLOT_ORDER.map(slot => ({
    slot,
    item: getEquippedForSlot(slot),
    position: SLOT_POSITIONS[slot],
  })).filter(s => s.item);

  // Default avatar when nothing equipped
  const hasBody = equippedSlots.some(s => s.slot === 'body');

  return (
    <motion.div
      className={`relative ${sizeConfig.container} rounded-2xl overflow-hidden cursor-pointer group ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: 'linear-gradient(145deg, hsl(220 45% 8%), hsl(220 40% 12%))',
        border: '2px solid hsl(45 100% 65% / 0.3)',
        boxShadow: '0 0 30px hsl(45 100% 65% / 0.15)',
      }}
    >
      {/* Pixel grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(hsl(220 20% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(220 20% 50% / 0.3) 1px, transparent 1px)',
        backgroundSize: size === 'lg' ? '8px 8px' : size === 'md' ? '6px 6px' : '4px 4px',
      }} />

      {/* Equipped items layered */}
      {equippedSlots.map(({ slot, item, position }) => (
        <motion.div
          key={slot}
          className="absolute flex items-center justify-center"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: `translate(-50%, -50%) scale(${position.scale})`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: position.scale }}
          transition={{ delay: SLOT_ORDER.indexOf(slot as any) * 0.05 }}
        >
          <span className={slot === 'aura' ? sizeConfig.aura : sizeConfig.emoji}>
            {item?.preview_emoji}
          </span>
        </motion.div>
      ))}

      {/* Default body if nothing equipped */}
      {!hasBody && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={sizeConfig.emoji}>🧍</span>
        </div>
      )}

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

      {/* Rarity glow for legendary items */}
      {equippedSlots.some(s => s.item?.rarity === 'legendary') && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ boxShadow: '0 0 20px hsl(45 100% 65% / 0.4)' }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
