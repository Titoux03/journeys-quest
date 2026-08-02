/**
 * ÉCONOMIE DE L'ÂME — le moteur de progression, de déblocage et de récompense.
 *
 * Philosophie (non négociable) : cette app aide des gens à sortir d'addictions
 * (clope, porno, réseaux). On ne peut donc PAS utiliser les mécaniques de compulsion
 * des réseaux sociaux. Règles dures :
 *
 *  1. Tout coffre est GRATUIT et MÉRITÉ par une action réelle. Rien ne s'achète au hasard.
 *     (→ plaisir de la surprise sans gambling, et zéro friction App Store guideline 3.1.1)
 *  2. Les probabilités sont PUBLIQUES et affichées dans l'app.
 *  3. Les déblocages majeurs sont DÉTERMINISTES : l'user sait ce qu'il vise.
 *     (Cialdini — commitment & consistency : un objectif su et choisi engage bien plus qu'un tirage)
 *  4. Aucune récompense ne dépend de la "qualité" de la journée. On récompense le fait
 *     de se présenter, pas la performance. Une journée de merde rapporte autant.
 *     (The Slight Edge : ce sont les disciplines quotidiennes composées qui produisent le résultat)
 *  5. Rien ne se perd, rien n'expire, aucun timer punitif.
 */

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

/* ─────────────────────────  MONNAIE : LES ÉCLATS D'ÂME (✦)  ───────────────────────── */

export type ShardSource =
  | 'daily_review'
  | 'free_note'
  | 'focus_session'
  | 'abstinence_day'
  | 'stretching'
  | 'level_up'
  | 'streak_milestone';

/** Ce que rapporte chaque action. Aucune n'est conditionnée à un "bon" score. */
export const SHARD_REWARDS: Record<ShardSource, number> = {
  daily_review: 10,      // faire son bilan, quel qu'il soit
  free_note: 5,
  focus_session: 8,
  abstinence_day: 5,     // par addiction suivie, chaque jour tenu
  stretching: 6,
  level_up: 25,
  streak_milestone: 40,
};

export const SHARD_LABELS: Record<ShardSource, string> = {
  daily_review: 'Bilan du jour',
  free_note: 'Note libre',
  focus_session: 'Session de focus',
  abstinence_day: 'Journée tenue',
  stretching: 'Étirements',
  level_up: 'Nouveau niveau',
  streak_milestone: 'Palier de constance',
};

/* ─────────────────────────  COFFRES (toujours gratuits)  ───────────────────────── */

export type ChestKind = 'aube' | 'eclat' | 'astral' | 'mythique';

export interface ChestDef {
  kind: ChestKind;
  name: string;
  /** Comment on l'obtient — affiché tel quel à l'user, jamais de mystère. */
  howTo: string;
  gradient: string;
  glow: string;
  /** Probabilités PUBLIQUES, affichées dans l'app. Somme = 1. */
  odds: Partial<Record<Rarity, number>>;
  shards: number;
}

export const CHESTS: Record<ChestKind, ChestDef> = {
  aube: {
    kind: 'aube',
    name: "Coffre de l'Aube",
    howTo: 'Offert à ton premier bilan de la journée',
    gradient: 'from-amber-300 to-orange-400',
    glow: 'hsl(38 95% 60% / 0.35)',
    odds: { common: 0.6, uncommon: 0.3, rare: 0.1 },
    shards: 10,
  },
  eclat: {
    kind: 'eclat',
    name: "Coffre d'Éclat",
    howTo: 'Tous les 3 jours de constance',
    gradient: 'from-cyan-300 to-blue-500',
    glow: 'hsl(200 90% 60% / 0.35)',
    odds: { common: 0.35, uncommon: 0.35, rare: 0.22, epic: 0.08 },
    shards: 25,
  },
  astral: {
    kind: 'astral',
    name: 'Coffre Astral',
    howTo: 'Aux paliers de constance (7, 14, 30 jours…)',
    gradient: 'from-purple-400 to-indigo-600',
    glow: 'hsl(270 80% 62% / 0.4)',
    odds: { uncommon: 0.3, rare: 0.4, epic: 0.25, legendary: 0.05 },
    shards: 60,
  },
  mythique: {
    kind: 'mythique',
    name: 'Coffre Mythique',
    howTo: "Aux grands paliers d'évolution et fins de saison",
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    glow: 'hsl(340 90% 62% / 0.45)',
    odds: { rare: 0.3, epic: 0.42, legendary: 0.23, mythic: 0.05 },
    shards: 150,
  },
};

/** Tire une rareté selon les probabilités publiques du coffre. */
export function rollRarity(kind: ChestKind, rng: () => number = Math.random): Rarity {
  const odds = CHESTS[kind].odds;
  let roll = rng();
  for (const [rarity, p] of Object.entries(odds) as [Rarity, number][]) {
    if (roll < p) return rarity;
    roll -= p;
  }
  return (Object.keys(odds)[0] as Rarity) || 'common';
}

