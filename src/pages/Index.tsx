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
import { MarketingNotifications } from '@/components/MarketingNotifications';
import { BottomNavigation } from '@/components/BottomNavigation';
import { UserStatus } from '@/components/UserStatus';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';
import { useProgress } from '@/hooks/useProgress';
import { useGongSounds } from '@/hooks/useGongSounds';

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
  const { journalEntries, saveJournalEntry } = useProgress();
  const { playWelcome } = useGongSounds();
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [localJournalEntries, setLocalJournalEntries] = useState<JournalEntry[]>([]);
  const [currentJournalData, setCurrentJournalData] = useState<{
    scores: Record<string, number>;
    totalScore: number;
  } | null>(null);

  // Charger les données locales si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        try {
          setLocalJournalEntries(JSON.parse(savedEntries));
        } catch (error) {
          console.error('Erreur lors du chargement des données locales:', error);
        }
      }
    } else {
      // Effacer les données locales si l'utilisateur se connecte
      setLocalJournalEntries([]);
    }
  }, [user]);

  // Jouer le gong de bienvenue à l'arrivée
  useEffect(() => {
    const hasPlayedWelcome = sessionStorage.getItem('hasPlayedWelcome');
    if (!hasPlayedWelcome) {
      const timer = setTimeout(() => {
        playWelcome();
        sessionStorage.setItem('hasPlayedWelcome', 'true');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [playWelcome]);

  // Utiliser les données de la base si connecté, sinon les données locales
  const entries = user ? journalEntries.map(entry => ({
    date: entry.date,
    scores: entry.scores,
    totalScore: entry.total_score,
    reflection: entry.reflection,
    mood: entry.mood
  })) : localJournalEntries;

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

    // Si l'utilisateur n'est pas connecté, sauvegarder en local
    if (!user) {
      const newEntries = localJournalEntries.filter(e => e.date !== today);
      const updatedEntries = [entry, ...newEntries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setLocalJournalEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    }
    // Si connecté, la sauvegarde se fait automatiquement dans DailyJournal via useProgress

    setCurrentJournalData({ scores, totalScore });
    setCurrentScreen('reflection');
  };

  const handleUpdateEntry = async (updatedEntry: JournalEntry) => {
    if (user) {
      // Mettre à jour en base de données
      await saveJournalEntry(
        updatedEntry.scores, 
        updatedEntry.totalScore, 
        updatedEntry.mood, 
        updatedEntry.reflection || ''
      );
    } else {
      // Mettre à jour les données locales
      const updatedEntries = localJournalEntries.map(entry => 
        entry.date === updatedEntry.date ? updatedEntry : entry
      );
      setLocalJournalEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    }
  };

  const handleReflectionComplete = async (reflection: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (user && currentJournalData) {
      // Sauvegarder avec la réflection en base de données
      const mood = currentJournalData.totalScore <= 4 ? 'low' : currentJournalData.totalScore <= 7 ? 'medium' : 'high';
      await saveJournalEntry(
        currentJournalData.scores, 
        currentJournalData.totalScore, 
        mood, 
        reflection
      );
    } else {
      // Mettre à jour les données locales
      const updatedEntries = localJournalEntries.map(entry => 
        entry.date === today 
          ? { ...entry, reflection }
          : entry
      );
      setLocalJournalEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    }
    
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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomePage onNavigate={setCurrentScreen} entries={entries} />;
      case 'journal':
        return <DailyJournal onComplete={handleJournalComplete} />;
      case 'reflection':
        if (!currentJournalData) return <HomePage onNavigate={setCurrentScreen} entries={entries} />;
        const reflectionMood = currentJournalData.totalScore <= 4 ? 'low' : currentJournalData.totalScore <= 7 ? 'medium' : 'high';
        return (
          <ReflectionScreen 
            mood={reflectionMood} 
            totalScore={currentJournalData.totalScore}
            onComplete={handleReflectionComplete}
          />
        );
      case 'progress':
        return <ProgressScreen entries={entries} onNavigate={setCurrentScreen} onUpdateEntry={handleUpdateEntry} />;
      case 'abstinence':
        return <AbstinenceTracker onNavigate={setCurrentScreen} />;
      case 'stretching':
        return <StretchingRoutine onNavigate={setCurrentScreen} />;
      case 'meditation':
        return <MeditationTimer onNavigate={setCurrentScreen} />;
      default:
        return <HomePage onNavigate={setCurrentScreen} entries={entries} />;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* User Status Header */}
      <UserStatus />
      
      {/* Marketing Notifications */}
      <MarketingNotifications />
      
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