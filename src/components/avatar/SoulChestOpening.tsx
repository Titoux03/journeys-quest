/**
 * OUVERTURE DE COFFRE — le pic émotionnel de l'app.
 *
 * Mise en scène en 4 temps (structure d'arc) :
 *   1. ANTICIPATION — le coffre tremble, l'aura monte. Plus l'objet est rare, plus l'attente est longue.
 *      (c'est l'attente qui crée l'émotion, pas la révélation elle-même)
 *   2. RUPTURE — flash + éclatement lumineux
 *   3. RÉVÉLATION — l'item s'élève, halo de rareté, nom + rareté
 *   4. REPOS — on souffle, puis on continue
 *
 * Motion : uniquement transform/opacity (compositor), springs plutôt que courbes molles,
 * entrée plus marquée que la sortie, et chemin complet sous prefers-reduced-motion.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { PixelIcon } from './AvatarRenderer';
import { PixelItemOverlay, RARITY_COLORS, RARITY_LABELS } from './AvatarEngine';
import { CHESTS, ChestKind } from '@/utils/soulEconomy';
import { playSound } from '@/utils/soundManager';

type Phase = 'anticipation' | 'burst' | 'reveal' | 'rest';

interface SoulChestOpeningProps {
  kind: ChestKind;
  item: PixelItemOverlay;
  shards?: number;
  /** true si l'objet est déjà possédé (on convertit alors en éclats) */
  duplicate?: boolean;
  /** aperçu : la cérémonie se joue mais rien n'est réellement obtenu */
  preview?: boolean;
  onClose: () => void;
}

/** Plus c'est rare, plus l'attente est longue — l'anticipation fait la valeur. */
const ANTICIPATION_MS: Record<string, number> = {
  common: 900,
  uncommon: 1100,
  rare: 1400,
  epic: 1800,
  legendary: 2300,
  mythic: 2800,
};

