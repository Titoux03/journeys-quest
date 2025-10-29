import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAthena } from '@/hooks/useAthena';
import { cn } from '@/lib/utils';

interface AthenaCoachProps {
  className?: string;
}

export const AthenaCoach: React.FC<AthenaCoachProps> = ({ className = "" }) => {
  const { currentMessage, dismissCurrentMessage, markAsRead } = useAthena();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentMessage && !currentMessage.read) {
      // Délai avant d'afficher pour un effet plus doux
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentMessage]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      dismissCurrentMessage();
    }, 300);
  };

  const handleRead = () => {
    if (currentMessage) {
      markAsRead(currentMessage.id);
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
      case 'warning':
        return 'from-orange-500/20 to-red-500/10 border-orange-500/30';
      case 'celebration':
        return 'from-green-500/20 to-emerald-500/10 border-green-500/30';
      case 'return':
        return 'from-blue-500/20 to-cyan-500/10 border-blue-500/30';
      default:
        return 'from-purple-500/20 to-pink-500/10 border-purple-500/30';
    }
  };

  if (!currentMessage || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed bottom-6 right-6 z-50 max-w-md w-full mx-4",
          "lg:bottom-8 lg:right-8",
          className
        )}
      >
        <motion.div
          className={cn(
            "relative bg-gradient-to-br backdrop-blur-xl rounded-2xl shadow-2xl border-2 overflow-hidden",
            getMessageStyle(currentMessage.type)
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {/* Effet de lumière animé */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, hsl(var(--primary)) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, hsl(var(--primary)) 0%, transparent 50%)',
                'radial-gradient(circle at 0% 0%, hsl(var(--primary)) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          {/* Contenu */}
          <div className="relative p-6 space-y-4">
            {/* Header avec avatar Athena */}
            <div className="flex items-start gap-4">
              <motion.div
                className="flex-shrink-0"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <motion.h3
                    className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Athena
                  </motion.h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Message */}
                <motion.p
                  className="text-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleRead}
                >
                  {currentMessage.message}
                </motion.p>
              </div>
            </div>

            {/* Actions */}
            <motion.div
              className="flex items-center justify-between pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Heart className="w-3 h-3" />
                <span>Ton coach personnel</span>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs hover:bg-white/10"
              >
                D'accord
              </Button>
            </motion.div>
          </div>

          {/* Particules décoratives */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"
            />
          </div>
        </motion.div>

        {/* Ombre portée animée */}
        <motion.div
          className="absolute inset-0 -z-10 blur-2xl opacity-30"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
