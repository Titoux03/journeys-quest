import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatar, getRarityColor, getRarityLabel, AvatarItem } from '@/hooks/useAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useLevel } from '@/hooks/useLevel';
import { usePremium } from '@/hooks/usePremium';
import { PixelAvatar } from '@/components/PixelAvatar';
import { ChestOpener } from '@/components/ChestOpener';
import { ArrowLeft, Lock, Crown, Package, Swords, Sparkles, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
        <Sparkles className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-xl font-bold mb-2">Connecte-toi pour personnaliser ton avatar</h2>
        <p className="text-muted-foreground text-center">Ton personnage t'attend !</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-card border border-border/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gradient-primary">Mon Avatar</h1>
          <p className="text-sm text-muted-foreground">Niveau {levelData?.level || 1} — {levelData?.title || 'Initié'}</p>
        </div>
      </div>

      {/* Avatar Preview */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <PixelAvatar size="lg" />
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Nv. {levelData?.level || 1}
          </motion.div>
        </div>
      </div>

      {/* Chests */}
      {chests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Coffres à ouvrir ({chests.length})
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {chests.map(chest => (
              <motion.button
                key={chest.id}
                onClick={() => handleOpenChest(chest.id)}
                className={`p-4 rounded-xl border border-border/30 bg-gradient-to-br ${getRarityColor(chest.rarity)} text-center`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ rotate: [0, -2, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="text-3xl mb-1">📦</div>
                <div className="text-xs font-bold text-white drop-shadow-lg">
                  {getRarityLabel(chest.rarity)}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Slot Tabs */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          Équipement
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {SLOTS.map(slot => {
            const equipped = getEquippedForSlot(slot.id);
            const isSelected = selectedSlot === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(isSelected ? null : slot.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : equipped
                    ? 'bg-card border-primary/30 text-foreground'
                    : 'bg-card border-border/30 text-muted-foreground'
                }`}
              >
                <span className="mr-1">{equipped?.preview_emoji || slot.emoji}</span>
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items for selected slot */}
      <AnimatePresence mode="wait">
        {selectedSlot && (
          <motion.div
            key={selectedSlot}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Unequip button */}
            {getEquippedForSlot(selectedSlot) && (
              <button
                onClick={() => unequipSlot(selectedSlot)}
                className="w-full p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium"
              >
                Retirer l'item équipé
              </button>
            )}

            {/* Owned items */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Débloqués</h3>
              <div className="grid grid-cols-2 gap-3">
                {getOwnedItemsForSlot(selectedSlot).map(item => {
                  const isEquipped = getEquippedForSlot(selectedSlot)?.id === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => !isEquipped && equipItem(item.id, selectedSlot)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isEquipped
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                          : 'border-border/30 bg-card hover:border-primary/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-3xl mb-2">{item.preview_emoji}</div>
                      <div className="text-sm font-medium">{item.name_fr}</div>
                      <div className={`text-xs font-bold bg-gradient-to-r ${getRarityColor(item.rarity)} bg-clip-text text-transparent`}>
                        {getRarityLabel(item.rarity)}
                      </div>
                      {isEquipped && (
                        <div className="mt-1 text-xs text-primary font-medium">✓ Équipé</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Locked items */}
            {getLockedItemsForSlot(selectedSlot).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Verrouillés
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {getLockedItemsForSlot(selectedSlot).map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-border/20 bg-card/50 opacity-60 relative"
                    >
                      <div className="text-3xl mb-2 grayscale">{item.preview_emoji}</div>
                      <div className="text-sm font-medium text-muted-foreground">{item.name_fr}</div>
                      <div className={`text-xs font-bold bg-gradient-to-r ${getRarityColor(item.rarity)} bg-clip-text text-transparent`}>
                        {getRarityLabel(item.rarity)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.is_premium && !isPremium ? (
                          <span className="flex items-center gap-1">
                            <Crown className="w-3 h-3 text-primary" /> Premium
                          </span>
                        ) : item.unlock_method === 'level' ? (
                          `Niveau ${item.level_required}`
                        ) : item.unlock_method === 'quest' ? (
                          'Quête'
                        ) : item.unlock_method === 'chest' ? (
                          '📦 Coffre'
                        ) : ''}
                      </div>
                      {item.is_premium && !isPremium && (
                        <button
                          onClick={showUpgradeModal}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Crown className="w-3 h-3 text-primary-foreground" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quests Section */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          Quêtes
        </h2>
        <div className="space-y-3">
          {quests.map(quest => {
            const progress = questProgress.find(p => p.quest_id === quest.id);
            const progressPct = progress ? Math.min(100, (progress.current_value / quest.target_value) * 100) : 0;
            const isCompleted = progress?.is_completed;

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-xl border ${
                  isCompleted ? 'border-success/30 bg-success/5' : 'border-border/30 bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{quest.title_fr}</div>
                  {isCompleted && <span className="text-success text-sm">✅</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{quest.description_fr}</p>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {progress?.current_value || 0} / {quest.target_value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
