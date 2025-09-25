import React, { createContext, useContext, useState, useEffect } from 'react';

interface PremiumContextType {
  isPremium: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  showUpgradeModal: () => void;
  hideUpgradeModal: () => void;
  upgradeModalVisible: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

interface PremiumProviderProps {
  children: React.ReactNode;
}

export const PremiumProvider: React.FC<PremiumProviderProps> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

  // For demo purposes - in real app this would check with Supabase/Stripe
  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual Supabase function call
      const stored = localStorage.getItem('journeys-premium');
      if (stored === 'true') {
        setIsPremium(true);
        setProductId('prod_T7VWYhmpYJxGnB');
        setSubscriptionEnd(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      } else {
        setIsPremium(false);
        setProductId(null);
        setSubscriptionEnd(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showUpgradeModal = () => setUpgradeModalVisible(true);
  const hideUpgradeModal = () => setUpgradeModalVisible(false);

  useEffect(() => {
    checkSubscription();
    // Check every minute for real-time updates
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        productId,
        subscriptionEnd,
        isLoading,
        checkSubscription,
        showUpgradeModal,
        hideUpgradeModal,
        upgradeModalVisible,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};