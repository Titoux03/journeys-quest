import React, { createContext, useContext } from 'react';

interface PremiumPreviewContextType {
  isPreviewMode: boolean;
}

const PremiumPreviewContext = createContext<PremiumPreviewContextType>({
  isPreviewMode: false
});

export const usePremiumPreview = () => useContext(PremiumPreviewContext);

interface PremiumPreviewProviderProps {
  children: React.ReactNode;
  isPreviewMode: boolean;
}

export const PremiumPreviewProvider: React.FC<PremiumPreviewProviderProps> = ({
  children,
  isPreviewMode
}) => {
  return (
    <PremiumPreviewContext.Provider value={{ isPreviewMode }}>
      {children}
    </PremiumPreviewContext.Provider>
  );
};