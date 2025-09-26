import React from 'react';
import { Check, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumLock } from '@/components/PremiumLock';
import { useStretching } from '@/hooks/useStretching';

interface StretchingRoutineProps {
  onNavigate: (screen: string) => void;
}

export const StretchingRoutine: React.FC<StretchingRoutineProps> = ({ onNavigate }) => {
  return (
    <PremiumLock feature="Routine Stretching Premium" className="min-h-screen">
      <StretchingRoutineContent onNavigate={onNavigate} />
    </PremiumLock>
  );
};

const StretchingRoutineContent: React.FC<StretchingRoutineProps> = ({ onNavigate }) => {
  const { 
    exercises, 
    isLoading, 
    toggleExercise, 
    resetSession, 
    completedCount, 
    totalCount, 
    isCompleted 
  } = useStretching();

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre routine...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-background">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="mb-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-2">
          Routine Stretching
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          6 exercices ciblés pour améliorer votre mobilité
        </p>
      </div>

      {/* Progress Overview */}
      <div className="journey-card-premium mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Progression du jour</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {completedCount} sur {totalCount} exercices
            </p>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gradient-primary">
            {Math.round(progressPercentage)}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary/30 rounded-full h-2 sm:h-3 mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>~7 minutes total</span>
          </div>
          {completedCount > 0 && (
            <Button
              onClick={resetSession}
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1 h-auto"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-3 sm:space-y-4">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className={`journey-card transition-all duration-300 ${
              exercise.completed
                ? 'border-success/30 bg-success/5'
                : 'hover:scale-[1.01] sm:hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              {/* Exercise Number & Check */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleExercise(exercise.id)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    exercise.completed
                      ? 'border-success bg-success text-white shadow-lg shadow-success/30'
                      : 'border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20'
                  }`}
                >
                  {exercise.completed ? (
                    <Check className="w-4 h-4 sm:w-6 sm:h-6" />
                  ) : (
                    <span className="font-bold text-xs sm:text-sm">{index + 1}</span>
                  )}
                </button>
              </div>

              {/* Exercise Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-semibold text-sm sm:text-base leading-tight ${
                    exercise.completed 
                      ? 'text-success line-through' 
                      : 'text-foreground'
                  }`}>
                    {exercise.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{exercise.duration}</span>
                  </div>
                </div>
                
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  exercise.completed 
                    ? 'text-muted-foreground/60' 
                    : 'text-muted-foreground'
                }`}>
                  {exercise.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <div className="journey-card-glow mt-4 sm:mt-6 text-center">
          <div className="text-3xl sm:text-4xl mb-3">🎉</div>
          <h3 className="text-base sm:text-lg font-semibold text-success mb-2">
            Félicitations !
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Vous avez terminé votre routine de stretching d'aujourd'hui
          </p>
        </div>
      )}
    </div>
  );
};