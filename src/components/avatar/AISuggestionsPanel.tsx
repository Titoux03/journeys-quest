/**
 * AISuggestionsPanel - AI-powered item combo recommendations
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Star, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PixelIcon } from './AvatarRenderer';
import { PIXEL_ITEMS, PREMIUM_PIXEL_ITEMS, RARITY_COLORS, RARITY_LABELS, PixelItemOverlay } from './AvatarEngine';

interface AISuggestion {
  combinations: {
    name: string;
    items: string[];
    description: string;
    rarity_tier: string;
  }[];
  quest: {
    title: string;
    description: string;
    target?: string;
    difficulty: string;
  };
  motivation: string;
}

interface AISuggestionsPanelProps {
  level: number;
  gender: string;
  equippedItems: string[];
  ownedItems: string[];
  onPreviewCombo: (itemKeys: string[]) => void;
}

const allPixelItems = [...PIXEL_ITEMS, ...PREMIUM_PIXEL_ITEMS];

function getPixelItem(key: string): PixelItemOverlay | undefined {
  return allPixelItems.find(p => p.key === key);
}

const DIFFICULTY_COLORS: Record<string, string> = {
  facile: 'text-green-400',
  moyen: 'text-yellow-400',
  difficile: 'text-red-400',
};

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  level,
  gender,
  equippedItems,
  ownedItems,
  onPreviewCombo,
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const itemSummary = allPixelItems.map(i => ({ key: i.key, name: i.nameFr, slot: i.slot, rarity: i.rarity, level: i.levelRequired }));

      const { data, error: fnError } = await supabase.functions.invoke('suggest-items', {
        body: {
          level,
          gender,
          equippedItems,
          ownedItems,
          allItems: itemSummary,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) {
        setError(data.error);
        toast({ title: 'Erreur AI', description: data.error, variant: 'destructive', duration: 3000 });
        return;
      }

      setSuggestions(data);
    } catch (e) {
      console.error('AI suggestion error:', e);
      setError('Impossible de charger les suggestions');
      toast({ title: 'Erreur', description: 'Impossible de contacter l\'IA', variant: 'destructive', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [level, gender, equippedItems, ownedItems, toast]);

  return (
    <div className="space-y-3">
      {/* Trigger button */}
      {!suggestions && !loading && (
        <motion.button
          onClick={fetchSuggestions}
          className="w-full p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 text-left relative overflow-hidden group"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">Suggestions IA</div>
              <div className="text-[10px] text-muted-foreground">
                Obtiens des combos d'items recommandés par l'IA
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.button>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="text-sm text-muted-foreground">L'IA analyse ton style...</p>
        </motion.div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <p className="text-xs text-destructive">{error}</p>
          <button onClick={fetchSuggestions} className="mt-2 text-xs text-primary underline">Réessayer</button>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {suggestions && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Motivation message */}
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/15"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">{suggestions.motivation}</p>
              </div>
            </motion.div>

            {/* Combinations */}
            {suggestions.combinations.map((combo, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-xl border border-border/20 bg-card"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_COLORS[combo.rarity_tier] || RARITY_COLORS.common }} />
                  <span className="text-xs font-bold">{combo.name}</span>
                  <span className="text-[9px] font-medium ml-auto" style={{ color: RARITY_COLORS[combo.rarity_tier] }}>
                    {RARITY_LABELS[combo.rarity_tier] || combo.rarity_tier}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">{combo.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {combo.items.map((key) => {
                      const item = getPixelItem(key);
                      if (!item) return (
                        <span key={key} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded">{key}</span>
                      );
                      return (
                        <div key={key} className="flex items-center gap-1 bg-secondary/50 rounded-lg px-1.5 py-1">
                          <PixelIcon pixels={item.pixels.slice(0, 4)} palette={item.palette} pixelSize={2} />
                          <span className="text-[9px] font-medium">{item.nameFr}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => onPreviewCombo(combo.items)}
                    className="flex-shrink-0 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary hover:bg-primary/20 transition-colors"
                  >
                    Aperçu
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Quest suggestion */}
            {suggestions.quest && (
              <motion.div
                className="p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-bold">{suggestions.quest.title}</span>
                  <span className={`text-[9px] font-medium ml-auto ${DIFFICULTY_COLORS[suggestions.quest.difficulty] || 'text-muted-foreground'}`}>
                    {suggestions.quest.difficulty}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{suggestions.quest.description}</p>
                {suggestions.quest.target && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-[9px] text-muted-foreground">Récompense :</span>
                    <span className="text-[9px] font-bold text-primary">{getPixelItem(suggestions.quest.target)?.nameFr || suggestions.quest.target}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Refresh button */}
            <button
              onClick={fetchSuggestions}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border/20 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Nouvelles suggestions
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
