/**
 * AvatarCustomizer - Dual-space: Identity (calm) + Equipment (gamified)
 * Ultra-dopamine AAA mobile-first design
 * 100% pixel art, no emojis
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Lock, Sparkles, Package, Star, Gift, Check, Crown, TrendingUp, Zap, Eye, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLevel } from '@/hooks/useLevel';
import { usePremium } from '@/hooks/usePremium';
import { useAvatar, AvatarItem, getRarityColor, getRarityLabel } from '@/hooks/useAvatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { playSound } from '@/utils/soundManager';
import { AvatarRenderer, PixelIcon } from './AvatarRenderer';
import { ChestOpenerPixel } from './ChestOpenerPixel';
import { Progress } from '@/components/ui/progress';
import {
  AvatarConfig,
  AvatarGender,
  DEFAULT_AVATAR_CONFIG,
  SKIN_PALETTES,
  EYE_PALETTES,
  CLOTHING_PALETTES,
  SHOES_PALETTES,
  HAIR_PALETTES,
  PIXEL_ITEMS,
  PREMIUM_PIXEL_ITEMS,
  PREMIUM_CLOTHING_PALETTES,
  PREMIUM_EYE_PALETTES,
  SLOT_META,
  RARITY_COLORS,
  RARITY_LABELS,
  RARITY_GRADIENTS,
  PixelItemOverlay,
  getNextUnlock,
  getEvolutionStage,
  getHairstylesForGender,
  HairStyle,
} from './AvatarEngine';

interface AvatarCustomizerProps {
  onNavigate: (screen: string) => void;
}

function loadAvatarConfig(): AvatarConfig {
  try {
    const saved = localStorage.getItem('avatar_config');
    if (saved) return { ...DEFAULT_AVATAR_CONFIG, ...JSON.parse(saved) };
  } catch { }
  return DEFAULT_AVATAR_CONFIG;
}

function saveAvatarConfigLocal(config: AvatarConfig) {
  localStorage.setItem('avatar_config', JSON.stringify(config));
  localStorage.setItem('avatar_gender', config.gender);
}

// Legendary quests data
const LEGENDARY_QUESTS = [
  {
    id: 'quest_streak_30',
    title: '🔥 Flamme Éternelle',
    description: 'Maintiens un streak de 30 jours',
    targetValue: 30,
    type: 'streak',
    rewardName: 'Aura Légendaire',
    rewardRarity: 'legendary' as const,
  },
  {
    id: 'quest_todos_100',
    title: '⚡ Maître des Tâches',
    description: 'Complète 100 tâches au total',
    targetValue: 100,
    type: 'todos',
    rewardName: 'Épée Mythique',
    rewardRarity: 'legendary' as const,
  },
  {
    id: 'quest_meditate_50',
    title: '🧘 Sage Ultime',
    description: 'Médite 50 fois',
    targetValue: 50,
    type: 'meditation',
    rewardName: 'Cape Astrale',
    rewardRarity: 'legendary' as const,
  },
  {
    id: 'quest_journal_20',
    title: '📖 Chroniqueur',
    description: 'Écris 20 entrées de journal',
    targetValue: 20,
    type: 'journal',
    rewardName: 'Couronne du Sage',
    rewardRarity: 'epic' as const,
  },
  {
    id: 'quest_level_50',
    title: '👑 Ascension',
    description: 'Atteins le niveau 50',
    targetValue: 50,
    type: 'level',
    rewardName: 'Armure Dorée',
    rewardRarity: 'legendary' as const,
  },
];

// Weekly chest helpers
function getWeeklyChestInfo(): { canClaim: boolean; nextClaimDate: string; daysLeft: number } {
  const lastClaim = localStorage.getItem('weekly_chest_last_claim');
  const now = new Date();
  if (!lastClaim) return { canClaim: true, nextClaimDate: '', daysLeft: 0 };

  const lastDate = new Date(lastClaim);
  const diffMs = now.getTime() - lastDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays >= 7) return { canClaim: true, nextClaimDate: '', daysLeft: 0 };

  const nextDate = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const daysLeft = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { canClaim: false, nextClaimDate: nextDate.toLocaleDateString('fr-FR'), daysLeft };
}

function getQuestProgress(questId: string): number {
  try {
    const data = localStorage.getItem(`quest_progress_${questId}`);
    return data ? parseInt(data, 10) : 0;
  } catch { return 0; }
}

function isQuestCompleted(questId: string): boolean {
  return localStorage.getItem(`quest_completed_${questId}`) === 'true';
}

type MainSpace = 'identity' | 'equipment';

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { isPremium, showUpgradeModal } = usePremium();
  const { levelData } = useLevel(user?.id);
  const { toast } = useToast();
  const {
    allItems,
    chests,
    quests,
    questProgress,
    loading,
    equipItem,
    unequipSlot,
    openChest,
    getEquippedForSlot,
    getOwnedItemsForSlot,
    getLockedItemsForSlot,
  } = useAvatar(user?.id);

  const [config, setConfig] = useState<AvatarConfig>(loadAvatarConfig);
  const [mainSpace, setMainSpace] = useState<MainSpace>('identity');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [openingChest, setOpeningChest] = useState<string | null>(null);
  const [chestReward, setChestReward] = useState<AvatarItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [colorCategory, setColorCategory] = useState<'skin' | 'eyes' | 'hair' | 'hairstyle'>('skin');
  const [equipmentTab, setEquipmentTab] = useState<'items' | 'quests' | 'chests'>('items');
  const [previewingItem, setPreviewingItem] = useState<string | null>(null);
  const [showSparkle, setShowSparkle] = useState(false);
  const [weeklyChest, setWeeklyChest] = useState(getWeeklyChestInfo);

  useEffect(() => {
    saveAvatarConfigLocal(config);
  }, [config]);

  const updateConfig = useCallback((partial: Partial<AvatarConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
    setSaved(false);
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ avatar_url: JSON.stringify(config) })
        .eq('user_id', user.id);
      saveAvatarConfigLocal(config);
      setSaved(true);
      toast({ title: 'Ton avatar est prêt ✨', duration: 2000 });
      playSound('click');
    } catch {
      toast({ title: 'Erreur de sauvegarde', variant: 'destructive', duration: 2000 });
    } finally {
      setSaving(false);
    }
  };

  const allPixelItems = useMemo(() => [...PIXEL_ITEMS, ...PREMIUM_PIXEL_ITEMS], []);

  // Build equipped overlays — supports MULTIPLE items simultaneously
  const equippedOverlays: PixelItemOverlay[] = useMemo(() => {
    const overlays: PixelItemOverlay[] = [];

    // Collect ALL equipped items across ALL slots
    for (const s of SLOT_META) {
      const item = getEquippedForSlot(s.id);
      if (!item) continue;
      const overlayKey = (item.pixel_art_data as any)?.overlay_key as string | undefined;
      if (!overlayKey) continue;
      const pixelItem = allPixelItems.find(p => p.key === overlayKey);
      if (pixelItem) overlays.push(pixelItem);
    }

    // Single item preview — replaces slot but keeps others
    if (previewingItem) {
      const previewDbItem = allItems.find(i => i.id === previewingItem);
      const previewKey = previewDbItem ? (previewDbItem.pixel_art_data as any)?.overlay_key : previewingItem;
      const previewPixel = allPixelItems.find(p => p.key === previewKey);
      if (previewPixel) {
        const filtered = overlays.filter(o => o.slot !== previewPixel.slot);
        filtered.push(previewPixel);
        return filtered;
      }
    }

    return overlays;
  }, [getEquippedForSlot, previewingItem, allItems, allPixelItems]);

  const getLocalItemsForSlot = useCallback((slot: string) => {
    return allPixelItems.filter(p => p.slot === slot);
  }, [allPixelItems]);

  const handleOpenChest = async (chestId: string) => {
    setOpeningChest(chestId);
    const reward = await openChest(chestId);
    if (reward) setChestReward(reward);
  };

  const handleClaimWeeklyChest = async () => {
    if (!user || !weeklyChest.canClaim) return;
    // Grant a random epic chest
    await supabase.from('user_chests' as any).insert({
      user_id: user.id,
      rarity: 'epic',
      source: 'weekly',
    });
    localStorage.setItem('weekly_chest_last_claim', new Date().toISOString());
    setWeeklyChest(getWeeklyChestInfo());
    toast({ title: '🎁 Coffre hebdomadaire récupéré !', description: 'Un coffre Épique a été ajouté !', duration: 3000 });
    playSound('chest_open');
  };

  const level = levelData?.level || 1;
  const nextUnlock = useMemo(() => getNextUnlock(level), [level]);
  const evolution = useMemo(() => getEvolutionStage(level), [level]);

  const collectionCount = SLOT_META.reduce((sum, s) => sum + getOwnedItemsForSlot(s.id).length, 0);
  const totalItems = allItems.length;
  const collectionPct = totalItems > 0 ? Math.round((collectionCount / totalItems) * 100) : 0;

  if (!user) {
    return (
      <div className="min-h-screen p-4 pb-24 flex flex-col items-center justify-center text-center">
        <AvatarRenderer config={DEFAULT_AVATAR_CONFIG} size="xl" />
        <h2 className="text-xl font-bold mb-2 mt-6">Connecte-toi pour débloquer ton personnage</h2>
        <p className="text-muted-foreground text-sm">Fais-le évoluer en accomplissant tes objectifs !</p>
      </div>
    );
  }

  // Color palette component
  const ColorPalette: React.FC<{
    palettes: { main?: string; shadow?: string; color?: string; label: string; levelRequired?: number; rarity?: string }[];
    selectedIndex: number;
    onSelect: (i: number) => void;
    colorKey?: 'main' | 'color';
    premiumPalettes?: { main?: string; color?: string; label: string }[];
  }> = ({ palettes, selectedIndex, onSelect, colorKey = 'main', premiumPalettes }) => (
    <div>
      <div className="flex flex-wrap gap-2.5 justify-center">
        {palettes.map((p, i) => {
          const c = colorKey === 'color' ? (p as any).color : (p as any).main;
          const isSelected = selectedIndex === i;
          const isLocked = (p.levelRequired || 0) > level;
          const rarity = (p as any).rarity;
          return (
            <motion.button
              key={i}
              onClick={() => {
                if (isLocked) { toast({ title: `Nv. ${p.levelRequired} requis`, duration: 2000 }); return; }
                onSelect(i);
                playSound('click');
              }}
              className={`relative rounded-full border-2 transition-all ${
                isSelected ? 'border-primary scale-110 ring-2 ring-primary/30' :
                isLocked ? 'border-border/20 opacity-40' :
                'border-border/30 hover:border-primary/40'
              }`}
              style={{ width: 36, height: 36 }}
              whileTap={isLocked ? undefined : { scale: 0.9 }}
            >
              <div className="w-full h-full rounded-full" style={{ backgroundColor: c }} />
              {isSelected && (
                <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-3.5 h-3.5 text-white drop-shadow-lg" />
                </motion.div>
              )}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
              {rarity && rarity !== 'common' && !isLocked && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_COLORS[rarity] || RARITY_COLORS.common }} />
              )}
            </motion.button>
          );
        })}
      </div>
      {premiumPalettes && premiumPalettes.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-3 h-3 text-[#FF2D78]" />
            <span className="text-[10px] font-bold text-[#FF2D78]">Premium</span>
            <div className="flex-1 h-px bg-[#FF2D78]/20" />
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {premiumPalettes.map((p, i) => {
              const c = colorKey === 'color' ? (p as any).color : (p as any).main;
              return (
                <motion.button
                  key={`prem-${i}`}
                  onClick={() => {
                    if (!isPremium) { showUpgradeModal(); return; }
                    toast({ title: 'Couleur Premium équipée !', duration: 2000 });
                  }}
                  className={`relative rounded-full border-2 transition-all ${
                    isPremium ? 'border-[#FF2D78]/40 hover:border-[#FF2D78]' : 'border-border/20 opacity-50'
                  }`}
                  style={{ width: 36, height: 36 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-full h-full rounded-full" style={{ backgroundColor: c }} />
                  {!isPremium && (
                    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px] rounded-full">
                      <Lock className="w-3 h-3 text-[#FF2D78]" />
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FF2D78]" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Hairstyle selector
  const HairstyleSelector: React.FC<{
    gender: AvatarGender;
    selectedIndex: number;
    level: number;
    onSelect: (i: number) => void;
    config: AvatarConfig;
  }> = ({ gender, selectedIndex, level: currentLevel, onSelect, config: currentConfig }) => {
    const hairstyles = getHairstylesForGender(gender);
    const unlockedCount = hairstyles.filter(h => h.levelRequired <= currentLevel).length;
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-muted-foreground">{unlockedCount}/{hairstyles.length} débloquées</span>
          <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(unlockedCount / hairstyles.length) * 100}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {hairstyles.map((style, i) => {
            const isSelected = selectedIndex === i;
            const isLocked = style.levelRequired > currentLevel;
            const previewConfig = { ...currentConfig, hairStyleIndex: i };
            return (
              <motion.button
                key={style.key}
                onClick={() => {
                  if (isLocked) { toast({ title: `Nv. ${style.levelRequired} requis`, duration: 2000 }); return; }
                  onSelect(i);
                  playSound('click');
                }}
                className={`relative p-1.5 rounded-xl border text-center transition-all ${
                  isSelected ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : isLocked ? 'border-border/10 bg-card/30 opacity-60'
                  : 'border-border/20 bg-card hover:border-primary/30'
                }`}
                whileTap={isLocked ? undefined : { scale: 0.95 }}
              >
                <div className="flex justify-center mb-1">
                  <AvatarRenderer config={previewConfig} size="xs" animate={false} />
                </div>
                <div className="text-[9px] font-medium truncate text-center">{style.nameFr}</div>
                {style.rarity !== 'common' && (
                  <div className="text-[8px] font-bold text-center" style={{ color: RARITY_COLORS[style.rarity] }}>
                    {RARITY_LABELS[style.rarity] || style.rarity}
                  </div>
                )}
                {isLocked && (
                  <div className="absolute top-1 right-1">
                    <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                  </div>
                )}
                {isSelected && <div className="text-[8px] text-primary font-bold text-center">✓</div>}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-card border border-border/30">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold">Mon Personnage</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              saved ? 'bg-green-500/20 border-green-400/40 text-green-300' : 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
            }`}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? '...' : saved ? 'Sauvé' : 'Sauver'}
          </button>
        </div>
      </div>

      {/* Avatar Preview */}
      <div className="px-4 pt-4">
        <motion.div
          className="relative rounded-2xl overflow-hidden mb-4"
          style={{ background: 'linear-gradient(145deg, hsl(220 50% 6%), hsl(220 45% 10%))', border: '1px solid hsl(45 100% 65% / 0.15)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-b ${evolution.color} opacity-10`} />
          <div className="relative p-4 flex flex-col items-center gap-3">
            <AvatarRenderer
              config={config}
              equippedOverlays={equippedOverlays}
              size="lg"
              showGlow={level >= 50}
              glowColor={evolution.glowColor}
              showSparkle={showSparkle}
            />

            {/* Equipped items list below avatar */}
            {equippedOverlays.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {equippedOverlays.map(o => (
                  <div key={o.key} className="flex items-center gap-1 bg-card/60 border border-border/20 rounded-lg px-2 py-1">
                    <PixelIcon pixels={o.pixels.slice(0, 3)} palette={o.palette} pixelSize={2} />
                    <span className="text-[9px] font-medium truncate max-w-[60px]">{o.nameFr}</span>
                  </div>
                ))}
              </div>
            )}

            {previewingItem && (
              <motion.p
                className="text-[10px] text-primary font-medium text-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                👁 Mode aperçu
              </motion.p>
            )}

            {/* Gender + Level */}
            <div className="flex items-center gap-2">
              {(['male', 'female'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => updateConfig({ gender: g })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    config.gender === g
                      ? g === 'male' ? 'bg-blue-500/20 border-blue-400/40 text-blue-300' : 'bg-pink-500/20 border-pink-400/40 text-pink-300'
                      : 'bg-card/50 border-border/20 text-muted-foreground'
                  }`}
                >
                  {g === 'male' ? '♂' : '♀'}
                </button>
              ))}
              <motion.div
                className={`bg-gradient-to-r ${evolution.color} text-white px-3 py-1 rounded-full text-[10px] font-bold`}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {evolution.name} · Nv. {level}
              </motion.div>
            </div>

            {/* XP Bar */}
            <div className="w-full max-w-xs space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">XP</span>
                <span className="font-mono font-bold">{levelData?.xp || 0}/{levelData?.xpForNextLevel || 50}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${evolution.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${levelData?.progressPercentage || 0}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Collection stat */}
            <div className="flex gap-4 text-center">
              <div className="text-[10px]"><span className="font-bold">{collectionPct}%</span> <span className="text-muted-foreground">Collection</span></div>
              {chests.length > 0 && (
                <div className="text-[10px]"><span className="font-bold text-primary">{chests.length}</span> <span className="text-muted-foreground">Coffres</span></div>
              )}
            </div>
          </div>

          {/* Next unlock teaser */}
          {nextUnlock && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card/60 border border-primary/15">
                <div className="flex-shrink-0 opacity-70">
                  <PixelIcon pixels={nextUnlock.item.pixels.slice(0, 4)} palette={nextUnlock.item.palette} pixelSize={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-muted-foreground">Prochain déblocage</div>
                  <div className="text-[11px] font-bold truncate">{nextUnlock.item.nameFr}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Progress value={Math.min(100, (level / nextUnlock.level) * 100)} className="h-1 w-12" />
                  <span className="text-[9px] font-mono" style={{ color: RARITY_COLORS[nextUnlock.item.rarity] }}>Nv.{nextUnlock.level}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* DUAL SPACE SELECTOR */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMainSpace('identity')}
            className={`relative p-3 rounded-xl border text-center transition-all ${
              mainSpace === 'identity'
                ? 'bg-card border-primary/40 shadow-lg shadow-primary/10'
                : 'bg-card/50 border-border/20 hover:border-border/40'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">Identité</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Genre, couleurs, coiffure</p>
            {mainSpace === 'identity' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-t-full" />}
          </button>
          <button
            onClick={() => setMainSpace('equipment')}
            className={`relative p-3 rounded-xl border text-center transition-all ${
              mainSpace === 'equipment'
                ? 'bg-gradient-to-br from-card to-primary/5 border-primary/40 shadow-lg shadow-primary/10'
                : 'bg-card/50 border-border/20 hover:border-border/40'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">Équipement</span>
              {chests.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full font-bold">{chests.length}</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Items, quêtes, coffres</p>
            {mainSpace === 'equipment' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-t-full" />}
          </button>
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* SPACE A: IDENTITY */}
          {mainSpace === 'identity' && (
            <motion.div key="identity" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {([
                  { id: 'skin' as const, label: 'Peau' },
                  { id: 'eyes' as const, label: 'Yeux' },
                  { id: 'hair' as const, label: 'Cheveux' },
                  { id: 'hairstyle' as const, label: 'Coiffure' },
                ]).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setColorCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border whitespace-nowrap ${
                      colorCategory === cat.id ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-card border-border/20 text-muted-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/20">
                <h3 className="text-sm font-bold mb-3 text-center">
                  {colorCategory === 'skin' ? 'Couleur de peau' :
                   colorCategory === 'eyes' ? 'Couleur des yeux' :
                   colorCategory === 'hair' ? 'Couleur des cheveux' :
                   'Coiffure'}
                </h3>
                {colorCategory === 'skin' && (
                  <ColorPalette palettes={SKIN_PALETTES} selectedIndex={config.skinIndex} onSelect={i => updateConfig({ skinIndex: i })} />
                )}
                {colorCategory === 'eyes' && (
                  <ColorPalette palettes={EYE_PALETTES} selectedIndex={config.eyeIndex} onSelect={i => updateConfig({ eyeIndex: i })} colorKey="color" premiumPalettes={PREMIUM_EYE_PALETTES} />
                )}
                {colorCategory === 'hair' && (
                  <ColorPalette palettes={HAIR_PALETTES} selectedIndex={config.hairIndex} onSelect={i => updateConfig({ hairIndex: i })} />
                )}
                {colorCategory === 'hairstyle' && (
                  <HairstyleSelector gender={config.gender} selectedIndex={config.hairStyleIndex} level={level} onSelect={i => updateConfig({ hairStyleIndex: i })} config={config} />
                )}
              </div>
            </motion.div>
          )}

          {/* SPACE B: EQUIPMENT */}
          {mainSpace === 'equipment' && (
            <motion.div key="equipment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Sub-tabs — NO AI tab */}
              <div className="flex gap-1 mb-4 bg-card rounded-xl p-1 border border-border/20">
                {([
                  { id: 'items' as const, label: 'Items' },
                  { id: 'quests' as const, label: 'Quêtes' },
                  { id: 'chests' as const, label: 'Coffres', badge: chests.length },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setEquipmentTab(tab.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all text-center ${
                      equipmentTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    {'badge' in tab && tab.badge ? (
                      <span className="ml-1 bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded-full text-[9px]">{tab.badge}</span>
                    ) : null}
                  </button>
                ))}
              </div>

              {/* ITEMS TAB */}
              {equipmentTab === 'items' && (
                <div>
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
                    {SLOT_META.map(slot => {
                      const equipped = getEquippedForSlot(slot.id);
                      const isSelected = selectedSlot === slot.id;
                      const ownedCount = getOwnedItemsForSlot(slot.id).length;
                      const totalCount = allItems.filter(i => i.slot === slot.id).length;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(isSelected ? null : slot.id)}
                          className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border relative ${
                            isSelected ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                            : equipped ? 'bg-card border-primary/30 text-foreground'
                            : 'bg-card border-border/20 text-muted-foreground'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <PixelIcon pixels={slot.iconPixels} palette={slot.iconPalette} pixelSize={3} />
                            <span className="text-center">{slot.label}</span>
                            <span className="text-[9px] opacity-60 text-center">{ownedCount}/{totalCount}</span>
                            <div className="w-full h-0.5 bg-border/20 rounded-full mt-0.5">
                              <div className="h-full bg-primary rounded-full" style={{ width: totalCount > 0 ? `${(ownedCount / totalCount) * 100}%` : '0%' }} />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Collection counter */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-[10px] text-muted-foreground">{collectionCount}/{totalItems} items</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${collectionPct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-primary">{collectionPct}%</span>
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedSlot && (
                      <motion.div key={selectedSlot} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        {getEquippedForSlot(selectedSlot) && (
                          <button onClick={() => unequipSlot(selectedSlot)} className="w-full p-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium text-center">
                            Retirer l'item équipé
                          </button>
                        )}

                        {/* Owned items */}
                        <div className="grid grid-cols-3 gap-2">
                          {getOwnedItemsForSlot(selectedSlot).map(item => {
                            const isEquipped = getEquippedForSlot(selectedSlot)?.id === item.id;
                            const overlayKey = (item.pixel_art_data as any)?.overlay_key;
                            const pixelItem = overlayKey ? allPixelItems.find(p => p.key === overlayKey) : null;
                            return (
                              <motion.button
                                key={item.id}
                                onClick={() => { if (!isEquipped) { equipItem(item.id, selectedSlot); playSound('equip_item'); setShowSparkle(true); setTimeout(() => setShowSparkle(false), 700); } }}
                                className={`p-2.5 rounded-xl border text-center transition-all ${
                                  isEquipped ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                  : 'border-border/20 bg-card hover:border-primary/30'
                                }`}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                              >
                                <div className="flex justify-center mb-1">
                                  {pixelItem ? <PixelIcon pixels={pixelItem.pixels.slice(0, 5)} palette={pixelItem.palette} pixelSize={3} /> : <div className="w-8 h-8 bg-secondary rounded" />}
                                </div>
                                <div className="text-[10px] font-medium truncate text-center">{item.name_fr}</div>
                                <div className="text-[9px] font-bold text-center" style={{ color: RARITY_COLORS[item.rarity] || RARITY_COLORS.common }}>
                                  {RARITY_LABELS[item.rarity] || 'Commun'}
                                </div>
                                {isEquipped && <div className="text-[9px] text-primary font-bold mt-0.5 text-center">✓ Équipé</div>}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Locked items */}
                        {getLockedItemsForSlot(selectedSlot).length > 0 && (
                          <>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Lock className="w-3 h-3" />
                              <span className="font-medium">Verrouillés ({getLockedItemsForSlot(selectedSlot).length})</span>
                              <div className="flex-1 h-px bg-border/20" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {getLockedItemsForSlot(selectedSlot).map(item => {
                                const overlayKey = (item.pixel_art_data as any)?.overlay_key;
                                const pixelItem = overlayKey ? allPixelItems.find(p => p.key === overlayKey) : null;
                                const isPremiumLocked = item.is_premium && !isPremium;
                                const isPreviewing = previewingItem === item.id || previewingItem === overlayKey;
                                return (
                                  <motion.button
                                    key={item.id}
                                    onClick={() => setPreviewingItem(isPreviewing ? null : (overlayKey || item.id))}
                                    className={`p-2.5 rounded-xl border text-center relative overflow-hidden transition-all ${
                                      isPreviewing ? 'border-primary/40 bg-primary/5 opacity-100'
                                      : 'border-border/10 bg-card/30 opacity-60'
                                    }`}
                                    whileHover={{ scale: 1.03, opacity: 0.85 }}
                                    whileTap={{ scale: 0.96 }}
                                  >
                                    <div className={`flex justify-center mb-1 ${isPremiumLocked && !isPreviewing ? 'blur-[2px]' : ''}`}>
                                      {pixelItem ? <PixelIcon pixels={pixelItem.pixels.slice(0, 5)} palette={pixelItem.palette} pixelSize={3} /> : <div className="w-8 h-8 bg-secondary/50 rounded" />}
                                    </div>
                                    <div className="text-[10px] font-medium text-muted-foreground truncate text-center">{item.name_fr}</div>
                                    <div className="text-[9px] font-bold text-center" style={{ color: RARITY_COLORS[item.rarity] }}>
                                      {RARITY_LABELS[item.rarity] || 'Commun'}
                                    </div>
                                    <div className="text-[8px] text-muted-foreground mt-0.5 text-center">
                                      {isPremiumLocked ? (
                                        <span onClick={(e) => { e.stopPropagation(); showUpgradeModal(); }} className="flex items-center justify-center gap-0.5 text-[#FF2D78] font-bold">
                                          <Crown className="w-2.5 h-2.5" /> Premium
                                        </span>
                                      ) : item.unlock_method === 'level' ? `Nv. ${item.level_required}` : item.unlock_method === 'quest' ? 'Quête' : 'Coffre'}
                                    </div>
                                    {isPreviewing && (
                                      <motion.div
                                        className="text-[8px] text-primary font-bold mt-0.5 text-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                      >
                                        👁 Aperçu
                                      </motion.div>
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!selectedSlot && (
                    <div className="space-y-4">
                      {SLOT_META.map(slot => {
                        const localItems = getLocalItemsForSlot(slot.id);
                        if (localItems.length === 0) return null;
                        const equippedItem = getEquippedForSlot(slot.id);
                        const equippedKey = equippedItem ? (equippedItem.pixel_art_data as any)?.overlay_key : null;
                        return (
                          <div key={slot.id}>
                            <button
                              onClick={() => setSelectedSlot(slot.id)}
                              className="flex items-center gap-2 mb-2 group w-full"
                            >
                              <PixelIcon pixels={slot.iconPixels} palette={slot.iconPalette} pixelSize={3} />
                              <span className="text-xs font-bold">{slot.label}</span>
                              <span className="text-[9px] text-muted-foreground">({localItems.filter(i => i.levelRequired <= level).length}/{localItems.length})</span>
                              <ArrowLeft className="w-3 h-3 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                            </button>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                              {localItems.slice(0, 6).map(pixelItem => {
                                const isUnlocked = pixelItem.levelRequired <= level;
                                const isEquipped = equippedKey === pixelItem.key;
                                const isPreviewing = previewingItem === pixelItem.key;
                                return (
                                  <motion.button
                                    key={pixelItem.key}
                                    onClick={() => setPreviewingItem(isPreviewing ? null : pixelItem.key)}
                                    className={`flex-shrink-0 p-2 rounded-xl border text-center transition-all w-16 ${
                                      isEquipped ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
                                      : isPreviewing ? 'border-primary/40 bg-primary/5'
                                      : isUnlocked ? 'border-border/20 bg-card hover:border-primary/30'
                                      : 'border-border/10 bg-card/30 opacity-50'
                                    }`}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <div className="flex justify-center mb-1">
                                      <PixelIcon pixels={pixelItem.pixels.slice(0, 5)} palette={pixelItem.palette} pixelSize={2} />
                                    </div>
                                    <div className="text-[8px] font-medium truncate text-center">{pixelItem.nameFr}</div>
                                    <div className="text-[7px] text-center" style={{ color: RARITY_COLORS[pixelItem.rarity] }}>
                                      {RARITY_LABELS[pixelItem.rarity]}
                                    </div>
                                    {isEquipped && <div className="text-[7px] text-primary font-bold text-center">✓</div>}
                                    {!isUnlocked && <Lock className="w-2 h-2 mx-auto text-muted-foreground mt-0.5" />}
                                  </motion.button>
                                );
                              })}
                              {localItems.length > 6 && (
                                <button
                                  onClick={() => setSelectedSlot(slot.id)}
                                  className="flex-shrink-0 w-16 p-2 rounded-xl border border-border/10 bg-card/30 flex items-center justify-center text-[10px] text-muted-foreground hover:text-primary transition-colors"
                                >
                                  +{localItems.length - 6}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* QUESTS TAB — with legendary quests */}
              {equipmentTab === 'quests' && (
                <div className="space-y-3">
                  {/* Legendary quests */}
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold">Quêtes Légendaires</span>
                    <div className="flex-1 h-px bg-border/20" />
                  </div>
                  {LEGENDARY_QUESTS.map(quest => {
                    const progress = getQuestProgress(quest.id);
                    const completed = isQuestCompleted(quest.id);
                    const progressPct = Math.min(100, (progress / quest.targetValue) * 100);
                    return (
                      <motion.div
                        key={quest.id}
                        className={`p-3.5 rounded-xl border ${completed ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent'}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${completed ? 'bg-green-500/20' : 'bg-yellow-500/10'}`}>
                            {completed ? <Check className="w-4 h-4 text-green-400" /> : <Star className="w-4 h-4 text-yellow-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">{quest.title}</div>
                            <p className="text-[10px] text-muted-foreground truncate">{quest.description}</p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${completed ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPct}%` }}
                                  transition={{ duration: 0.8 }}
                                />
                              </div>
                              <span className="text-[9px] text-muted-foreground font-mono">{progress}/{quest.targetValue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 ml-12 text-[10px] flex items-center gap-1" style={{ color: RARITY_COLORS[quest.rewardRarity] }}>
                          <Gift className="w-3 h-3" />
                          <span className="truncate">{quest.rewardName}</span>
                          <span className="font-bold">({RARITY_LABELS[quest.rewardRarity]})</span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* DB quests */}
                  {quests.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 mt-4 mb-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold">Quêtes Actives</span>
                        <div className="flex-1 h-px bg-border/20" />
                      </div>
                      {quests.map(quest => {
                        const progress = questProgress.find(p => p.quest_id === quest.id);
                        const progressPct = progress ? Math.min(100, (progress.current_value / quest.target_value) * 100) : 0;
                        const isCompleted = progress?.is_completed;
                        return (
                          <motion.div
                            key={quest.id}
                            className={`p-3.5 rounded-xl border ${isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-border/20 bg-card'}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-green-500/20' : 'bg-primary/10'}`}>
                                {isCompleted ? <Check className="w-4 h-4 text-green-400" /> : <Star className="w-4 h-4 text-primary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs truncate">{quest.title_fr}</div>
                                <p className="text-[10px] text-muted-foreground truncate">{quest.description_fr}</p>
                                <div className="mt-1.5 flex items-center gap-2">
                                  <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                      className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-primary'}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progressPct}%` }}
                                      transition={{ duration: 0.8 }}
                                    />
                                  </div>
                                  <span className="text-[9px] text-muted-foreground font-mono">{progress?.current_value || 0}/{quest.target_value}</span>
                                </div>
                              </div>
                            </div>
                            {quest.reward_chest_rarity && !isCompleted && (
                              <div className="mt-2 ml-12 text-[10px] flex items-center gap-1" style={{ color: RARITY_COLORS[quest.reward_chest_rarity] || RARITY_COLORS.common }}>
                                <Gift className="w-3 h-3" />
                                <span className="truncate">Coffre {RARITY_LABELS[quest.reward_chest_rarity] || 'Commun'}</span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </>
                  )}

                  {quests.length === 0 && LEGENDARY_QUESTS.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">Aucune quête disponible</div>
                  )}
                </div>
              )}

              {/* CHESTS TAB — with weekly chest */}
              {equipmentTab === 'chests' && (
                <div className="space-y-4">
                  {/* Weekly chest */}
                  <motion.div
                    className="p-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 relative overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">Coffre Hebdomadaire</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          Récupère un coffre Épique chaque semaine
                        </div>
                      </div>
                    </div>
                    {weeklyChest.canClaim ? (
                      <motion.button
                        onClick={handleClaimWeeklyChest}
                        className="w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold text-center"
                        whileTap={{ scale: 0.97 }}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🎁 Récupérer le coffre !
                      </motion.button>
                    ) : (
                      <div className="mt-3 py-2 rounded-xl bg-card/60 border border-border/20 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Prochain dans <span className="font-bold text-foreground">{weeklyChest.daysLeft}j</span></span>
                        </div>
                      </div>
                    )}
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 4, repeat: Infinity }} />
                  </motion.div>

                  {/* Premium weekly chest teaser */}
                  {!isPremium && (
                    <motion.button
                      onClick={showUpgradeModal}
                      className="w-full p-4 rounded-xl border border-[#FF2D78]/20 bg-gradient-to-r from-[#FF2D78]/10 to-[#FF2D78]/5 text-center relative overflow-hidden"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FF2D78]/20 flex items-center justify-center">
                          <Crown className="w-5 h-5 text-[#FF2D78]" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#FF2D78] truncate">Coffre Premium</div>
                          <div className="text-[10px] text-muted-foreground truncate">Drop garanti Rare+ chaque semaine</div>
                        </div>
                      </div>
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF2D78]/5 to-transparent pointer-events-none" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 4, repeat: Infinity }} />
                    </motion.button>
                  )}

                  {chests.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {chests.map(chest => (
                        <motion.button
                          key={chest.id}
                          onClick={() => handleOpenChest(chest.id)}
                          className={`p-4 rounded-xl border border-border/20 bg-gradient-to-br ${RARITY_GRADIENTS[chest.rarity] || RARITY_GRADIENTS.common} text-center relative overflow-hidden`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <motion.div className="absolute inset-0 bg-white/10" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity }} />
                          <div className="relative z-10 mb-2 flex justify-center">
                            <PixelIcon
                              pixels={[[0,1,1,1,1,0],[1,2,1,1,2,1],[1,1,3,3,1,1],[1,1,1,1,1,1],[0,1,1,1,1,0]]}
                              palette={['', RARITY_COLORS[chest.rarity] || '#888', '#FFD700', '#FFFFFF']}
                              pixelSize={5}
                            />
                          </div>
                          <div className="text-xs font-bold text-white drop-shadow-lg relative z-10 text-center">{RARITY_LABELS[chest.rarity] || 'Commun'}</div>
                          <div className="text-[9px] text-white/70 mt-1 relative z-10 text-center">Touche pour ouvrir</div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm text-center">Aucun coffre à ouvrir</p>
                      <p className="text-[10px] mt-1 text-center">Monte de niveau pour en gagner !</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chest opener modal */}
      <AnimatePresence>
        {openingChest && (
          <ChestOpenerPixel reward={chestReward} onClose={() => { setOpeningChest(null); setChestReward(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
};
