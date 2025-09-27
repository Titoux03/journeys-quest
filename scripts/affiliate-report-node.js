/**
 * Script Node.js pour générer des rapports d'affiliation via l'API Stripe
 * Utilisation: node scripts/affiliate-report-node.js
 * 
 * IMPORTANT: Ce script nécessite votre clé secrète Stripe
 * Assurez-vous de la définir comme variable d'environnement
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Génère un rapport détaillé des affiliations depuis Stripe
 */
async function generateAffiliateReport() {
  try {
    console.log('🚀 Génération du rapport d\'affiliation...\n');

    // Récupérer toutes les sessions de checkout avec metadata d'affiliation
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.payment_intent']
    });

    // Filtrer les sessions avec des codes d'affiliation
    const affiliateSessions = sessions.data.filter(session => 
      session.metadata && session.metadata.affiliate_code
    );

    console.log(`📊 ${affiliateSessions.length} paiements avec affiliation trouvés sur ${sessions.data.length} paiements totaux\n`);

    // Organiser les données par code d'affiliation
    const affiliateStats = {};

    affiliateSessions.forEach(session => {
      const code = session.metadata.affiliate_code;
      const amount = session.amount_total || 0;
      const isPaid = session.payment_status === 'paid';

      if (!affiliateStats[code]) {
        affiliateStats[code] = {
          affiliate_code: code,
          total_referrals: 0,
          successful_payments: 0,
          total_revenue: 0,
          conversion_rate: 0,
          payments: []
        };
      }

      affiliateStats[code].total_referrals++;
      
      if (isPaid) {
        affiliateStats[code].successful_payments++;
        affiliateStats[code].total_revenue += amount;
      }

      affiliateStats[code].payments.push({
        session_id: session.id,
        payment_intent_id: session.payment_intent?.id,
        amount: amount,
        currency: session.currency,
        status: session.payment_status,
        customer_email: session.customer_details?.email,
        created: new Date(session.created * 1000).toISOString()
      });
    });

    // Calculer les taux de conversion
    Object.values(affiliateStats).forEach(stats => {
      if (stats.total_referrals > 0) {
        stats.conversion_rate = (stats.successful_payments / stats.total_referrals) * 100;
      }
    });

    // Trier par revenus décroissants
    const sortedAffiliates = Object.values(affiliateStats)
      .sort((a, b) => b.total_revenue - a.total_revenue);

    // Calculer les totaux
    const totalReferrals = sortedAffiliates.reduce((sum, stats) => sum + stats.total_referrals, 0);
    const totalConversions = sortedAffiliates.reduce((sum, stats) => sum + stats.successful_payments, 0);
    const totalRevenue = sortedAffiliates.reduce((sum, stats) => sum + stats.total_revenue, 0);
    const overallConversionRate = totalReferrals > 0 ? (totalConversions / totalReferrals) * 100 : 0;

    // Afficher le rapport
    console.log('='.repeat(60));
    console.log('           RAPPORT D\'AFFILIATION STRIPE');
    console.log('='.repeat(60));
    console.log(`📅 Généré le: ${new Date().toLocaleString('fr-FR')}`);
    console.log('');
    
    console.log('📈 RÉSUMÉ GLOBAL:');
    console.log(`   • Influenceurs actifs: ${sortedAffiliates.length}`);
    console.log(`   • Total références: ${totalReferrals}`);
    console.log(`   • Conversions réussies: ${totalConversions}`);
    console.log(`   • Revenus totaux: ${formatCurrency(totalRevenue)}`);
    console.log(`   • Taux de conversion global: ${overallConversionRate.toFixed(1)}%`);
    console.log('');

    console.log('🏆 TOP INFLUENCEURS:');
    console.log('-'.repeat(60));
    
    sortedAffiliates.slice(0, 10).forEach((stats, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${stats.affiliate_code.padEnd(20)} | Réf: ${stats.total_referrals.toString().padStart(3)} | Conv: ${stats.successful_payments.toString().padStart(3)} | Revenus: ${formatCurrency(stats.total_revenue).padStart(10)} | Taux: ${stats.conversion_rate.toFixed(1).padStart(5)}%`);
    });

    console.log('');
    console.log('💰 DÉTAILS PAR INFLUENCEUR:');
    console.log('-'.repeat(60));

    sortedAffiliates.forEach(stats => {
      if (stats.total_revenue > 0) {
        console.log(`\n🎯 ${stats.affiliate_code}:`);
        console.log(`   • ${stats.total_referrals} références → ${stats.successful_payments} conversions (${stats.conversion_rate.toFixed(1)}%)`);
        console.log(`   • Revenus générés: ${formatCurrency(stats.total_revenue)}`);
        
        // Afficher les paiements réussis
        const successfulPayments = stats.payments.filter(p => p.status === 'paid');
        if (successfulPayments.length > 0) {
          console.log(`   • Paiements:`);
          successfulPayments.forEach(payment => {
            console.log(`     - ${payment.created.split('T')[0]} | ${formatCurrency(payment.amount)} | ${payment.customer_email || 'N/A'}`);
          });
        }
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Rapport généré avec succès !');
    
    // Optionnel: sauvegarder dans un fichier JSON
    const reportData = {
      generated_at: new Date().toISOString(),
      summary: {
        total_affiliates: sortedAffiliates.length,
        total_referrals: totalReferrals,
        total_conversions: totalConversions,
        total_revenue: totalRevenue,
        overall_conversion_rate: overallConversionRate
      },
      affiliates: sortedAffiliates
    };

    // Uncommenter pour sauvegarder dans un fichier
    // const fs = require('fs');
    // fs.writeFileSync('affiliate-report.json', JSON.stringify(reportData, null, 2));
    // console.log('📄 Rapport sauvegardé dans affiliate-report.json');

  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport:', error.message);
    
    if (error.message.includes('No such API key')) {
      console.log('\n💡 Conseil: Assurez-vous que votre clé secrète Stripe est correctement définie:');
      console.log('   export STRIPE_SECRET_KEY=sk_test_...');
      console.log('   ou créez un fichier .env avec STRIPE_SECRET_KEY=sk_test_...');
    }
  }
}

/**
 * Formate un montant en euros
 */
function formatCurrency(amountInCents, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amountInCents / 100);
}

// Vérifier que la clé Stripe est définie
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Erreur: La variable d\'environnement STRIPE_SECRET_KEY n\'est pas définie');
  console.log('\n💡 Pour corriger cela:');
  console.log('1. Récupérez votre clé secrète depuis le dashboard Stripe');
  console.log('2. Définissez la variable d\'environnement:');
  console.log('   export STRIPE_SECRET_KEY=sk_test_votre_cle_ici');
  console.log('3. Ou créez un fichier .env avec:');
  console.log('   STRIPE_SECRET_KEY=sk_test_votre_cle_ici');
  process.exit(1);
}

// Exécuter le script
generateAffiliateReport();