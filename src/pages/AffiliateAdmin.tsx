import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Users, TrendingUp, DollarSign, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AffiliateLinkGenerator } from '@/components/AffiliateLinkGenerator';
import { generateAffiliateReport, formatCurrency, formatConversionRate, type AffiliateReport } from '@/utils/affiliateReport';
import { useNavigate } from 'react-router-dom';

/**
 * Page d'administration pour la gestion des affiliations
 */
export const AffiliateAdmin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [report, setReport] = useState<AffiliateReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const ADMIN_PASSWORD = 'valettitsgoat@';
  const AUTH_KEY = 'affiliate_admin_auth';

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  /**
   * Gérer la connexion
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'authenticated');
      setAuthError('');
      setPassword('');
    } else {
      setAuthError('Mot de passe incorrect');
    }
  };

  /**
   * Gérer la déconnexion
   */
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    setReport(null);
  };

  /**
   * Génère un rapport d'affiliation
   */
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Génération du rapport d\'affiliation...');
      
      const reportData = await generateAffiliateReport();
      setReport(reportData);
      
      console.log('Rapport généré avec succès');
    } catch (err) {
      console.error('Erreur lors de la génération du rapport:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Écran de connexion si non authentifié
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Accès Administration</CardTitle>
            <CardDescription>
              Entrez le mot de passe pour accéder au portail d'affiliation
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              
              {authError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-destructive text-sm">❌ {authError}</p>
                </div>
              )}
              
              <Button type="submit" className="w-full">
                Se connecter
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">Administration Affiliation</h1>
                <p className="text-muted-foreground">Gestion des liens et rapports d'affiliation</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-destructive hover:bg-destructive/10"
            >
              <Lock className="w-4 h-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Générateur de liens</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Rapports</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Générateur */}
          <TabsContent value="generator" className="space-y-6">
            <AffiliateLinkGenerator />
          </TabsContent>

          {/* Onglet Rapports */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>Rapports d'affiliation</span>
                </CardTitle>
                <CardDescription>
                  Analysez les performances de vos influenceurs
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Bouton de génération */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>{loading ? 'Génération...' : 'Générer le rapport'}</span>
                  </Button>
                </div>

                {/* Erreur */}
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive text-sm">❌ {error}</p>
                  </div>
                )}

                {/* Rapport */}
                {report && (
                  <div className="space-y-6">
                    {/* Résumé */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Influenceurs</p>
                              <p className="text-lg font-bold">{report.summary.total_affiliates}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Références</p>
                              <p className="text-lg font-bold">{report.summary.total_referrals}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Conversions</p>
                              <p className="text-lg font-bold">{report.summary.total_conversions}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-yellow-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Revenus</p>
                              <p className="text-lg font-bold">{formatCurrency(report.summary.total_revenue)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Taux de conversion global */}
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Taux de conversion global</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatConversionRate(report.summary.overall_conversion_rate)}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Top influenceurs */}
                    {report.affiliates.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>🏆 Top Influenceurs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {report.affiliates.slice(0, 10).map((affiliate, index) => (
                              <div
                                key={affiliate.affiliate_code}
                                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground">{affiliate.affiliate_code}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {affiliate.total_referrals} réf. → {affiliate.total_conversions} conv.
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-bold text-foreground">{formatCurrency(affiliate.total_revenue)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatConversionRate(affiliate.conversion_rate)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Timestamp */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Rapport généré le {new Date(report.generated_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};