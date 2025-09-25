import React, { useState, useEffect } from 'react';
import { HomePage } from '@/components/HomePage';
import { DailyJournal } from '@/components/DailyJournal';
import { ReflectionScreen } from '@/components/ReflectionScreen';
import { ProgressScreen } from '@/components/ProgressScreen';
import { MeditationTimer } from '@/components/MeditationTimer';
import { AbstinenceTracker } from '@/components/AbstinenceTracker';
import { StretchingRoutine } from '@/components/StretchingRoutine';
import { DailyQuote } from '@/components/DailyQuote';
import { PremiumUpgrade } from '@/components/PremiumUpgrade';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';

interface JournalEntry {
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  reflection?: string;
  mood: 'low' | 'medium' | 'high';
}

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { upgradeModalVisible, hideUpgradeModal } = usePremium();
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentJournalData, setCurrentJournalData] = useState<{
    scores: Record<string, number>;
    totalScore: number;
  } | null>(null);

  // Rediriger vers la page d'authentification si pas connecté
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleJournalComplete = (scores: Record<string, number>, totalScore: number) => {
    const today = new Date().toISOString().split('T')[0];
    const mood = totalScore <= 4 ? 'low' : totalScore <= 7 ? 'medium' : 'high';
    const entry: JournalEntry = {
      date: today,
      scores,
      totalScore,
      reflection: '',
      mood
    };

    setJournalEntries(prev => {
      const filtered = prev.filter(e => e.date !== today);
      return [entry, ...filtered].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    setCurrentJournalData({ scores, totalScore });
    setCurrentScreen('reflection');
  };

  const handleReflectionComplete = (reflection: string) => {
    const today = new Date().toISOString().split('T')[0];
    setJournalEntries(prev => 
      prev.map(entry => 
        entry.date === today 
          ? { ...entry, reflection }
          : entry
      )
    );
    setCurrentScreen('home');
  };

  // Afficher un loader pendant le chargement de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-secondary">
        <div className="w-8 h-8 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Si pas d'utilisateur, rien à afficher (redirection en cours)
  if (!user) {
    return null;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomePage onNavigate={setCurrentScreen} entries={journalEntries} />;
      case 'journal':
        return <DailyJournal onComplete={handleJournalComplete} />;
      case 'reflection':
        if (!currentJournalData) return <HomePage onNavigate={setCurrentScreen} entries={journalEntries} />;
        const reflectionMood = currentJournalData.totalScore <= 4 ? 'low' : currentJournalData.totalScore <= 7 ? 'medium' : 'high';
        return (
          <ReflectionScreen 
            mood={reflectionMood} 
            totalScore={currentJournalData.totalScore}
            onComplete={handleReflectionComplete}
          />
        );
      case 'progress':
        return <ProgressScreen entries={journalEntries} onNavigate={setCurrentScreen} />;
      case 'abstinence':
        return <AbstinenceTracker onNavigate={setCurrentScreen} />;
      case 'stretching':
        return <StretchingRoutine onNavigate={setCurrentScreen} />;
      case 'meditation':
        return <MeditationTimer onNavigate={setCurrentScreen} />;
      default:
        return <HomePage onNavigate={setCurrentScreen} entries={journalEntries} />;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {renderScreen()}

      {/* Navigation en bas */}
      <BottomNavigation 
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgrade 
        isVisible={upgradeModalVisible}
        onClose={hideUpgradeModal}
      />
    </div>
  );
};

export default Index;