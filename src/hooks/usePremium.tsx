import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isNativeIOS } from '@/utils/platformDetection';
import { purchaseApplePremium, initializeIAPStore, restoreApplePurchases } from '@/utils/appleIAP';

interface PremiumContextType {
  isPremium: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  checkPremiumStatus: () => Promise<void>;
  showUpgradeModal: () => void;
  hideUpgradeModal: () => void;
  upgradeModalVisible: boolean;
  purchasePremium: (affiliateCode?: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  loading: boolean;
  isIOSNative: boolean;
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

  const purchasePremium = async (affiliateCode?: string) => {
    try {
      setLoading(true);
      
      // Sur iOS natif → Apple In-App Purchase
      if (isNativeIOS()) {
        const success = await purchaseApplePremium();
        if (success) {
          toast.success('Achat en cours de traitement...');
          // Le callback du store gère la vérification
          setTimeout(() => checkPremiumStatus(), 3000);
        } else {
          toast.error('Achat annulé ou échoué.');
        }
        return;
      }

      // Sur Web → Stripe Checkout
      const requestBody = affiliateCode ? { affiliate_code: affiliateCode } : {};

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: requestBody
      });
      
      if (error) {
        console.error('Error creating payment:', error);
        toast.error('Impossible de démarrer le paiement. Réessayez dans un instant.');
        return;
      }

      if (data?.url) {
        try {
          window.location.assign(data.url);
        } catch {
          window.location.href = data.url;
        }
      } else {
        toast.error('Lien de paiement indisponible. Merci de réessayer.');
      }
    } catch (error) {
      console.error('Error purchasing premium:', error);
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
    
    // Initialize Apple IAP store if on iOS
    if (isNativeIOS()) {
      initializeIAPStore().catch(console.error);
    }
    
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