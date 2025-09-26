import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Métriques spécialisées pour stress test
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time_ms');
const activeUsers = new Gauge('active_users');
const systemBreakpoint = new Counter('system_breakpoint_reached');
const recoveryTime = new Trend('recovery_time_ms');

// Configuration stress test - montée progressive jusqu'à rupture
export const options = {
  stages: [
    // Phase 1: Validation baseline
    { duration: '2m', target: 100 },
    { duration: '3m', target: 500 },
    
    // Phase 2: Stress croissant
    { duration: '5m', target: 1000 },
    { duration: '5m', target: 2500 },
    { duration: '5m', target: 5000 },
    
    // Phase 3: Stress extrême
    { duration: '10m', target: 10000 },
    { duration: '10m', target: 25000 },
    { duration: '15m', target: 50000 },
    
    // Phase 4: Rupture intentionnelle
    { duration: '10m', target: 100000 },
    
    // Phase 5: Récupération
    { duration: '5m', target: 1000 },
    { duration: '3m', target: 0 },
  ],
  
  // Seuils de stress - plus permissifs que load test
  thresholds: {
    http_req_duration: ['p(99)<2000'],     // 99% < 2s (tolérance stress)
    http_req_failed: ['rate<0.10'],        // Jusqu'à 10% d'échecs acceptables
    response_time_ms: ['p(95)<1500'],      // Métrique custom
    errors: ['rate<0.15'],                 // 15% erreurs business max
    
    // Seuils critiques pour arrêt automatique
    'http_req_failed{scenario:critical}': ['rate<0.50'], // 50% échec = arrêt
  },
  
  // Configuration avancée
  noConnectionReuse: false,
  userAgent: 'Journeys-StressTest/1.0',
  batch: 10, // Requêtes parallèles par VU
  batchPerHost: 5,
};

const BASE_URL = __ENV.BASE_URL || 'https://fa38fd85-7706-45c2-b1f8-05b67f1e1a15.lovableproject.com';
const SUPABASE_URL = 'https://fgoyvsnsoheboywgtgvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb3l2c25zb2hlYm95d2d0Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTM3MzMsImV4cCI6MjA3NDM4OTczM30.43odgp6oU7P6_KY_8zvkIOc4_ZeZbva7u9bJlNeemjE';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

// Pool d'utilisateurs de test étendu pour stress test
const testUsers = Array.from({length: 1000}, (_, i) => ({
  email: `stresstest${i}@journeys.com`,
  password: 'StressTest123!',
  id: `stress-user-${i}`
}));

// Scenarios de stress différenciés
const stressScenarios = {
  // Utilisateurs lourds - créent beaucoup de contenu
  heavy_users: {
    weight: 20,
    actions: ['auth', 'profile', 'create_journal', 'create_journal', 'stats', 'premium'],
    think_time: [1, 2]
  },
  
  // Utilisateurs moyens - usage normal
  normal_users: {
    weight: 60,
    actions: ['auth', 'profile', 'create_journal', 'stats'],
    think_time: [2, 5]
  },
  
  // Utilisateurs légers - consultation seule
  light_users: {
    weight: 20,
    actions: ['auth', 'profile', 'stats'],
    think_time: [3, 7]
  }
};

// Variables globales pour tracking stress
let currentStage = 0;
let breakpointDetected = false;
let lastSuccessfulResponse = Date.now();

function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function getScenarioType() {
  const rand = Math.random() * 100;
  if (rand < 20) return 'heavy_users';
  if (rand < 80) return 'normal_users';
  return 'light_users';
}

// Authentification avec gestion d'erreur avancée
function authenticateStress() {
  const user = getRandomUser();
  const payload = {
    email: user.email,
    password: user.password,
  };

  const startTime = Date.now();
  
  try {
    const response = http.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      JSON.stringify(payload),
      { 
        headers,
        timeout: '30s', // Timeout étendu pour stress
        tags: { scenario: 'auth' }
      }
    );
    
    const duration = Date.now() - startTime;
    responseTime.add(duration);
    
    // Détection de point de rupture
    if (response.status >= 500) {
      systemBreakpoint.add(1);
      breakpointDetected = true;
    }
    
    const success = check(response, {
      'auth status OK': (r) => r.status < 400,
      'auth response time OK': (r) => r.timings.duration < 5000,
    }, { scenario: 'critical' });

    if (success && response.body) {
      try {
        const authData = JSON.parse(response.body);
        if (authData.access_token) {
          lastSuccessfulResponse = Date.now();
          errorRate.add(0);
          return {
            token: authData.access_token,
            userId: authData.user.id,
          };
        }
      } catch (e) {
        console.warn('Auth JSON parse error:', e);
      }
    }
    
    errorRate.add(1);
    return null;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    responseTime.add(duration);
    errorRate.add(1);
    console.error('Auth request failed:', error);
    return null;
  }
}

