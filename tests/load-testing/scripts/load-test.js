import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métriques personnalisées
const errorRate = new Rate('errors');
const responseTime = new Trend('custom_response_time');
const journalCreated = new Counter('journal_entries_created');
const premiumAccess = new Counter('premium_features_accessed');

// Configuration du test de charge
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Montée progressive
    { duration: '5m', target: 500 },   // Charge intermédiaire
    { duration: '10m', target: 1000 }, // Charge cible
    { duration: '5m', target: 500 },   // Descente
    { duration: '2m', target: 0 },     // Arrêt progressif
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],     // 95% des requêtes < 200ms
    http_req_failed: ['rate<0.02'],       // Moins de 2% d'échecs
    http_reqs: ['rate>100'],              // Au moins 100 RPS
    custom_response_time: ['p(95)<250'],  // Métrique custom
    errors: ['rate<0.05'],                // Moins de 5% d'erreurs business
  },
};

// Configuration de l'environnement
const BASE_URL = __ENV.BASE_URL || 'https://fa38fd85-7706-45c2-b1f8-05b67f1e1a15.lovableproject.com';
const SUPABASE_URL = 'https://fgoyvsnsoheboywgtgvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb3l2c25zb2hlYm95d2d0Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTM3MzMsImV4cCI6MjA3NDM4OTczM30.43odgp6oU7P6_KY_8zvkIOc4_ZeZbva7u9bJlNeemjE';

// Headers communs
const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

// Données de test
const testUsers = [
  { email: 'testuser1@journeys.com', password: 'TestPass123!' },
  { email: 'testuser2@journeys.com', password: 'TestPass123!' },
  { email: 'testuser3@journeys.com', password: 'TestPass123!' },
  // Ajoutez plus d'utilisateurs de test selon vos besoins
];

const journalEntries = [
  { 
    scores: { meditation: 8, sport: 7, wellbeing: 9 },
    mood: 'high',
    reflection: 'Excellente journée de test de performance'
  },
  { 
    scores: { meditation: 6, sport: 8, creativity: 7 },
    mood: 'medium',
    reflection: 'Journée normale avec quelques défis'
  },
  { 
    scores: { meditation: 9, social: 8, wellbeing: 8 },
    mood: 'high',
    reflection: 'Très productive et équilibrée'
  },
];

// Fonction utilitaire pour générer des données aléatoires
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Authentification utilisateur
function authenticate() {
  const user = randomChoice(testUsers);
  const loginPayload = {
    email: user.email,
    password: user.password,
  };

  const startTime = Date.now();
  const response = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify(loginPayload),
    { headers }
  );
  
  const duration = Date.now() - startTime;
  responseTime.add(duration);

  const success = check(response, {
    'auth status is 200': (r) => r.status === 200,
    'auth has access token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.access_token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    errorRate.add(1);
    return null;
  }

  errorRate.add(0);
  const authData = JSON.parse(response.body);
  return {
    token: authData.access_token,
    userId: authData.user.id,
  };
}

// Récupération du profil utilisateur
function getUserProfile(auth) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${auth.token}`,
  };

  const startTime = Date.now();
  const response = http.get(
    `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${auth.userId}`,
    { headers: authHeaders }
  );
  
  const duration = Date.now() - startTime;
  responseTime.add(duration);

  const success = check(response, {
    'profile status is 200': (r) => r.status === 200,
    'profile data received': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(success ? 0 : 1);
  return success;
}

// Création d'une entrée de journal
function createJournalEntry(auth) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${auth.token}`,
  };

  const entryData = randomChoice(journalEntries);
  const totalScore = Object.values(entryData.scores).reduce((a, b) => a + b, 0);
  
  const payload = {
    user_id: auth.userId,
    date: new Date().toISOString().split('T')[0],
    scores: entryData.scores,
    total_score: totalScore,
    mood: entryData.mood,
    reflection: entryData.reflection,
  };

  const startTime = Date.now();
  const response = http.post(
    `${SUPABASE_URL}/rest/v1/journal_entries`,
    JSON.stringify(payload),
    { headers: authHeaders }
  );
  
  const duration = Date.now() - startTime;
  responseTime.add(duration);

  const success = check(response, {
    'journal entry created': (r) => r.status === 201,
  });

  if (success) {
    journalCreated.add(1);
  }
  
  errorRate.add(success ? 0 : 1);
  return success;
}

// Consultation des statistiques (fonctionnalité premium simulée)
function getProgressStats(auth) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${auth.token}`,
  };

  const startTime = Date.now();
  const response = http.get(
    `${SUPABASE_URL}/rest/v1/journal_entries?user_id=eq.${auth.userId}&order=date.desc&limit=30`,
    { headers: authHeaders }
  );
  
  const duration = Date.now() - startTime;
  responseTime.add(duration);

  const success = check(response, {
    'progress stats retrieved': (r) => r.status === 200,
    'progress data is valid': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  });

  if (success) {
    premiumAccess.add(1);
  }
  
  errorRate.add(success ? 0 : 1);
  return success;
}

// Test de l'Edge Function de performance analytics
function testPerformanceAnalytics(auth) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${auth.token}`,
  };

  const payload = {
    action: 'get_system_health',
  };

  const startTime = Date.now();
  const response = http.post(
    `${SUPABASE_URL}/functions/v1/performance-analytics`,
    JSON.stringify(payload),
    { headers: authHeaders }
  );
  
  const duration = Date.now() - startTime;
  responseTime.add(duration);

  const success = check(response, {
    'analytics function responds': (r) => r.status === 200,
  });

  errorRate.add(success ? 0 : 1);
  return success;
}

// Scénario principal du test
export default function() {
  // 1. Authentification
  const auth = authenticate();
  if (!auth) {
    console.log('❌ Authentication failed, skipping user scenario');
    return;
  }
  
  sleep(randomInt(1, 3)); // Simulation temps de réflexion utilisateur

  // 2. Récupération du profil
  getUserProfile(auth);
  sleep(randomInt(1, 2));

  // 3. Création d'entrée de journal (70% des utilisateurs)
  if (Math.random() < 0.7) {
    createJournalEntry(auth);
    sleep(randomInt(2, 5));
  }

  // 4. Consultation des stats (50% des utilisateurs)
  if (Math.random() < 0.5) {
    getProgressStats(auth);
    sleep(randomInt(1, 3));
  }

  // 5. Test analytics (20% des utilisateurs)
  if (Math.random() < 0.2) {
    testPerformanceAnalytics(auth);
    sleep(randomInt(1, 2));
  }

  // Pause finale pour simuler la navigation
  sleep(randomInt(2, 5));
}

// Fonction de setup (exécutée une fois au début)
export function setup() {
  console.log('🚀 Démarrage du test de charge Journeys');
  console.log(`📊 Cible: ${SUPABASE_URL}`);
  console.log('⏱️ Durée: 24 minutes');
  console.log('👥 Max users: 1000 simultanés');
  
  // Test de connectivité initial
  const healthCheck = http.get(`${SUPABASE_URL}/rest/v1/`, { headers });
  if (healthCheck.status !== 200) {
    console.error('❌ Health check failed, aborting test');
    return null;
  }
  
  console.log('✅ Health check passed, starting load test');
  return { startTime: Date.now() };
}

// Fonction de teardown (exécutée une fois à la fin)
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`✅ Test de charge terminé en ${duration}s`);
  console.log('📊 Consultez Grafana pour les métriques détaillées');
}