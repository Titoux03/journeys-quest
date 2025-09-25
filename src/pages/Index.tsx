import React, { useState } from 'react';
import { Calendar, Target, BookOpen, Star, TrendingUp, Shield, Dumbbell, Brain } from 'lucide-react';
import { HomePage } from '@/components/HomePage';
import { DailyJournal } from '@/components/DailyJournal';
import { ReflectionScreen } from '@/components/ReflectionScreen';
import { ProgressScreen } from '@/components/ProgressScreen';
import { AbstinenceTracker } from '@/components/AbstinenceTracker';
import { StretchingRoutine } from '@/components/StretchingRoutine';
import { MeditationTimer } from '@/components/MeditationTimer';
import { PremiumUpgrade } from '@/components/PremiumUpgrade';
import { PremiumProvider, usePremium } from '@/hooks/usePremium';

type Screen = 'home' | 'journal' | 'reflection' | 'progress' | 'abstinence' | 'stretching' | 'meditation';

interface JournalEntry {
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  reflection?: string;
  mood: 'low' | 'medium' | 'high';
}

const IndexContent = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [todayScores, setTodayScores] = useState<Record<string, number>>({});
  const { upgradeModalVisible, hideUpgradeModal } = usePremium();

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
      case 'abstinence':
        return <AbstinenceTracker onNavigate={navigateToScreen} />;
      case 'stretching':
        return <StretchingRoutine onNavigate={navigateToScreen} />;
      case 'meditation':
        return <MeditationTimer onNavigate={navigateToScreen} />;
      default:
        return <HomePage onNavigate={navigateToScreen} entries={entries} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {renderScreen()}
      
      {/* Premium Upgrade Modal */}
      <PremiumUpgrade 
        isVisible={upgradeModalVisible}
        onClose={hideUpgradeModal}
      />
      
      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="journey-card-premium px-4 py-3 flex items-center space-x-3 backdrop-filter backdrop-blur-xl">
          <button
            onClick={() => navigateToScreen('home')}
            className={`p-2.5 rounded-xl transition-all duration-500 ${
              currentScreen === 'home' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigateToScreen('journal')}
            className={`p-2.5 rounded-xl transition-all duration-500 ${
              currentScreen === 'journal' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Target className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateToScreen('abstinence')}
            className={`p-2.5 rounded-xl transition-all duration-500 ${
              currentScreen === 'abstinence' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Shield className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateToScreen('stretching')}
            className={`p-2.5 rounded-xl transition-all duration-500 ${
              currentScreen === 'stretching' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateToScreen('meditation')}
            className={`p-2.5 rounded-xl transition-all duration-500 ${
              currentScreen === 'meditation' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Brain className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigateToScreen('reflection')}
            className={`p-2.5 rounded-xl transition-all duration-500 ${
              currentScreen === 'reflection' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigateToScreen('progress')}
            className={`p-2.5 rounded-xl transition-all duration-500 ${
              currentScreen === 'progress' 
                ? 'bg-primary text-primary-foreground shadow-lg scale-110 shadow-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </div>
  );
};

const Index = () => {
  return (
    <PremiumProvider>
      <IndexContent />
    </PremiumProvider>
  );
};

export default Index;