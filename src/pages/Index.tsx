import React, { useState } from 'react';
import { Calendar, Target, BookOpen, Star, TrendingUp } from 'lucide-react';
import { HomePage } from '@/components/HomePage';
import { DailyJournal } from '@/components/DailyJournal';
import { ReflectionScreen } from '@/components/ReflectionScreen';
import { ProgressScreen } from '@/components/ProgressScreen';

type Screen = 'home' | 'journal' | 'reflection' | 'progress';

interface JournalEntry {
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  reflection?: string;
  mood: 'low' | 'medium' | 'high';
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [todayScores, setTodayScores] = useState<Record<string, number>>({});

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleJournalComplete = (scores: Record<string, number>, totalScore: number) => {
    const today = new Date().toISOString().split('T')[0];
    const mood: JournalEntry['mood'] = 
      totalScore >= 7 ? 'high' : 
      totalScore >= 4 ? 'medium' : 'low';

    const newEntry: JournalEntry = {
      date: today,
      scores,
      totalScore,
      mood
    };

    setTodayScores(scores);
    setEntries(prev => {
      const filtered = prev.filter(entry => entry.date !== today);
      return [...filtered, newEntry];
    });

    navigateToScreen('reflection');
  };

  const handleReflectionComplete = (reflection: string) => {
    const today = new Date().toISOString().split('T')[0];
    setEntries(prev => 
      prev.map(entry => 
        entry.date === today 
          ? { ...entry, reflection }
          : entry
      )
    );
    navigateToScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomePage onNavigate={navigateToScreen} entries={entries} />;
      case 'journal':
        return <DailyJournal onComplete={handleJournalComplete} />;
      case 'reflection':
        const todayEntry = entries.find(e => e.date === new Date().toISOString().split('T')[0]);
        return (
          <ReflectionScreen 
            mood={todayEntry?.mood || 'medium'} 
            totalScore={todayEntry?.totalScore || 0}
            onComplete={handleReflectionComplete}
          />
        );
      case 'progress':
        return <ProgressScreen entries={entries} onNavigate={navigateToScreen} />;
      default:
        return <HomePage onNavigate={navigateToScreen} entries={entries} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
      
      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="journey-card-premium px-6 py-3 flex items-center space-x-6 backdrop-filter backdrop-blur-xl">
          <button
            onClick={() => navigateToScreen('home')}
            className={`p-3 rounded-xl transition-all duration-500 ${
              currentScreen === 'home' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigateToScreen('journal')}
            className={`p-3 rounded-xl transition-all duration-500 ${
              currentScreen === 'journal' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Target className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigateToScreen('reflection')}
            className={`p-3 rounded-xl transition-all duration-500 ${
              currentScreen === 'reflection' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigateToScreen('progress')}
            className={`p-3 rounded-xl transition-all duration-500 ${
              currentScreen === 'progress' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Index;