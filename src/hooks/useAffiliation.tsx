import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook pour gérer le système d'affiliation
 * Capture et stocke les codes de référencement depuis l'URL
 */
export const useAffiliation = () => {
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  useEffect(() => {
    // Capturer le paramètre 'ref' de l'URL au chargement
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    
    if (refParam) {
      console.log('[AFFILIATION] Code de référencement détecté:', refParam);
      
      // Stocker le code d'affiliation dans localStorage
      localStorage.setItem('affiliate_code', refParam);
      setAffiliateCode(refParam);
      
      // Nettoyer l'URL pour enlever le paramètre ref (optionnel)
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Enregistrer la référence dans la base de données si l'utilisateur est connecté
      registerAffiliateReferral(refParam);
    } else {
      // Vérifier si on a déjà un code stocké
      const storedCode = localStorage.getItem('affiliate_code');
      if (storedCode) {
        setAffiliateCode(storedCode);
      }
    }
  }, []);

  /**
   * Enregistre une référence d'affiliation dans la base de données
   */
  const registerAffiliateReferral = async (code: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('[AFFILIATION] Enregistrement de la référence pour l\'utilisateur:', session.user.id);
        
        // Vérifier si une référence existe déjà pour cet utilisateur
        const { data: existingReferral } = await supabase
          .from('affiliate_referrals')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!existingReferral) {
          // Créer une nouvelle référence
          const { error } = await supabase
            .from('affiliate_referrals')
            .insert({
              user_id: session.user.id,
              affiliate_code: code,
              status: 'pending'
            });

          if (error) {
            console.error('[AFFILIATION] Erreur lors de l\'enregistrement:', error);
          } else {
            console.log('[AFFILIATION] Référence enregistrée avec succès');
          }
        } else {
          console.log('[AFFILIATION] Référence déjà existante pour cet utilisateur');
        }
      } else {
        console.log('[AFFILIATION] Utilisateur non connecté, référence stockée en local');
      }
    } catch (error) {
      console.error('[AFFILIATION] Erreur:', error);
    }
  };

  /**
   * Récupère le code d'affiliation stocké (pour le paiement)
   */
  const getAffiliateCode = (): string | null => {
    return affiliateCode || localStorage.getItem('affiliate_code');
  };

  /**
   * Nettoie le code d'affiliation après conversion
   */
  const clearAffiliateCode = () => {
    localStorage.removeItem('affiliate_code');
    setAffiliateCode(null);
  };

  /**
   * Marque une conversion comme réussie
   */
  const markConversion = async (paymentIntentId: string, amount: number, currency: string = 'eur') => {
    try {
      const code = getAffiliateCode();
      if (!code) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      console.log('[AFFILIATION] Marquage de la conversion:', { paymentIntentId, amount, currency, code });

      // Mettre à jour la référence avec les informations de paiement
      const { error } = await supabase
        .from('affiliate_referrals')
        .update({
          payment_intent_id: paymentIntentId,
          amount,
          currency,
          status: 'converted',
          converted_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .eq('affiliate_code', code);

      if (error) {
        console.error('[AFFILIATION] Erreur lors du marquage de la conversion:', error);
      } else {
        console.log('[AFFILIATION] Conversion marquée avec succès');
        // Nettoyer le code local après conversion
        clearAffiliateCode();
      }
    } catch (error) {
      console.error('[AFFILIATION] Erreur lors du marquage de la conversion:', error);
    }
  };

  return {
    affiliateCode,
    getAffiliateCode,
    clearAffiliateCode,
    markConversion,
    registerAffiliateReferral
  };
};