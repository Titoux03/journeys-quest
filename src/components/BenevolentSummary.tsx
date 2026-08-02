/**
 * Carte de bilan BIENVEILLANT — remplace le "Score global X.X" rouge.
 * Ne juge jamais : met en avant les "lumières" du jour + un recadrage doux.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { BenevolentSummary as Summary, SoulTone } from '@/utils/benevolentScore';

const TONE_STYLE: Record<SoulTone, { ring: string; glow: string; emoji: string }> = {
  radiant: { ring: 'from-primary to-amber-300', glow: 'hsl(45 100% 65% / 0.35)', emoji: '✨' },
  steady:  { ring: 'from-blue-400 to-cyan-500', glow: 'hsl(200 80% 55% / 0.28)', emoji: '🌗' },
  tender:  { ring: 'from-indigo-400 to-purple-500', glow: 'hsl(270 70% 60% / 0.28)', emoji: '🌙' },
};

export const BenevolentSummary: React.FC<{ summary: Summary }> = ({ summary }) => {
  const style = TONE_STYLE[summary.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
      className="relative mb-8 overflow-hidden rounded-3xl border border-primary/15 p-6 text-center"
      style={{
        background: 'linear-gradient(160deg, hsl(220 45% 9%), hsl(220 50% 6%))',
        boxShadow: `0 0 40px ${style.glow}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-40 w-40 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${style.glow}, transparent 70%)` }}
      />

      <div className="relative">
        <div className="mb-1 text-3xl">{style.emoji}</div>
        <h3 className={`bg-gradient-to-r ${style.ring} bg-clip-text text-xl font-bold text-transparent`}>
          {summary.headline}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {summary.reframe}
        </p>

        {/* Les lumières du jour — toujours présentes, même une journée basse */}
        {summary.lights.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary/80">
              <Sparkles className="h-3.5 w-3.5" />
              {summary.lightsTitle}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {summary.lights.map((light, i) => (
                <motion.span
                  key={light.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.08, type: 'spring', bounce: 0.3, duration: 0.4 }}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {light.label}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
