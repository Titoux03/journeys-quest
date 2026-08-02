/**
 * GlobalAvatar - A unified avatar component that shows the user's 
 * customized character with ALL equipped items, everywhere in the app.
 * Drop-in replacement for any avatar display.
 */
import React, { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLevel } from '@/hooks/useLevel';
import { useAvatar } from '@/hooks/useAvatar';
import { AvatarRenderer } from './AvatarRenderer';
import {
  AvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  SLOT_META,
  getEvolutionStage,
  PixelItemOverlay,
} from './AvatarEngine';
import { EXTENDED_SLOTS } from './ItemCatalog';
import { resolveOverlay } from './resolveOverlay';

/** Tous les emplacements équipables : base + étendus (couvre-chef, dos, décor, familier). */
const ALL_SLOT_IDS = [
  ...SLOT_META.map((s) => s.id),
  ...EXTENDED_SLOTS.map((s) => s.id),
];

interface GlobalAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  animate?: boolean;
  showGlow?: boolean;
}

function loadAvatarConfig(): AvatarConfig {
  try {
    const saved = localStorage.getItem('avatar_config');
    if (saved) return { ...DEFAULT_AVATAR_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_AVATAR_CONFIG;
}

export const GlobalAvatar: React.FC<GlobalAvatarProps> = ({
  size = 'md',
  onClick,
  className = '',
  animate = true,
  showGlow,
}) => {
  const { user } = useAuth();
  const { levelData } = useLevel(user?.id);
  const { getEquippedForSlot } = useAvatar(user?.id);

  const config = useMemo(() => loadAvatarConfig(), []);
  const level = levelData?.level || 1;
  const evolution = useMemo(() => getEvolutionStage(level), [level]);

  // Build equipped overlays from ALL slots (base + emplacements étendus)
  const equippedOverlays: PixelItemOverlay[] = useMemo(() => {
    const overlays: PixelItemOverlay[] = [];
    for (const slotId of ALL_SLOT_IDS) {
      const item = getEquippedForSlot(slotId);
      if (!item) continue;
      // resolveOverlay gère les items dont `pixel_art_data.overlay_key` n'est pas renseigné
      const pixelItem = resolveOverlay(item as any);
      if (pixelItem) overlays.push(pixelItem);
    }
    return overlays;
  }, [getEquippedForSlot]);

  const autoGlow = showGlow ?? level >= 50;

  return (
    <AvatarRenderer
      config={config}
      equippedOverlays={equippedOverlays}
      size={size}
      onClick={onClick}
      className={className}
      animate={animate}
      showGlow={autoGlow}
      glowColor={evolution.glowColor}
    />
  );
};
