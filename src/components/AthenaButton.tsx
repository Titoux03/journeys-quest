import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAthena } from '@/hooks/useAthena';
import { useToast } from '@/hooks/use-toast';

interface AthenaButtonProps {
  className?: string;
}

export const AthenaButton: React.FC<AthenaButtonProps> = ({ className = "" }) => {
  const { generateMessage, isLoading } = useAthena();
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async () => {
    setIsAnimating(true);
    
    const message = await generateMessage('L\'utilisateur a demandé un message de motivation');
    
    if (!message) {
      toast({
        title: "Erreur",
        description: "Impossible de générer un message. Réessayez plus tard.",
        variant: "destructive",
      });
    }
    
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={handleClick}
        disabled={isLoading}
        className="relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
        size="lg"
      >
        <motion.div
          animate={isAnimating ? { rotate: 360 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isLoading ? 'Athena réfléchit...' : 'Parler à Athena'}</span>
        </motion.div>
        
        {/* Effet de brillance */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </Button>
    </motion.div>
  );
};
