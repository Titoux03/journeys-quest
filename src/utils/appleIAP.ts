import { isNativeIOS } from './platformDetection';
import { supabase } from '@/integrations/supabase/client';

// RevenueCat configuration
export const REVENUECAT_API_KEY = 'test_gqNGgmHblseCHUYwfjyJBzgwinn';
export const ENTITLEMENT_ID = 'Titoux corp Pro';

// Product identifiers (must match App Store Connect)
export const PRODUCTS = {
  monthly: 'monthly',
  yearly: 'yearly',
} as const;

/**
 * RevenueCat Purchases interface (injected by native bridge)
 */
interface RevenueCatBridge {
  configure: (apiKey: string, appUserId?: string) => Promise<void>;
  getCustomerInfo: () => Promise<any>;
  getOfferings: () => Promise<any>;
  purchase: (productId: string) => Promise<any>;
  restorePurchases: () => Promise<any>;
  presentPaywall: () => Promise<any>;
  presentCustomerCenter: () => Promise<void>;
}

const getRevenueCat = (): RevenueCatBridge | null => {
  return (window as any).RevenueCatBridge ?? null;
};

/**
 * Initialize RevenueCat SDK on iOS
 * Called on app startup when running on iOS native
 */
export const initializeIAPStore = async (): Promise<void> => {
  if (!isNativeIOS()) return;

  const rc = getRevenueCat();
  if (!rc) {
    console.warn('[RevenueCat] Native bridge not available');
    return;
  }

  try {
    // Get the Supabase user ID to identify the customer
    const { data: { session } } = await supabase.auth.getSession();
    const appUserId = session?.user?.id;

    await rc.configure(REVENUECAT_API_KEY, appUserId);
    console.log('[RevenueCat] Configured successfully', { appUserId });
  } catch (error) {
    console.error('[RevenueCat] Configuration error:', error);
  }
};

/**
 * Purchase a subscription via RevenueCat
 */
export const purchaseApplePremium = async (plan: string = 'monthly'): Promise<boolean> => {
  const rc = getRevenueCat();
  if (!rc) {
    console.error('[RevenueCat] Bridge not available');
    return false;
  }

  try {
    // Try presenting RevenueCat paywall first
    const result = await rc.presentPaywall();
    
    if (result?.customerInfo) {
      // Check if the purchase granted the entitlement
      const entitlements = result.customerInfo.entitlements?.active || {};
      if (entitlements[ENTITLEMENT_ID]) {
        console.log('[RevenueCat] Purchase successful via paywall');
        await syncPurchaseToBackend(result.customerInfo);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[RevenueCat] Purchase error:', error);
    
    // Fallback: try direct product purchase
    try {
      const productId = plan === 'yearly' ? PRODUCTS.yearly : PRODUCTS.monthly;
      const purchaseResult = await rc.purchase(productId);
      
      if (purchaseResult?.customerInfo) {
        const entitlements = purchaseResult.customerInfo.entitlements?.active || {};
        if (entitlements[ENTITLEMENT_ID]) {
          console.log('[RevenueCat] Direct purchase successful');
          await syncPurchaseToBackend(purchaseResult.customerInfo);
          return true;
        }
      }
      return false;
    } catch (fallbackError) {
      console.error('[RevenueCat] Fallback purchase error:', fallbackError);
      return false;
    }
  }
};

/**
 * Sync RevenueCat purchase to Supabase backend
 */
const syncPurchaseToBackend = async (customerInfo: any): Promise<void> => {
  try {
    const entitlement = customerInfo.entitlements?.active?.[ENTITLEMENT_ID];
    if (!entitlement) return;

    const { data, error } = await supabase.functions.invoke('verify-apple-purchase', {
      body: {
        rc_customer_id: customerInfo.originalAppUserId || customerInfo.id,
        product_id: entitlement.productIdentifier,
        transaction_id: entitlement.originalPurchaseDate,
      },
    });

    if (error) {
      console.error('[RevenueCat] Backend sync error:', error);
    } else {
      console.log('[RevenueCat] Backend sync success:', data);
    }
  } catch (err) {
    console.error('[RevenueCat] Backend sync failed:', err);
  }
};

/**
 * Check if user has active entitlement via RevenueCat
 */
export const checkRevenueCatEntitlement = async (): Promise<boolean> => {
  const rc = getRevenueCat();
  if (!rc) return false;

  try {
    const customerInfo = await rc.getCustomerInfo();
    const entitlements = customerInfo?.entitlements?.active || {};
    return !!entitlements[ENTITLEMENT_ID];
  } catch (error) {
    console.error('[RevenueCat] Entitlement check error:', error);
    return false;
  }
};

/**
 * Restore previous purchases (required by Apple guidelines)
 */
export const restoreApplePurchases = async (): Promise<boolean> => {
  const rc = getRevenueCat();
  if (!rc) return false;

  try {
    const result = await rc.restorePurchases();
    const entitlements = result?.entitlements?.active || {};
    
    if (entitlements[ENTITLEMENT_ID]) {
      console.log('[RevenueCat] Restore successful, entitlement active');
      await syncPurchaseToBackend(result);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[RevenueCat] Restore error:', error);
    return false;
  }
};

/**
 * Open RevenueCat Customer Center (manage subscription)
 */
export const openCustomerCenter = async (): Promise<void> => {
  const rc = getRevenueCat();
  if (!rc) {
    console.warn('[RevenueCat] Bridge not available for Customer Center');
    return;
  }

  try {
    await rc.presentCustomerCenter();
  } catch (error) {
    console.error('[RevenueCat] Customer Center error:', error);
  }
};

/**
 * Get available offerings/products
 */
export const getOfferings = async (): Promise<any> => {
  const rc = getRevenueCat();
  if (!rc) return null;

  try {
    return await rc.getOfferings();
  } catch (error) {
    console.error('[RevenueCat] Offerings error:', error);
    return null;
  }
};