/** Formatage des probabilités pour l'affichage transparent. */
export function formatOdds(kind: ChestKind): { rarity: Rarity; percent: string }[] {
  return (Object.entries(CHESTS[kind].odds) as [Rarity, number][]).map(([rarity, p]) => ({
    rarity,
    percent: `${(p * 100).toFixed(p * 100 < 10 ? 1 : 0)}%`,
  }));
}

/* ─────────────────────────  CONSTANCE (streak) — avec GRÂCE  ───────────────────────── */

/**
 * Paliers de constance. Un jour manqué ne remet JAMAIS à zéro brutalement :
 * on dispose de "jours de grâce" (regagnés avec le temps).
 * (Anti-culpabilisation : rater un jour ne doit pas casser la relation à l'app.)
 */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365] as const;

export const GRACE_DAYS_MAX = 2;

export function chestForStreak(day: number): ChestKind | null {
  if (day === 365 || day === 180 || day === 100) return 'mythique';
  if (day === 30 || day === 60) return 'astral';
  if (day === 7 || day === 14) return 'astral';
  if (day % 3 === 0) return 'eclat';
  return null;
}

export function nextMilestone(current: number): number | null {
  return STREAK_MILESTONES.find((m) => m > current) ?? null;
}

/* ─────────────────────────  SAISONS — la raison de rester  ───────────────────────── */

/**
 * Chaque saison apporte une collection thématique. C'est le moteur de rétention
 * de l'abonnement : du nouveau à collectionner tous les mois, jamais du "pay to win".
 * Le contenu de saison est SU d'avance (déterministe), pas tiré au sort.
 */
export interface Season {
  id: string;
  name: string;
  tagline: string;
  gradient: string;
  /** clés d'items (PIXEL_ITEMS / PREMIUM_PIXEL_ITEMS) qui composent la collection */
  itemKeys: string[];
  premiumOnly: boolean;
}

export const SEASONS: Season[] = [
  {
    id: 's1-eveil',
    name: "Saison I — L'Éveil",
    tagline: 'Là où toute âme commence.',
    gradient: 'from-amber-300 to-orange-500',
    itemKeys: [],
    premiumOnly: false,
  },
  {
    id: 's2-ombres',
    name: 'Saison II — Les Ombres',
    tagline: 'Ce que tu traverses te façonne.',
    gradient: 'from-indigo-400 to-purple-600',
    itemKeys: [],
    premiumOnly: true,
  },
];

/* ─────────────────────────  AVANTAGES PREMIUM (jamais du hasard payant)  ───────────────────────── */

export const PREMIUM_PERKS: { title: string; description: string }[] = [
  {
    title: 'Collections de saison',
    description: 'Chaque mois, une nouvelle collection thématique entière à débloquer.',
  },
  {
    title: 'Éclats doublés',
    description: 'Toutes tes actions rapportent deux fois plus d\'éclats d\'âme.',
  },
  {
    title: 'Auras & palettes exclusives',
    description: 'Les couleurs et auras réservées aux membres, pour une âme unique.',
  },
  {
    title: 'Coffre Astral hebdomadaire',
    description: 'Un coffre Astral offert chaque semaine, en plus de ceux que tu mérites.',
  },
  {
    title: 'Historique & statistiques complets',
    description: 'Toute ta trajectoire, sans limite de temps.',
  },
];

/* ─────────────────────────  LE REFLET — l'âme te reflète avec douceur  ───────────────────────── */

export type SoulState = 'radiant' | 'serene' | 'resting';

export interface SoulReflection {
  state: SoulState;
  label: string;
  message: string;
  /** modulations visuelles douces (jamais punitives) */
  auraOpacity: number;
  breathDuration: number;
}

/**
 * L'âme reflète les derniers jours — mais JAMAIS comme un reproche.
 * Une période basse ne "punit" pas : l'âme se repose, et elle récupère avec toi.
 * Elle ne meurt jamais, ne se dégrade jamais durablement.
 */
export function getSoulReflection(recentAverage: number | null): SoulReflection {
  if (recentAverage == null) {
    return {
      state: 'serene',
      label: 'Sereine',
      message: 'Ton âme attend tes premiers pas.',
      auraOpacity: 0.6,
      breathDuration: 4.5,
    };
  }
  if (recentAverage >= 6.5) {
    return {
      state: 'radiant',
      label: 'Rayonnante',
      message: 'Ton âme rayonne — ces derniers jours t\'ont nourri.',
      auraOpacity: 1,
      breathDuration: 3.5,
    };
  }
  if (recentAverage >= 4) {
    return {
      state: 'serene',
      label: 'Sereine',
      message: 'Ton âme est stable. Tu avances, tranquillement.',
      auraOpacity: 0.7,
      breathDuration: 4.5,
    };
  }
  return {
    state: 'resting',
    label: 'En repos',
    message: 'Ton âme se repose avec toi. Elle reprendra des forces, comme toi.',
    auraOpacity: 0.45,
    breathDuration: 6,
  };
}
