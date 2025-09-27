/**
 * Utilitaires pour générer et analyser les rapports d'affiliation
 * Exemple d'utilisation pour les rapports côté client
 */

import { supabase } from '@/integrations/supabase/client';

export interface AffiliateStats {
  affiliate_code: string;
  total_referrals: number;
  total_conversions: number;
  total_revenue: number;
  conversion_rate: number;
  last_activity: string | null;
}

export interface AffiliateReport {
  generated_at: string;
  summary: {
    total_affiliates: number;
    total_referrals: number;
    total_conversions: number;
    total_revenue: number;
    overall_conversion_rate: number;
  };
  affiliates: AffiliateStats[];
}

/**
 * Génère un rapport d'affiliation en appelant l'edge function
 */
export const generateAffiliateReport = async (): Promise<AffiliateReport> => {
  try {
    console.log('[AFFILIATE-UTILS] Génération du rapport d\'affiliation...');
    
    const { data, error } = await supabase.functions.invoke('affiliate-report');
    
    if (error) {
      console.error('[AFFILIATE-UTILS] Erreur lors de la génération:', error);
      throw new Error(`Erreur lors de la génération du rapport: ${error.message}`);
    }

    console.log('[AFFILIATE-UTILS] Rapport généré avec succès');
    return data as AffiliateReport;
    
  } catch (error) {
    console.error('[AFFILIATE-UTILS] Erreur:', error);
    throw error;
  }
};

/**
 * Formate un montant en euros
 */
export const formatCurrency = (amountInCents: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  }).format(amountInCents / 100);
};

/**
 * Formate un taux de conversion
 */
export const formatConversionRate = (rate: number): string => {
  return `${rate.toFixed(1)}%`;
};

/**
 * Exemple de rapport simple pour les tests
 */
export const generateSimpleReport = async (): Promise<void> => {
  try {
    const report = await generateAffiliateReport();
    
    console.log('=== RAPPORT D\'AFFILIATION ===');
    console.log(`Généré le: ${new Date(report.generated_at).toLocaleString('fr-FR')}`);
    console.log('');
    console.log('RÉSUMÉ:');
    console.log(`- Nombre d'influenceurs: ${report.summary.total_affiliates}`);
    console.log(`- Total références: ${report.summary.total_referrals}`);
    console.log(`- Total conversions: ${report.summary.total_conversions}`);
    console.log(`- Revenus totaux: ${formatCurrency(report.summary.total_revenue)}`);
    console.log(`- Taux de conversion global: ${formatConversionRate(report.summary.overall_conversion_rate)}`);
    console.log('');
    console.log('TOP INFLUENCEURS:');
    
    report.affiliates.slice(0, 10).forEach((affiliate, index) => {
      console.log(`${index + 1}. ${affiliate.affiliate_code}`);
      console.log(`   - Références: ${affiliate.total_referrals}`);
      console.log(`   - Conversions: ${affiliate.total_conversions}`);
      console.log(`   - Revenus: ${formatCurrency(affiliate.total_revenue)}`);
      console.log(`   - Taux: ${formatConversionRate(affiliate.conversion_rate)}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
  }
};

// Exemple d'utilisation dans la console du navigateur:
// import { generateSimpleReport } from '@/utils/affiliateReport';
// generateSimpleReport();