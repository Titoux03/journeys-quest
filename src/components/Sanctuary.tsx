/**
 * LE SANCTUAIRE — la collection complète de ton âme.
 *
 * Rôle produit : rendre VISIBLE tout ce qui existe et comment l'obtenir.
 * Une collection incomplète appelle à être complétée (effet Zeigarnik), et
 * la condition de déblocage est toujours écrite en clair — jamais de mystère,
 * jamais de tirage payant. C'est ça qui donne envie de revenir sans manipuler.
 */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Crown, Info } from 'lucide-react';
import { PixelIcon } from '@/components/avatar';
import {
  PIXEL_ITEMS,
  PREMIUM_PIXEL_ITEMS,
  PixelItemOverlay,
  RARITY_COLORS,
  RARITY_LABELS,
  SLOT_META,
} from '@/components/avatar/AvatarEngine';
import { EXTENDED_ITEMS, EXTENDED_SLOTS } from '@/components/avatar/ItemCatalog';
import { CHESTS, ChestKind, formatOdds, Rarity } from '@/utils/soulEconomy';

interface SanctuaryProps {
  level: number;
  isPremium: boolean;
  /** clés des items déjà possédés */
  ownedKeys?: string[];
  onUpgrade?: () => void;
}

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

/**
 * Recadre l'aperçu sur la zone réellement dessinée.
 * Sans ça, un item dessiné en bas de la grille (ailes, décors) rendrait une vignette vide.
 */
