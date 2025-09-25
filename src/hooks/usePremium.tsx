import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PremiumContextType {
  isPremium: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  checkPremiumStatus: () => Promise<void>;
  showUpgradeModal: () => void;
  hideUpgradeModal: () => void;
  upgradeModalVisible: boolean;
  purchasePremium: () => Promise<void>;
  loading: boolean;
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
  const [loading, setLoading] = useState(false);

  const checkPremiumStatus = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('check-premium');
      if (data?.isPremium) {
        setIsPremium(true);
        setProductId('prod_T7WZyN63dpDW6k');
        setSubscriptionEnd(data.purchaseDate);
      } else {
        setIsPremium(false);
        setProductId(null);
        setSubscriptionEnd(null);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePremium = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) {
        console.error('Error creating payment:', error);
        return;
      }

      if (data?.url) {
        // Ouvrir Stripe Checkout dans un nouvel onglet
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error purchasing premium:', error);
    } finally {
      setLoading(false);
    }
  };

  const showUpgradeModal = () => setUpgradeModalVisible(true);
  const hideUpgradeModal = () => setUpgradeModalVisible(false);

  useEffect(() => {
    checkPremiumStatus();
    // Check every minute for real-time updates
    const interval = setInterval(checkPremiumStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        productId,
        subscriptionEnd,
        isLoading,
        checkPremiumStatus,
        showUpgradeModal,
        hideUpgradeModal,
        upgradeModalVisible,
        purchasePremium,
        loading,
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