import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isNativeIOS } from '@/utils/platformDetection';
import { purchaseApplePremium, initializeIAPStore, restoreApplePurchases } from '@/utils/appleIAP';

interface PremiumContextType {
  isPremium: boolean;
  plan: string | null; // 'monthly' | 'annual' | 'lifetime' | null
  subscriptionEnd: string | null;
  subscriptionStatus: string | null; // 'active' | 'past_due' | null
  isLegacy: boolean;
  isLoading: boolean;
  checkPremiumStatus: () => Promise<void>;
  showUpgradeModal: () => void;
  hideUpgradeModal: () => void;
  upgradeModalVisible: boolean;
  purchasePremium: (plan?: string, affiliateCode?: string) => Promise<void>;
  manageSubscription: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  loading: boolean;
  isIOSNative: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLegacy, setIsLegacy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkPremiumStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsPremium(false);
        setPlan(null);
        setSubscriptionEnd(null);
        setSubscriptionStatus(null);
        setIsLegacy(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setIsPremium(false);
      } else if (data?.subscribed) {
        setIsPremium(true);
        setPlan(data.plan || null);
        setSubscriptionEnd(data.subscription_end || null);
        setSubscriptionStatus(data.status || null);
        setIsLegacy(!!data.legacy);
      } else {
        setIsPremium(false);
        setPlan(null);
        setSubscriptionEnd(null);
        setSubscriptionStatus(null);
        setIsLegacy(false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchasePremium = async (selectedPlan: string = 'monthly', affiliateCode?: string) => {
    try {
      setLoading(true);

      if (isNativeIOS()) {
        const success = await purchaseApplePremium();
        if (success) {
          toast.success('Achat en cours de traitement...');
          setTimeout(() => checkPremiumStatus(), 3000);
        } else {
          toast.error('Achat annulé ou échoué.');
        }
        return;
      }

      const body: Record<string, string> = { plan: selectedPlan };
      if (affiliateCode) body.affiliate_code = affiliateCode;

      const { data, error } = await supabase.functions.invoke('create-checkout', { body });

      if (error) {
        console.error('Error creating checkout:', error);
        toast.error('Impossible de démarrer le paiement. Réessayez.');
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.error('Lien de paiement indisponible.');
      }
    } catch (error) {
      console.error('Error purchasing premium:', error);
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error || !data?.url) {
        toast.error('Impossible d\'ouvrir le portail de gestion.');
        return;
      }
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Erreur lors de l\'ouverture du portail.');
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (!isNativeIOS()) {
      toast.info('La restauration est disponible uniquement sur iOS.');
      return;
    }
    try {
      setLoading(true);
      const success = await restoreApplePurchases();
      if (success) {
        toast.success('Restauration en cours...');
        setTimeout(() => checkPremiumStatus(), 3000);
      } else {
        toast.error('Aucun achat à restaurer.');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
      toast.error('Erreur lors de la restauration.');
    } finally {
      setLoading(false);
    }
  };

  const showUpgradeModal = () => setUpgradeModalVisible(true);
  const hideUpgradeModal = () => setUpgradeModalVisible(false);

  useEffect(() => {
    checkPremiumStatus();

    if (isNativeIOS()) {
      initializeIAPStore().catch(console.error);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkPremiumStatus();
      }
    });

    const interval = setInterval(checkPremiumStatus, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkPremiumStatus]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        plan,
        subscriptionEnd,
        subscriptionStatus,
        isLegacy,
        isLoading,
        checkPremiumStatus,
        showUpgradeModal,
        hideUpgradeModal,
        upgradeModalVisible,
        purchasePremium,
        manageSubscription,
        restorePurchases,
        loading,
        isIOSNative: isNativeIOS(),
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
