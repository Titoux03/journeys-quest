import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Settings, Lock } from 'lucide-react';

interface DailyQuoteProps {
  apiKey?: string;
  onApiKeyChange?: (key: string) => void;
}

interface Quote {
  text: string;
  author: string;
  theme: string;
  date: string;
}

export const DailyQuote: React.FC<DailyQuoteProps> = ({ apiKey, onApiKeyChange }) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const fallbackQuotes = [
    {
      text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.",
      author: "Winston Churchill",
      theme: "persévérance",
      date: new Date().toISOString().split('T')[0]
    },
    {
      text: "Votre seule limite est votre mental. Croyez en vous et tous les possibles s'offriront à vous.",
      author: "Anonyme",
      theme: "confiance en soi",
      date: new Date().toISOString().split('T')[0]
    },
    {
      text: "Chaque jour est une nouvelle opportunité de devenir la meilleure version de vous-même.",
      author: "Journeys",
      theme: "croissance personnelle",
      date: new Date().toISOString().split('T')[0]
    }
  ];

  const getStoredQuote = (): Quote | null => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`daily-quote-${today}`);
    return stored ? JSON.parse(stored) : null;
  };

  const storeQuote = (newQuote: Quote) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`daily-quote-${today}`, JSON.stringify(newQuote));
  };

  const generateQuote = async (useApiKey: string) => {
    setLoading(true);
    setError(null);

    try {
      const themes = [
        'bien-être et développement personnel',
        'confiance en soi et estime de soi',
        'gratitude et reconnaissance',
        'persévérance et résilience',
        'croissance personnelle et apprentissage',
        'équilibre vie professionnelle et personnelle',
        'relations humaines et amour',
        'méditation et pleine conscience'
      ];

      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      
      const prompt = `Génère une citation inspirante et motivante originale sur le thème "${randomTheme}" pour une application de journal intime de bien-être. La citation doit être en français, positive, encourageante et adaptée à quelqu'un qui travaille sur son développement personnel. Format de réponse souhaité : "Citation exacte" - Auteur (si c'est une citation existante) ou "Journeys" (si c'est original). Exemple: "La vie commence là où finit votre zone de confort." - Neale Donald Walsch`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${useApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en citations inspirantes et en développement personnel. Réponds uniquement avec une citation suivie de son auteur, rien d\'autre.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
          top_p: 0.9,
          return_images: false,
          return_related_questions: false,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Réponse vide de l\'API');
      }

      // Parse la réponse pour extraire la citation et l'auteur
      const match = content.match(/"([^"]+)"\s*-\s*(.+)/);
      
      if (match) {
        const newQuote: Quote = {
          text: match[1].trim(),
          author: match[2].trim(),
          theme: randomTheme,
          date: new Date().toISOString().split('T')[0]
        };
        
        setQuote(newQuote);
        storeQuote(newQuote);
      } else {
        // Si le parsing échoue, utiliser le contenu brut
        const newQuote: Quote = {
          text: content.replace(/"/g, '').trim(),
          author: "Journeys",
          theme: randomTheme,
          date: new Date().toISOString().split('T')[0]
        };
        
        setQuote(newQuote);
        storeQuote(newQuote);
      }
    } catch (err) {
      console.error('Erreur lors de la génération de citation:', err);
      setError('Impossible de générer une nouvelle citation');
      // Utiliser une citation de fallback
      const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setQuote(randomFallback);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClick = () => {
    if (!apiKey && !tempApiKey) {
      setShowApiKeyInput(true);
      return;
    }
    generateQuote(apiKey || tempApiKey);
  };

  const handleApiKeySubmit = () => {
    if (tempApiKey.trim()) {
      onApiKeyChange?.(tempApiKey);
      setShowApiKeyInput(false);
      generateQuote(tempApiKey);
    }
  };

  useEffect(() => {
    // Charger la citation du jour au montage
    const stored = getStoredQuote();
    if (stored) {
      setQuote(stored);
    } else {
      // Si pas de citation stockée et pas de clé API, utiliser une citation de fallback
      const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      setQuote(randomFallback);
    }
  }, []);

  return (
    <div className="journey-card-premium animate-scale-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Citation du jour</h3>
            <p className="text-sm text-muted-foreground">Générée par IA ✨</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
            title="Configurer l'API"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleGenerateClick}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors disabled:opacity-50"
            title="Nouvelle citation"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Configuration de l'API Key */}
      {showApiKeyInput && (
        <div className="mb-4 p-4 bg-secondary/30 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Configuration Perplexity AI</span>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Clé API Perplexity"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-xl text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleApiKeySubmit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:scale-105 transition-transform"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setShowApiKeyInput(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm hover:bg-secondary/80 transition-colors"
              >
                Annuler
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenez votre clé API sur{' '}
              <a 
                href="https://www.perplexity.ai/settings/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                perplexity.ai
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Citation */}
      {quote && (
        <div className="space-y-4">
          <blockquote className="text-lg font-medium text-card-foreground leading-relaxed italic">
            "{quote.text}"
          </blockquote>
          
          <div className="flex items-center justify-between">
            <cite className="text-sm text-primary font-medium not-italic">
              — {quote.author}
            </cite>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary/30 rounded-lg">
              {quote.theme}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!apiKey && !showApiKeyInput && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-xl">
          <p className="text-xs text-muted-foreground">
            💡 Configurez votre clé API Perplexity pour des citations personnalisées générées par IA !
          </p>
        </div>
      )}
    </div>
  );
};