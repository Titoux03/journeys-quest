# 🚀 Load Testing Suite pour Journeys

## 📋 Vue d'ensemble

Ce dossier contient tous les scripts et configurations pour tester la performance de Journeys sous charge élevée.

### 🛠️ Stack de Test Recommandée
- **K6** : Outil principal (moderne, performant, scriptable en JS)
- **Artillery** : Tests rapides et CI/CD
- **Grafana + InfluxDB** : Visualisation des métriques temps réel
- **Supabase Analytics** : Monitoring backend

### 📊 Objectifs de Performance
- **Response Time** : <200ms (p95)
- **Error Rate** : <2%
- **Throughput** : >1000 RPS
- **Users simultanés** : 10k+ sans dégradation

## 🧪 Types de Tests

### 1. **Load Test** (`load-test.js`)
- Charge normale attendue (1k users simultanés)
- Durée : 10 minutes
- Objectif : Validation performance nominale

### 2. **Stress Test** (`stress-test.js`)
- Montée progressive jusqu'à rupture
- 100 → 10k → 100k utilisateurs
- Objectif : Identifier les limites

### 3. **Spike Test** (`spike-test.js`)
- Pics soudains de trafic
- 100 → 10k en 30 secondes
- Objectif : Test de résilience

### 4. **Endurance Test** (`endurance-test.js`)
- Charge soutenue sur longue durée (2h)
- Objectif : Détecter memory leaks

## 🎯 Scénarios de Test

### **Scénario 1 : Utilisateur Standard**
1. Authentification
2. Récupération profil + données
3. Création entrée journal
4. Consultation progress
5. Logout

### **Scénario 2 : Utilisateur Premium**
1. Authentification
2. Accès fonctionnalités premium
3. Génération statistiques avancées
4. Export données

### **Scénario 3 : Nouveau User**
1. Inscription
2. Setup profil
3. Première entrée journal
4. Exploration app

## 📈 Métriques Surveillées

### **Performance**
- Response time (avg, p95, p99, max)
- Throughput (RPS)
- Error rate (%)
- Success rate (%)

### **Infrastructure**
- CPU usage (%)
- Memory usage (MB)
- Database connections
- Cache hit rate (%)

### **Business**
- User journey completion rate
- Premium feature usage
- Payment processing success

## 🚦 Seuils d'Alerte

```yaml
Critiques:
  response_time_p95: >1000ms
  error_rate: >5%
  success_rate: <95%

Avertissements:
  response_time_p95: >500ms
  error_rate: >2%
  cpu_usage: >80%
```

## 🏃‍♂️ Exécution des Tests

```bash
# Test de charge standard
npm run test:load

# Test de stress complet
npm run test:stress

# Test de pic de trafic
npm run test:spike

# Test d'endurance
npm run test:endurance

# Suite complète
npm run test:all
```

## 📊 Reporting

Les résultats sont automatiquement :
- Sauvegardés en JSON/CSV
- Visualisés dans Grafana
- Résumés dans un rapport HTML
- Envoyés par webhook (optionnel)