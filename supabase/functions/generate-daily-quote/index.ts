import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Quote {
  text: string;
  author: string;
  theme: string;
}

const knownQuotes: Quote[] = [
  {
    text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.",
    author: "Winston Churchill",
    theme: "persévérance"
  },
  {
    text: "La seule façon de faire du bon travail, c'est d'aimer ce que vous faites.",
    author: "Steve Jobs",
    theme: "passion"
  },
  {
    text: "Votre temps est limité, ne le gaspillez pas en menant une existence qui n'est pas la vôtre.",
    author: "Steve Jobs",
    theme: "authenticité"
  },
  {
    text: "Le bonheur n'est pas quelque chose de tout fait. Il vient de vos propres actions.",
    author: "Dalaï Lama",
    theme: "bonheur"
  },
  {
    text: "Il n'y a qu'une façon d'éviter les critiques : ne rien faire, ne rien dire et n'être rien.",
    author: "Aristote",
    theme: "courage"
  },
  {
    text: "La vie, c'est ce qui vous arrive pendant que vous êtes occupé à faire d'autres projets.",
    author: "John Lennon",
    theme: "présent"
  },
  {
    text: "Soyez vous-même ; tous les autres sont déjà pris.",
    author: "Oscar Wilde",
    theme: "authenticité"
  },
  {
    text: "Dans vingt ans, vous serez plus déçu par les choses que vous n'avez pas faites que par celles que vous avez faites.",
    author: "Mark Twain",
    theme: "action"
  },
  {
    text: "L'impossible n'est que l'opinion de quelqu'un d'autre.",
    author: "Paulo Coelho",
    theme: "possibilités"
  },
  {
    text: "Le moment présent est le seul moment disponible pour nous, et c'est la porte d'entrée vers tous les autres moments.",
    author: "Thich Nhat Hanh",
    theme: "pleine conscience"
  },
  {
    text: "Ce que nous pensons, nous le devenons.",
    author: "Bouddha",
    theme: "pensée positive"
  },
  {
    text: "La gratitude transforme ce que nous avons en suffisant.",
    author: "Anonyme",
    theme: "gratitude"
  },
  {
    text: "Chaque jour est une nouvelle opportunité de devenir la meilleure version de soi-même.",
    author: "Journeys",
    theme: "croissance personnelle"
  },
  {
    text: "Le voyage de mille lieues commence par un premier pas.",
    author: "Lao Tseu",
    theme: "commencement"
  },
  {
    text: "Il n'est jamais trop tard pour être ce que vous auriez pu être.",
    author: "George Eliot",
    theme: "transformation"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[GENERATE-QUOTE] Function started');
    
    const { forceAI = false } = await req.json().catch(() => ({}));
    
    // 60% chance d'utiliser l'IA, 40% chance d'utiliser une citation connue
    const useAI = forceAI || Math.random() < 0.6;
    
    if (useAI) {
      console.log('[GENERATE-QUOTE] Using AI generation');
      const quote = await generateAIQuote();
      return new Response(JSON.stringify(quote), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.log('[GENERATE-QUOTE] Using known quote');
      const randomQuote = knownQuotes[Math.floor(Math.random() * knownQuotes.length)];
      const today = new Date().toISOString().split('T')[0];
      
      const quote = {
        text: randomQuote.text,
        author: randomQuote.author,
        theme: randomQuote.theme,
        date: today,
        source: 'known'
      };
      
      return new Response(JSON.stringify(quote), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('[GENERATE-QUOTE] Error:', error);
    
    // Fallback avec une citation connue en cas d'erreur
    const randomQuote = knownQuotes[Math.floor(Math.random() * knownQuotes.length)];
    const today = new Date().toISOString().split('T')[0];
    
    const fallbackQuote = {
      text: randomQuote.text,
      author: randomQuote.author,
      theme: randomQuote.theme,
      date: today,
      source: 'fallback'
    };
    
    return new Response(JSON.stringify(fallbackQuote), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateAIQuote(): Promise<any> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const themes = [
    'bien-être et développement personnel',
    'confiance en soi et estime de soi',
    'gratitude et reconnaissance',
    'persévérance et résilience',
    'croissance personnelle et apprentissage',
    'équilibre vie professionnelle et personnelle',
    'relations humaines et amour',
    'méditation et pleine conscience',
    'courage et dépassement de soi',
    'créativité et inspiration',
    'paix intérieure et sérénité',
    'force mentale et motivation'
  ];

  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  
  const prompt = `Génère une citation inspirante et motivante originale sur le thème "${randomTheme}" pour une application de journal intime de bien-être. 

La citation doit être :
- En français
- Positive et encourageante
- Adaptée à quelqu'un qui travaille sur son développement personnel
- Originale (pas une citation existante connue)
- Entre 10 et 25 mots maximum

Réponds uniquement avec le format JSON suivant :
{
  "text": "La citation exacte",
  "author": "Journeys"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en citations inspirantes et en développement personnel. Tu génères uniquement des citations originales et motivantes. Réponds toujours en JSON valide.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  try {
    const parsedQuote = JSON.parse(content);
    const today = new Date().toISOString().split('T')[0];
    
    return {
      text: parsedQuote.text,
      author: parsedQuote.author || "Journeys",
      theme: randomTheme,
      date: today,
      source: 'ai'
    };
  } catch (parseError) {
    console.error('[GENERATE-QUOTE] JSON parse error:', parseError);
    
    // Fallback si le parsing JSON échoue
    const cleanContent = content.replace(/"/g, '').replace(/\n/g, ' ').trim();
    const today = new Date().toISOString().split('T')[0];
    
    return {
      text: cleanContent,
      author: "Journeys",
      theme: randomTheme,
      date: today,
      source: 'ai'
    };
  }
}