import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatar, getRarityColor, getRarityLabel, AvatarItem } from '@/hooks/useAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useLevel } from '@/hooks/useLevel';
import { usePremium } from '@/hooks/usePremium';
import { PixelAvatar } from '@/components/PixelAvatar';
import { ChestOpener } from '@/components/ChestOpener';
import { ArrowLeft, Lock, Crown, Package, Swords, Sparkles, Star, Flame, Gift, Zap, Trophy, Clock } from 'lucide-react';
import { playSound } from '@/utils/soundManager';

const SLOTS = [
  { id: 'body', label: 'Corps', emoji: '🧍' },
  { id: 'head', label: 'Tête', emoji: '👑' },
  { id: 'face', label: 'Visage', emoji: '😎' },
  { id: 'outfit', label: 'Tenue', emoji: '👕' },
  { id: 'weapon', label: 'Arme', emoji: '⚔️' },
  { id: 'cape', label: 'Cape', emoji: '🦸' },
  { id: 'aura', label: 'Aura', emoji: '💫' },
  { id: 'background', label: 'Fond', emoji: '🌲' },
  { id: 'pet', label: 'Compagnon', emoji: '🐱' },
];

// Daily reward tiers
const DAILY_REWARDS = [
  { day: 1, reward: '10 XP', emoji: '⭐' },
  { day: 2, reward: '15 XP', emoji: '⭐' },
  { day: 3, reward: 'Coffre commun', emoji: '📦' },
  { day: 4, reward: '20 XP', emoji: '⭐' },
  { day: 5, reward: '25 XP', emoji: '✨' },
  { day: 6, reward: 'Coffre rare', emoji: '💎' },
  { day: 7, reward: 'Coffre épique !', emoji: '🔥' },
];

interface AvatarCustomizationProps {
  onNavigate: (screen: string) => void;
}