function cropPreview(pixels: number[][]): number[][] {
  const rows = pixels.filter((r) => r.some((v) => v !== 0));
  if (rows.length === 0) return [[0]];
  let minC = Infinity;
  let maxC = -1;
  for (const r of rows) {
    r.forEach((v, c) => {
      if (v !== 0) {
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    });
  }
  return rows.slice(0, 8).map((r) => r.slice(minC, maxC + 1));
}

export const Sanctuary: React.FC<SanctuaryProps> = ({
  level,
  isPremium,
  ownedKeys = [],
  onUpgrade,
}) => {
  const [slotFilter, setSlotFilter] = useState<string>('all');
  const [showOdds, setShowOdds] = useState<ChestKind | null>(null);

  const allItems: (PixelItemOverlay & { premium?: boolean })[] = useMemo(
    () => [
      ...PIXEL_ITEMS.map((i) => ({ ...i, premium: false })),
      ...EXTENDED_ITEMS.map((i) => ({ ...i, premium: false })),
      ...PREMIUM_PIXEL_ITEMS.map((i) => ({ ...i, premium: true })),
    ],
    []
  );

  const allSlots = useMemo(
    () => [
      ...SLOT_META.map((s) => ({ id: s.id, label: s.label })),
      ...EXTENDED_SLOTS,
    ],
    []
  );

  const visible = useMemo(
    () => (slotFilter === 'all' ? allItems : allItems.filter((i) => i.slot === slotFilter)),
    [allItems, slotFilter]
  );

  const owned = useMemo(() => new Set(ownedKeys), [ownedKeys]);
  const isUnlocked = (item: PixelItemOverlay & { premium?: boolean }) =>
    owned.has(item.key) || (level >= item.levelRequired && (!item.premium || isPremium));

  const unlockedCount = allItems.filter(isUnlocked).length;
  const pct = Math.round((unlockedCount / allItems.length) * 100);

  const unlockLabel = (item: PixelItemOverlay & { premium?: boolean }) => {
    if (owned.has(item.key)) return 'Obtenu';
    if (item.premium && !isPremium) return 'Membre';
    if (level < item.levelRequired) return `Niv. ${item.levelRequired}`;
    return 'Disponible';
  };

  return (
    <div className="min-h-screen p-4 pb-28 sm:p-6">
      <div className="mx-auto max-w-2xl">
        {/* En-tête : progression de collection */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          className="mb-6 rounded-3xl border border-primary/15 p-6 text-center"
          style={{
            background: 'linear-gradient(160deg, hsl(220 45% 9%), hsl(220 50% 6%))',
            boxShadow: '0 0 40px hsl(45 100% 65% / 0.12)',
          }}
        >
          <h1 className="text-gradient-primary text-2xl font-bold">Le Sanctuaire</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tout ce que ton âme peut devenir.
          </p>

          <div className="mx-auto mt-5 max-w-xs">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-300"
                style={{ boxShadow: '0 0 12px hsl(45 100% 65% / 0.5)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, pct)}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 1 }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-bold text-primary">{unlockedCount}</span> / {allItems.length} révélés
              {' · '}
              {pct}%
            </p>
          </div>
        </motion.div>

        {/* Coffres + probabilités PUBLIQUES */}
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Les coffres
          </h2>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Tous les coffres sont <span className="font-semibold text-foreground">gratuits</span> et se
            méritent par tes actions. Aucun ne s'achète. Les chances sont affichées, toujours.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(CHESTS) as ChestKind[]).map((kind) => {
              const chest = CHESTS[kind];
              return (
                <button
                  key={kind}
                  onClick={() => setShowOdds(showOdds === kind ? null : kind)}
                  className="rounded-2xl border border-primary/15 p-3 text-left transition-colors hover:border-primary/35"
                  style={{ background: 'hsl(220 45% 8%)', boxShadow: `0 0 20px ${chest.glow}` }}
                >
                  <div
                    className={`mb-2 h-1.5 w-10 rounded-full bg-gradient-to-r ${chest.gradient}`}
                  />
                  <p className="text-sm font-semibold text-foreground">{chest.name}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {chest.howTo}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                    <Info className="h-3 w-3" />
                    {showOdds === kind ? 'Masquer' : 'Voir les chances'}
                  </span>

                  {showOdds === kind && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 space-y-1 border-t border-primary/10 pt-2"
                    >
                      {formatOdds(kind).map(({ rarity, percent }) => (
                        <div key={rarity} className="flex items-center justify-between text-[10px]">
                          <span style={{ color: RARITY_COLORS[rarity] }}>
                            {RARITY_LABELS[rarity]}
                          </span>
                          <span className="text-muted-foreground">{percent}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Filtres par emplacement */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSlotFilter('all')}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              slotFilter === 'all'
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-primary/15 text-muted-foreground hover:border-primary/30'
            }`}
          >
            Tout
          </button>
          {allSlots.map((s) => (
            <button
              key={s.id}
              onClick={() => setSlotFilter(s.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                slotFilter === s.id
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : 'border-primary/15 text-muted-foreground hover:border-primary/30'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Grille de collection */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {[...visible]
            .sort(
              (a, b) =>
                RARITY_ORDER.indexOf(a.rarity as Rarity) - RARITY_ORDER.indexOf(b.rarity as Rarity) ||
                a.levelRequired - b.levelRequired
            )
            .map((item, i) => {
              const unlocked = isUnlocked(item);
              const color = RARITY_COLORS[item.rarity] || '#9CA3AF';
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.015, 0.4), type: 'spring', bounce: 0, duration: 0.35 }}
                  className="relative flex flex-col items-center rounded-2xl border p-3 text-center"
                  style={{
                    borderColor: unlocked ? `${color}55` : 'hsl(220 35% 15%)',
                    background: unlocked
                      ? `linear-gradient(160deg, ${color}14, hsl(220 45% 8%))`
                      : 'hsl(220 45% 7%)',
                    boxShadow: unlocked ? `0 0 18px ${color}22` : 'none',
                  }}
                >
                  <div className={unlocked ? '' : 'opacity-25 grayscale'}>
                    <PixelIcon pixels={cropPreview(item.pixels)} palette={item.palette} pixelSize={3} />
                  </div>

                  <p
                    className={`mt-2 line-clamp-2 text-[11px] font-medium leading-tight ${
                      unlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {unlocked ? item.nameFr : '???'}
                  </p>

                  <span
                    className="mt-1 text-[9px] font-bold uppercase tracking-wide"
                    style={{ color }}
                  >
                    {RARITY_LABELS[item.rarity]}
                  </span>

                  {!unlocked && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                      {item.premium && !isPremium ? (
                        <Crown className="h-2.5 w-2.5 text-warning" />
                      ) : (
                        <Lock className="h-2.5 w-2.5" />
                      )}
                      {unlockLabel(item)}
                    </span>
                  )}
                </motion.div>
              );
            })}
        </div>

        {/* Invitation premium — jamais culpabilisante */}
        {!isPremium && (
          <button
            onClick={onUpgrade}
            className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-warning/20 bg-gradient-to-r from-warning/10 to-warning/5 p-4 text-left"
          >
            <Crown className="h-6 w-6 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-semibold text-warning">Collections de saison</p>
              <p className="text-xs text-muted-foreground">
                Chaque mois, une nouvelle collection entière à révéler.
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
