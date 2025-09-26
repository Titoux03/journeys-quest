// Test manuel rapide depuis le navigateur
async function quickPerformanceTest() {
  const SUPABASE_URL = 'https://fgoyvsnsoheboywgtgvi.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb3l2c25zb2hlYm95d2d0Z3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTM3MzMsImV4cCI6MjA3NDM4OTczM30.43odgp6oU7P6_KY_8zvkIOc4_ZeZbva7u9bJlNeemjE';

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  console.log('🚀 Démarrage test rapide...');

  // Test 1: Health check
  console.log('1️⃣ Test de connectivité...');
  const start1 = Date.now();
  const health = await fetch(`${SUPABASE_URL}/rest/v1/addiction_types?limit=1`, { headers });
  const time1 = Date.now() - start1;
  console.log(`✅ Health check: ${health.status} (${time1}ms)`);

  // Test 2: Edge Function
  console.log('2️⃣ Test Edge Function analytics...');
  const start2 = Date.now();
  try {
    const analytics = await fetch(`${SUPABASE_URL}/functions/v1/performance-analytics`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'get_system_health' })
    });
    const time2 = Date.now() - start2;
    console.log(`✅ Analytics function: ${analytics.status} (${time2}ms)`);
  } catch (e) {
    console.log(`⚠️ Analytics function: Error (${e.message})`);
  }

  // Test 3: Multiple requests simulées
  console.log('3️⃣ Test de charge légère (10 requêtes simultanées)...');
  const start3 = Date.now();
  const promises = Array.from({length: 10}, () => 
    fetch(`${SUPABASE_URL}/rest/v1/badges?limit=5`, { headers })
  );
  
  const results = await Promise.all(promises);
  const time3 = Date.now() - start3;
  const successes = results.filter(r => r.status === 200).length;
  console.log(`✅ Charge légère: ${successes}/10 succès (${time3}ms total, ${(time3/10).toFixed(0)}ms/req)`);

  console.log('\n📊 RÉSULTATS:');
  console.log(`- Connectivité: ${health.status === 200 ? '✅' : '❌'}`);
  console.log(`- Performance: ${time1 < 200 ? '✅' : '⚠️'} (${time1}ms)`);
  console.log(`- Scalabilité légère: ${successes >= 9 ? '✅' : '⚠️'} (${successes}/10)`);
  
  if (health.status === 200 && time1 < 500 && successes >= 8) {
    console.log('\n🎉 SYSTÈME PRÊT pour les tests K6 !');
    console.log('\n📋 Pour lancer les vrais tests:');
    console.log('1. Ouvrez un terminal');
    console.log('2. cd tests/load-testing');
    console.log('3. npm run test:load');
  } else {
    console.log('\n⚠️ Optimisations recommandées avant tests lourds');
  }
}

// Lancer le test
quickPerformanceTest().catch(console.error);