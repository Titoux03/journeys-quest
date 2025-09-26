import React from 'react';

// Styles CSS pour l'optimisation mobile complète
const mobileStyles = `
  /* Optimisations générales mobiles */
  @media (max-width: 640px) {
    .bottom-nav-item {
      font-size: 7px !important;
      padding: 8px 4px !important;
    }
    
    .journey-card {
      padding: 12px !important;
    }
    
    /* Prévenir le zoom automatique sur iOS */
    input[type="text"],
    input[type="email"], 
    input[type="password"],
    textarea,
    select {
      font-size: 16px !important;
    }
    
    /* Zones de toucher plus grandes */
    button, .clickable {
      min-height: 44px;
      min-width: 44px;
    }
    
    /* Optimisations des textes */
    h1 {
      font-size: 1.75rem !important;
      line-height: 1.2 !important;
    }
    
    h2 {
      font-size: 1.5rem !important;
      line-height: 1.3 !important;
    }
    
    h3 {
      font-size: 1.25rem !important;
      line-height: 1.4 !important;
    }
    
    /* Éviter les débordements de texte */
    .journey-card p,
    .journey-card span {
      word-wrap: break-word;
      hyphens: auto;
    }
    
    /* Optimisations pour les grilles */
    .grid-cols-2 > * {
      min-height: 120px;
    }
    
    /* Score indicators responsive */
    .score-indicator {
      width: 60px !important;
      height: 60px !important;
      font-size: 1.25rem !important;
    }
    
    /* Navigation bottom responsive */
    .bottom-nav-item span {
      display: block;
      margin-top: 2px;
      font-size: 10px;
    }
  }
  
  /* Écrans très petits (iPhone SE, etc.) */
  @media (max-width: 375px) {
    .bottom-nav-item {
      font-size: 6px !important;
      padding: 6px 2px !important;
    }
    
    .journey-card {
      padding: 8px !important;
    }
    
    h1 {
      font-size: 1.5rem !important;
    }
    
    h2 {
      font-size: 1.25rem !important;
    }
    
    .grid-cols-2 > * {
      min-height: 100px;
    }
    
    .score-indicator {
      width: 50px !important;
      height: 50px !important;
      font-size: 1rem !important;
    }
    
    /* Réduire les espacements */
    .space-y-4 > * + * {
      margin-top: 0.75rem !important;
    }
    
    .space-y-6 > * + * {
      margin-top: 1rem !important;
    }
  }
  
  /* Optimisations tablettes */
  @media (min-width: 641px) and (max-width: 1024px) {
    .journey-card {
      padding: 20px !important;
    }
    
    .grid-cols-2 > * {
      min-height: 140px;
    }
  }
  
  /* Corrections pour Safari iOS */
  @supports (-webkit-touch-callout: none) {
    .journey-card {
      -webkit-tap-highlight-color: transparent;
    }
    
    textarea {
      -webkit-appearance: none;
      border-radius: 0;
    }
    
    input {
      -webkit-appearance: none;
      border-radius: 0;
    }
  }
  
  /* Performance et fluidité */
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .journey-card,
  button {
    will-change: transform;
    backface-visibility: hidden;
  }
`;

export const MobileOptimizations: React.FC = () => {
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = mobileStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
};