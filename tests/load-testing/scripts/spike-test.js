import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métriques spécialisées pour spike test
const errorRate = new Rate('spike_errors');
const spikeResponseTime = new Trend('spike_response_time');
const recoveryMetric = new Counter('recovery_success');
const spikeImpact = new Trend('spike_impact_duration');

// Configuration spike test - pics soudains de trafic
export const options = {
  stages: [
    // Baseline stable
    { duration: '2m', target: 100 },
    
    // SPIKE 1: 10x traffic instantané
    { duration: '30s', target: 1000 },
    { duration: '2m', target: 1000 },
    { duration: '30s', target: 100 },
    
    // Récupération
    { duration: '3m', target: 100 },
    
    // SPIKE 2: 50x traffic extrême
    { duration: '15s', target: 5000 },
    { duration: '3m', target: 5000 },
    { duration: '30s', target: 100 },
    
    // Récupération longue
    { duration: '5m', target: 100 },
    
    // SPIKE 3: 100x traffic critique
    { duration: '10s', target: 10000 },
    { duration: '2m', target: 10000 },
    { duration: '1m', target: 100 },
    
    // Test final de stabilité
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  
  thresholds: {
    // Seuils permissifs pendant les spikes
    http_req_duration: ['p(90)<5000'],    // 90% < 5s pendant spike
    http_req_failed: ['rate<0.30'],       // Jusqu'à 30% échecs acceptables
    spike_response_time: ['p(95)<3000'],  // Métrique custom spike
    spike_errors: ['rate<0.40'],          // 40% erreurs max pendant spike
    
    // Récupération doit être rapide
    'http_req_duration{scenario:recovery}': ['p(95)<500'],
  },
};

const SUPABASE_URL = 'https://fgoyvsnsoheboywgtgvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb3l2c25zb2hlYm95d2d0Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTM3MzMsImV4cCI6MjA3NDM4OTczM30.43odgp6oU7P6_KY_8zvkIOc4_ZeZbva7u9bJlNeemjE';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

// Pool d'utilisateurs pour spike test
const spikeUsers = Array.from({length: 500}, (_, i) => ({
  email: `spike${i}@journeys.com`,
  password: 'Spike123!',
  id: `spike-${i}`
}));

// Actions critiques à tester pendant les spikes
const spikeActions = [
  'auth_only',          // 40% - Action la plus critique
  'auth_profile',       // 30% - Combo fréquent
  'auth_journal',       // 20% - Action métier
  'full_scenario',      // 10% - Scénario complet
];

function selectSpikeAction() {
  const rand = Math.random();
  if (rand < 0.4) return 'auth_only';
  if (rand < 0.7) return 'auth_profile';
  if (rand < 0.9) return 'auth_journal';
  return 'full_scenario';
}

function quickAuth() {
  const user = spikeUsers[Math.floor(Math.random() * spikeUsers.length)];
  const startTime = Date.now();
  
  try {
    const response = http.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      { 
        headers,
        timeout: '10s',
        tags: { scenario: 'spike_auth' }
      }
    );
    
    const duration = Date.now() - startTime;
    spikeResponseTime.add(duration);
    
    const success = response.status === 200 && response.body;
    errorRate.add(success ? 0 : 1);
    
    if (success) {
      try {
        const authData = JSON.parse(response.body);
        return authData.access_token ? {
          token: authData.access_token,
          userId: authData.user.id,
        } : null;
      } catch (e) {
        return null;
      }
    }
    
    return null;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    spikeResponseTime.add(duration);
    errorRate.add(1);
    return null;
  }
}

function quickProfile(auth) {
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
        tags: { scenario: 'spike_profile' }
      }
    );
    
    const duration = Date.now() - startTime;
    spikeResponseTime.add(duration);
    
    const success = response.status === 200;
    errorRate.add(success ? 0 : 1);
    return success;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    spikeResponseTime.add(duration);
    errorRate.add(1);
    return false;
  }
}

function quickJournal(auth) {
  const startTime = Date.now();
  
  const payload = {
    user_id: auth.userId,
    date: new Date().toISOString().split('T')[0],
    scores: { test: 5 },
    total_score: 5,
    mood: 'medium',
    reflection: 'Spike test',
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
        timeout: '10s',
        tags: { scenario: 'spike_journal' }
      }
    );
    
    const duration = Date.now() - startTime;
    spikeResponseTime.add(duration);
    
    const success = response.status === 201 || response.status === 200;
    errorRate.add(success ? 0 : 1);
    return success;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    spikeResponseTime.add(duration);
    errorRate.add(1);
    return false;
  }
}

// Test de récupération du système
function recoveryTest() {
  const startTime = Date.now();
  
  try {
    const response = http.get(`${SUPABASE_URL}/rest/v1/addiction_types?limit=1`, {
      headers,
      timeout: '5s',
      tags: { scenario: 'recovery' }
    });
    
    const duration = Date.now() - startTime;
    
    if (response.status === 200 && duration < 1000) {
      recoveryMetric.add(1);
      return true;
    }
    
    return false;
    
  } catch (error) {
    return false;
  }
}

export default function() {
  const action = selectSpikeAction();
  
  // Gestion ultra-rapide des scénarios pour spike
  switch (action) {
    case 'auth_only':
      quickAuth();
      break;
      
    case 'auth_profile':
      const auth1 = quickAuth();
      if (auth1) {
        sleep(0.1);
        quickProfile(auth1);
      }
      break;
      
    case 'auth_journal':
      const auth2 = quickAuth();
      if (auth2) {
        sleep(0.2);
        quickJournal(auth2);
      }
      break;
      
    case 'full_scenario':
      const auth3 = quickAuth();
      if (auth3) {
        sleep(0.1);
        quickProfile(auth3);
        sleep(0.2);
        quickJournal(auth3);
      }
      break;
  }
  
  // Test de récupération sporadique
  if (Math.random() < 0.05) {
    recoveryTest();
  }
  
  // Pause minimale pour spike
  sleep(Math.random() * 0.5);
}

export function setup() {
  console.log('⚡ DÉMARRAGE SPIKE TEST JOURNEYS');
  console.log('🎯 Objectif: Tester résistance aux pics soudains');
  console.log(`📡 Cible: ${SUPABASE_URL}`);
  console.log('📊 Spikes: 10x → 50x → 100x traffic');
  console.log('⏱️ Durée: ~25 minutes');
  
  // Validation pré-test
  const health = http.get(`${SUPABASE_URL}/rest/v1/addiction_types?limit=1`, { headers });
  if (health.status !== 200) {
    console.error('❌ Pre-spike health check failed');
    throw new Error('System not ready for spike test');
  }
  
  console.log('✅ System ready for spike testing');
  return { 
    startTime: Date.now(),
    spikes: 0,
    recoveries: 0
  };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  
  console.log('⚡ SPIKE TEST COMPLETED');
  console.log(`⏱️ Duration: ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`);
  
  // Test de récupération finale
  console.log('🔄 Final recovery test...');
  let recoverySuccess = 0;
  for (let i = 0; i < 5; i++) {
    if (recoveryTest()) recoverySuccess++;
    sleep(1);
  }
  
  console.log(`💚 Recovery rate: ${recoverySuccess}/5 (${recoverySuccess * 20}%)`);
  console.log('📊 Analyze spike impact in Grafana');
  
  if (recoverySuccess >= 4) {
    console.log('✅ System recovered successfully from spikes');
  } else {
    console.log('⚠️ System may need additional recovery time');
  }
}