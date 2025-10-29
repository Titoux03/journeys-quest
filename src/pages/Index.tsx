import React, { useState, useEffect } from 'react';
import { HomePage } from '@/components/HomePage';
import { DailyJournal } from '@/components/DailyJournal';
import { ReflectionScreen } from '@/components/ReflectionScreen';
import { DailyNotes } from '@/components/DailyNotes';
import { ProgressScreen } from '@/components/ProgressScreen';
import { MeditationTimer } from '@/components/MeditationTimer';
import { AbstinenceTracker } from '@/components/AbstinenceTracker';
import { StretchingRoutine } from '@/components/StretchingRoutine';
import TodoList from '@/components/TodoList';
import { DailyQuote } from '@/components/DailyQuote';
import { PremiumUpgrade } from '@/components/PremiumUpgrade';
import { MarketingNotifications } from '@/components/MarketingNotifications';
import { BottomNavigation } from '@/components/BottomNavigation';
import { DesktopNavigation } from '@/components/DesktopNavigation';
import { UserStatus } from '@/components/UserStatus';
import { IntroPopup } from '@/components/IntroPopup';
import { OnboardingModal } from '@/components/OnboardingModal';
import { PremiumProgressInterruptor } from '@/components/PremiumProgressInterruptor';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';
import { useProgress } from '@/hooks/useProgress';
import { useGongSounds } from '@/hooks/useGongSounds';
import { usePopupManager } from '@/hooks/usePopupManager';
import { MobileOptimizations } from '@/components/MobileOptimizations';