// Création journal avec retry logic
function createJournalEntryStress(auth, retries = 2) {
  const authHeaders = {
    ...headers,
    'Authorization': `Bearer ${auth.token}`,
  };

  const payload = {
    user_id: auth.userId,
    date: new Date().toISOString().split('T')[0],
    scores: {
      meditation: Math.floor(Math.random() * 10) + 1,
      sport: Math.floor(Math.random() * 10) + 1,
      wellbeing: Math.floor(Math.random() * 10) + 1,
    },
    total_score: Math.floor(Math.random() * 30) + 3,
    mood: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    reflection: `Stress test entry ${Date.now()}`,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const startTime = Date.now();
    
    try {
      const response = http.post(
        `${SUPABASE_URL}/rest/v1/journal_entries`,
        JSON.stringify(payload),
        { 
          headers: authHeaders,
          timeout: '20s',
          tags: { scenario: 'journal_create', attempt: attempt.toString() }
        }
      );
      
      const duration = Date.now() - startTime;
      responseTime.add(duration);
      
      if (response.status === 201 || response.status === 200) {
        errorRate.add(0);
        return true;
      }
      
      if (response.status >= 500 && attempt < retries) {
        console.log(`Journal creation failed (${response.status}), retrying... (${attempt + 1}/${retries})`);
        sleep(0.5); // Pause avant retry
        continue;
      }
      
      errorRate.add(1);
      return false;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      responseTime.add(duration);
      
      if (attempt < retries) {
        console.log(`Journal creation error, retrying... (${attempt + 1}/${retries}):`, error);
        sleep(1);
        continue;
      }
      
      errorRate.add(1);
      return false;
    }
  }
  
  return false;
}

// Test de récupération après stress
function systemRecoveryCheck() {
  const startTime = Date.now();
  
  try {
    const response = http.get(`${SUPABASE_URL}/rest/v1/profiles?limit=1`, {
      headers,
      timeout: '10s',
      tags: { scenario: 'recovery_check' }
    });
    
    const duration = Date.now() - startTime;
    
    if (response.status === 200) {
      recoveryTime.add(duration);
      return true;
    }
    
    return false;
    
  } catch (error) {
    return false;
  }
}

// Monitoring système pendant stress
function monitorSystemHealth() {
  try {
    http.post(
      `${SUPABASE_URL}/functions/v1/performance-analytics`,
      JSON.stringify({ action: 'get_system_health' }),
      { 
        headers,
        timeout: '15s',
        tags: { scenario: 'monitoring' }
      }
    );
  } catch (error) {
    // Monitoring non-critique, on ignore les erreurs
  }
}

// Scénario principal de stress test
export default function() {
  activeUsers.add(1);
  
  const scenarioType = getScenarioType();
  const scenario = stressScenarios[scenarioType];
  
  // Détection early exit si système en rupture
  if (breakpointDetected && Math.random() < 0.8) {
    console.log('🚨 System breakpoint detected, reducing user actions');
    sleep(Math.random() * 10); // Pause aléatoire
    return;
  }
  
  // 1. Authentification (obligatoire)
  const auth = authenticateStress();
  if (!auth) {
    sleep(Math.random() * 5);
    return;
  }
  
  // Pause realistic
  const [minThink, maxThink] = scenario.think_time;
  sleep(Math.random() * (maxThink - minThink) + minThink);
  
  // 2. Actions selon le type d'utilisateur
  for (const action of scenario.actions) {
    switch (action) {
      case 'profile':
        http.get(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${auth.userId}`, {
          headers: { ...headers, 'Authorization': `Bearer ${auth.token}` },
          timeout: '10s',
          tags: { scenario: 'profile' }
        });
        break;
        
      case 'create_journal':
        createJournalEntryStress(auth);
        break;
        
      case 'stats':
        http.get(`${SUPABASE_URL}/rest/v1/journal_entries?user_id=eq.${auth.userId}&limit=10`, {
          headers: { ...headers, 'Authorization': `Bearer ${auth.token}` },
          timeout: '15s',
          tags: { scenario: 'stats' }
        });
        break;
        
      case 'premium':
        http.post(`${SUPABASE_URL}/functions/v1/performance-analytics`, 
          JSON.stringify({ action: 'analyze_bottlenecks' }), {
          headers: { ...headers, 'Authorization': `Bearer ${auth.token}` },
          timeout: '20s',
          tags: { scenario: 'premium' }
        });
        break;
    }
    
    // Pause entre actions
    sleep(Math.random() * 2 + 0.5);
  }
  
  // 3. Test de récupération sporadique
  if (Math.random() < 0.1) {
    systemRecoveryCheck();
  }
  
  // 4. Monitoring sporadique
  if (Math.random() < 0.05) {
    monitorSystemHealth();
  }
  
  activeUsers.add(-1);
}

export function setup() {
  console.log('🔥 DÉMARRAGE STRESS TEST JOURNEYS');
  console.log('⚠️  Attention: Test destructif - monitorer les métriques!');
  console.log(`🎯 Cible: ${SUPABASE_URL}`);
  console.log('📈 Escalade: 100 → 100,000 utilisateurs');
  console.log('⏱️  Durée totale: ~78 minutes');
  
  // Health check critique
  const health = http.get(`${SUPABASE_URL}/rest/v1/`, { headers });
  if (health.status !== 200) {
    console.error('❌ CRITICAL: System not healthy, aborting stress test');
    throw new Error('Pre-test health check failed');
  }
  
  console.log('✅ System healthy, beginning stress escalation');
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  
  console.log('🏁 STRESS TEST COMPLETED');
  console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`);
  console.log(`🔥 Breakpoint detected: ${breakpointDetected ? 'YES' : 'NO'}`);
  console.log('📊 Check Grafana for detailed stress analysis');
  
  // Test de récupération final
  console.log('🔄 Testing system recovery...');
  const recovery = systemRecoveryCheck();
  console.log(`💚 System recovery: ${recovery ? 'SUCCESSFUL' : 'FAILED'}`);
}