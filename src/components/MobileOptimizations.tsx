import React from 'react';

// Styles CSS pour l'optimisation mobile
const mobileStyles = `
  @media (max-width: 640px) {
    .bottom-nav-item {
      font-size: 7px !important;
      padding: 8px 4px !important;
    }
    
    .journey-card {
      padding: 12px !important;
    }
    
    input[type="text"],
    input[type="email"], 
    input[type="password"],
    textarea,
    select {
      font-size: 16px !important;
    }
    
    button, .clickable {
      min-height: 44px;
      min-width: 44px;
    }
  }
  
  @media (max-width: 375px) {
    .bottom-nav-item {
      font-size: 6px !important;
    }
    
    h1 {
      font-size: 1.5rem !important;
    }
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