interface JournalEntry {
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  reflection?: string;
  mood: 'low' | 'medium' | 'high';
}

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { upgradeModalVisible, hideUpgradeModal, isPremium } = usePremium();
  const { journalEntries, saveJournalEntry, deleteJournalEntry } = useProgress();
  const { playWelcome } = useGongSounds();
  const navigate = useNavigate();
  const { 
    shouldShowIntro, 
    shouldShowTutorial, 
    markIntroSeen, 
    markTutorialSeen,
    loading: popupLoading 
  } = usePopupManager();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [localJournalEntries, setLocalJournalEntries] = useState<JournalEntry[]>([]);
  const [currentJournalData, setCurrentJournalData] = useState<{
    scores: Record<string, number>;
    totalScore: number;
  } | null>(null);
  const [showProgressInterruptor, setShowProgressInterruptor] = useState(false);

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

  // Plus d'auto-affichage du modal Premium - supprimé

  // Jouer le gong de bienvenue
  useEffect(() => {
    const hasPlayedGong = sessionStorage.getItem('hasPlayedGong');
    if (!hasPlayedGong) {
      const gongTimer = setTimeout(() => {
        playWelcome();
        sessionStorage.setItem('hasPlayedGong', 'true');
      }, 1200);
      
      return () => clearTimeout(gongTimer);
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

    // Vérifier si on doit montrer l'interrupteur de progression (pour les utilisateurs non-premium)
    const allEntries = user ? journalEntries : localJournalEntries;
    const journalDay = allEntries.length + 1;
    
    if (user && !isPremium && (journalDay === 3 || journalDay === 7 || journalDay === 14 || journalDay === 21 || (journalDay > 21 && journalDay % 7 === 0))) {
      setTimeout(() => setShowProgressInterruptor(true), 2000);
    }
  };

  const handleUpdateEntry = async (updatedEntry: JournalEntry) => {
    if (user) {
      // Mettre à jour en base de données
      const result = await saveJournalEntry(
        updatedEntry.scores, 
        updatedEntry.totalScore, 
        updatedEntry.mood, 
        updatedEntry.reflection || ''
      );
      
      if (result?.success) {
        // Les données seront automatiquement mises à jour via loadProgressData
      }
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
    
    if (user) {
      if (currentJournalData) {
        // Sauvegarder avec la réflection en base de données (journal + notes)
        const mood = currentJournalData.totalScore <= 4 ? 'low' : currentJournalData.totalScore <= 7 ? 'medium' : 'high';
        await saveJournalEntry(
          currentJournalData.scores, 
          currentJournalData.totalScore, 
          mood, 
          reflection
        );
      } else {
        // Sauvegarder juste les notes libres en base de données
        await saveJournalEntry(
          {}, // Scores vides pour les notes libres
          0,  // Score total à 0 pour les notes libres
          'medium', // Mood neutre par défaut
          reflection
        );
      }
    } else {
      // Mettre à jour les données locales
      if (currentJournalData) {
        const updatedEntries = localJournalEntries.map(entry => 
          entry.date === today 
            ? { ...entry, reflection }
            : entry
        );
        setLocalJournalEntries(updatedEntries);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      } else {
        // Créer une nouvelle entrée locale pour les notes libres
        const newEntry: JournalEntry = {
          date: today,
          scores: {},
          totalScore: 0,
          reflection,
          mood: 'medium'
        };
        const updatedEntries = [newEntry, ...localJournalEntries.filter(e => e.date !== today)];
        setLocalJournalEntries(updatedEntries);
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      }
    }
    
    setCurrentScreen('home');
  };

  // Ne rien afficher pendant le chargement initial de l'auth (ignorer les popups)
  if (loading) {
    return null;
  }


  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomePage onNavigate={setCurrentScreen} entries={entries} />;
      case 'journal':
        return <DailyJournal onComplete={handleJournalComplete} />;
      case 'reflection':
        // Permettre l'accès libre aux notes (sans avoir besoin de currentJournalData)
        const mood = currentJournalData?.totalScore ? 
          (currentJournalData.totalScore <= 4 ? 'low' : currentJournalData.totalScore <= 7 ? 'medium' : 'high') : 
          'medium';
        const score = currentJournalData?.totalScore || 5.0;
        
        return (
          <ReflectionScreen 
            mood={mood}
            totalScore={score}
            onComplete={handleReflectionComplete}
            freeWriting={!currentJournalData} // Nouveau prop pour indiquer l'écriture libre
          />
        );
      case 'progress':
        return <ProgressScreen entries={entries} onNavigate={setCurrentScreen} onUpdateEntry={handleUpdateEntry} />;
      case 'notes':
        return <DailyNotes onNavigate={setCurrentScreen} />;
      case 'abstinence':
        return <AbstinenceTracker onNavigate={setCurrentScreen} />;
      case 'stretching':
        return <StretchingRoutine onNavigate={setCurrentScreen} />;
      case 'meditation':
        return <MeditationTimer onNavigate={setCurrentScreen} />;
      case 'todos':
        return <TodoList onNavigate={setCurrentScreen} />;
      default:
        return <HomePage onNavigate={setCurrentScreen} entries={entries} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {/* Desktop Navigation */}
      <DesktopNavigation 
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Pop-up d'introduction (SEULEMENT pour les visiteurs non connectés) */}
        {!user && shouldShowIntro && (
          <IntroPopup onClose={markIntroSeen} />
        )}
        
        {/* Optimisations CSS mobile */}
        <MobileOptimizations />
        
        {/* User Status Header */}
        <UserStatus />
        
        {/* Marketing Notifications */}
        <MarketingNotifications />
        
        {renderScreen()}
      </div>

      {/* Navigation en bas (mobile seulement) */}
      <BottomNavigation
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
      />

      {/* Premium Upgrade Modal - Accessible pour tous les utilisateurs non-premium */}
      <PremiumUpgrade 
        isVisible={upgradeModalVisible}
        onClose={hideUpgradeModal}
      />

      {/* Progress Interruptor Modal - disabled for authenticated users */}
      {!user && (
        <PremiumProgressInterruptor
          journalDay={localJournalEntries.length}
          onClose={() => setShowProgressInterruptor(false)}
        />
      )}
    </div>
  );
};

export default Index;