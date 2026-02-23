import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import successAnimation from '@/assets/animations/success-animation.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/hooks/usePremium';
import { InstallPWAModal } from '@/components/InstallPWAModal';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkPremiumStatus } = usePremium();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPWAModal, setShowPWAModal] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySubscription = async () => {
      if (!sessionId) {
        // No session_id means direct navigation - just check premium status
        await checkPremiumStatus();
        setVerified(true);
        setVerifying(false);
        launchCelebration();
        return;
      }

      try {
        // For subscriptions, we just need to refresh the premium status
        // Stripe handles the subscription activation automatically
        await checkPremiumStatus();
        setVerified(true);
        launchCelebration();
        setTimeout(() => setShowPWAModal(true), 2000);
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setVerifying(false);
      }
    };

    verifySubscription();
  }, [sessionId, checkPremiumStatus]);

  const launchCelebration = () => {
    // Fire confetti celebration
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleContinue = () => {
    navigate('/');
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-secondary">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h2 className="text-xl font-semibold">Activation de votre abonnement...</h2>
              <p className="text-muted-foreground">
                Nous vérifions votre abonnement. Cela ne prendra qu'un instant.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-secondary">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <Crown className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Problème de vérification</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={handleContinue} variant="outline" className="w-full">
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-secondary">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <Card className="max-w-md w-full mx-4 border-primary/30">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="h-24 w-24 mx-auto mb-4"
            >
              <Lottie animationData={successAnimation} loop={false} />
            </motion.div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              Bienvenue dans Premium !
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-lg font-medium text-foreground mb-2">
                  🎉 Votre abonnement est activé !
                </p>
                <p className="text-muted-foreground mb-4">
                  Vous avez maintenant accès à toutes les fonctionnalités exclusives de Journeys Premium.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">Fonctionnalités débloquées</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✨ Méditation & Deep Work illimités</li>
                  <li>✨ Suivi multi-addictions complet</li>
                  <li>✨ Routine Stretching guidée</li>
                  <li>✨ Statistiques avancées & badges exclusifs</li>
                  <li>✨ Items et personnalisation premium</li>
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button onClick={handleContinue} className="w-full journey-button-primary text-lg py-6">
                <Crown className="w-5 h-5 mr-2" />
                Commencer mon parcours Premium
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      
      <InstallPWAModal 
        isOpen={showPWAModal} 
        onClose={() => setShowPWAModal(false)} 
      />
    </div>
  );
};
