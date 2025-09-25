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
      // Si pas d'utilisateur connecté, pas de premium
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsPremium(false);
        setProductId(null);
        setSubscriptionEnd(null);
        setIsLoading(false);
        return;
      }

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
      setIsPremium(false);
      setProductId(null);
      setSubscriptionEnd(null);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePremium = async () => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('User must be logged in to purchase premium');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) {
        console.error('Error creating payment:', error);
        return;
      }

      if (data?.url) {
        // Redirection vers Stripe Checkout (compatible mobile)
        window.location.href = data.url;
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
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkPremiumStatus();
      }
    });

    // Check every minute for real-time updates
    const interval = setInterval(checkPremiumStatus, 60000);
    
    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
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