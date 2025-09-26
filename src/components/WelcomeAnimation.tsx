import React, { useState, useEffect } from 'react';

export const WelcomeAnimation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3500); // Animation de 3.5s pour plus d'immersion

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-card to-secondary animate-fade-out"
      style={{ animationDelay: '3100ms', animationDuration: '400ms' }}
    >
      <div className="text-center">
        <div 
          className="text-8xl mb-4 animate-scale-in floating-element"
          style={{ animationDuration: '800ms' }}
        >
          🌙
        </div>
        <div 
          className="text-2xl font-bold text-gradient-primary animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          Journeys
        </div>
      </div>
    </div>
  );
};