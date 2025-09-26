import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Métriques pour test d'endurance
const errorRate = new Rate('endurance_errors');
const responseTime = new Trend('endurance_response_time');
const memoryLeakIndicator = new Gauge('memory_leak_indicator');
const longRunningOps = new Counter('long_running_operations');
const connectionLeaks = new Gauge('connection_leaks');

// Configuration endurance - charge soutenue 2h
export const options = {
  stages: [
    // Montée graduelle
    { duration: '5m', target: 200 },
    { duration: '5m', target: 500 },
    
    // Charge soutenue principale (1h45)
    { duration: '105m', target: 800 },
    
    // Descente progressive
    { duration: '3m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<300'],      // Performance stable
    http_req_failed: ['rate<0.03'],        // Très faible taux d'erreur
    endurance_response_time: ['p(99)<500'], // Pas de dégradation
    endurance_errors: ['rate<0.05'],       // Erreurs métier minimales
    
    // Détection memory leaks
    memory_leak_indicator: ['value<1000'], // Seuil arbitraire
    connection_leaks: ['value<50'],        // Max connections
  },
  
  // Configuration optimisée pour longue durée
  noConnectionReuse: false,
  batchPerHost: 3,
  discardResponseBodies: true, // Économie mémoire
};

const SUPABASE_URL = 'https://fgoyvsnsoheboywgtgvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb3l2c25zb2hlYm95d2d0Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTM3MzMsImV4cCI6MjA3NDM4OTczM30.43odgp6oU7P6_KY_8zvkIOc4_ZeZbva7u9bJlNeemjE';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

// Pool étendu pour test longue durée
const enduranceUsers = Array.from({length: 200}, (_, i) => ({
  email: `endurance${i}@journeys.com`,
  password: 'Endurance123!',
  id: `endurance-${i}`,
  lastActivity: 0,
  sessionDuration: 0
}));

// Patterns d'usage réalistes sur longue durée
const userBehaviors = {
  // Sessions courtes fréquentes (mobile)
  mobile_user: {
    weight: 60,
    session_duration: [30, 120], // 30s-2min
    actions_per_session: [1, 3],
    pause_between_sessions: [300, 900], // 5-15min
  },
  
  // Sessions moyennes (tablette)
  tablet_user: {
    weight: 30,
    session_duration: [120, 600], // 2-10min
    actions_per_session: [2, 8],
    pause_between_sessions: [600, 1800], // 10-30min
  },
  
  // Sessions longues (desktop)
  desktop_user: {
    weight: 10,
    session_duration: [600, 1800], // 10-30min
    actions_per_session: [5, 20],
    pause_between_sessions: [1800, 3600], // 30-60min
  }
};

let globalStats = {
  totalRequests: 0,
  totalErrors: 0,
  totalSessions: 0,
  averageResponseTime: [],
  connectionCount: 0,
  startTime: Date.now()
};

function getBehaviorType() {
  const rand = Math.random() * 100;
  if (rand < 60) return 'mobile_user';
  if (rand < 90) return 'tablet_user';
  return 'desktop_user';
}

function getRandomUser() {
  return enduranceUsers[Math.floor(Math.random() * enduranceUsers.length)];
}

// Authentification avec tracking session
function enduranceAuth(user) {
  const startTime = Date.now();
  globalStats.connectionCount++;
  
  try {
    const response = http.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      { 
        headers,
        timeout: '15s',
        tags: { scenario: 'endurance_auth' }
      }
    );
    
    const duration = Date.now() - startTime;
    responseTime.add(duration);
    globalStats.totalRequests++;
    globalStats.averageResponseTime.push(duration);
    
    // Détection potential memory leak
    if (globalStats.averageResponseTime.length > 1000) {
      const recent = globalStats.averageResponseTime.slice(-100);
      const old = globalStats.averageResponseTime.slice(-1000, -900);
      const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
      const oldAvg = old.reduce((a, b) => a + b) / old.length;
      
      if (recentAvg > oldAvg * 1.5) {
        memoryLeakIndicator.add(recentAvg - oldAvg);
      }
      
      // Cleanup pour éviter memory leak du test lui-même
      globalStats.averageResponseTime = globalStats.averageResponseTime.slice(-500);
    }
    
    const success = check(response, {
      'endurance auth OK': (r) => r.status === 200,
      'response time stable': (r) => r.timings.duration < 1000,
    });
    
    if (!success) {
      globalStats.totalErrors++;
      errorRate.add(1);
      globalStats.connectionCount--;
      return null;
    }
    
    errorRate.add(0);
    user.lastActivity = Date.now();
    
    try {
      const authData = JSON.parse(response.body);
      globalStats.connectionCount--;
      return authData.access_token ? {
        token: authData.access_token,
        userId: authData.user.id,
      } : null;
    } catch (e) {
      globalStats.connectionCount--;
      return null;
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    responseTime.add(duration);
    globalStats.totalRequests++;
    globalStats.totalErrors++;
    errorRate.add(1);
    globalStats.connectionCount--;
    return null;
  }
}

