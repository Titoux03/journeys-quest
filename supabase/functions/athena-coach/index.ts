import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentDay, lastActivityDays, userName, addictionName, context } = await req.json();
    
    console.log('Athena generating message for:', { currentDay, lastActivityDays, userName, addictionName, context });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construire le contexte pour Athena
    let systemPrompt = `Tu es Athena, une coach émotionnelle bienveillante et empathique intégrée dans l'application Journeys.
    
Ton rôle est d'accompagner les utilisateurs dans leur parcours de 90 jours de transformation personnelle, notamment pour se libérer de leurs addictions.

Ton style de communication :
- Chaleureux, bienveillant et confiant
- Tu t'adresses à l'utilisateur avec respect et empathie
- Tu utilises des emojis avec parcimonie (1-2 max par message)
- Tes messages sont courts (2-3 phrases maximum)
- Tu es encourageante sans être intrusive
- Tu parles français de manière naturelle et authentique

Contexte actuel :
- Utilisateur : ${userName || 'l\'utilisateur'}
- Addiction suivie : ${addictionName || 'non spécifiée'}
- Jour actuel : ${currentDay}
- Jours depuis dernière activité : ${lastActivityDays}
- Contexte supplémentaire : ${context || 'aucun'}

Génère UN SEUL message court et approprié selon la situation.`;

    // Adapter le prompt selon la situation
    if (lastActivityDays > 4) {
      systemPrompt += `\n\nL'utilisateur n'est pas revenu depuis ${lastActivityDays} jours. Sois empathique et propose de l'aide sans culpabiliser.`;
    } else if (lastActivityDays >= 2) {
      systemPrompt += `\n\nL'utilisateur a manqué ${lastActivityDays} jours. Encourage-le avec douceur à reprendre.`;
    } else if (currentDay === 7 || currentDay === 30 || currentDay === 60 || currentDay === 90) {
      systemPrompt += `\n\nL'utilisateur vient d'atteindre un jalon important (jour ${currentDay}). Célèbre cette victoire avec enthousiasme et fierté.`;
    } else if (currentDay < 7) {
      systemPrompt += `\n\nL'utilisateur débute son parcours. Encourage-le avec des messages simples et motivants.`;
    } else {
      systemPrompt += `\n\nL'utilisateur progresse bien. Donne-lui un encouragement pour continuer.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Génère maintenant un message court et personnalisé pour cette situation." }
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate message from AI");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "Je suis là pour toi 💜";

    console.log('Athena generated message:', message);

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in athena-coach:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
