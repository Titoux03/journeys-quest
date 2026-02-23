import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AvatarItem {
  id: string;
  name: string;
  name_fr: string;
  description: string | null;
  description_fr: string | null;
  slot: string;
  rarity: string;
  pixel_art_data: any;
  preview_emoji: string;
  unlock_method: string;
  unlock_requirement: any;
  is_premium: boolean;
  level_required: number | null;
  sort_order: number | null;
}

export interface UserAvatarItem {
  id: string;
  user_id: string;
  item_id: string;
  obtained_at: string;
  obtained_via: string;
  item?: AvatarItem;
}

export interface EquippedItem {
  id: string;
  user_id: string;
  slot: string;
  item_id: string;
  equipped_at: string;
  item?: AvatarItem;
}

export interface UserChest {
  id: string;
  user_id: string;
  rarity: string;
  source: string;
  is_opened: boolean;
  obtained_at: string;
  opened_at: string | null;
}

export interface AvatarQuest {
  id: string;
  title: string;
  title_fr: string;
  description: string | null;
  description_fr: string | null;
  quest_type: string;
  target_value: number;
  reward_item_id: string | null;
  reward_chest_rarity: string | null;
  is_active: boolean;
  sort_order: number | null;
}

export interface QuestProgress {
  id: string;
  user_id: string;
  quest_id: string;
  current_value: number;
  is_completed: boolean;
  completed_at: string | null;
  reward_claimed: boolean;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'from-gray-400 to-gray-500',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

export const getRarityColor = (rarity: string) => RARITY_COLORS[rarity] || RARITY_COLORS.common;
export const getRarityLabel = (rarity: string) => RARITY_LABELS[rarity] || 'Commun';

export const useAvatar = (userId: string | undefined) => {
  const [allItems, setAllItems] = useState<AvatarItem[]>([]);
  const [userItems, setUserItems] = useState<UserAvatarItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItem[]>([]);
  const [chests, setChests] = useState<UserChest[]>([]);
  const [quests, setQuests] = useState<AvatarQuest[]>([]);
  const [questProgress, setQuestProgress] = useState<QuestProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAllData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const [itemsRes, userItemsRes, equippedRes, chestsRes, questsRes, progressRes] = await Promise.all([
        supabase.from('avatar_items' as any).select('*').order('sort_order'),
        supabase.from('user_avatar_items' as any).select('*').eq('user_id', userId),
        supabase.from('user_avatar_equipped' as any).select('*').eq('user_id', userId),
        supabase.from('user_chests' as any).select('*').eq('user_id', userId).eq('is_opened', false),
        supabase.from('avatar_quests' as any).select('*').eq('is_active', true).order('sort_order'),
        supabase.from('user_quest_progress' as any).select('*').eq('user_id', userId),
      ]);

      if (itemsRes.data) setAllItems(itemsRes.data as any);
      if (userItemsRes.data) setUserItems(userItemsRes.data as any);
      if (equippedRes.data) setEquippedItems(equippedRes.data as any);
      if (chestsRes.data) setChests(chestsRes.data as any);
      if (questsRes.data) setQuests(questsRes.data as any);
      if (progressRes.data) setQuestProgress(progressRes.data as any);
    } catch (error) {
      console.error('Error loading avatar data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auto-grant default items on first load
  useEffect(() => {
    if (!userId || loading || allItems.length === 0) return;
    
    const defaultItems = allItems.filter(i => i.unlock_method === 'default');
    const ownedIds = new Set(userItems.map(ui => ui.item_id));
    const missing = defaultItems.filter(i => !ownedIds.has(i.id));
    
    if (missing.length > 0) {
      Promise.all(
        missing.map(item =>
          supabase.from('user_avatar_items' as any).insert({
            user_id: userId,
            item_id: item.id,
            obtained_via: 'default'
          })
        )
      ).then(() => loadAllData());
    }
  }, [userId, loading, allItems, userItems]);

  const equipItem = async (itemId: string, slot: string) => {
    if (!userId) return;

    // Upsert: delete existing for this slot, then insert
    await supabase.from('user_avatar_equipped' as any).delete().eq('user_id', userId).eq('slot', slot);
    
    const { error } = await supabase.from('user_avatar_equipped' as any).insert({
      user_id: userId,
      slot,
      item_id: itemId,
    });

    if (!error) {
      await loadAllData();
      toast({ title: '✨ Équipé !', duration: 2000 });
    }
  };

  const unequipSlot = async (slot: string) => {
    if (!userId) return;
    await supabase.from('user_avatar_equipped' as any).delete().eq('user_id', userId).eq('slot', slot);
    await loadAllData();
  };

  const openChest = async (chestId: string): Promise<AvatarItem | null> => {
    if (!userId) return null;

    const chest = chests.find(c => c.id === chestId);
    if (!chest) return null;

    // Get items matching this rarity or lower that user doesn't own
    const ownedIds = new Set(userItems.map(ui => ui.item_id));
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const chestRarityIdx = rarityOrder.indexOf(chest.rarity);
    
    // Higher rarity chests give better items
    const eligibleItems = allItems.filter(item => {
      if (ownedIds.has(item.id)) return false;
      const itemRarityIdx = rarityOrder.indexOf(item.rarity);
      // Chest gives items of its rarity ± 1
      return Math.abs(itemRarityIdx - chestRarityIdx) <= 1;
    });

    if (eligibleItems.length === 0) {
      // All items owned, give random item
      const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
      toast({ title: '📦 Coffre ouvert !', description: `Tu as déjà tous les items de cette rareté !`, duration: 3000 });
      
      // Mark chest as opened
      await supabase.from('user_chests' as any).update({ is_opened: true, opened_at: new Date().toISOString() }).eq('id', chestId);
      await loadAllData();
      return randomItem;
    }

    // Weighted random - higher rarity = less likely
    const weights = eligibleItems.map(item => {
      const idx = rarityOrder.indexOf(item.rarity);
      return Math.max(1, 5 - idx); // common=5, uncommon=4, rare=3, epic=2, legendary=1
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedItem = eligibleItems[0];
    
    for (let i = 0; i < eligibleItems.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedItem = eligibleItems[i];
        break;
      }
    }

    // Add item to inventory
    await supabase.from('user_avatar_items' as any).insert({
      user_id: userId,
      item_id: selectedItem.id,
      obtained_via: 'chest'
    });

    // Mark chest as opened
    await supabase.from('user_chests' as any).update({ is_opened: true, opened_at: new Date().toISOString() }).eq('id', chestId);

    await loadAllData();
    return selectedItem;
  };

  const unlockItemByLevel = async (level: number) => {
    if (!userId) return;

    const ownedIds = new Set(userItems.map(ui => ui.item_id));
    const newItems = allItems.filter(
      item => item.unlock_method === 'level' && 
              (item.level_required || 1) <= level && 
              !ownedIds.has(item.id) &&
              !item.is_premium
    );

    if (newItems.length > 0) {
      await Promise.all(
        newItems.map(item =>
          supabase.from('user_avatar_items' as any).insert({
            user_id: userId,
            item_id: item.id,
            obtained_via: 'level'
          })
        )
      );

      // Award a chest every 5 levels
      if (level % 5 === 0) {
        const chestRarity = level >= 75 ? 'legendary' : level >= 50 ? 'epic' : level >= 25 ? 'rare' : level >= 10 ? 'uncommon' : 'common';
        await supabase.from('user_chests' as any).insert({
          user_id: userId,
          rarity: chestRarity,
          source: 'level'
        });
      }

      await loadAllData();
      
      if (newItems.length > 0) {
        toast({
          title: '🎉 Nouvel item débloqué !',
          description: `${newItems[0].name_fr}${newItems.length > 1 ? ` (+${newItems.length - 1} autres)` : ''}`,
          duration: 4000,
        });
      }
    }
  };

  const getEquippedForSlot = (slot: string): AvatarItem | undefined => {
    const equipped = equippedItems.find(e => e.slot === slot);
    if (!equipped) return undefined;
    return allItems.find(i => i.id === equipped.item_id);
  };

  const getOwnedItemsForSlot = (slot: string): AvatarItem[] => {
    const ownedIds = new Set(userItems.map(ui => ui.item_id));
    return allItems.filter(i => i.slot === slot && ownedIds.has(i.id));
  };

  const getLockedItemsForSlot = (slot: string): AvatarItem[] => {
    const ownedIds = new Set(userItems.map(ui => ui.item_id));
    return allItems.filter(i => i.slot === slot && !ownedIds.has(i.id));
  };

  const unopenedChests = chests.filter(c => !c.is_opened);

  return {
    allItems,
    userItems,
    equippedItems,
    chests: unopenedChests,
    quests,
    questProgress,
    loading,
    equipItem,
    unequipSlot,
    openChest,
    unlockItemByLevel,
    getEquippedForSlot,
    getOwnedItemsForSlot,
    getLockedItemsForSlot,
    loadAllData,
  };
};
