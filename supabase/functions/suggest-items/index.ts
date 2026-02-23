import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { level, gender, equippedItems, ownedItems, allItems } = await req.json();

    const systemPrompt = `Tu es un styliste expert pour un jeu pixel art RPG. Tu donnes des conseils de style d'avatar ultra-engageants et addictifs.

RÈGLES:
- Réponds UNIQUEMENT en français
- Sois enthousiaste, motivant et fun
- Utilise des emojis avec parcimonie
- Tes suggestions doivent être concrètes et référencer des items existants par leur clé exacte
- Donne 2-3 combinaisons d'items recommandées
- Suggère 1 quête/objectif personnalisé pour débloquer des items rares
- Donne un message motivant lié au niveau actuel`;

    const userPrompt = `Joueur niveau ${level}, genre: ${gender}.
Items équipés: ${JSON.stringify(equippedItems || [])}
Items possédés: ${JSON.stringify(ownedItems || [])}
Tous les items disponibles: ${JSON.stringify(allItems || [])}

Donne:
1. 2-3 combinaisons d'items harmonieuses (utilise les clés exactes des items)
2. Un défi/quête personnalisé pour progresser
3. Un message motivant adapté au niveau`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_items",
              description: "Return item suggestions, quest and motivational message",
              parameters: {
                type: "object",
                properties: {
                  combinations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nom de la combinaison" },
                        items: { type: "array", items: { type: "string" }, description: "Clés des items" },
                        description: { type: "string", description: "Description fun de la combo" },
                        rarity_tier: { type: "string", enum: ["common", "uncommon", "rare", "epic", "legendary"] }
                      },
                      required: ["name", "items", "description", "rarity_tier"],
                      additionalProperties: false
                    }
                  },
                  quest: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      target: { type: "string", description: "Item à débloquer en récompense (clé)" },
                      difficulty: { type: "string", enum: ["facile", "moyen", "difficile"] }
                    },
                    required: ["title", "description", "difficulty"],
                    additionalProperties: false
                  },
                  motivation: { type: "string", description: "Message motivant personnalisé" }
                },
                required: ["combinations", "quest", "motivation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_items" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessaie dans quelques secondes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits AI épuisés." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const suggestions = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(suggestions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: return content as-is
    return new Response(JSON.stringify({ 
      combinations: [],
      quest: { title: "Continue ton aventure !", description: "Monte de niveau pour débloquer plus d'items.", difficulty: "moyen" },
      motivation: data.choices?.[0]?.message?.content || "Continue comme ça ! 🎮"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-items error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
