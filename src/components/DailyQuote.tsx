import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DailyQuoteProps {}

interface Quote {
  text: string;
  author: string;
  theme: string;
  date: string;
  source?: string;
}

export const DailyQuote: React.FC<DailyQuoteProps> = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallbackQuotes = [
    {
      text: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.",
      author: "Winston Churchill",
      theme: "persévérance",
      date: new Date().toISOString().split('T')[0],
      source: 'fallback'
    },
    {
      text: "Votre seule limite est votre mental. Croyez en vous et tous les possibles s'offriront à vous.",
      author: "Anonyme",
      theme: "confiance en soi",
      date: new Date().toISOString().split('T')[0],
      source: 'fallback'
    },
    {
      text: "Chaque jour est une nouvelle opportunité de devenir la meilleure version de vous-même.",
      author: "Journeys",
      theme: "croissance personnelle",
      date: new Date().toISOString().split('T')[0],
      source: 'fallback'
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

  const generateQuote = async (forceNew = false) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Generating new quote...');
      
      const { data, error } = await supabase.functions.invoke('generate-daily-quote', {
        body: { forceAI: forceNew }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        console.log('Generated quote:', data);
        setQuote(data);
        storeQuote(data);
      } else {
        throw new Error('Aucune citation reçue');
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
    generateQuote(true); // Force une nouvelle génération
  };

  useEffect(() => {
    // Charger la citation du jour au montage
    const stored = getStoredQuote();
    if (stored) {
      setQuote(stored);
    } else {
      // Générer automatiquement une nouvelle citation
      generateQuote(false);
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
            <p className="text-sm text-muted-foreground">
              {quote?.source === 'ai' ? 'Générée par IA ✨' : 
               quote?.source === 'known' ? 'Citation inspirante 📚' : 
               'Inspiration quotidienne 💫'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-secondary/50 transition-colors disabled:opacity-50"
          title="Nouvelle citation"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>


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
    </div>
  );
};