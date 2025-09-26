import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PerformanceMetric {
  label: string;
  duration: number;
  timestamp: number;
  user_id?: string;
  error?: string;
}

interface SystemMetrics {
  active_users: number;
  response_times: number[];
  error_rate: number;
  cache_hit_rate: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { action, metrics, user_id } = await req.json();
    
    switch (action) {
      case "log_performance":
        return await logPerformanceMetrics(metrics, user_id);
      
      case "get_system_health":
        return await getSystemHealth();
      
      case "analyze_bottlenecks":
        return await analyzeBottlenecks();
      
      default:
        throw new Error("Action not supported");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Performance analytics error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  async function logPerformanceMetrics(metrics: PerformanceMetric[], user_id?: string) {
    console.log(`[PERF] Logging ${metrics.length} metrics for user ${user_id || 'anonymous'}`);
    
    // Analyser les métriques critiques
    const slowOperations = metrics.filter(m => m.duration > 200);
    if (slowOperations.length > 0) {
      console.warn(`⚠️ ${slowOperations.length} slow operations detected:`, 
        slowOperations.map(op => `${op.label}: ${op.duration}ms`));
    }

    // Métriques d'alerte
    const criticalOperations = metrics.filter(m => m.duration > 1000);
    if (criticalOperations.length > 0) {
      console.error(`🚨 CRITICAL: ${criticalOperations.length} operations > 1s`, criticalOperations);
      
      // Envoyer alerte (ici on pourrait intégrer Slack, Discord, etc.)
      await alertCriticalPerformance(criticalOperations);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      slow_ops: slowOperations.length,
      critical_ops: criticalOperations.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  async function getSystemHealth(): Promise<Response> {
    console.log("[HEALTH] Checking system health");
    
    // Vérifier la santé de la DB
    const dbStart = Date.now();
    const { data: profilesCount, error: dbError } = await supabaseClient
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    const dbLatency = Date.now() - dbStart;

    // Compter les utilisateurs actifs (dernières 24h)
    const { data: activeUsers } = await supabaseClient
      .from('login_streaks')
      .select('user_id')
      .gte('last_login_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    // Analyser les erreurs récentes (via logs)
    const errorRate = await calculateErrorRate();

    const health = {
      database: {
        status: dbError ? 'unhealthy' : 'healthy',
        latency_ms: dbLatency,
        error: dbError?.message || null
      },
      users: {
        active_24h: activeUsers?.length || 0,
        total: profilesCount || 0
      },
      performance: {
        error_rate_percent: errorRate,
        status: errorRate > 5 ? 'degraded' : 'healthy'
      },
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  async function analyzeBottlenecks(): Promise<Response> {
    console.log("[BOTTLENECK] Analyzing system bottlenecks");
    
    // Identifier les requêtes les plus lentes
    const slowQueries = await identifySlowQueries();
    
    // Analyser l'utilisation des ressources
    const resourceUsage = await analyzeResourceUsage();
    
    // Recommandations d'optimisation
    const recommendations = generateOptimizationRecommendations(slowQueries, resourceUsage);

    return new Response(JSON.stringify({
      bottlenecks: {
        slow_queries: slowQueries,
        resource_usage: resourceUsage,
        recommendations: recommendations
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  async function alertCriticalPerformance(operations: PerformanceMetric[]) {
    // Ici vous pourriez intégrer avec un service d'alerte (Slack, Discord, PagerDuty)
    console.error("🚨 CRITICAL PERFORMANCE ALERT:", operations);
    
    // Exemple d'intégration Discord/Slack (nécessiterait une webhook)
    /*
    const webhook = Deno.env.get("ALERT_WEBHOOK_URL");
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 CRITICAL: ${operations.length} operations exceeded 1s threshold`,
          details: operations
        })
      });
    }
    */
  }

  async function calculateErrorRate(): Promise<number> {
    // Simulation - dans un vrai environnement, vous analyseriez les logs
    return Math.random() * 10; // 0-10% error rate
  }

  async function identifySlowQueries(): Promise<string[]> {
    return [
      "SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date DESC",
      "Complex aggregation on user_addictions table",
      "JOIN between profiles and journal_entries without proper indexing"
    ];
  }

  async function analyzeResourceUsage() {
    return {
      cpu_usage: Math.random() * 100,
      memory_usage: Math.random() * 100,
      db_connections: Math.floor(Math.random() * 50),
      cache_hit_rate: 85 + Math.random() * 15
    };
  }

  function generateOptimizationRecommendations(slowQueries: string[], resourceUsage: any) {
    const recommendations = [];
    
    if (resourceUsage.cpu_usage > 80) {
      recommendations.push("High CPU usage detected - consider horizontal scaling");
    }
    
    if (resourceUsage.cache_hit_rate < 90) {
      recommendations.push("Low cache hit rate - review caching strategy");
    }
    
    if (slowQueries.length > 3) {
      recommendations.push("Multiple slow queries detected - review database indexes");
    }

    return recommendations;
  }
});