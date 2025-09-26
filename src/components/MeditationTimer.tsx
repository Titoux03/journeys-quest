import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Brain, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumLock } from '@/components/PremiumLock';
import { useGongSounds } from '@/hooks/useGongSounds';
import { useToast } from '@/hooks/use-toast';

interface MeditationTimerProps {
  onNavigate: (screen: string) => void;
}

type TimerMode = 'meditation' | 'deepwork';
type TimerState = 'idle' | 'running' | 'paused' | 'completed';

const presetDurations = [
  { label: '5 min', minutes: 5 },
  { label: '15 min', minutes: 15 },
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 }
];

export const MeditationTimer: React.FC<MeditationTimerProps> = ({ onNavigate }) => {
  return (
    <PremiumLock feature="Méditation & Deep Work" className="min-h-screen">
      <MeditationTimerContent onNavigate={onNavigate} />
    </PremiumLock>
  );
};

const MeditationTimerContent: React.FC<MeditationTimerProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<TimerMode>('meditation');
  const [duration, setDuration] = useState(15); // minutes
  const [timeLeft, setTimeLeft] = useState(15 * 60); // seconds
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const { playStart, playEnd } = useGongSounds();

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerState('completed');
            // Jouer le triple gong de fin
            playEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (timerState === 'idle') {
      setTimeLeft(duration * 60);
    }
    
    // Jouer le gong de démarrage
    playStart();
    setTimerState('running');
  };

  const handlePause = () => {
    setTimerState('paused');
  };

  const handleReset = () => {
    setTimerState('idle');
    setTimeLeft(duration * 60);
  };

  const handleDurationChange = (minutes: number) => {
    if (timerState === 'idle') {
      setDuration(minutes);
      setTimeLeft(minutes * 60);
    }
  };

  const getProgress = () => {
    const totalSeconds = duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const getCompletionMessage = () => {
    if (mode === 'meditation') {
      return {
        title: "Session terminée 🧘‍♀️",
        message: "Votre esprit est plus calme et centré"
      };
    } else {
      return {
        title: "Objectif atteint 🎯",
        message: "Votre focus profond porte ses fruits"
      };
    }
  };

  return (
    <div className="min-h-screen p-6 bg-background pb-32">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="mb-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-gradient-primary mb-2">
          Focus & Sérénité
        </h1>
        <p className="text-muted-foreground">
          Cultivez votre concentration et votre paix intérieure
        </p>
      </div>

      {/* Mode Selection */}
      <div className="journey-card mb-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMode('meditation')}
            className={`p-4 rounded-xl transition-all duration-300 ${
              mode === 'meditation'
                ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <Heart className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Méditation</div>
          </button>
          <button
            onClick={() => setMode('deepwork')}
            className={`p-4 rounded-xl transition-all duration-300 ${
              mode === 'deepwork'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <Brain className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Deep Work</div>
          </button>
        </div>
      </div>

      {/* Main Timer */}
      <div className={`journey-card-premium mb-6 text-center ${
        timerState === 'completed' ? 'journey-card-glow' : ''
      }`}>
        {timerState === 'completed' ? (
          <div>
            <div className="text-4xl mb-4">
              {mode === 'meditation' ? '🧘‍♀️' : '🎯'}
            </div>
            <h3 className="text-xl font-semibold text-success mb-2">
              {getCompletionMessage().title}
            </h3>
            <p className="text-muted-foreground mb-6">
              {getCompletionMessage().message}
            </p>
            <Button onClick={handleReset} className="journey-button-primary">
              Nouvelle session
            </Button>
          </div>
        ) : (
          <div>
            {/* Timer Circle */}
            <div className="relative mb-8">
              <div className="w-64 h-64 mx-auto relative">
                <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    fill="transparent"
                    className="opacity-20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={mode === 'meditation' ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
                    strokeWidth="2"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    className="transition-all duration-1000 ease-linear"
                    style={{
                      filter: timerState === 'running' 
                        ? `drop-shadow(0 0 10px ${mode === 'meditation' ? 'hsl(var(--accent))' : 'hsl(var(--primary))'})` 
                        : 'none'
                    }}
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-4xl font-mono font-bold mb-2 ${
                    mode === 'meditation' ? 'text-accent' : 'text-primary'
                  }`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">
                    {mode === 'meditation' ? 'Méditation' : 'Deep Work'}
                  </div>
                </div>
              </div>

              {/* Pulsing effect during meditation */}
              {timerState === 'running' && mode === 'meditation' && (
                <div className="absolute inset-0 rounded-full animate-pulse opacity-30"
                     style={{ 
                       background: `radial-gradient(circle, hsl(var(--accent) / 0.3) 0%, transparent 70%)`,
                       animation: 'pulse 4s ease-in-out infinite'
                     }} 
                />
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4 mb-6">
              {timerState === 'idle' || timerState === 'paused' ? (
                <Button onClick={handleStart} className="journey-button-primary px-8">
                  <Play className="w-5 h-5 mr-2" />
                  {timerState === 'paused' ? 'Reprendre' : 'Commencer'}
                </Button>
              ) : (
                <Button onClick={handlePause} variant="outline" className="px-8">
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              
              {timerState !== 'idle' && (
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Duration Selection (only when idle) */}
      {timerState === 'idle' && (
        <div className="journey-card">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Durée</h3>
          <div className="grid grid-cols-2 gap-3">
            {presetDurations.map((preset) => (
              <button
                key={preset.minutes}
                onClick={() => handleDurationChange(preset.minutes)}
                className={`p-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                  duration === preset.minutes
                    ? mode === 'meditation'
                      ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                      : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};