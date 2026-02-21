import { isNativeIOS } from './platformDetection';
import { supabase } from '@/integrations/supabase/client';

// Apple In-App Purchase Product ID
export const APPLE_PREMIUM_PRODUCT_ID = 'com.journeys.premium';

/**
 * Initialize the In-App Purchase store (cordova-plugin-purchase)
 * Call this on app startup when running on iOS
 */
export const initializeIAPStore = async (): Promise<void> => {
  if (!isNativeIOS()) return;
  
  // Wait for the store plugin to be available
  const store = (window as any).CdvPurchase?.store;
  if (!store) {
    console.warn('[IAP] CdvPurchase store not available');
    return;
  }

  // Register the premium product
  store.register([{
    id: APPLE_PREMIUM_PRODUCT_ID,
    type: store.NON_CONSUMABLE,
    platform: store.APPLE_APPSTORE,
  }]);

  // Handle approved purchases
  store.when()
    .approved((transaction: any) => {
      console.log('[IAP] Purchase approved:', transaction.id);
      // Verify the receipt server-side
      verifyApplePurchase(transaction.transactionReceipt || transaction.appStoreReceipt)
        .then((verified) => {
          if (verified) {
            transaction.finish();
            console.log('[IAP] Purchase verified and finished');
          }
        })
        .catch((err) => {
          console.error('[IAP] Verification failed:', err);
        });
    })
    .verified((receipt: any) => {
      console.log('[IAP] Receipt verified:', receipt);
      receipt.finish();
    });

  // Initialize the store
  await store.initialize([store.APPLE_APPSTORE]);
  await store.update();
  
  console.log('[IAP] Store initialized');
};

/**
 * Trigger the Apple In-App Purchase flow
 */
export const purchaseApplePremium = async (): Promise<boolean> => {
  const store = (window as any).CdvPurchase?.store;
  if (!store) {
    console.error('[IAP] Store not available');
    return false;
  }

  try {
    const offer = store.get(APPLE_PREMIUM_PRODUCT_ID)?.getOffer();
    if (!offer) {
      console.error('[IAP] Product not found');
      return false;
    }

    await store.order(offer);
    return true;
  } catch (error) {
    console.error('[IAP] Purchase error:', error);
    return false;
  }
};

/**
 * Verify Apple receipt with our backend
 */
export const verifyApplePurchase = async (receiptData: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-apple-purchase', {
      body: { receipt_data: receiptData },
    });

    if (error) {
      console.error('[IAP] Server verification error:', error);
      return false;
    }

    return data?.verified === true;
  } catch (err) {
    console.error('[IAP] Verification request failed:', err);
    return false;
  }
};

/**
 * Restore previous Apple purchases (required by Apple guidelines)
 */
export const restoreApplePurchases = async (): Promise<boolean> => {
  const store = (window as any).CdvPurchase?.store;
  if (!store) return false;

  try {
    await store.restorePurchases();
    return true;
  } catch (error) {
    console.error('[IAP] Restore error:', error);
    return false;
  }
};