export const AvatarCustomization: React.FC<AvatarCustomizationProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { isPremium, showUpgradeModal } = usePremium();
  const { levelData } = useLevel(user?.id);
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

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [openingChest, setOpeningChest] = useState<string | null>(null);
  const [chestReward, setChestReward] = useState<AvatarItem | null>(null);
  const [activeTab, setActiveTab] = useState<'character' | 'quests' | 'rewards'>('character');
  const [showEvolution, setShowEvolution] = useState(false);

  // Evolution stage names
  const getEvolutionStage = (level: number) => {
    if (level >= 100) return { name: 'Légende Cosmique', tier: 5, color: 'from-purple-500 via-pink-500 to-cyan-500' };
    if (level >= 50) return { name: 'Maître Astral', tier: 4, color: 'from-purple-400 to-indigo-600' };
    if (level >= 25) return { name: 'Guerrier Zen', tier: 3, color: 'from-orange-400 to-red-500' };
    if (level >= 10) return { name: 'Voyageur Intérieur', tier: 2, color: 'from-blue-400 to-cyan-500' };
    return { name: 'Initié du Calme', tier: 1, color: 'from-gray-400 to-blue-400' };
  };

  const evolution = getEvolutionStage(levelData?.level || 1);
  const nextEvolution = getEvolutionStage(
    levelData?.level ? (levelData.level < 10 ? 10 : levelData.level < 25 ? 25 : levelData.level < 50 ? 50 : levelData.level < 100 ? 100 : 200) : 10
  );
  const nextEvolutionLevel = levelData?.level ? (levelData.level < 10 ? 10 : levelData.level < 25 ? 25 : levelData.level < 50 ? 50 : levelData.level < 100 ? 100 : 200) : 10;

  const handleOpenChest = async (chestId: string) => {
    setOpeningChest(chestId);
    const reward = await openChest(chestId);
    if (reward) {
      setChestReward(reward);
    }
  };

  const handleCloseChestReward = () => {
    setOpeningChest(null);
    setChestReward(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen p-4 pb-24 flex flex-col items-center justify-center">
        <PixelAvatar size="lg" level={1} />
        <h2 className="text-xl font-bold mb-2 mt-6">Connecte-toi pour débloquer ton personnage</h2>
        <p className="text-muted-foreground text-center text-sm">Fais-le évoluer en accomplissant tes objectifs !</p>
      </div>
    );
  }

  const ownedCount = allItems.filter(i => getOwnedItemsForSlot(i.slot).some(oi => oi.id === i.id)).length;
  const totalItems = allItems.length;
  const collectionPct = totalItems > 0 ? Math.round((new Set(getOwnedItemsForSlot('body').concat(
    getOwnedItemsForSlot('head'),
    getOwnedItemsForSlot('face'),
    getOwnedItemsForSlot('outfit'),
    getOwnedItemsForSlot('weapon'),
    getOwnedItemsForSlot('cape'),
    getOwnedItemsForSlot('aura'),
    getOwnedItemsForSlot('background'),
    getOwnedItemsForSlot('pet'),
  )).size / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-card border border-border/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gradient-primary">Mon Personnage</h1>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">Nv. {levelData?.level || 1}</span>
        </div>
      </div>

      {/* Character Card */}
      <motion.div
        className="relative rounded-2xl overflow-hidden mb-6"
        style={{
          background: 'linear-gradient(145deg, hsl(220 50% 6%), hsl(220 45% 10%))',
          border: '1px solid hsl(45 100% 65% / 0.15)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Background gradient based on evolution */}
        <div className={`absolute inset-0 bg-gradient-to-b ${evolution.color} opacity-10`} />

        <div className="relative p-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <PixelAvatar size="lg" />
            
            {/* Evolution badge */}
            <motion.div
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${evolution.color} text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {evolution.name}
            </motion.div>
          </div>

          {/* XP Progress to next level */}
          <div className="w-full mt-6 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">XP</span>
              <span className="font-mono font-bold text-foreground">
                {levelData?.xp || 0} / {levelData?.xpForNextLevel || 50}
              </span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${evolution.color} rounded-full relative`}
                initial={{ width: 0 }}
                animate={{ width: `${levelData?.progressPercentage || 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </div>

          {/* Next evolution preview */}
          {(levelData?.level || 1) < 200 && (
            <button
              onClick={() => setShowEvolution(!showEvolution)}
              className="mt-4 w-full p-3 rounded-xl bg-card/80 border border-border/30 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary-glow/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs text-muted-foreground">Prochaine évolution</div>
                <div className={`text-sm font-bold bg-gradient-to-r ${nextEvolution.color} bg-clip-text text-transparent`}>
                  {nextEvolution.name} — Nv. {nextEvolutionLevel}
                </div>
              </div>
              <PixelAvatar size="sm" level={nextEvolutionLevel} />
            </button>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 w-full mt-4">
            <div className="bg-card/80 rounded-xl p-3 text-center border border-border/20">
              <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{collectionPct}%</div>
              <div className="text-[10px] text-muted-foreground">Collection</div>
            </div>
            <div className="bg-card/80 rounded-xl p-3 text-center border border-border/20">
              <Package className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{chests.length}</div>
              <div className="text-[10px] text-muted-foreground">Coffres</div>
            </div>
            <div className="bg-card/80 rounded-xl p-3 text-center border border-border/20">
              <Star className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{quests.filter(q => questProgress.find(p => p.quest_id === q.id)?.is_completed).length}/{quests.length}</div>
              <div className="text-[10px] text-muted-foreground">Quêtes</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-card rounded-xl p-1 border border-border/30">
        {[
          { id: 'character' as const, label: 'Équipement', icon: Swords },
          { id: 'quests' as const, label: 'Quêtes', icon: Star },
          { id: 'rewards' as const, label: 'Coffres', icon: Gift },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Equipment Tab */}
      {activeTab === 'character' && (
        <div>
          {/* Slot Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {SLOTS.map(slot => {
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
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg">{equipped?.preview_emoji || slot.emoji}</span>
                    <span>{slot.label}</span>
                    <span className="text-[9px] opacity-60">{ownedCount}/{totalCount}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Items Grid */}
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

                {/* Owned */}
                <div className="grid grid-cols-3 gap-2.5">
                  {getOwnedItemsForSlot(selectedSlot).map(item => {
                    const isEquipped = getEquippedForSlot(selectedSlot)?.id === item.id;
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
                        <div className="text-2xl mb-1">{item.preview_emoji}</div>
                        <div className="text-[10px] font-medium truncate">{item.name_fr}</div>
                        <div className={`text-[9px] font-bold bg-gradient-to-r ${getRarityColor(item.rarity)} bg-clip-text text-transparent`}>
                          {getRarityLabel(item.rarity)}
                        </div>
                        {isEquipped && <div className="text-[9px] text-primary font-bold mt-0.5">✓</div>}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Locked */}
                {getLockedItemsForSlot(selectedSlot).length > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span className="font-medium">Verrouillés</span>
                      <div className="flex-1 h-px bg-border/30" />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {getLockedItemsForSlot(selectedSlot).map(item => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl border border-border/15 bg-card/30 text-center relative"
                        >
                          <div className="text-2xl mb-1 grayscale opacity-40">{item.preview_emoji}</div>
                          <div className="text-[10px] font-medium text-muted-foreground truncate">{item.name_fr}</div>
                          <div className={`text-[9px] font-bold bg-gradient-to-r ${getRarityColor(item.rarity)} bg-clip-text text-transparent`}>
                            {getRarityLabel(item.rarity)}
                          </div>
                          <div className="text-[8px] text-muted-foreground mt-0.5">
                            {item.is_premium && !isPremium ? (
                              <button onClick={showUpgradeModal} className="flex items-center justify-center gap-0.5 text-primary">
                                <Crown className="w-2.5 h-2.5" /> Premium
                              </button>
                            ) : item.unlock_method === 'level' ? (
                              `Nv. ${item.level_required}`
                            ) : item.unlock_method === 'quest' ? 'Quête' : '📦'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedSlot && (
            <div className="text-center py-8 text-muted-foreground">
              <Swords className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sélectionne un slot pour équiper ton personnage</p>
            </div>
          )}
        </div>
      )}

      {/* Quests Tab */}
      {activeTab === 'quests' && (
        <div className="space-y-3">
          {quests.map(quest => {
            const progress = questProgress.find(p => p.quest_id === quest.id);
            const progressPct = progress ? Math.min(100, (progress.current_value / quest.target_value) * 100) : 0;
            const isCompleted = progress?.is_completed;

            return (
              <motion.div
                key={quest.id}
                className={`p-4 rounded-xl border ${
                  isCompleted ? 'border-success/30 bg-success/5' : 'border-border/30 bg-card'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isCompleted ? 'bg-success/20' : 'bg-primary/10'
                  }`}>
                    {isCompleted ? '✅' : <Star className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{quest.title_fr}</div>
                    <p className="text-xs text-muted-foreground">{quest.description_fr}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-gradient-to-r from-primary to-primary-glow'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {progress?.current_value || 0}/{quest.target_value}
                      </span>
                    </div>
                  </div>
                </div>
                {quest.reward_chest_rarity && !isCompleted && (
                  <div className="mt-2 ml-13 text-xs text-primary flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Récompense : Coffre {getRarityLabel(quest.reward_chest_rarity)}
                  </div>
                )}
              </motion.div>
            );
          })}
          {quests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune quête disponible</p>
            </div>
          )}
        </div>
      )}

      {/* Rewards/Chests Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Daily Rewards */}
          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              Récompenses journalières
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {DAILY_REWARDS.map((reward, idx) => (
                <div
                  key={idx}
                  className={`flex-shrink-0 w-16 p-2.5 rounded-xl border text-center ${
                    idx === 0
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                      : 'border-border/20 bg-card/50 opacity-50'
                  }`}
                >
                  <div className="text-lg mb-0.5">{reward.emoji}</div>
                  <div className="text-[9px] font-medium text-muted-foreground">Jour {reward.day}</div>
                  <div className="text-[8px] font-bold text-foreground">{reward.reward}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chests to open */}
          {chests.length > 0 ? (
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Coffres à ouvrir ({chests.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {chests.map(chest => (
                  <motion.button
                    key={chest.id}
                    onClick={() => handleOpenChest(chest.id)}
                    className={`p-5 rounded-xl border border-border/30 bg-gradient-to-br ${getRarityColor(chest.rarity)} text-center relative overflow-hidden`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                      className="text-4xl mb-2 relative z-10"
                      animate={{ rotate: [-3, 3, -3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      📦
                    </motion.div>
                    <div className="text-xs font-bold text-white drop-shadow-lg relative z-10">
                      {getRarityLabel(chest.rarity)}
                    </div>
                    <div className="text-[10px] text-white/70 mt-1 relative z-10">
                      Touche pour ouvrir
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun coffre à ouvrir</p>
              <p className="text-xs mt-1">Monte de niveau pour en gagner !</p>
            </div>
          )}
        </div>
      )}

      {/* Chest Opening Modal */}
      <AnimatePresence>
        {openingChest && (
          <ChestOpener
            reward={chestReward}
            onClose={handleCloseChestReward}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
