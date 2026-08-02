import React from 'react';
import { motion } from 'framer-motion';
import { DailyQuote } from '@/components/DailyQuote';
import { SoulHero } from '@/components/SoulHero';
import { GlobalAvatar } from '@/components/avatar/GlobalAvatar';
import { useNavigate } from 'react-router-dom';
import { getNextUnlock, getEvolutionStage, RARITY_COLORS } from '@/components/avatar/AvatarEngine';
import { PixelIcon } from '@/components/avatar';
import { Progress } from '@/components/ui/progress';
import { useLevel } from '@/hooks/useLevel';
import { AddictionCard } from '@/components/AddictionCard';
import { BadgesModal } from '@/components/BadgesModal';
import { Sparkles, TrendingUp, Target, Brain, Shield, Dumbbell, Crown, Star, Flame, Timer, BarChart3, Leaf, PenTool, CheckSquare } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';
import { useAddictions } from '@/hooks/useAddictions';
import { PremiumTeaser, PremiumBadge, PremiumLockOverlay } from '@/components/PremiumTeaser';
import { PremiumTodoTeaser } from '@/components/PremiumTodoTeaser';
import { JourneyCard } from '@/components/JourneyCard';
import { PremiumSuccessIndicator } from '@/components/PremiumSuccessIndicator';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';


interface JournalEntry {
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  reflection?: string;
  mood: 'low' | 'medium' | 'high';
}

