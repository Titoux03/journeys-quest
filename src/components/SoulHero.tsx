/**
 * SoulHero — L'écran d'accueil tourne autour de l'ÂME (l'avatar qui évolue).
 * C'est le héros de la page : grand, aura mystique, niveau + progression XP.
 * Affiché pour TOUT LE MONDE (invité inclus) → vend le concept dès la 1re seconde.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { GlobalAvatar } from '@/components/avatar/GlobalAvatar';
import { EvolutionStage } from '@/components/avatar/AvatarEngine';
import { Sparkles, ChevronRight } from 'lucide-react';

interface SoulHeroProps {
  level: number;
  progress: number;           // 0-100
  xp?: number;
  xpForNext?: number;
  evolution: EvolutionStage;
  title?: string;
  isGuest: boolean;
  onOpenAvatar: () => void;
  onSignup: () => void;
}

export const SoulHero: React.FC<SoulHeroProps> = ({
  level,
  progress,
  xp,
  xpForNext,
  evolution,
  title,
  isGuest,
  onOpenAvatar,
  onSignup,
}) => {
  // Couleur d'aura : glow du palier si dispo, sinon magenta "Force âme"
  const aura = evolution.glowColor || 'hsl(300 100% 50% / 0.22)';

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-8"
    >
      {/* Halo d'ambiance derrière tout le hero */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-6 mx-auto h-64 w-64 rounded-full blur-3xl opacity-60"
        style={{ background: `radial-gradient(circle, ${aura}, transparent 70%)` }}
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Avatar + aura pulsée */}
        <button
          onClick={onOpenAvatar}
          className="relative mb-5 outline-none"
          aria-label="Ouvrir mon âme"
        >
          {/* Anneau d'aura qui respire */}
          <motion.span
            className="absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: `radial-gradient(circle, ${aura}, transparent 65%)` }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Cercle de confinement premium */}
          <motion.div
            className="relative flex h-32 w-32 items-center justify-center rounded-full border border-primary/25"
            style={{
              background: 'radial-gradient(circle at 50% 30%, hsl(220 45% 12%), hsl(220 55% 6%))',
              boxShadow: `0 0 40px ${aura}, inset 0 0 30px hsl(220 80% 3% / 0.8)`,
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
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
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Niveau {level}{title ? ` · ${title}` : ''}
        </p>

        {/* Barre de progression XP */}
        <div className="w-full max-w-xs">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/60">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${evolution.color}`}
              style={{ boxShadow: `0 0 12px ${aura}` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(3, Math.min(100, progress))}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
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
