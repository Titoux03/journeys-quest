import React, { useState } from 'react';
import { Shield, Plus, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumLock } from '@/components/PremiumLock';
import { AddictionCard } from '@/components/AddictionCard';
import { AddictionCommitment } from '@/components/AddictionCommitment';
import { BadgesList } from '@/components/BadgesList';
import { LoginStreakDisplay } from '@/components/LoginStreakDisplay';
import { AllBadgesDisplay } from '@/components/AllBadgesDisplay';
import { ProcrastinationTasks } from '@/components/ProcrastinationTasks';
import { useAddictions } from '@/hooks/useAddictions';
import { useGongSounds } from '@/hooks/useGongSounds';
import { useTranslation } from 'react-i18next';

interface AbstinenceTrackerProps {
  onNavigate: (screen: string) => void;
}

export const AbstinenceTracker: React.FC<AbstinenceTrackerProps> = ({ onNavigate }) => {
  return (
    <PremiumLock feature="Compteur d'abstinence" className="min-h-screen">
      <AbstinenceTrackerContent onNavigate={onNavigate} />
    </PremiumLock>
  );
};

const AbstinenceTrackerContent: React.FC<AbstinenceTrackerProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { 
    addictionTypes, 
    userAddictions, 
    badges,
    userBadges, 
    loginStreak, 
    loading,
    startAddictionTracking,
    markRelapse,
    deactivateAddiction
  } = useAddictions();
  const { playPremium } = useGongSounds();
  
  const [showCommitment, setShowCommitment] = useState(false);
  const [selectedAddictionType, setSelectedAddictionType] = useState<any>(null);

  const handleStartAddiction = (addictionType: any) => {
    setSelectedAddictionType(addictionType);
    setShowCommitment(true);
  };

  const handleCommitmentConfirm = async (
    selectedEffects: string[], 
    personalGoal: string,
    cigaretteData?: {
      dailyCigarettes: number;
      cigarettePrice: number;
      packPrice: number;
      cigarettesPerPack: number;
    }
  ) => {
    if (selectedAddictionType) {
      playPremium();
      await startAddictionTracking(selectedAddictionType.id, cigaretteData);
      setShowCommitment(false);
      setSelectedAddictionType(null);
    }
  };

  const handleCommitmentCancel = () => {
    setShowCommitment(false);
    setSelectedAddictionType(null);
  };

  const handleDeactivateAddiction = async (addictionId: string) => {
    const result = await deactivateAddiction(addictionId);
    if (result.success) {
      playPremium();
    }
  };

  const handleRelapse = async (addictionId: string) => {
    playPremium();
    await markRelapse(addictionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('addictions.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="mb-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {t('common.back')}
        </button>
        <h1 className="text-3xl font-bold text-gradient-primary mb-2">
          {t('addictions.controlAndFreedom')}
        </h1>
        <p className="text-muted-foreground mb-3">
          {t('addictions.subtitle')}
        </p>
        
        {/* Streak Journeys */}
        <LoginStreakDisplay className="mb-6" />
      </div>

      {/* Addictions Grid */}
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{t('home.myActiveAddictions')}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addictionTypes.map((addictionType) => {
            const userAddiction = userAddictions.find(
              ua => ua.addiction_type_id === addictionType.id
            );
            
            return (
              <div key={addictionType.id} className="space-y-4">
                <AddictionCard
                  addictionType={addictionType}
                  userAddiction={userAddiction}
                  onStart={() => handleStartAddiction(addictionType)}
                  onRelapse={() => userAddiction && handleRelapse(userAddiction.id)}
                  onDeactivate={() => userAddiction && handleDeactivateAddiction(userAddiction.id)}
                />
                
                {/* Système de tâches pour la procrastination */}
                {addictionType.name === 'Procrastination' && userAddiction && (
                  <ProcrastinationTasks />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <Crown className="w-8 h-8 mr-2 text-primary" />
            Mes Badges
          </h2>
          <div className="text-sm text-muted-foreground">
            {userBadges.length} badge{userBadges.length !== 1 ? 's' : ''} débloqué{userBadges.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <BadgesList userBadges={userBadges} />
        
        {/* Tous les badges disponibles */}
        <AllBadgesDisplay 
          addictionTypes={addictionTypes}
          badges={badges}
          userBadges={userBadges}
        />
      </div>
      
      {/* Commitment Modal */}
      {showCommitment && selectedAddictionType && (
        <AddictionCommitment
          addictionType={selectedAddictionType}
          onConfirm={handleCommitmentConfirm}
          onCancel={handleCommitmentCancel}
        />
      )}
    </div>
  );
};