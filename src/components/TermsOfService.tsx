import React from 'react';
import { X, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TermsOfServiceProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg">
      <div className="journey-card max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
            <ScrollText className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <h1 className="text-2xl font-bold text-gradient-primary mb-2">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-muted-foreground">
            Application Journeys - Développement Personnel
          </p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          
          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">1. Objet et champ d'application</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de l'application mobile "Journeys", 
              une application de développement personnel proposant des outils de méditation, suivi d'habitudes, journaling et gestion des addictions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">2. Définitions</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong>Application :</strong> L'application mobile "Journeys" et ses fonctionnalités</li>
              <li><strong>Utilisateur :</strong> Toute personne utilisant l'application</li>
              <li><strong>Services :</strong> L'ensemble des fonctionnalités proposées par l'application</li>
              <li><strong>Version Premium :</strong> Version payante offrant des fonctionnalités étendues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">3. Acceptation des conditions</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'utilisation de l'application implique l'acceptation pleine et entière des présentes CGU. 
              L'achat de la version Premium constitue une acceptation expresse de ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">4. Services proposés</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              L'application propose les services suivants :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Suivi quotidien d'activités et d'habitudes</li>
              <li>Outils de méditation et relaxation</li>
              <li>Journal personnel et réflexions</li>
              <li>Gestion et suivi d'addictions</li>
              <li>Exercices de stretching guidés</li>
              <li>Citations inspirantes quotidiennes</li>
              <li>Analyses et statistiques de progression (Premium)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">5. Conditions d'achat - Version Premium</h2>
            <div className="text-muted-foreground space-y-3">
              <p><strong>Prix :</strong> Abonnement mensuel à 14,99€/mois ou annuel à 149,99€/an (soit 12,50€/mois)</p>
              <p><strong>Paiement :</strong> Le paiement s'effectue via les plateformes sécurisées (Stripe)</p>
              <p><strong>Activation :</strong> L'accès Premium est activé immédiatement après confirmation du paiement</p>
              <p><strong>Renouvellement :</strong> L'abonnement se renouvelle automatiquement. Vous pouvez l'annuler à tout moment depuis votre espace de gestion.</p>
              <p><strong>Anciens achats :</strong> Les utilisateurs ayant effectué un achat unique conservent leur accès à vie.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">6. Droit de rétractation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas 
              aux contenus numériques non fournis sur un support matériel dont l'exécution a commencé après accord 
              préalable exprès du consommateur et renoncement exprès à son droit de rétractation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">7. Protection des données personnelles</h2>
            <div className="text-muted-foreground space-y-2">
              <p>Vos données personnelles sont traitées conformément au RGPD :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Collecte limitée aux données nécessaires au fonctionnement de l'application</li>
                <li>Stockage sécurisé via Supabase (hébergement EU)</li>
                <li>Aucune vente de données à des tiers</li>
                <li>Droit d'accès, rectification et suppression sur demande</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">8. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L'application, son contenu, ses fonctionnalités et son design sont protégés par les droits de propriété intellectuelle. 
              Toute reproduction, distribution ou modification non autorisée est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">9. Responsabilité</h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>L'application à des fins de bien-être :</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ne constitue pas un avis médical ou thérapeutique</li>
                <li>Ne remplace pas un suivi médical professionnel</li>
                <li>Les résultats peuvent varier selon les utilisateurs</li>
              </ul>
              <p className="mt-3">
                Le développeur ne saurait être tenu responsable de dommages indirects ou de l'usage inapproprié de l'application.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">10. Disponibilité du service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous efforçons de maintenir l'application disponible 24h/24. Cependant, des interruptions peuvent survenir 
              pour maintenance, mises à jour ou raisons techniques. Aucune garantie de disponibilité absolue n'est fournie.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">11. Modification des CGU</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés des changements 
              via l'application. L'usage continu constitue acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">12. Contact et réclamations</h2>
            <div className="text-muted-foreground space-y-2">
              <p>Pour toute question ou réclamation :</p>
              <ul className="list-none space-y-1">
                <li><strong>Email :</strong> support@journeys-app.com</li>
                <li><strong>Délai de réponse :</strong> 48h ouvrées maximum</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-primary mb-3">13. Droit applicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={onClose}
            className="journey-button-primary"
          >
            J'ai lu et compris
          </Button>
        </div>
      </div>
    </div>
  );
};