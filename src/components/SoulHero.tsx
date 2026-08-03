/**
 * SoulHero — L'écran d'accueil tourne autour de l'ÂME (l'avatar qui évolue).
 * C'est le héros de la page : grand, aura mystique vivante, niveau + progression XP.
 * Affiché pour TOUT LE MONDE (invité inclus) → vend le concept dès la 1re seconde.
 *
 * Motion (méthode Apple / Fluid Interfaces) : entrées en spring critique (pas d'overshoot
 * gratuit), boucles lentes en transform/opacity uniquement (compositor 60fps),
 * tout désactivé sous prefers-reduced-motion.
 */
import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GlobalAvatar } from '@/components/avatar/GlobalAvatar';
import { EvolutionStage } from '@/components/avatar/AvatarEngine';
import { getSoulReflection } from '@/utils/soulEconomy';
import { Sparkles, ChevronRight } from 'lucide-react';

interface SoulHeroProps {
  level: number;
  progress: number;           // 0-100
  xp?: number;
  xpForNext?: number;
  evolution: EvolutionStage;
  title?: string;
  isGuest: boolean;
  /** moyenne des derniers jours — l'âme reflète, avec douceur, jamais en reproche */
  recentAverage?: number | null;
  /** éclats d'âme gagnés par les actions réelles */
  shards?: number | null;
  onOpenAvatar: () => void;
  onSignup: () => void;
}

/** Braises d'âme qui s'élèvent doucement autour du personnage. */
const SoulEmbers: React.FC<{ aura: string }> = ({ aura }) => {
  const reduce = useReducedMotion();
  const motes = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        id: i,
        x: (i * 37) % 120 - 60,          // -60..60 réparti, stable
        size: 2 + ((i * 7) % 4),          // 2..5 px
        delay: (i * 0.6) % 5,
        duration: 4.5 + ((i * 5) % 4),    // 4.5..8.5 s
        gold: i % 3 === 0,
      })),
    []
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative h-40 w-40">
        {motes.map((m) => (
          <motion.span
            key={m.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: m.size,
              height: m.size,
              background: m.gold ? 'hsl(45 100% 70%)' : aura.replace(/\/\s*[\d.]+\)/, '/ 0.9)'),
              boxShadow: `0 0 6px ${m.gold ? 'hsl(45 100% 65% / 0.8)' : aura}`,
            }}
            initial={{ opacity: 0, x: m.x, y: 40 }}
            animate={{ opacity: [0, 0.9, 0], y: [-10, -120], x: [m.x, m.x + (m.gold ? 8 : -8)] }}
            transition={{
              duration: m.duration,
              delay: m.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const SoulHero: React.FC<SoulHeroProps> = ({
  level,
  progress,
  xp,
  xpForNext,
  evolution,
  title,
  isGuest,
  recentAverage = null,
  shards = null,
  onOpenAvatar,
  onSignup,
}) => {
  const reduce = useReducedMotion();
  // Couleur d'aura : glow du palier si dispo, sinon magenta "Force âme"
  const aura = evolution.glowColor || 'hsl(300 100% 50% / 0.22)';
  // Le Reflet : l'âme reflète tes derniers jours — douceur uniquement, jamais de punition
  const reflection = getSoulReflection(recentAverage);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
      className="relative mb-8"
    >
      {/* Halo d'ambiance derrière tout le hero */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-6 mx-auto h-64 w-64 rounded-full blur-3xl opacity-60"
        style={{ background: `radial-gradient(circle, ${aura}, transparent 70%)` }}
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Avatar + aura vivante */}
        <button
          onClick={onOpenAvatar}
          className="relative mb-5 outline-none"
          aria-label="Ouvrir mon âme"
        >
          {/* Anneau conique qui tourne très lentement (halo mystique) */}
          {!reduce && (
            <motion.span
              className="absolute left-1/2 top-1/2 -z-10 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-md"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${aura}, transparent 60%)`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {/* Aura qui respire — son intensité et son rythme reflètent tes derniers jours */}
          <motion.span
            className="absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: `radial-gradient(circle, ${aura}, transparent 65%)` }}
            animate={
              reduce
                ? undefined
                : {
                    scale: [1, 1.12, 1],
                    opacity: [
                      0.55 * reflection.auraOpacity,
                      0.85 * reflection.auraOpacity,
                      0.55 * reflection.auraOpacity,
                    ],
                  }
            }
            transition={{ duration: reflection.breathDuration, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Braises */}
          <SoulEmbers aura={aura} />

          {/* Cercle de confinement premium */}
          <motion.div
            className="relative flex h-32 w-32 items-center justify-center rounded-full border border-primary/25"
            style={{
              background: 'radial-gradient(circle at 50% 30%, hsl(220 45% 12%), hsl(220 55% 6%))',
              boxShadow: `0 0 40px ${aura}, inset 0 0 30px hsl(220 80% 3% / 0.8)`,
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          >
            <GlobalAvatar size="xl" animate showGlow={false} />
          </motion.div>
        </button>

        {/* Palier d'évolution */}
        <div className="mb-1 flex items-center gap-2">
          <span
            className={`bg-gradient-to-r ${evolution.color} bg-clip-text text-transparent text-lg font-bold tracking-tight`}
          >
            {evolution.name}
          </span>
        </div>

        {/* Niveau / titre */}
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Niveau {level}{title ? ` · ${title}` : ''}
        </p>

        {/* Le Reflet — état de l'âme, toujours doux */}
        {!isGuest && (
          <p className="mb-4 max-w-xs text-xs italic leading-relaxed text-muted-foreground/80">
            {reflection.message}
          </p>
        )}

        {/* Éclats d'âme — la monnaie gagnée par les actions réelles */}
        {!isGuest && shards != null && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            {shards} éclats
          </div>
        )}

        {/* Barre de progression XP */}
        <div className="w-full max-w-xs">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${evolution.color}`}
              style={{ boxShadow: `0 0 12px ${aura}` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(3, Math.min(100, progress))}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 1, delay: 0.3 }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>{xp != null && xpForNext != null ? `${xp} / ${xpForNext} XP` : 'vers le prochain niveau'}</span>
          </div>
        </div>

        {/* CTA selon état */}
        {isGuest ? (
          <motion.button
            onClick={onSignup}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary"
          >
            <Sparkles className="h-4 w-4" />
            Éveille ton âme — crée ton compte
          </motion.button>
        ) : (
          <button
            onClick={onOpenAvatar}
            className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Personnaliser mon âme
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.section>
  );
};
