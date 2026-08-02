# Journeys — Spécification fonctionnelle complète

Application de développement personnel (React 18 + Vite 5 + TypeScript + Tailwind + shadcn/ui),
backend Supabase (Lovable Cloud), packagée aussi en app mobile via Capacitor, i18n FR/EN.

Navigation : SPA à écran unique (`src/pages/Index.tsx`) qui commute un state `currentScreen`
(`home`, `journal`, `reflection`, `progress`, `notes`, `abstinence`, `stretching`, `meditation`,
`todos`, `avatar`). Routes react-router : `/`, `/auth`, `/payment-success`, `/affiliate-admin`, `*`.

---

## 1. Authentification & compte
- Inscription e-mail/mot de passe avec `full_name` optionnel, redirection `emailRedirectTo` vers `/auth`.
- Connexion, déconnexion, session persistante via `onAuthStateChange` + `getSession` (`useAuth`).
- Écran de chargement global tant que l'auth n'est pas résolue (évite l'écran blanc).
- **Mode invité** : sans compte, les entrées de journal sont stockées dans `localStorage`
  (`journalEntries`) ; elles sont vidées à la connexion.
- Table `profiles` (profil utilisateur), table `user_roles` + enum de rôles + fonction
  security-definer `has_role()` (pas de rôle stocké sur le profil) pour l'accès admin.

## 2. Accueil / Tableau de bord (`HomePage`)
- Vue d'ensemble : avatar global, niveau/XP, série de connexion, addictions actives.
- Cartes d'accès rapide vers chaque module (`JourneyCard`).
- Citation du jour, statut utilisateur (`UserStatus`), notifications marketing.
- Pop-up d'intro pour visiteurs non connectés + modale d'onboarding (`usePopupManager`).

## 3. Score du jour / Journal quotidien (`DailyJournal`)
- Notation de 7 critères de vie : **vie sociale, famille, amour, sport, apprentissage,
  méditation, bien-être**.
- Calcul d'un score total → humeur dérivée : `low` (≤4), `medium` (≤7), `high` (>7).
- Phrase de motivation aléatoire (12 variantes) affichée à la validation.
- Sauvegarde en base (`journal_entries`) si connecté, sinon en local.
- Enchaîne automatiquement sur l'écran Réflexion.
- Déclenche l'interrupteur premium aux jours 3, 7, 14, 21 puis tous les 7 jours (non-premium).

## 4. Réflexion (`ReflectionScreen`)
- Écriture guidée selon l'humeur et le score du jour.
- Mode « écriture libre » quand on y accède sans avoir rempli le score.
- Enregistrée dans le champ `reflection` de l'entrée du jour.

## 5. Notes quotidiennes (`DailyNotes`, `useDailyNotes`)
- Prise de notes libre indépendante du scoring, table `daily_notes`.
- Création, édition, suppression.

## 6. Progression (`ProgressScreen`)
- Historique complet des entrées avec édition (`EditJournalEntry`) et suppression.
- Graphiques d'évolution du score, **radar de compétences** (`SkillsRadarChart`) par critère.
- **Analyse de streaks** (`StreakAnalytics`).
- Version dégradée pour les non-premium : seules les notes libres sont affichées.

## 7. To-do list (`TodoList`, `useTodos`)
- Tâches avec texte + niveau de priorité, table `todos`.
- Cochage/décochage, suppression, filtre « terminées ».
- **Célébration animée** à chaque tâche terminée (`TodoCompletionCelebration`).
- Statistiques du jour (`TodoStats`).
- Reset automatique quotidien via l'edge function `daily-todo-reset`.
- Premium : report automatique des tâches importantes de la veille.
- Optimisation IA : après 3 complétions, proposition premium au pic de motivation
  (`trackBehavior('todo_completed')`), teaser `PremiumTodoTeaser` pour les gratuits.

## 8. Focus / Méditation (`MeditationTimer`)
- Deux modes : **méditation** et **deep work**.
- Durées prédéfinies 5 / 15 / 25 / 45 min, états `idle | running | paused | completed`.
- Gong au démarrage, triple gong de fin (`useGongSounds`, `soundManager`).
- Sessions enregistrées dans `meditation_sessions`.

## 9. Addictions — « Contrôle & Liberté » (`AbstinenceTracker`) — Premium
- Catalogue de types d'addictions (`addiction_types`).
- **Engagement formel** avant démarrage (`AddictionCommitment`) : sélection des effets
  recherchés + objectif personnel.
- Compteur d'abstinence en temps réel par addiction (`AddictionCard`, `abstinence_tracking`).
- Déclaration de rechute (reset du compteur) et désactivation d'un suivi.
- Timeline des étapes franchies (`AddictionTimeline`).
- **Cas tabac** : saisie cigarettes/jour, prix à l'unité, prix et contenu du paquet →
  calcul des économies cumulées (`CigaretteSavings`, table `addiction_savings`).
- **Cas procrastination** : module de micro-tâches dédié (`ProcrastinationTasks`).
- Badges liés aux paliers + affichage de tous les badges disponibles.
- Fonction SQL `calculate_addiction_streaks`.

## 10. Étirements (`StretchingRoutine`, `useStretching`) — Premium
- Routine quotidienne de 6 exercices ciblés : trapèzes supérieurs, ouverture thoracique,
  flexion avant debout, rotation du rachis, ischio-jambiers, fléchisseurs de hanche.
- Chaque exercice a une durée, se coche individuellement, barre de progression globale.
- Reset de session, historique dans `stretching_sessions`.

## 11. Avatar pixel art (`src/components/avatar/`)
- Avatar évolutif du **niveau 0 à 200**, moteur maison (`AvatarEngine.ts`, grille de pixels).
- **5 slots d'équipement** : skin (corps), visage, arme, cape, aura.
- 12 skins complets (Ninja, Samouraï, Cosmique…), raretés Commun → Légendaire avec
  couleurs/gradients associés.
- Personnalisation d'identité : genre, teinte de peau, yeux, coiffure (listes homme /
  femme / unisexe).
