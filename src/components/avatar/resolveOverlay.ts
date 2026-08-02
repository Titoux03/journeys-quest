/**
 * RÉSOLUTION D'OVERLAY — fait le pont entre un item stocké en base et son pixel art.
 *
 * Pourquoi ce fichier existe : les items de la table `avatar_items` sont insérés avec
 * `pixel_art_data = '{}'` (aucune migration ne renseigne `overlay_key`). Le rendu qui
 * lisait uniquement `pixel_art_data.overlay_key` ne trouvait donc JAMAIS de sprite —
 * résultat, aucun item équipé n'apparaissait sur le personnage (lunettes comprises).
 *
 * Stratégie en cascade, pour qu'un item ait TOUJOURS un visuel :
 *   1. `pixel_art_data.overlay_key` s'il est renseigné (chemin propre)
 *   2. correspondance exacte sur la clé, le nom EN ou le nom FR (normalisés)
 *   3. correspondance partielle (mots communs) dans le même emplacement
 *   4. repli sur un item du même emplacement, au plus proche en rareté
 */
import {
  PIXEL_ITEMS,
  PREMIUM_PIXEL_ITEMS,
  PixelItemOverlay,
} from './AvatarEngine';
import { EXTENDED_ITEMS } from './ItemCatalog';

export const ALL_OVERLAYS: PixelItemOverlay[] = [
  ...PIXEL_ITEMS,
  ...PREMIUM_PIXEL_ITEMS,
  ...EXTENDED_ITEMS,
];

const RARITY_RANK: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

/** minuscules, sans accents ni séparateurs — pour comparer "Lunettes de soleil" et "sunglasses". */
function norm(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Mots signifiants d'un libellé (on ignore les mots outils). */
const STOP_WORDS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'of', 'the', 'en', 'a']);
function words(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export interface DbLikeItem {
  name?: string | null;
  name_fr?: string | null;
  slot?: string | null;
  rarity?: string | null;
  pixel_art_data?: unknown;
}

/**
 * Retrouve le sprite correspondant à un item de la base.
 * Retourne `undefined` seulement si l'emplacement n'a aucun sprite disponible.
 */
export function resolveOverlay(item: DbLikeItem | null | undefined): PixelItemOverlay | undefined {
  if (!item) return undefined;

  // 1. chemin propre : la clé est explicitement stockée
  const explicit = (item.pixel_art_data as { overlay_key?: string } | null)?.overlay_key;
  if (explicit) {
    const found = ALL_OVERLAYS.find((o) => o.key === explicit);
    if (found) return found;
  }

  const slot = item.slot ?? undefined;
  const pool = slot ? ALL_OVERLAYS.filter((o) => o.slot === slot) : ALL_OVERLAYS;
  if (pool.length === 0) return undefined;

  const candidates = [item.name, item.name_fr].filter(Boolean) as string[];

  // 2. correspondance exacte sur clé / nom EN / nom FR
  for (const label of candidates) {
    const n = norm(label);
    const exact = pool.find(
      (o) => norm(o.key) === n || norm(o.name) === n || norm(o.nameFr) === n
    );
    if (exact) return exact;
  }

  // 3. correspondance partielle : mots en commun, la rareté départage les ex aequo
  //    (sinon toutes les capes tomberaient sur le même sprite)
  const target = RARITY_RANK[item.rarity ?? 'common'] ?? 0;
  let best: { overlay: PixelItemOverlay; score: number; gap: number } | null = null;
  for (const label of candidates) {
    for (const w of words(label)) {
      for (const o of pool) {
        const haystack = norm(`${o.key} ${o.name} ${o.nameFr}`);
        if (!haystack.includes(norm(w))) continue;
        const score = w.length;
        const gap = Math.abs((RARITY_RANK[o.rarity] ?? 0) - target);
        if (!best || score > best.score || (score === best.score && gap < best.gap)) {
          best = { overlay: o, score, gap };
        }
      }
    }
  }
  if (best) return best.overlay;

  // 4. repli : même emplacement, rareté la plus proche (jamais d'item invisible)
  return [...pool].sort(
    (a, b) =>
      Math.abs((RARITY_RANK[a.rarity] ?? 0) - target) -
      Math.abs((RARITY_RANK[b.rarity] ?? 0) - target)
  )[0];
}

/** Variante pratique quand on n'a besoin que de la clé. */
export function resolveOverlayKey(item: DbLikeItem | null | undefined): string | undefined {
  return resolveOverlay(item)?.key;
}
