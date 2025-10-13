import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodoCompletionCelebrationProps {
  todoText: string;
  onComplete: () => void;
}

const AFFIRMATIONS = [
  "Excellent travail ! 🎉",
  "Bravo pour cette victoire ! ✨",
  "Tu fais des progrès incroyables ! 💪",
  "Chaque pas compte ! 🌟",
  "Tu es sur la bonne voie ! 🚀",
  "Fier de toi ! ⭐",
  "Continue comme ça ! 💎",
  "Tu es une machine ! 🔥",
];

export const TodoCompletionCelebration: React.FC<TodoCompletionCelebrationProps> = ({
  todoText,
  onComplete,
}) => {
  const [visible, setVisible] = useState(true);
  const [affirmation] = useState(() => 
    AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]
  );

  useEffect(() => {
    // Trigger confetti
    const duration = 1500;
    const end = Date.now() + duration;

    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
        disableForReducedMotion: true,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Auto-hide after 2 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-fade-in">
      <div className="journey-card p-8 text-center animate-scale-in shadow-2xl pointer-events-auto max-w-sm mx-4">
        <div className="mb-4 relative">
          <CheckCircle className="w-16 h-16 text-success mx-auto animate-pulse" />
          <Sparkles className="w-8 h-8 text-yellow-500 absolute top-0 right-1/4 animate-spin" />
        </div>
        
        <h3 className="text-2xl font-bold text-gradient-primary mb-2">
          {affirmation}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-2">
          "{todoText}"
        </p>
        
        <div className="text-sm text-success font-medium">
          Tâche terminée avec succès
        </div>
      </div>
    </div>
  );
};
