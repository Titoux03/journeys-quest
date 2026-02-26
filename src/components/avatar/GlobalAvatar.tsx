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
  PIXEL_ITEMS,
  PREMIUM_PIXEL_ITEMS,
  SLOT_META,
  getEvolutionStage,
  PixelItemOverlay,
} from './AvatarEngine';

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

  const allPixelItems = useMemo(() => [...PIXEL_ITEMS, ...PREMIUM_PIXEL_ITEMS], []);

  // Build equipped overlays from ALL slots
  const equippedOverlays: PixelItemOverlay[] = useMemo(() => {
    const overlays: PixelItemOverlay[] = [];
    for (const s of SLOT_META) {
      const item = getEquippedForSlot(s.id);
      if (!item) continue;
      const overlayKey = (item.pixel_art_data as any)?.overlay_key as string | undefined;
      if (!overlayKey) continue;
      const pixelItem = allPixelItems.find(p => p.key === overlayKey);
      if (pixelItem) overlays.push(pixelItem);
    }
    return overlays;
  }, [getEquippedForSlot, allPixelItems]);

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
