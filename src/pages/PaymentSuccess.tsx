import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/hooks/usePremium';
import { InstallPWAModal } from '@/components/InstallPWAModal';

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
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('Session ID manquant');
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId }
        });

        if (error) {
          setError('Erreur lors de la vérification du paiement');
        } else if (data?.success) {
          setVerified(true);
          // Mettre à jour le statut premium
          await checkPremiumStatus();
          // Afficher le modal PWA après un court délai
          setTimeout(() => setShowPWAModal(true), 1500);
        } else {
          setError('Paiement non confirmé');
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, checkPremiumStatus]);

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
              <h2 className="text-xl font-semibold">Vérification du paiement...</h2>
              <p className="text-muted-foreground">
                Nous vérifions votre achat. Cela ne prendra qu'un instant.
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
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Bienvenue dans Premium !
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Votre paiement a été confirmé avec succès. Vous avez maintenant accès à toutes les fonctionnalités premium de Journeys !
            </p>
            
            <div className="bg-accent/20 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm">Fonctionnalités débloquées :</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✨ Méditation & Deep Work</li>
                <li>✨ Compteur d'abstinence</li>
                <li>✨ Routine Stretching</li>
                <li>✨ Statistiques avancées</li>
              </ul>
            </div>
          </div>

          <Button onClick={handleContinue} className="w-full">
            Commencer mon parcours Premium
          </Button>
        </CardContent>
      </Card>
      
      <InstallPWAModal 
        isOpen={showPWAModal} 
        onClose={() => setShowPWAModal(false)} 
      />
    </div>
  );
};