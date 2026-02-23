/**
 * AvatarCustomizer - Full customization screen
 * Gender selection, color pickers, equipment, save/modify
 * 100% pixel art, no emojis
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Lock, Sparkles, Package, Star, Gift, Flame, Zap, Trophy, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLevel } from '@/hooks/useLevel';
import { usePremium } from '@/hooks/usePremium';
import { useAvatar, AvatarItem, getRarityColor, getRarityLabel } from '@/hooks/useAvatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { playSound } from '@/utils/soundManager';
import { AvatarRenderer, PixelIcon } from './AvatarRenderer';
import { ChestOpenerPixel } from './ChestOpenerPixel';
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
  SLOT_META,
  RARITY_COLORS,
  RARITY_LABELS,
  RARITY_GRADIENTS,
  PixelItemOverlay,
} from './AvatarEngine';

interface AvatarCustomizerProps {
  onNavigate: (screen: string) => void;
}

// Load/save avatar config from localStorage + Supabase profiles
function loadAvatarConfig(): AvatarConfig {
  try {
    const saved = localStorage.getItem('avatar_config');
    if (saved) return { ...DEFAULT_AVATAR_CONFIG, ...JSON.parse(saved) };
  } catch { }
  return DEFAULT_AVATAR_CONFIG;
}

function saveAvatarConfigLocal(config: AvatarConfig) {
  localStorage.setItem('avatar_config', JSON.stringify(config));
  // Also keep legacy gender key for compatibility
  localStorage.setItem('avatar_gender', config.gender);
}

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
  const [activeTab, setActiveTab] = useState<'customize' | 'equipment' | 'quests' | 'chests'>('customize');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [openingChest, setOpeningChest] = useState<string | null>(null);
  const [chestReward, setChestReward] = useState<AvatarItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [colorCategory, setColorCategory] = useState<'skin' | 'eyes' | 'hair' | 'clothing' | 'shoes'>('skin');

  // Save config whenever it changes
  useEffect(() => {
    saveAvatarConfigLocal(config);
  }, [config]);

  const updateConfig = useCallback((partial: Partial<AvatarConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
    setSaved(false);
  }, []);

  // Save to backend
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Save config as JSON in profiles avatar_url field (repurposed)
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

  // Build equipped overlays for renderer
  const equippedOverlays: PixelItemOverlay[] = SLOT_META.map(s => {
    const item = getEquippedForSlot(s.id);
    if (!item) return null;
    const overlayKey = (item.pixel_art_data as any)?.overlay_key as string | undefined;
    if (!overlayKey) return null;
    const pixelItem = PIXEL_ITEMS.find(p => p.key === overlayKey);
    return pixelItem || null;
  }).filter(Boolean) as PixelItemOverlay[];

  const handleOpenChest = async (chestId: string) => {
    setOpeningChest(chestId);
    const reward = await openChest(chestId);
    if (reward) setChestReward(reward);
  };

  const level = levelData?.level || 1;

  const getEvolutionStage = (l: number) => {
    if (l >= 100) return { name: 'Légende Cosmique', color: 'from-purple-500 via-pink-500 to-cyan-500' };
    if (l >= 50) return { name: 'Maître Astral', color: 'from-purple-400 to-indigo-600' };
    if (l >= 25) return { name: 'Guerrier Zen', color: 'from-orange-400 to-red-500' };
    if (l >= 10) return { name: 'Voyageur', color: 'from-blue-400 to-cyan-500' };
    return { name: 'Initié', color: 'from-gray-400 to-blue-400' };
  };
  const evolution = getEvolutionStage(level);

  if (!user) {
    return (
      <div className="min-h-screen p-4 pb-24 flex flex-col items-center justify-center">
        <AvatarRenderer config={DEFAULT_AVATAR_CONFIG} size="xl" />
        <h2 className="text-xl font-bold mb-2 mt-6">Connecte-toi pour débloquer ton personnage</h2>
        <p className="text-muted-foreground text-center text-sm">Fais-le évoluer en accomplissant tes objectifs !</p>
      </div>
    );
  }

  const collectionCount = SLOT_META.reduce((sum, s) => sum + getOwnedItemsForSlot(s.id).length, 0);
  const totalItems = allItems.length;
  const collectionPct = totalItems > 0 ? Math.round((collectionCount / totalItems) * 100) : 0;

  // Color palette selector component
  const ColorPalette: React.FC<{
    palettes: { main?: string; shadow?: string; color?: string; label: string }[];
    selectedIndex: number;
    onSelect: (i: number) => void;
    colorKey?: 'main' | 'color';
  }> = ({ palettes, selectedIndex, onSelect, colorKey = 'main' }) => (
    <div className="flex flex-wrap gap-2">
      {palettes.map((p, i) => {
        const c = colorKey === 'color' ? (p as any).color : (p as any).main;
        const isSelected = selectedIndex === i;
        return (
          <motion.button
            key={i}
            onClick={() => { onSelect(i); playSound('click'); }}
            className={`relative rounded-full border-2 transition-all ${isSelected ? 'border-primary scale-110 ring-2 ring-primary/30' : 'border-border/30'}`}
            style={{ width: 36, height: 36 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-full h-full rounded-full" style={{ backgroundColor: c }} />
            {isSelected && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check className="w-4 h-4 text-white drop-shadow-lg" />
              </motion.div>
            )}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap">
              {isSelected ? p.label : ''}
            </div>
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-card border border-border/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gradient-primary">Mon Personnage</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
            saved
              ? 'bg-green-500/20 border-green-400/40 text-green-300'
              : 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? '...' : saved ? 'Sauvé' : 'Enregistrer'}
        </button>
      </div>

      {/* Avatar Preview Card */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-5"
        style={{
          background: 'linear-gradient(145deg, hsl(220 50% 6%), hsl(220 45% 10%))',
          border: '1px solid hsl(45 100% 65% / 0.15)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${evolution.color} opacity-10`} />
        <div className="relative p-5 flex flex-col items-center">
          {/* Gender Toggle */}
          <div className="flex gap-2 mb-4">
            {(['male', 'female'] as const).map(g => (
              <button
                key={g}
                onClick={() => updateConfig({ gender: g })}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  config.gender === g
                    ? g === 'male'
                      ? 'bg-blue-500/20 border-blue-400/40 text-blue-300'
                      : 'bg-pink-500/20 border-pink-400/40 text-pink-300'
                    : 'bg-card/50 border-border/20 text-muted-foreground'
                }`}
              >
                {g === 'male' ? '♂ Garçon' : '♀ Fille'}
              </button>
            ))}
          </div>

          {/* Avatar */}
          <AvatarRenderer
            config={config}
            equippedOverlays={equippedOverlays}
            size="xl"
            showGlow={level >= 50}
            glowColor={level >= 100 ? 'hsl(280 100% 70% / 0.3)' : undefined}
          />

          {/* Evolution Badge */}
          <motion.div
            className={`mt-3 bg-gradient-to-r ${evolution.color} text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg`}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {evolution.name} · Nv. {level}
          </motion.div>

          {/* XP Bar */}
          <div className="w-full mt-4 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">XP</span>
              <span className="font-mono font-bold">{levelData?.xp || 0} / {levelData?.xpForNextLevel || 50}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${evolution.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${levelData?.progressPercentage || 0}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 w-full mt-3">
            <div className="bg-card/80 rounded-lg p-2 text-center border border-border/20">
              <div className="text-sm font-bold">{collectionPct}%</div>
              <div className="text-[9px] text-muted-foreground">Collection</div>
            </div>
            <div className="bg-card/80 rounded-lg p-2 text-center border border-border/20">
              <div className="text-sm font-bold">{chests.length}</div>
              <div className="text-[9px] text-muted-foreground">Coffres</div>
            </div>
            <div className="bg-card/80 rounded-lg p-2 text-center border border-border/20">
              <div className="text-sm font-bold">{quests.filter(q => questProgress.find(p => p.quest_id === q.id)?.is_completed).length}/{quests.length}</div>
              <div className="text-[9px] text-muted-foreground">Quêtes</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-5 bg-card rounded-xl p-1 border border-border/30 overflow-x-auto scrollbar-hide">
        {([
          { id: 'customize' as const, label: 'Couleurs' },
          { id: 'equipment' as const, label: 'Équipement' },
          { id: 'quests' as const, label: 'Quêtes' },
          { id: 'chests' as const, label: 'Coffres' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ CUSTOMIZE TAB ═══ */}
      {activeTab === 'customize' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Color category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
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
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border whitespace-nowrap ${
                  colorCategory === cat.id
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'bg-card border-border/30 text-muted-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Color pickers */}
          <div className="p-4 rounded-xl bg-card border border-border/30">
            <h3 className="text-sm font-bold mb-4 capitalize">
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
              <ColorPalette palettes={EYE_PALETTES} selectedIndex={config.eyeIndex} onSelect={i => updateConfig({ eyeIndex: i })} colorKey="color" />
            )}
            {colorCategory === 'hair' && (
              <ColorPalette palettes={HAIR_PALETTES} selectedIndex={config.hairIndex} onSelect={i => updateConfig({ hairIndex: i })} />
            )}
            {colorCategory === 'clothing' && (
              <ColorPalette palettes={CLOTHING_PALETTES} selectedIndex={config.clothingIndex} onSelect={i => updateConfig({ clothingIndex: i })} />
            )}
            {colorCategory === 'shoes' && (
              <ColorPalette palettes={SHOES_PALETTES} selectedIndex={config.shoesIndex} onSelect={i => updateConfig({ shoesIndex: i })} />
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ EQUIPMENT TAB ═══ */}
      {activeTab === 'equipment' && (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
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
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                      : equipped
                      ? 'bg-card border-primary/30 text-foreground'
                      : 'bg-card border-border/30 text-muted-foreground'
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
              <motion.div
                key={selectedSlot}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {getEquippedForSlot(selectedSlot) && (
                  <button
                    onClick={() => unequipSlot(selectedSlot)}
                    className="w-full p-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium"
                  >
                    Retirer l'item équipé
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2.5">
                  {getOwnedItemsForSlot(selectedSlot).map(item => {
                    const isEquipped = getEquippedForSlot(selectedSlot)?.id === item.id;
                    const overlayKey = (item.pixel_art_data as any)?.overlay_key;
                    const pixelItem = overlayKey ? PIXEL_ITEMS.find(p => p.key === overlayKey) : null;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          if (!isEquipped) {
                            equipItem(item.id, selectedSlot);
                            playSound('click');
                          }
                        }}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isEquipped
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border/30 bg-card hover:border-primary/40'
                        }`}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        {/* Pixel art preview of item */}
                        <div className="flex justify-center mb-1.5">
                          {pixelItem ? (
                            <PixelIcon pixels={pixelItem.pixels.slice(0, 5)} palette={pixelItem.palette} pixelSize={3} />
                          ) : (
                            <div className="w-8 h-8 bg-secondary rounded" />
                          )}
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

                {getLockedItemsForSlot(selectedSlot).length > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span className="font-medium">Verrouillés</span>
                      <div className="flex-1 h-px bg-border/30" />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {getLockedItemsForSlot(selectedSlot).map(item => {
                        const overlayKey = (item.pixel_art_data as any)?.overlay_key;
                        const pixelItem = overlayKey ? PIXEL_ITEMS.find(p => p.key === overlayKey) : null;
                        return (
                          <div key={item.id} className="p-3 rounded-xl border border-border/15 bg-card/30 text-center relative opacity-60">
                            <div className="flex justify-center mb-1.5">
                              {pixelItem ? (
                                <PixelIcon pixels={pixelItem.pixels.slice(0, 5)} palette={pixelItem.palette} pixelSize={3} />
                              ) : (
                                <div className="w-8 h-8 bg-secondary/50 rounded" />
                              )}
                            </div>
                            <div className="text-[10px] font-medium text-muted-foreground truncate">{item.name_fr}</div>
                            <div className="text-[9px] font-bold" style={{ color: RARITY_COLORS[item.rarity] }}>
                              {RARITY_LABELS[item.rarity] || 'Commun'}
                            </div>
                            <div className="text-[8px] text-muted-foreground mt-0.5">
                              {item.is_premium && !isPremium ? (
                                <button onClick={showUpgradeModal} className="flex items-center justify-center gap-0.5 text-primary mx-auto">
                                  <Lock className="w-2.5 h-2.5" /> Premium
                                </button>
                              ) : item.unlock_method === 'level' ? `Nv. ${item.level_required}` : item.unlock_method === 'quest' ? 'Quête' : 'Coffre'}
                            </div>
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
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Sélectionne un slot pour équiper ton personnage</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ QUESTS TAB ═══ */}
      {activeTab === 'quests' && (
        <div className="space-y-3">
          {quests.map(quest => {
            const progress = questProgress.find(p => p.quest_id === quest.id);
            const progressPct = progress ? Math.min(100, (progress.current_value / quest.target_value) * 100) : 0;
            const isCompleted = progress?.is_completed;
            return (
              <motion.div
                key={quest.id}
                className={`p-4 rounded-xl border ${isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-border/30 bg-card'}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-green-500/20' : 'bg-primary/10'}`}>
                    {isCompleted ? <Check className="w-5 h-5 text-green-400" /> : <Star className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{quest.title_fr}</div>
                    <p className="text-xs text-muted-foreground">{quest.description_fr}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-primary-glow'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{progress?.current_value || 0}/{quest.target_value}</span>
                    </div>
                  </div>
                </div>
                {quest.reward_chest_rarity && !isCompleted && (
                  <div className="mt-2 ml-13 text-xs flex items-center gap-1" style={{ color: RARITY_COLORS[quest.reward_chest_rarity] || RARITY_COLORS.common }}>
                    <Gift className="w-3 h-3" />
                    Récompense : Coffre {RARITY_LABELS[quest.reward_chest_rarity] || 'Commun'}
                  </div>
                )}
              </motion.div>
            );
          })}
          {quests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Aucune quête disponible</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ CHESTS TAB ═══ */}
      {activeTab === 'chests' && (
        <div className="space-y-4">
          {chests.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {chests.map(chest => (
                <motion.button
                  key={chest.id}
                  onClick={() => handleOpenChest(chest.id)}
                  className={`p-5 rounded-xl border border-border/30 bg-gradient-to-br ${RARITY_GRADIENTS[chest.rarity] || RARITY_GRADIENTS.common} text-center relative overflow-hidden`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div className="absolute inset-0 bg-white/10" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity }} />
                  {/* Pixel art chest icon */}
                  <div className="relative z-10 mb-2 flex justify-center">
                    <PixelIcon
                      pixels={[
                        [0,1,1,1,1,0],
                        [1,2,1,1,2,1],
                        [1,1,3,3,1,1],
                        [1,1,1,1,1,1],
                        [0,1,1,1,1,0],
                      ]}
                      palette={['', RARITY_COLORS[chest.rarity] || '#888', '#FFD700', '#FFFFFF']}
                      pixelSize={6}
                    />
                  </div>
                  <div className="text-xs font-bold text-white drop-shadow-lg relative z-10">{RARITY_LABELS[chest.rarity] || 'Commun'}</div>
                  <div className="text-[10px] text-white/70 mt-1 relative z-10">Touche pour ouvrir</div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun coffre à ouvrir</p>
              <p className="text-xs mt-1">Monte de niveau pour en gagner !</p>
            </div>
          )}
        </div>
      )}

      {/* Chest opener modal */}
      <AnimatePresence>
        {openingChest && (
          <ChestOpenerPixel
            reward={chestReward}
            onClose={() => { setOpeningChest(null); setChestReward(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
