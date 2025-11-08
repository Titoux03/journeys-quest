import { motion } from 'framer-motion';
import { useLevel } from '@/hooks/useLevel';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, TrendingUp } from 'lucide-react';
import { playSound } from '@/utils/soundManager';
import { useEffect, useState } from 'react';

interface LevelDisplayProps {
  className?: string;
  compact?: boolean;
}

export const LevelDisplay = ({ className = "", compact = false }: LevelDisplayProps) => {
  const { user } = useAuth();
  const { levelData, loading, updateLevelOnLogin } = useLevel(user?.id);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Update level on mount
  useEffect(() => {
    if (user?.id) {
      updateLevelOnLogin();
    }
  }, [user?.id]);

  // Detect level up and play sound
  useEffect(() => {
    if (levelData && previousLevel !== null && levelData.level > previousLevel) {
      setShowLevelUp(true);
      
      // Play different sounds for major milestones
      if ([25, 50, 100, 150, 200].includes(levelData.level)) {
        playSound('level_up_major');
      } else {
        playSound('level_up');
      }
      
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    if (levelData) {
      setPreviousLevel(levelData.level);
    }
  }, [levelData?.level]);

  if (loading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!levelData) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <div>
            <div className="text-lg font-semibold">Niveau 1 — Initié du Calme</div>
            <div className="text-sm text-muted-foreground">Commence ton voyage</div>
          </div>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: number) => {
    if (level <= 10) return 'from-blue-500 to-cyan-500';
    if (level <= 25) return 'from-cyan-500 to-green-500';
    if (level <= 50) return 'from-green-500 to-yellow-500';
    if (level <= 75) return 'from-yellow-500 to-orange-500';
    if (level <= 100) return 'from-orange-500 to-red-500';
    if (level <= 150) return 'from-purple-500 to-pink-500';
    return 'from-pink-500 via-purple-500 to-indigo-500';
  };

  const getLevelIcon = (level: number) => {
    if (level <= 25) return '🌱';
    if (level <= 50) return '🌿';
    if (level <= 75) return '🌸';
    if (level <= 100) return '🌺';
    if (level <= 150) return '✨';
    return '🌌';
  };

  if (compact) {
    return (
      <motion.div
        className={`relative ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
          <span className="text-2xl">{getLevelIcon(levelData.level)}</span>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-primary">Niveau {levelData.level}</span>
            <span className="text-[10px] text-muted-foreground">{levelData.title}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`relative glass-card overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Level up animation */}
      {showLevelUp && (
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">✨</div>
            <div className="text-3xl font-bold text-primary mb-2">Niveau {levelData.level} !</div>
            <div className="text-lg text-muted-foreground">{levelData.title}</div>
          </motion.div>
        </motion.div>
      )}

      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getLevelColor(levelData.level)} opacity-10`} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-5xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {getLevelIcon(levelData.level)}
            </motion.span>
            <div>
              <div className="text-2xl font-bold text-foreground">
                Niveau {levelData.level}
              </div>
              <div className="text-sm text-primary font-medium">{levelData.title}</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xs text-muted-foreground">XP</div>
            <div className="text-lg font-mono font-bold">
              {levelData.xp}/{levelData.xpForNextLevel}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progression</span>
            <span>{Math.round(levelData.progressPercentage)}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getLevelColor(levelData.level)} rounded-full relative`}
              initial={{ width: 0 }}
              animate={{ width: `${levelData.progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white/30"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Prochain niveau</span>
            </div>
            <div className="text-lg font-bold">
              {levelData.xpForNextLevel - levelData.xp} XP
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Palier max</span>
            </div>
            <div className="text-lg font-bold">200</div>
          </div>
        </div>

        {/* Motivational message */}
        {levelData.level < 200 && (
          <motion.div
            className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-center text-muted-foreground">
              {levelData.level < 50 
                ? "Continue ton voyage, chaque jour te rapproche de la sérénité"
                : levelData.level < 100
                ? "Tu es sur la voie de la maîtrise intérieure"
                : "Tu approches des sommets du bien-être cosmique"}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
