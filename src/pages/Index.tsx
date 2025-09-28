import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { HomePage } from '@/components/HomePage';
import { MobileLayout } from '@/components/MobileLayout';
import { CalendarView } from '@/components/CalendarView';
import { DayDetailView } from '@/components/DayDetailView';
import { MeditationTimer } from '@/components/MeditationTimer';
import { AbstinenceTracker } from '@/components/AbstinenceTracker';
import { StretchingRoutine } from '@/components/StretchingRoutine';
import { ProgressScreen } from '@/components/ProgressScreen';
import { WelcomeAnimation } from '@/components/WelcomeAnimation';
import { InstallPWAModal } from '@/components/InstallPWAModal';
import { usePremium } from '@/hooks/usePremium';
import { useProgress } from '@/hooks/useProgress';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { journalEntries } = useProgress();
  const [currentTab, setCurrentTab] = useState('calendar');
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Animation de bienvenue pour les nouveaux utilisateurs
  useEffect(() => {
    if (user) {
      const hasSeenWelcome = localStorage.getItem(`welcome-${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
        localStorage.setItem(`welcome-${user.id}`, 'true');
      }
    }
  }, [user]);

  const handleTabChange = (tab: string) => {
    // Vérifier les permissions Premium
    if (!isPremium && ['abstinence', 'stretching', 'progress'].includes(tab)) {
      toast({
        title: "Fonctionnalité Premium",
        description: "Passez à Journeys+ pour accéder à cette fonctionnalité",
        variant: "default"
      });
      return;
    }
    
    setCurrentTab(tab);
    setShowDayDetail(false);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setShowDayDetail(true);
  };

  const handleGoHome = () => {
    setCurrentTab('calendar');
    setShowDayDetail(false);
  };

  // Formater les entrées pour HomePage
  const formattedEntries = journalEntries.map(entry => ({
    date: entry.date,
    scores: entry.scores,
    totalScore: entry.total_score,
    reflection: entry.reflection,
    mood: entry.mood as 'low' | 'medium' | 'high'
  }));

  if (!user) {
    return <HomePage onNavigate={handleGoHome} entries={formattedEntries} />;
  }

  if (showWelcome) {
    return (
      <WelcomeAnimation />
    );
  }

  const renderTabContent = () => {
    if (showDayDetail) {
      return (
        <DayDetailView
          selectedDate={selectedDate}
          onBack={() => setShowDayDetail(false)}
        />
      );
    }

    switch (currentTab) {
      case 'calendar':
        return (
          <CalendarView
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
          />
        );
      case 'meditation':
        return <MeditationTimer onNavigate={handleGoHome} />;
      case 'abstinence':
        return <AbstinenceTracker onNavigate={handleGoHome} />;
      case 'stretching':
        return <StretchingRoutine onNavigate={handleGoHome} />;
      case 'progress':
        return <ProgressScreen entries={formattedEntries} onNavigate={handleGoHome} onUpdateEntry={() => {}} />;
      default:
        return (
          <CalendarView
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
          />
        );
    }
  };

  return (
    <>
      <MobileLayout currentTab={currentTab} onTabChange={handleTabChange}>
        {renderTabContent()}
      </MobileLayout>
      <InstallPWAModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)} 
      />
    </>
  );
};

export default Index;