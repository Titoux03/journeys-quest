import React, { useState, useEffect } from 'react';
import { Crown, TrendingUp, Clock, Users, Star, Zap, Target } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useGongSounds } from '@/hooks/useGongSounds';
import { Button } from '@/components/ui/button';

interface PremiumProgressInterruptorProps {
  journalDay: number;
  onClose: () => void;
  className?: string;
}

export const PremiumProgressInterruptor: React.FC<PremiumProgressInterruptorProps> = ({ 
  journalDay, 
  onClose,
  className = ""
}) => {
  const { isPremium, showUpgradeModal } = usePremium();
  const { user } = useAuth();
  const { playPremium } = useGongSounds();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleUpgrade = () => {
    playPremium();
    showUpgradeModal();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isPremium || !user) return null;

  // Montrer seulement aux jours critiques (3, 7, 14, 21...)
  const shouldShow = journalDay === 3 || journalDay === 7 || journalDay === 14 || journalDay === 21 || (journalDay > 21 && journalDay % 7 === 0);
  
  if (!shouldShow) return null;

  return (
    <div className={`fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-md w-full journey-card-premium p-8 text-center relative overflow-hidden">
        {/* Animation de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] animate-[slide-right_3s_ease-in-out_infinite]"></div>
        
        {/* Bouton fermer discret */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm"
        >
          ✕
        </button>

        {/* Badge de jour */}
        <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
          Jour {journalDay} 🎯
        </div>

        {/* Icon principale */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center pulse-glow">
          <Crown className="w-10 h-10 text-primary-foreground" />
        </div>

        {/* Message personnalisé selon le jour */}
        {journalDay === 3 && (
          <>
            <h2 className="text-2xl font-bold text-gradient-primary mb-3">
              Bravo ! 3 jours de suite 🔥
            </h2>
            <p className="text-muted-foreground mb-6">
              Tu fais partie des 23% qui tiennent plus de 3 jours. Les utilisateurs Premium maintiennent leur streak 5x plus longtemps.
            </p>
          </>
        )}

        {journalDay === 7 && (
          <>
            <h2 className="text-2xl font-bold text-gradient-primary mb-3">
              Incroyable ! Une semaine complète 🚀
            </h2>
            <p className="text-muted-foreground mb-6">
              Seulement 7% arrivent à 1 semaine. Tu es exceptionnel ! Les Premium débloqueraient maintenant des badges exclusifs.
            </p>
          </>
        )}

        {journalDay === 14 && (
          <>
            <h2 className="text-2xl font-bold text-gradient-primary mb-3">
              Legend ! 2 semaines d'affilée 👑
            </h2>
            <p className="text-muted-foreground mb-6">
              Tu es dans le top 3% ! Mais sans Premium, tu perds l'historique complet et les statistiques de progression.
            </p>
          </>
        )}

        {journalDay >= 21 && (
          <>
            <h2 className="text-2xl font-bold text-gradient-primary mb-3">
              Maître absolu ! {journalDay} jours 🏆
            </h2>
            <p className="text-muted-foreground mb-6">
              Tu es dans l'élite mondiale ! Mais imagine avec Premium : suivi d'addictions, badges, communauté...
            </p>
          </>
        )}

        {/* Stats de comparaison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-secondary/30 rounded-lg p-3">
            <div className="text-lg font-bold text-foreground">Toi</div>
            <div className="text-sm text-muted-foreground">{journalDay} jours</div>
            <div className="text-xs text-warning">Limité</div>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="text-lg font-bold text-gradient-primary">Premium</div>
            <div className="text-sm text-foreground">{Math.floor(journalDay * 1.5)} jours</div>
            <div className="text-xs text-success">+50% de succès</div>
          </div>
        </div>

        {/* Preuve sociale dynamique */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">
                +847 nouveaux membres cette semaine
              </p>
              <p className="text-xs text-muted-foreground">
                Moyenne: 28 jours d'abstinence réussie
              </p>
            </div>
          </div>
        </div>

        {/* Urgence temporelle */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              Offre expire dans: {formatTime(timeLeft)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            50% de réduction - Ne rate pas cette chance
          </p>
        </div>

        {/* CTA principal */}
        <Button 
          onClick={handleUpgrade}
          className="journey-button-primary w-full group relative overflow-hidden mb-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <Crown className="w-5 h-5 mr-2" />
          Rejoindre l'élite Premium (7,49€)
        </Button>

        {/* Garanties */}
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex flex-col items-center">
            <Star className="w-4 h-4 text-success mb-1" />
            <span>Accès à vie</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="w-4 h-4 text-primary mb-1" />
            <span>Résultats x3</span>
          </div>
          <div className="flex flex-col items-center">
            <Target className="w-4 h-4 text-accent mb-1" />
            <span>94% succès</span>
          </div>
        </div>
      </div>
    </div>
  );
};