interface HomePageProps {
  onNavigate: (screen: string) => void;
  entries: JournalEntry[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, entries }) => {
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const { isPremium, showUpgradeModal } = usePremium();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { levelData: homeLevelData } = useLevel(user?.id);
  const { 
    addictionTypes, 
    badges,
    userAddictions, 
    userBadges, 
    loginStreak,
    startAddictionTracking,
    markRelapse,
    deactivateAddiction
  } = useAddictions();

  const handleDeactivateAddiction = async (addictionId: string) => {
    await deactivateAddiction(addictionId);
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayEntry = entries.find(entry => entry.date === todayStr);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return { message: t('greeting.morning'), emoji: '☀️' };
    } else {
      return { message: t('greeting.evening'), emoji: '🌙' };
    }
  };

  const greeting = getGreeting();
  const homeLevel = homeLevelData?.level || 1;
  const nextItem = getNextUnlock(homeLevel);
  const evo = getEvolutionStage(homeLevel);

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-24 flex flex-col">
      {/* Greeting compact */}
      <div className="mb-6 text-center animate-slide-up">
        <h1 className="text-xl sm:text-2xl font-bold text-gradient-primary">
          {greeting.message} {greeting.emoji}
        </h1>
      </div>

      {/* SOUL HERO — l'âme qui évolue, au centre de l'accueil (invité inclus) */}
      <SoulHero
        level={homeLevel}
        progress={homeLevelData?.progressPercentage ?? 0}
        xp={homeLevelData?.xp}
        xpForNext={homeLevelData?.xpForNextLevel}
        evolution={evo}
        title={homeLevelData?.title || undefined}
        isGuest={!user}
        onOpenAvatar={() => onNavigate('avatar')}
        onSignup={() => navigate('/auth')}
      />

      {/* Rappel premium discret (connecté non-premium) */}
      {user && !isPremium && (
        <button
          onClick={showUpgradeModal}
          className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-warning/20 bg-gradient-to-r from-warning/10 to-warning/5 p-3 text-left"
        >
          <Crown className="h-5 w-5 shrink-0 text-warning" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-warning">{t('home.freeAccount')}</p>
            <p className="text-xs text-muted-foreground">{t('home.unlockFeatures')}</p>
          </div>
        </button>
      )}

      {/* Badge premium (abonnés) */}
      {isPremium && (
        <div className="journey-card-glow mb-6">
          <div className="flex items-center justify-center space-x-3">
            <Crown className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-gradient-primary">Journeys Premium</span>
            <Crown className="w-6 h-6 text-primary" />
          </div>
        </div>
      )}


      {/* Recent Badges */}
      {isPremium && user && userBadges.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center">
              <Star className="w-6 h-6 mr-2 text-accent" />
              {t('home.lastBadges')}
            </h2>
            <button
              onClick={() => setShowBadgesModal(true)}
              className="text-accent hover:text-accent-glow transition-colors text-sm font-medium"
            >
              {t('home.viewAllBadges')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userBadges.slice(0, 4).map((userBadge) => (
              <button
                key={userBadge.id}
                onClick={() => setShowBadgesModal(true)}
                className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-accent/10 to-accent-glow/5 border border-accent/20 hover:scale-[1.02] transition-transform cursor-pointer text-left"
              >
                <div className="text-2xl">{userBadge.badge.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm">{userBadge.badge.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {userBadge.badge.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badges Modal */}
      <BadgesModal
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        addictionTypes={addictionTypes}
        badges={badges}
        userBadges={userBadges}
        currentStreaks={
          userAddictions.reduce((acc, ua) => {
            const daysSinceStart = Math.floor(
              (new Date().getTime() - new Date(ua.start_date).getTime()) / (1000 * 60 * 60 * 24)
            );
            acc[ua.addiction_type_id] = daysSinceStart;
            return acc;
          }, {} as Record<string, number>)
        }
        loginStreak={loginStreak?.current_streak || 0}
      />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Journal - Always Free */}
        <button
          onClick={() => onNavigate('journal')}
          className="journey-card hover:journey-card-glow transition-all duration-300 p-4 sm:p-6 text-left group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Target className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{t('home.dailyJournal')}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
            {t('home.dailyJournalDesc')}
          </p>
        </button>

        <button
          onClick={() => onNavigate('notes')}
          className="journey-card hover:journey-card-glow transition-all duration-300 p-4 sm:p-6 text-left group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              <PenTool className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{t('home.dailyNotes')}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
            {t('home.dailyNotesDesc')}
          </p>
        </button>

        {/* Tâches Premium Feature */}
        <button
          onClick={() => isPremium ? onNavigate('todos') : showUpgradeModal()}
          className={`journey-card transition-all duration-300 p-4 sm:p-6 text-left group relative ${
            isPremium ? 'hover:journey-card-glow' : 'opacity-80'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center pulse-glow">
              <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl transition-colors ${
              isPremium 
                ? 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-purple-50'
                : 'bg-muted/20 text-muted-foreground'
            }`}>
              <CheckSquare className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <h3 className={`font-semibold text-base sm:text-lg mb-1 sm:mb-2 ${!isPremium && 'text-muted-foreground'}`}>
            {t('home.morningTasks')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
            {t('home.morningTasksDesc')}
          </p>
        </button>

        {/* Meditation - Now Free */}
        <button
          onClick={() => onNavigate('meditation')}
          className="journey-card hover:journey-card-glow transition-all duration-300 p-4 sm:p-6 text-left group"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-xl bg-indigo-500/10 text-indigo-500 transition-colors group-hover:bg-indigo-500 group-hover:text-indigo-50">
              <Brain className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
            {t('home.focusDeepWork')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
            {t('home.focusDeepWorkDesc')}
          </p>
        </button>

        {/* Premium Features */}
        <button
          onClick={() => isPremium ? onNavigate('abstinence') : showUpgradeModal()}
          className={`journey-card transition-all duration-300 p-4 sm:p-6 text-left group relative ${
            isPremium ? 'hover:journey-card-glow' : 'hover:border-primary/40 opacity-90'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center pulse-glow">
              <Crown className="w-2 h-2 sm:w-3 sm:h-3 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className={`p-2 sm:p-3 rounded-xl transition-colors ${
              isPremium 
                ? 'bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground'
                : 'bg-destructive/10 text-destructive group-hover:bg-destructive/20'
            }`}>
              <Shield className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <h3 className={`font-semibold text-base sm:text-lg mb-1 sm:mb-2 ${!isPremium ? 'text-foreground' : 'text-foreground'}`}>
            {t('home.addictionTracking')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
            {t('home.addictionTrackingDesc')}
          </p>
        </button>
      </div>

      {/* Secondary Actions - Full Width */}
      <div className="space-y-4 mb-8">
        <button
          onClick={() => isPremium ? onNavigate('stretching') : showUpgradeModal()}
          className={`journey-card w-full transition-all duration-300 p-4 sm:p-6 text-left group relative ${
            isPremium ? 'hover:journey-card-glow' : 'opacity-80'
          }`}
        >
          {!isPremium && (
            <div className="absolute top-4 right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
          )}
          <div className="flex items-center space-x-4">
            <div className={`p-3 sm:p-4 rounded-xl transition-colors ${
              isPremium 
                ? 'bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground'
                : 'bg-muted/20 text-muted-foreground'
            }`}>
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg sm:text-xl mb-1 sm:mb-2 ${!isPremium && 'text-muted-foreground'}`}>
                {t('home.stretching')}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('home.stretchingDesc')}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Progress Overview */}
      <button
        onClick={() => isPremium ? onNavigate('progress') : showUpgradeModal()}
        className={`journey-card w-full text-left mb-6 transition-all duration-300 group relative ${
          isPremium ? 'hover:journey-card-glow' : 'opacity-80'
        }`}
      >
        {!isPremium && (
          <div className="absolute top-4 right-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center">
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
          </div>
        )}
        <div className="flex items-center space-x-4 p-4 sm:p-6">
          <div className={`p-3 sm:p-4 rounded-xl transition-colors ${
            isPremium 
              ? 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground'
              : 'bg-muted/20 text-muted-foreground'
          }`}>
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-lg sm:text-xl mb-1 sm:mb-2 ${!isPremium && 'text-muted-foreground'}`}>
              {t('home.weeklyProgress')}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('home.weeklyProgressDesc')}
            </p>
          </div>
        </div>
      </button>

      {/* Addiction Cards */}
      {isPremium && user && userAddictions.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <Shield className="w-6 h-6 mr-2 text-destructive" />
            {t('home.myAddictions')}
          </h2>
          {userAddictions.map((addiction) => {
            const addictionType = addictionTypes.find(at => at.id === addiction.addiction_type_id);
            if (!addictionType) return null;
            return (
              <AddictionCard
                key={addiction.id}
                userAddiction={addiction}
                addictionType={addictionType}
                onStart={() => {}}
                onRelapse={() => markRelapse(addiction.id)}
                onDeactivate={() => handleDeactivateAddiction(addiction.id)}
              />
            );
          })}
        </div>
      )}

      {/* Citation du jour — reléguée en secondaire, tout en bas */}
      <div className="mb-8 opacity-90">
        <DailyQuote />
      </div>

      {/* Premium Teasers */}
      {!isPremium && <PremiumTodoTeaser />}
      {isPremium && <PremiumSuccessIndicator />}
    </div>
  );
};