export const SoulChestOpening: React.FC<SoulChestOpeningProps> = ({
  kind,
  item,
  shards,
  duplicate = false,
  preview = false,
  onClose,
}) => {
  const reduce = useReducedMotion();
  const chest = CHESTS[kind];
  const color = RARITY_COLORS[item.rarity] || '#9CA3AF';
  const isBig = ['epic', 'legendary', 'mythic'].includes(item.rarity);

  const [phase, setPhase] = useState<Phase>(reduce ? 'reveal' : 'anticipation');

  const anticipation = reduce ? 0 : ANTICIPATION_MS[item.rarity] ?? 1000;

  useEffect(() => {
    if (reduce) return;
    const t1 = setTimeout(() => {
      setPhase('burst');
      playSound('chest_open');
    }, anticipation);
    const t2 = setTimeout(() => setPhase('reveal'), anticipation + 320);
    const t3 = setTimeout(() => setPhase('rest'), anticipation + 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [anticipation, reduce]);

  // Rayons de lumière — uniquement pour les objets marquants
  const rays = useMemo(
    () => Array.from({ length: isBig ? 12 : 8 }).map((_, i) => (i * 360) / (isBig ? 12 : 8)),
    [isBig]
  );

  const revealed = phase === 'reveal' || phase === 'rest';

  const overlay = (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
      style={{
        background:
          'radial-gradient(circle at 50% 45%, hsl(220 45% 9%), hsl(220 60% 3%) 70%)',
        backgroundColor: 'hsl(220 60% 3%)',
      }}
      role="dialog"
      aria-modal="true"
      data-phase={phase}
    >
      {/* Flash de rupture — masque la coupe entre le coffre et la révélation */}
      {phase === 'burst' && !reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 45%, #fff, ${color}00 60%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      )}

      {/* Halo d'ambiance qui monte pendant l'anticipation */}
      <motion.div
        className="pointer-events-none absolute h-80 w-80 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${color}55, transparent 70%)` }}
        initial={{ scale: 0.5, opacity: 0.2 }}
        animate={{
          scale: revealed ? 1.5 : 0.9,
          opacity: revealed ? 0.75 : 0.45,
        }}
        transition={{ type: 'spring', bounce: 0, duration: revealed ? 0.6 : anticipation / 1000 }}
      />

        {/* ── 1 & 2. LE COFFRE : tension puis rupture ── */}
        {!revealed ? (
          <motion.div
            key="chest"
            className="relative flex flex-col items-center"
            exit={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={`h-28 w-28 rounded-3xl bg-gradient-to-br ${chest.gradient}`}
              style={{ boxShadow: `0 0 60px ${chest.glow}` }}
              initial={{ scale: 0.9, rotate: 0 }}
              animate={
                reduce
                  ? { scale: 1 }
                  : {
                      // tremblement qui s'intensifie : la tension monte
                      rotate: [0, -3, 3, -4, 4, -5, 5, 0],
                      scale: [1, 1.02, 1, 1.04, 1, 1.06, 1.1, 1.15],
                    }
              }
              transition={{ duration: anticipation / 1000, ease: 'easeIn' }}
            />
            <motion.p
              className="mt-6 text-sm font-medium text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.4 }}
            >
              {chest.name} s'ouvre…
            </motion.p>
          </motion.div>
        ) : (

        /* ── 3 & 4. RÉVÉLATION ── */
          <motion.div key="reward" className="relative flex flex-col items-center text-center">
            {/* Rayons */}
            {!reduce &&
              rays.map((deg, i) => (
                <motion.span
                  key={deg}
                  className="pointer-events-none absolute left-1/2 top-16 h-24 w-[2px] origin-bottom"
                  style={{ background: `linear-gradient(to top, ${color}00, ${color}AA)` }}
                  initial={{ rotate: deg, scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: [0, 0.9, 0.25] }}
                  transition={{ duration: 0.8, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}

            {/* L'objet s'élève */}
            <motion.div
              className="relative flex h-32 w-32 items-center justify-center rounded-3xl border"
              style={{
                borderColor: `${color}66`,
                background: `linear-gradient(160deg, ${color}22, hsl(220 50% 7%))`,
                boxShadow: `0 0 50px ${color}55`,
              }}
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: isBig ? 0.35 : 0.2, duration: 0.7 }}
            >
              <PixelIcon pixels={cropSprite(item.pixels)} palette={item.palette} pixelSize={6} />
            </motion.div>

            {/* Rareté + nom */}
            <motion.p
              className="mt-5 text-[11px] font-bold uppercase tracking-[0.25em]"
              style={{ color }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              {RARITY_LABELS[item.rarity]}
            </motion.p>
            <motion.h2
              className="mt-1 text-2xl font-bold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, type: 'spring', bounce: 0.2, duration: 0.5 }}
            >
              {item.nameFr}
            </motion.h2>

            {preview ? (
              <motion.p
                className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Aperçu · rien n'est ajouté
              </motion.p>
            ) : duplicate ? (
              <motion.p
                className="mt-2 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Tu l'avais déjà — il se transforme en éclats.
              </motion.p>
            ) : null}

            {/* Éclats gagnés */}
            {typeof shards === 'number' && shards > 0 && (
              <motion.div
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', bounce: 0.35, duration: 0.5 }}
              >
                <Sparkles className="h-3.5 w-3.5" />+{shards} éclats
              </motion.div>
            )}

            {/* Repos : on laisse respirer avant d'inviter à continuer */}
            <AnimatePresence>
              {phase === 'rest' && (
                <motion.button
                  onClick={onClose}
                  className="mt-8 rounded-full border border-primary/30 bg-primary/10 px-6 py-2.5 text-sm font-semibold text-primary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                >
                  Continuer
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
    </div>
  );

  // Rendu en portail : un overlay plein écran ne doit pas dépendre de l'arbre qui l'a ouvert
  return typeof document !== 'undefined' ? createPortal(overlay, document.body) : overlay;
};

/** Recadre le sprite sur sa zone dessinée (sinon un item dessiné en bas rend une vignette vide). */
function cropSprite(pixels: number[][]): number[][] {
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
  return rows.map((r) => r.slice(minC, maxC + 1));
}