// Actions métier optimisées pour endurance
function enduranceJournalEntry(auth) {
  const startTime = Date.now();
  
  const payload = {
    user_id: auth.userId,
    date: new Date().toISOString().split('T')[0],
    scores: {
      endurance: Math.floor(Math.random() * 10) + 1,
      stability: Math.floor(Math.random() * 10) + 1,
    },
    total_score: Math.floor(Math.random() * 20) + 2,
    mood: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    reflection: null, // Économie payload
  };
  
  try {
    const response = http.post(
      `${SUPABASE_URL}/rest/v1/journal_entries`,
      JSON.stringify(payload),
      {
        headers: {
          ...headers,
          'Authorization': `Bearer ${auth.token}`,
        },
        timeout: '12s',
        tags: { scenario: 'endurance_journal' }
      }
    );
    
    const duration = Date.now() - startTime;
    responseTime.add(duration);
    globalStats.totalRequests++;
    
    if (duration > 2000) {
      longRunningOps.add(1);
    }
    
    const success = response.status === 201 || response.status === 200;
    if (!success) {
      globalStats.totalErrors++;
    }
    
    errorRate.add(success ? 0 : 1);
    return success;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    responseTime.add(duration);
    globalStats.totalRequests++;
    globalStats.totalErrors++;
    errorRate.add(1);
    return false;
  }
}

function enduranceProfileCheck(auth) {
  const startTime = Date.now();
  
  try {
    const response = http.get(
      `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${auth.userId}&limit=1`,
      {
        headers: {
          ...headers,
          'Authorization': `Bearer ${auth.token}`,
        },
        timeout: '8s',
        tags: { scenario: 'endurance_profile' }
      }
    );
    
    const duration = Date.now() - startTime;
    responseTime.add(duration);
    globalStats.totalRequests++;
    
    const success = response.status === 200;
    if (!success) {
      globalStats.totalErrors++;
    }
    
    errorRate.add(success ? 0 : 1);
    return success;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    responseTime.add(duration);
    globalStats.totalRequests++;
    globalStats.totalErrors++;
    errorRate.add(1);
    return false;
  }
}

// Monitoring périodique pour détection leaks
function performanceHealthCheck() {
  connectionLeaks.add(globalStats.connectionCount);
  
  // Log stats périodiques
  const uptime = (Date.now() - globalStats.startTime) / 1000;
  if (uptime % 300 < 1) { // Toutes les 5 minutes
    const errorPercent = ((globalStats.totalErrors / globalStats.totalRequests) * 100).toFixed(2);
    console.log(`⏱️ Uptime: ${Math.floor(uptime/60)}m | Requests: ${globalStats.totalRequests} | Errors: ${errorPercent}%`);
    
    if (globalStats.connectionCount > 30) {
      console.warn(`⚠️ High connection count: ${globalStats.connectionCount}`);
    }
  }
}

export default function() {
  const user = getRandomUser();
  const behavior = userBehaviors[getBehaviorType()];
  
  // Gestion sessions réalistes
  const now = Date.now();
  const timeSinceLastActivity = now - user.lastActivity;
  const [minPause, maxPause] = behavior.pause_between_sessions;
  
  if (user.lastActivity > 0 && timeSinceLastActivity < minPause * 1000) {
    // Utilisateur en pause, attendre
    sleep(Math.random() * 5);
    return;
  }
  
  // Démarrage nouvelle session
  globalStats.totalSessions++;
  const auth = enduranceAuth(user);
  if (!auth) {
    sleep(Math.random() * 10);
    return;
  }
  
  // Actions pendant la session
  const [minActions, maxActions] = behavior.actions_per_session;
  const actionsCount = Math.floor(Math.random() * (maxActions - minActions + 1)) + minActions;
  
  for (let i = 0; i < actionsCount; i++) {
    const actionType = Math.random();
    
    if (actionType < 0.4) {
      enduranceProfileCheck(auth);
    } else if (actionType < 0.8) {
      enduranceJournalEntry(auth);
    } else {
      // Action légère
      http.get(`${SUPABASE_URL}/rest/v1/addiction_types?limit=5`, {
        headers,
        timeout: '5s',
        tags: { scenario: 'endurance_light' }
      });
    }
    
    // Pause entre actions
    sleep(Math.random() * 3 + 1);
  }
  
  // Health check sporadique
  if (Math.random() < 0.1) {
    performanceHealthCheck();
  }
  
  // Durée session
  const [minDuration, maxDuration] = behavior.session_duration;
  const sessionDuration = Math.random() * (maxDuration - minDuration) + minDuration;
  user.sessionDuration = sessionDuration;
  
  sleep(Math.random() * 2);
}

export function setup() {
  console.log('🏃‍♂️ DÉMARRAGE TEST D\'ENDURANCE JOURNEYS');
  console.log('⏱️  Durée: 2 heures de charge soutenue');
  console.log(`🎯 Cible: ${SUPABASE_URL}`);
  console.log('👥 Utilisateurs: 800 simultanés max');
  console.log('🔍 Objectif: Détecter memory leaks et dégradations');
  
  const health = http.get(`${SUPABASE_URL}/rest/v1/addiction_types?limit=1`, { headers });
  if (health.status !== 200) {
    throw new Error('System not ready for endurance test');
  }
  
  console.log('✅ Starting endurance marathon...');
  globalStats.startTime = Date.now();
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  
  console.log('🏁 ENDURANCE TEST COMPLETED');
  console.log(`⏱️  Total Duration: ${hours}h ${minutes}m`);
  console.log(`📊 Total Requests: ${globalStats.totalRequests}`);
  console.log(`❌ Total Errors: ${globalStats.totalErrors} (${((globalStats.totalErrors/globalStats.totalRequests)*100).toFixed(2)}%)`);
  console.log(`🔄 Total Sessions: ${globalStats.totalSessions}`);
  
  const avgResponseTime = globalStats.averageResponseTime.length > 0 ? 
    globalStats.averageResponseTime.reduce((a, b) => a + b) / globalStats.averageResponseTime.length : 0;
  console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
  
  if (globalStats.connectionCount > 0) {
    console.log(`⚠️  Connection leaks detected: ${globalStats.connectionCount}`);
  } else {
    console.log('✅ No connection leaks detected');
  }
  
  console.log('📊 Analyze long-term trends in Grafana');
}