# 🎯 Système d'Affiliation - Journeys

## 📋 Vue d'ensemble

Ce système d'affiliation permet de tracker les références d'influenceurs et de mesurer les conversions via des liens uniques. Chaque influenceur dispose d'un lien personnalisé qui track automatiquement les inscriptions et les achats.

## 🔗 Format des liens d'affiliation

```
https://journeys-quest.com/?ref=nom_influenceur
```

Exemples :
- `https://journeys-quest.com/?ref=marie_coach`
- `https://journeys-quest.com/?ref=julien_fitness`
- `https://journeys-quest.com/?ref=sophie_zen`

## 🏗️ Architecture technique

### 1. Frontend (React)
- **Hook `useAffiliation`** : Capture automatiquement le paramètre `ref` de l'URL
- **Stockage local** : Le code d'affiliation est sauvegardé dans localStorage
- **Integration avec Stripe** : Le code est transmis lors du paiement

### 2. Backend (Supabase + Edge Functions)
- **Table `affiliate_referrals`** : Stocke toutes les références
- **Edge Function `create-payment`** : Modifiée pour inclure les metadata d'affiliation
- **Edge Function `affiliate-report`** : Génère des rapports détaillés

### 3. Stripe Integration
- Les codes d'affiliation sont automatiquement ajoutés aux metadata des paiements
- Permet un tracking précis des conversions

## 📊 Tracking du parcours utilisateur

1. **Visite avec référence** : `/?ref=influenceur`
2. **Stockage automatique** : Code sauvegardé en localStorage
3. **Inscription/Connexion** : Référence liée au compte utilisateur
4. **Achat Premium** : Code transmis à Stripe via metadata
5. **Conversion trackée** : Mise à jour automatique du statut

## 🛠️ Utilisation

### Pour les influenceurs
1. Créer un lien avec le paramètre `ref` : `?ref=votre_nom`
2. Partager le lien sur vos réseaux sociaux
3. Les conversions sont automatiquement trackées

### Pour les administrateurs

#### Génération de rapports (Frontend)
```typescript
import { generateAffiliateReport } from '@/utils/affiliateReport';

// Générer un rapport complet
const report = await generateAffiliateReport();
console.log(report);

// Ou utiliser la fonction de rapport simple
import { generateSimpleReport } from '@/utils/affiliateReport';
generateSimpleReport();
```

#### Génération de rapports (Node.js)
```bash
# Installation des dépendances
npm install stripe

# Configuration de la clé Stripe
export STRIPE_SECRET_KEY=sk_test_votre_cle_ici

# Exécution du script
node scripts/affiliate-report-node.js
```

## 📈 Exemple de rapport

```
=== RAPPORT D'AFFILIATION ===
Généré le: 27/09/2025 à 10:15:23

RÉSUMÉ:
- Nombre d'influenceurs: 12
- Total références: 156
- Total conversions: 23
- Revenus totaux: 344,77€
- Taux de conversion global: 14.7%

TOP INFLUENCEURS:
1. marie_coach        | Réf:  45 | Conv:   8 | Revenus:   119,92€ | Taux: 17.8%
2. julien_fitness     | Réf:  32 | Conv:   6 | Revenus:    89,94€ | Taux: 18.8%
3. sophie_zen         | Réf:  28 | Conv:   4 | Revenus:    59,96€ | Taux: 14.3%
```

## 🔧 Configuration

### Variables d'environnement requises
```env
STRIPE_SECRET_KEY=sk_test_...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Structure de la base de données

Table `affiliate_referrals` :
- `id` : UUID unique
- `user_id` : ID de l'utilisateur référé
- `affiliate_code` : Code de l'influenceur
- `payment_intent_id` : ID du paiement Stripe
- `amount` : Montant de la conversion (en centimes)
- `currency` : Devise (EUR par défaut)
- `status` : 'pending' | 'converted'
- `referred_at` : Date de référence
- `converted_at` : Date de conversion

## 🚀 Déploiement

### Edge Functions
Les edge functions sont automatiquement déployées avec le projet :
- `create-payment` : Gestion des paiements avec affiliation
- `affiliate-report` : Génération de rapports

### Test du système

1. **Test de référence** :
   ```
   https://votre-domaine.com/?ref=test_influenceur
   ```

2. **Vérification du stockage** :
   ```javascript
   // Dans la console du navigateur
   localStorage.getItem('affiliate_code')
   ```

3. **Test de conversion** :
   - Créer un compte avec le lien de référence
   - Effectuer un achat premium
   - Vérifier dans Stripe Dashboard > Paiements > Metadata

## 📱 Compatibilité

- ✅ Desktop et mobile
- ✅ Tous les navigateurs modernes
- ✅ Compatible PWA
- ✅ Persistance entre les sessions

## 🔒 Sécurité

- Les codes d'affiliation sont validés côté serveur
- Aucune donnée sensible n'est exposée côté client
- Les rapports nécessitent une authentification admin
- Protection contre la manipulation des codes

## 💡 Conseils d'utilisation

### Pour maximiser les conversions :
1. **Codes courts et mémorables** : `marie` plutôt que `marie_coach_fitness_2024`
2. **Cohérence** : Utiliser le même code sur tous les canaux
3. **Tracking** : Vérifier régulièrement les performances

### Pour les rapports :
1. **Fréquence** : Générer des rapports hebdomadaires
2. **Analyse** : Identifier les influenceurs les plus performants
3. **Optimisation** : Ajuster les stratégies selon les données

## 🆘 Dépannage

### Problèmes courants :

1. **Code non détecté** :
   - Vérifier le format de l'URL : `?ref=code`
   - Contrôler la console pour les logs d'affiliation

2. **Conversion non trackée** :
   - Vérifier que l'utilisateur était connecté lors de l'achat
   - Contrôler les metadata dans Stripe Dashboard

3. **Rapport vide** :
   - Vérifier les clés d'API Stripe
   - Contrôler les logs des edge functions

## 📞 Support

Pour toute question sur l'implémentation :
1. Vérifier les logs dans la console navigateur
2. Consulter les logs des edge functions dans Supabase
3. Vérifier les metadata des paiements dans Stripe Dashboard

---

✨ **Le système d'affiliation est maintenant opérationnel !** ✨