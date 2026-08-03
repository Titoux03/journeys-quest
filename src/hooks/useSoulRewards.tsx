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
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLevel } from '@/hooks/useLevel';
import { toast } from 'sonner';
import { SHARD_REWARDS, SHARD_LABELS, ShardSource } from '@/utils/soulEconomy';

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

export const useSoulRewards = () => {
  const { user } = useAuth();
  const {
    updateLevelOnJournal,
    updateLevelOnMeditation,
    updateLevelOnAddiction,
    updateLevelOnLogin,
  } = useLevel(user?.id);

  /**
   * Récompense une action réelle : XP (donc évolution du personnage) + éclats d'âme,
   * avec un retour visible immédiat.
   */
  const reward = useCallback(
    async (source: ShardSource, options?: { silent?: boolean }) => {
      const amount = SHARD_REWARDS[source] ?? 0;
      const total = addShards(amount);

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

  return { reward, shards: getShards() };
};
