/**
 * AvatarCustomizer - Dual-space: Identity (calm) + Equipment (gamified)
 * Ultra-dopamine AAA mobile-first design
 * 100% pixel art, no emojis
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Lock, Sparkles, Package, Star, Gift, Check, Crown, TrendingUp, Zap, Eye } from 'lucide-react';
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
  const [colorCategory, setColorCategory] = useState<'skin' | 'eyes' | 'hair' | 'clothing' | 'shoes'>('skin');
  const [equipmentTab, setEquipmentTab] = useState<'items' | 'quests' | 'chests'>('items');

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

  const equippedOverlays: PixelItemOverlay[] = SLOT_META.map(s => {
    const item = getEquippedForSlot(s.id);
    if (!item) return null;
    const overlayKey = (item.pixel_art_data as any)?.overlay_key as string | undefined;
    if (!overlayKey) return null;
    return [...PIXEL_ITEMS, ...PREMIUM_PIXEL_ITEMS].find(p => p.key === overlayKey) || null;
  }).filter(Boolean) as PixelItemOverlay[];

  const handleOpenChest = async (chestId: string) => {
    setOpeningChest(chestId);
    const reward = await openChest(chestId);
    if (reward) setChestReward(reward);
  };

  const level = levelData?.level || 1;
  const nextUnlock = useMemo(() => getNextUnlock(level), [level]);
  const evolution = useMemo(() => getEvolutionStage(level), [level]);

  const collectionCount = SLOT_META.reduce((sum, s) => sum + getOwnedItemsForSlot(s.id).length, 0);
  const totalItems = allItems.length;
  const collectionPct = totalItems > 0 ? Math.round((collectionCount / totalItems) * 100) : 0;

  if (!user) {
    return (
      <div className="min-h-screen p-4 pb-24 flex flex-col items-center justify-center">
        <AvatarRenderer config={DEFAULT_AVATAR_CONFIG} size="xl" />
        <h2 className="text-xl font-bold mb-2 mt-6">Connecte-toi pour débloquer ton personnage</h2>
        <p className="text-muted-foreground text-center text-sm">Fais-le évoluer en accomplissant tes objectifs !</p>
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
      <div className="flex flex-wrap gap-2.5">
        {palettes.map((p, i) => {
          const c = colorKey === 'color' ? (p as any).color : (p as any).main;
          const isSelected = selectedIndex === i;
          const isLocked = (p.levelRequired || 0) > level;
          const rarity = (p as any).rarity;
          return (
            <motion.button
              key={i}
              onClick={() => {
                if (isLocked) {
                  toast({ title: `Nv. ${p.levelRequired} requis`, duration: 2000 });
                  return;
                }
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
      {/* Premium exclusive colors */}
      {premiumPalettes && premiumPalettes.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-3 h-3 text-[#FF2D78]" />
            <span className="text-[10px] font-bold text-[#FF2D78]">Premium</span>
            <div className="flex-1 h-px bg-[#FF2D78]/20" />
          </div>
          <div className="flex flex-wrap gap-2.5">
            {premiumPalettes.map((p, i) => {
              const c = colorKey === 'color' ? (p as any).color : (p as any).main;
              return (
                <motion.button
                  key={`prem-${i}`}
                  onClick={() => {
                    if (!isPremium) { showUpgradeModal(); return; }
                    // Premium colors handled separately if needed
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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-card border border-border/30">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
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
            {saving ? '...' : saved ? 'Sauvé' : 'Enregistrer'}
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
          <div className="relative p-4 flex items-center gap-4">
            <AvatarRenderer
              config={config}
              equippedOverlays={equippedOverlays}
              size="lg"
              showGlow={level >= 50}
              glowColor={evolution.glowColor}
            />
            <div className="flex-1 min-w-0">
              {/* Gender Toggle */}
              <div className="flex gap-1.5 mb-2">
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
              </div>
              <motion.div
                className={`bg-gradient-to-r ${evolution.color} text-white px-3 py-1 rounded-full text-[10px] font-bold inline-block mb-2`}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {evolution.name} · Nv. {level}
              </motion.div>
              <div className="space-y-1">
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
              <div className="flex gap-3 mt-2">
                <div className="text-[10px]"><span className="font-bold">{collectionPct}%</span> <span className="text-muted-foreground">Collection</span></div>
                {chests.length > 0 && (
                  <div className="text-[10px]"><span className="font-bold text-primary">{chests.length}</span> <span className="text-muted-foreground">Coffres</span></div>
                )}
              </div>
            </div>
          </div>

          {/* Next unlock teaser - dopamine bar */}
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

      {/* ═══ DUAL SPACE SELECTOR ═══ */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMainSpace('identity')}
            className={`relative p-3 rounded-xl border text-left transition-all ${
              mainSpace === 'identity'
                ? 'bg-card border-primary/40 shadow-lg shadow-primary/10'
                : 'bg-card/50 border-border/20 hover:border-border/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">Identité</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Genre, couleurs, coiffure</p>
            {mainSpace === 'identity' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-t-full" />}
          </button>
          <button
            onClick={() => setMainSpace('equipment')}
            className={`relative p-3 rounded-xl border text-left transition-all ${
              mainSpace === 'equipment'
                ? 'bg-gradient-to-br from-card to-primary/5 border-primary/40 shadow-lg shadow-primary/10'
                : 'bg-card/50 border-border/20 hover:border-border/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
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
          {/* ═══════════════════════════════════════
               SPACE A: IDENTITY (Calm, minimal)
             ═══════════════════════════════════════ */}
          {mainSpace === 'identity' && (
            <motion.div key="identity" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Color Category Selector */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {([
                  { id: 'skin' as const, label: 'Peau' },
                  { id: 'eyes' as const, label: 'Yeux' },
                  { id: 'hair' as const, label: 'Cheveux' },
                  { id: 'clothing' as const, label: 'Vêtements' },
                  { id: 'shoes' as const, label: 'Chaussures' },
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

              {/* Color Palette */}
              <div className="p-4 rounded-xl bg-card border border-border/20">
                <h3 className="text-sm font-bold mb-3">
                  {colorCategory === 'skin' ? 'Couleur de peau' :
                   colorCategory === 'eyes' ? 'Couleur des yeux' :
                   colorCategory === 'hair' ? 'Couleur des cheveux' :
                   colorCategory === 'clothing' ? 'Couleur des vêtements' :
                   'Couleur des chaussures'}
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
                {colorCategory === 'clothing' && (
                  <ColorPalette palettes={CLOTHING_PALETTES} selectedIndex={config.clothingIndex} onSelect={i => updateConfig({ clothingIndex: i })} premiumPalettes={PREMIUM_CLOTHING_PALETTES} />
                )}
                {colorCategory === 'shoes' && (
                  <ColorPalette palettes={SHOES_PALETTES} selectedIndex={config.shoesIndex} onSelect={i => updateConfig({ shoesIndex: i })} />
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════
               SPACE B: EQUIPMENT (Gamified, vivid)
             ═══════════════════════════════════════ */}
          {mainSpace === 'equipment' && (
            <motion.div key="equipment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Sub-tabs */}
              <div className="flex gap-1 mb-4 bg-card rounded-xl p-1 border border-border/20">
                {([
                  { id: 'items' as const, label: 'Items' },
                  { id: 'quests' as const, label: 'Quêtes' },
                  { id: 'chests' as const, label: 'Coffres', badge: chests.length },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setEquipmentTab(tab.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      equipmentTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    {tab.badge ? (
                      <span className="ml-1 bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded-full text-[9px]">{tab.badge}</span>
                    ) : null}
                  </button>
                ))}
              </div>

              {/* ── ITEMS TAB ── */}
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
                            <span>{slot.label}</span>
                            <span className="text-[9px] opacity-60">{ownedCount}/{totalCount}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedSlot && (
                      <motion.div key={selectedSlot} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        {getEquippedForSlot(selectedSlot) && (
                          <button onClick={() => unequipSlot(selectedSlot)} className="w-full p-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium">
                            Retirer l'item équipé
                          </button>
                        )}

                        {/* Owned items */}
                        <div className="grid grid-cols-3 gap-2">
                          {getOwnedItemsForSlot(selectedSlot).map(item => {
                            const isEquipped = getEquippedForSlot(selectedSlot)?.id === item.id;
                            const overlayKey = (item.pixel_art_data as any)?.overlay_key;
                            const pixelItem = overlayKey ? [...PIXEL_ITEMS, ...PREMIUM_PIXEL_ITEMS].find(p => p.key === overlayKey) : null;
                            const isMythic = item.rarity === 'mythic';
                            return (
                              <motion.button
                                key={item.id}
                                onClick={() => { if (!isEquipped) { equipItem(item.id, selectedSlot); playSound('click'); } }}
                                className={`p-2.5 rounded-xl border text-center transition-all ${
                                  isEquipped ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                  : isMythic ? 'border-[#FF2D78]/30 bg-[#FF2D78]/5 hover:border-[#FF2D78]/50'
                                  : 'border-border/20 bg-card hover:border-primary/30'
                                }`}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                              >
                                <div className="flex justify-center mb-1">
                                  {pixelItem ? <PixelIcon pixels={pixelItem.pixels.slice(0, 5)} palette={pixelItem.palette} pixelSize={3} /> : <div className="w-8 h-8 bg-secondary rounded" />}
                                </div>
                                <div className="text-[10px] font-medium truncate">{item.name_fr}</div>
                                <div className="text-[9px] font-bold" style={{ color: RARITY_COLORS[item.rarity] || RARITY_COLORS.common }}>
                                  {RARITY_LABELS[item.rarity] || 'Commun'}
                                </div>
                                {isEquipped && <div className="text-[9px] text-primary font-bold mt-0.5">✓ Équipé</div>}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Locked items */}
                        {getLockedItemsForSlot(selectedSlot).length > 0 && (
                          <>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Lock className="w-3 h-3" />
                              <span className="font-medium">Verrouillés</span>
                              <div className="flex-1 h-px bg-border/20" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {getLockedItemsForSlot(selectedSlot).map(item => {
                                const overlayKey = (item.pixel_art_data as any)?.overlay_key;
                                const pixelItem = overlayKey ? [...PIXEL_ITEMS, ...PREMIUM_PIXEL_ITEMS].find(p => p.key === overlayKey) : null;
                                const isMythic = item.rarity === 'mythic';
                                const isPremiumLocked = item.is_premium && !isPremium;
                                return (
                                  <div
                                    key={item.id}
                                    className={`p-2.5 rounded-xl border text-center relative overflow-hidden ${
                                      isMythic ? 'border-[#FF2D78]/15 bg-[#FF2D78]/5' : 'border-border/10 bg-card/30'
                                    } ${isPremiumLocked ? 'opacity-70' : 'opacity-50'}`}
                                  >
                                    {/* Blurred preview for premium items */}
                                    <div className={`flex justify-center mb-1 ${isPremiumLocked ? 'blur-[2px]' : ''}`}>
                                      {pixelItem ? <PixelIcon pixels={pixelItem.pixels.slice(0, 5)} palette={pixelItem.palette} pixelSize={3} /> : <div className="w-8 h-8 bg-secondary/50 rounded" />}
                                    </div>
                                    <div className="text-[10px] font-medium text-muted-foreground truncate">{item.name_fr}</div>
                                    <div className="text-[9px] font-bold" style={{ color: RARITY_COLORS[item.rarity] }}>
                                      {RARITY_LABELS[item.rarity] || 'Commun'}
                                    </div>
                                    <div className="text-[8px] text-muted-foreground mt-0.5">
                                      {isPremiumLocked ? (
                                        <button onClick={showUpgradeModal} className="flex items-center justify-center gap-0.5 text-[#FF2D78] mx-auto font-bold">
                                          <Crown className="w-2.5 h-2.5" /> Premium
                                        </button>
                                      ) : item.unlock_method === 'level' ? `Nv. ${item.level_required}` : item.unlock_method === 'quest' ? 'Quête' : 'Coffre'}
                                    </div>
                                    {/* Subtle animated shimmer for mythic */}
                                    {isMythic && (
                                      <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF2D78]/10 to-transparent pointer-events-none"
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!selectedSlot && (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">Sélectionne un slot pour équiper</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── QUESTS TAB ── */}
              {equipmentTab === 'quests' && (
                <div className="space-y-3">
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
                          <div className="flex-1">
                            <div className="font-medium text-xs">{quest.title_fr}</div>
                            <p className="text-[10px] text-muted-foreground">{quest.description_fr}</p>
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
                            Coffre {RARITY_LABELS[quest.reward_chest_rarity] || 'Commun'}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  {quests.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">Aucune quête disponible</div>
                  )}
                </div>
              )}

              {/* ── CHESTS TAB ── */}
              {equipmentTab === 'chests' && (
                <div className="space-y-4">
                  {/* Premium weekly chest teaser */}
                  {!isPremium && (
                    <motion.button
                      onClick={showUpgradeModal}
                      className="w-full p-4 rounded-xl border border-[#FF2D78]/20 bg-gradient-to-r from-[#FF2D78]/10 to-[#FF2D78]/5 text-left relative overflow-hidden"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FF2D78]/20 flex items-center justify-center">
                          <Crown className="w-5 h-5 text-[#FF2D78]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#FF2D78]">Coffre Premium Hebdomadaire</div>
                          <div className="text-[10px] text-muted-foreground">Drop garanti Rare ou Épique chaque semaine</div>
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
                          <div className="text-xs font-bold text-white drop-shadow-lg relative z-10">{RARITY_LABELS[chest.rarity] || 'Commun'}</div>
                          <div className="text-[9px] text-white/70 mt-1 relative z-10">Touche pour ouvrir</div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucun coffre à ouvrir</p>
                      <p className="text-[10px] mt-1">Monte de niveau pour en gagner !</p>
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
