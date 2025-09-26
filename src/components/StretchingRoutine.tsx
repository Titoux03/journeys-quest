import React, { useState } from 'react';
import { Check, Clock, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumLock } from '@/components/PremiumLock';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: string;
  completed: boolean;
}

interface StretchingRoutineProps {
  onNavigate: (screen: string) => void;
}

export const StretchingRoutine: React.FC<StretchingRoutineProps> = ({ onNavigate }) => {
  return (
    <PremiumLock feature="Routine Stretching" className="min-h-screen">
      <StretchingRoutineContent onNavigate={onNavigate} />
    </PremiumLock>
  );
};

const StretchingRoutineContent: React.FC<StretchingRoutineProps> = ({ onNavigate }) => {
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: 'Étirement des trapèzes supérieurs',
      description: 'Inclinez la tête sur le côté en plaçant la main opposée derrière le dos. Réduit les tensions cervicales et améliore la mobilité du cou.',
      duration: '45 sec',
      completed: false
    },
    {
      id: '2',
      name: 'Ouverture thoracique',
      description: 'Bras tendus dans le dos, entrelacez les doigts et poussez vers le haut. Corrige la posture, ouvre la cage thoracique et libère les tensions des épaules.',
      duration: '1 min',
      completed: false
    },
    {
      id: '3',
      name: 'Flexion avant debout',
      description: 'Pieds écartés largeur d\'épaules, penchez-vous en avant en laissant pendre les bras. Étire toute la chaîne postérieure et décompresse la colonne vertébrale.',
      duration: '1 min',
      completed: false
    },
    {
      id: '4',
      name: 'Rotation du rachis',
      description: 'Assis jambes croisées, placez une main au sol derrière vous et tournez le buste. Améliore la mobilité vertébrale et masse les organes internes.',
      duration: '45 sec',
      completed: false
    },
    {
      id: '5',
      name: 'Étirement des ischio-jambiers',
      description: 'Debout, posez un talon sur un support bas et penchez-vous vers l\'avant. Prévient les blessures et améliore la flexibilité des jambes.',
      duration: '45 sec',
      completed: false
    },
    {
      id: '6',
      name: 'Étirement des fléchisseurs de hanche',
      description: 'En fente, poussez le bassin vers l\'avant. Compense la position assise prolongée et améliore la posture globale.',
      duration: '45 sec',
      completed: false
    }
  ]);

  const toggleExercise = (id: string) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === id
          ? { ...exercise, completed: !exercise.completed }
          : exercise
      )
    );
  };

  const resetAll = () => {
    setExercises(prev =>
      prev.map(exercise => ({ ...exercise, completed: false }))
    );
  };

  const completedCount = exercises.filter(ex => ex.completed).length;
  const totalCount = exercises.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="min-h-screen p-6 bg-background">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="mb-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-gradient-primary mb-2">
          Routine Stretching
        </h1>
        <p className="text-muted-foreground">
          6 exercices ciblés pour améliorer votre mobilité
        </p>
      </div>

      {/* Progress Overview */}
      <div className="journey-card-premium mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Progression du jour</h3>
            <p className="text-sm text-muted-foreground">
              {completedCount} sur {totalCount} exercices
            </p>
          </div>
          <div className="text-2xl font-bold text-gradient-primary">
            {Math.round(progressPercentage)}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary/30 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>~7 minutes total</span>
          </div>
          {completedCount > 0 && (
            <Button
              onClick={resetAll}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className={`journey-card transition-all duration-300 ${
              exercise.completed
                ? 'border-success/30 bg-success/5'
                : 'hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Exercise Number & Check */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleExercise(exercise.id)}
                  className={`w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    exercise.completed
                      ? 'border-success bg-success text-white shadow-lg shadow-success/30'
                      : 'border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20'
                  }`}
                >
                  {exercise.completed ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="font-bold text-sm">{index + 1}</span>
                  )}
                </button>
              </div>

              {/* Exercise Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-semibold ${
                    exercise.completed 
                      ? 'text-success line-through' 
                      : 'text-foreground'
                  }`}>
                    {exercise.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>{exercise.duration}</span>
                  </div>
                </div>
                
                <p className={`text-sm ${
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
      {completedCount === totalCount && (
        <div className="journey-card-glow mt-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-semibold text-success mb-2">
            Félicitations !
          </h3>
          <p className="text-sm text-muted-foreground">
            Vous avez terminé votre routine de stretching
          </p>
        </div>
      )}
    </div>
  );
};