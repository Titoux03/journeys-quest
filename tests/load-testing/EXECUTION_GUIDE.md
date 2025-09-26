# 🚀 Guide d'Exécution Rapide

## Installation K6
```bash
# macOS
brew install k6

# Linux/Windows
https://k6.io/docs/getting-started/installation/
```

## Exécution Tests
```bash
cd tests/load-testing

# Test de base (recommandé pour débuter)
npm run test:load

# Test de stress (attention: destructif!)
npm run test:stress

# Test de pic (résilience)
npm run test:spike
```

## Interprétation Résultats

### ✅ Résultats OK
- Response time p95 < 200ms
- Error rate < 2%
- RPS > 100

### ❌ Problèmes Détectés
- Response time p95 > 1s = Optimisation DB nécessaire
- Error rate > 5% = Problème critique
- Connection leaks = Bug application

## Actions Post-Test
1. Analyser métriques dans Supabase Dashboard
2. Vérifier logs Edge Functions si erreurs
3. Optimiser requêtes lentes identifiées
4. Re-tester après optimisations