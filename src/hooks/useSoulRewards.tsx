/**
 * RÉCOMPENSES DE L'ÂME — le pont entre les actions réelles et l'évolution du personnage.
 *
 * Pourquoi ce hook existe : l'app promet "ton âme évolue quand tu évolues", mais
 * jusqu'ici SEULE la connexion donnait de l'XP. Faire son bilan, méditer, tenir une
 * journée sans rechute, s'étirer, cocher ses tâches : rien ne remontait au personnage.
 * La gamification était décorative.
 *
 * Principe (The Slight Edge) : on récompense le fait de s'être présenté, pas la performance.
 * Une journée difficile rapporte autant qu'une bonne — c'est la régularité qui compose.
 */
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLevel } from '@/hooks/useLevel';
import { toast } from 'sonner';
import { SHARD_REWARDS, SHARD_LABELS, ShardSource, chestForStreak, CHESTS } from '@/utils/soulEconomy';

/** Type d'activité accepté par la fonction de niveau côté base. */
type ActivityType = 'login' | 'journal' | 'meditation' | 'addiction';

const ACTIVITY_BY_SOURCE: Record<ShardSource, ActivityType> = {
  daily_review: 'journal',
  free_note: 'journal',
  focus_session: 'meditation',
  abstinence_day: 'addiction',
  stretching: 'meditation',
  level_up: 'login',
  streak_milestone: 'login',
};

const SHARDS_KEY = 'soul_shards';

export function getShards(): number {
  try {
    return parseInt(localStorage.getItem(SHARDS_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

function addShards(amount: number): number {
  const next = getShards() + amount;
  try {
    localStorage.setItem(SHARDS_KEY, String(next));
  } catch {
    /* stockage indisponible : on n'empêche jamais l'action de l'utilisateur */
  }
  return next;
}

/**
 * Attribue le coffre du jour (premier bilan) et les coffres de palier de constance.
 * Toujours gratuit et mérité — jamais achetable, jamais aléatoire dans son déclenchement.
 */
async function grantChestIfDue(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `chest_granted_${today}`;
  try {
    if (localStorage.getItem(dailyKey)) return;
    localStorage.setItem(dailyKey, '1');
  } catch {
    return;
  }

  // Coffre de l'Aube : offert au premier bilan de la journée
  try {
    await supabase.from('user_chests' as any).insert({
      user_id: userId,
      rarity: 'common',
      source: 'daily',
    });
  } catch {
    /* l'échec ne doit pas interrompre le parcours */
  }

  // Palier de constance : un coffre plus rare tous les 3 jours consécutifs
  try {
    const streak = parseInt(localStorage.getItem('soul_streak') || '0', 10) + 1;
    localStorage.setItem('soul_streak', String(streak));
    const kind = chestForStreak(streak);
    if (kind && kind !== 'aube') {
      const rarityByKind: Record<string, string> = {
        eclat: 'uncommon',
        astral: 'rare',
        mythique: 'epic',
      };
      await supabase.from('user_chests' as any).insert({
        user_id: userId,
        rarity: rarityByKind[kind] || 'uncommon',
        source: 'streak',
      });
      toast.success(`${CHESTS[kind].name} débloqué !`, {
        description: `${streak} jours de constance`,
        duration: 3500,
      });
    }
  } catch {
    /* idem */
  }
}

export const useSoulRewards = () => {
  const { user } = useAuth();
  const [shards, setShardsState] = useState<number>(getShards());
  const {
    updateLevelOnJournal,
    updateLevelOnMeditation,
    updateLevelOnAddiction,
    updateLevelOnLogin,
  } = useLevel(user?.id);

  // Au montage : on récupère le total de la base si disponible
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('user_levels')
          .select('shards')
          .eq('user_id', user.id)
          .single();
        const remote = (data as { shards?: number } | null)?.shards;
        if (!error && typeof remote === 'number' && !cancelled) {
          try { localStorage.setItem(SHARDS_KEY, String(remote)); } catch { /* ignore */ }
          setShardsState(remote);
        }
      } catch {
        /* colonne absente : on reste sur le compteur local */
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  /**
   * Récompense une action réelle : XP (donc évolution du personnage) + éclats d'âme,
   * avec un retour visible immédiat.
   */
  const reward = useCallback(
    async (source: ShardSource, options?: { silent?: boolean }) => {
      const amount = SHARD_REWARDS[source] ?? 0;
      // Optimiste en local, puis synchronisé en base si la colonne existe
      let total = addShards(amount);
      setShardsState(total);

      if (user?.id && amount > 0) {
        try {
          const { data, error } = await supabase.rpc('add_soul_shards' as any, {
            user_id_param: user.id,
            amount,
          });
          if (!error && typeof data === 'number') {
            total = data;
            try { localStorage.setItem(SHARDS_KEY, String(total)); } catch { /* ignore */ }
            setShardsState(total);
          }
        } catch {
          /* la fonction n'existe pas encore : le compteur local fait foi */
        }
      }

      // L'XP fait réellement évoluer l'âme (niveau, palier, déblocages)
      if (user?.id) {
        const runners: Record<ActivityType, () => void> = {
          journal: updateLevelOnJournal,
          meditation: updateLevelOnMeditation,
          addiction: updateLevelOnAddiction,
          login: updateLevelOnLogin,
        };
        try {
          await runners[ACTIVITY_BY_SOURCE[source]]();
        } catch {
          /* l'échec de synchro ne doit pas casser le parcours */
        }
      }

      // Coffres mérités : offerts par l'app, jamais achetés
      if (user?.id && source === 'daily_review') {
        await grantChestIfDue(user.id);
      }

      if (!options?.silent && amount > 0) {
        toast.success(`+${amount} éclats — ${SHARD_LABELS[source]}`, {
          description: `${total} éclats d'âme au total`,
          duration: 2500,
        });
      }

      return { gained: amount, total };
    },
    [user?.id, updateLevelOnJournal, updateLevelOnMeditation, updateLevelOnAddiction, updateLevelOnLogin]
  );

  return { reward, shards };
};
