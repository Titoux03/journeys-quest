import React, { useState } from 'react';
import { Copy, ExternalLink, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

/**
 * Composant pour générer des liens d'affiliation pour les influenceurs
 */
export const AffiliateLinkGenerator: React.FC = () => {
  const [influencerCode, setInfluencerCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // URL de base de votre app (à adapter selon votre domaine)
  const baseUrl = window.location.origin;
  const affiliateLink = influencerCode ? `${baseUrl}/?ref=${encodeURIComponent(influencerCode)}` : '';

  /**
   * Copie le lien dans le presse-papier
   */
  const copyToClipboard = async () => {
    if (!affiliateLink) return;

    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      toast({
        title: "✅ Lien copié !",
        description: "Le lien d'affiliation a été copié dans le presse-papier",
      });
      
      // Reset du statut après 2 secondes
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  /**
   * Ouvre le lien pour tester
   */
  const testLink = () => {
    if (!affiliateLink) return;
    window.open(affiliateLink, '_blank');
  };

  /**
   * Partage natif (si supporté)
   */
  const shareLink = async () => {
    if (!affiliateLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Journeys - Transformez votre vie',
          text: 'Découvrez Journeys, l\'app qui transforme votre développement personnel !',
          url: affiliateLink,
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback : copier le lien
      copyToClipboard();
    }
  };

  /**
   * Exemples de codes d'influenceurs
   */
  const exampleCodes = [
    'marie_coach',
    'julien_fitness', 
    'sophie_zen',
    'alex_motivation',
    'lisa_wellness'
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="w-5 h-5 text-primary" />
          <span>Générateur de liens d'affiliation</span>
        </CardTitle>
        <CardDescription>
          Créez des liens personnalisés pour tracker les références des influenceurs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Champ de saisie */}
        <div className="space-y-2">
          <label htmlFor="influencer-code" className="text-sm font-medium text-foreground">
            Code influenceur
          </label>
          <Input
            id="influencer-code"
            placeholder="ex: marie_coach, julien_fitness..."
            value={influencerCode}
            onChange={(e) => setInfluencerCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            className="text-lg"
          />
          <p className="text-xs text-muted-foreground">
            Utilisez uniquement des lettres, chiffres, tirets et underscores
          </p>
        </div>

        {/* Exemples rapides */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Exemples rapides :</p>
          <div className="flex flex-wrap gap-2">
            {exampleCodes.map((code) => (
              <Button
                key={code}
                variant="outline"
                size="sm"
                onClick={() => setInfluencerCode(code)}
                className="text-xs"
              >
                {code}
              </Button>
            ))}
          </div>
        </div>

        {/* Lien généré */}
        {affiliateLink && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Lien d'affiliation généré :
            </label>
            
            <div className="p-3 bg-secondary/50 rounded-lg border">
              <code className="text-sm text-foreground break-all">
                {affiliateLink}
              </code>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={copyToClipboard}
                className="flex items-center space-x-2"
                variant={copied ? "default" : "outline"}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copier</span>
                  </>
                )}
              </Button>

              <Button
                onClick={testLink}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Tester</span>
              </Button>

              <Button
                onClick={shareLink}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Partager</span>
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-accent/20 border border-accent/40 rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-2">📋 Instructions :</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Saisissez le nom/code de l'influenceur</li>
            <li>2. Copiez le lien généré</li>
            <li>3. Partagez-le avec l'influenceur</li>
            <li>4. Les conversions seront automatiquement trackées</li>
          </ul>
        </div>

        {/* Format du tracking */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-2">🎯 Comment ça marche :</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Référence :</strong> L'utilisateur clique sur le lien</p>
            <p><strong>Stockage :</strong> Le code est sauvegardé automatiquement</p>
            <p><strong>Conversion :</strong> Lors de l'achat, le code est envoyé à Stripe</p>
            <p><strong>Tracking :</strong> Visible dans vos rapports d'affiliation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};