- Évolution visuelle automatique par palier de niveau (`EVOLUTION_STAGES`) et animations de
  vie (clignement des yeux, respiration).
- `GlobalAvatar` synchronise le rendu partout (présent sur l'accueil, volontairement absent
  des barres de navigation).
- **Coffres hebdomadaires** (`ChestOpenerPixel`, `user_chests`) avec animation d'ouverture.
- **Quêtes légendaires** (`avatar_quests`, `user_quest_progress`).
- **Suggestions IA d'équipement** (`AISuggestionsPanel` + edge function `suggest-items`).
- Tables : `avatar_items`, `user_avatar_items`, `user_avatar_equipped`.

## 12. Niveaux & XP (`useLevel`, `LevelDisplay`)
- XP gagné par activité, niveau et titre calculés côté base
  (`calculate_xp_for_level`, `get_level_title`, `update_user_level`), table `user_levels`.
- Barre de progression vers le niveau suivant.
- Overlay de célébration plein écran au passage de niveau (`LevelUpCelebration`).
- Mise à jour quotidienne par l'edge function `daily-level-update`.

## 13. Séries (streaks) & badges
- Série de connexions (`login_streaks`, `LoginStreakDisplay`, `useStreak`).
- Attribution automatique de badges (`badges`, `user_badges`,
  `check_and_award_streak_badges`, `useStreakBadges`).
- Vues : badges obtenus (`BadgesList`), tous les badges (`AllBadgesDisplay`), modale
  (`BadgesModal`).
- Cron : `daily-streak-update`, `update_all_daily_streaks`, `update_user_streak_on_activity`.

## 14. Citation du jour (`DailyQuote`)
- Citation générée par IA via l'edge function `generate-daily-quote` (texte, auteur, thème).
- Jeu de citations de secours FR/EN si l'appel échoue.

## 15. Premium & paiements
- Contexte `usePremium` : état premium, modale d'upgrade globale, verrouillage de modules via
  `PremiumLock` (addictions, stretching, progression complète…).
- Composants d'acquisition : `PremiumUpgrade`, `PremiumCTA`, `PremiumTeaser`,
  `PremiumTodoTeaser`, `PremiumProgressInterruptor`, `PremiumSuccessIndicator`.
- Mode preview premium (`PremiumPreviewContext`) pour montrer le contenu verrouillé.
- **Stripe** : `create-checkout`, `create-payment`, `verify-payment`, `check-subscription`,
  `customer-portal`, page `/payment-success`.
- **Apple / RevenueCat** : `appleIAP.ts`, `verify-apple-purchase`, `revenuecat-webhook`.
- Table `premium_purchases`, edge function `check-premium`.

## 16. Affiliation
- Capture du code de parrainage dans l'URL au chargement (`useAffiliation`).
- Générateur de liens (`AffiliateLinkGenerator`), tables `affiliate_referrals` et
  `valid_affiliate_codes`.
- Console d'administration `/affiliate-admin` protégée par rôle.
- Rapports : edge function `affiliate-report` + script Node `scripts/affiliate-report-node.js`.

## 17. Optimisation IA & analytics
- `useAIOptimization` : suivi comportemental (`trackBehavior`) et déclenchement contextuel des
  offres premium au moment de motivation maximale.
- Journal des optimisations (`AIOptimizationLog`), console admin (`AdminOptimizationConsole`),
  table `ai_optimization_applications`.
- Edge function `performance-analytics`, hook `usePerformanceOptimization`,
  `utils/performanceOptimization.ts`, `utils/todoOptimization.ts`.
- E-mails marketing via `marketing-email` + `MarketingNotifications` en front.

## 18. Transverse
- **i18n** FR/EN (`react-i18next`, `LanguageToggle`).
- **Son** : gongs de bienvenue / début / fin / premium (`useGongSounds`, `audioUtils`).
- **Animations** : framer-motion + animations Lottie (couronne, lune, succès).
- **PWA** : `manifest.json`, modale d'installation (`InstallPWAModal`).
- **Mobile** : Capacitor, détection de plateforme (`platformDetection`), optimisations CSS
  mobile (`MobileOptimizations`), navigation bottom repliable vs sidebar desktop.
- **Design system** : tokens sémantiques dans `index.css` + `tailwind.config.ts`
  (`journey-card-premium`, `text-gradient-primary`…).
- **Divers** : CGU (`TermsOfService`), animation de bienvenue, validation (`utils/validation.ts`),
  nettoyage des anciennes entrées (`cleanup_old_entries`), tests de charge k6 dans `tests/load-testing/`.
