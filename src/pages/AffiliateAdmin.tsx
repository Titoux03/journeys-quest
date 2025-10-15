import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogOut, TrendingUp, Users, DollarSign, BarChart3, AlertCircle, Brain } from "lucide-react";
import { AffiliateLinkGenerator } from "@/components/AffiliateLinkGenerator";
import { AdminOptimizationConsole } from "@/components/AdminOptimizationConsole";
import { generateAffiliateReport, formatCurrency, formatConversionRate } from "@/utils/affiliateReport";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AffiliateAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) {
          console.error('Error checking admin role:', error);
          toast.error("Failed to verify admin access");
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
          if (data !== true) {
            toast.error("Access denied: Admin role required");
          }
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const data = await generateAffiliateReport();
      setReport(data);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Affiliate Admin</CardTitle>
            <CardDescription className="text-center">
              Please sign in to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Admin role required to access the affiliate dashboard
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Affiliate Admin</h1>
              <p className="text-sm text-muted-foreground">Manage affiliate links and reports</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator">
              <Users className="w-4 h-4 mr-2" />
              Link Generator
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="optimization">
              <Brain className="w-4 h-4 mr-2" />
              AI Optimization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <AffiliateLinkGenerator />
          </TabsContent>

          <TabsContent value="optimization">
            <AdminOptimizationConsole />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Reports</CardTitle>
                <CardDescription>
                  Analyze affiliate performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-full"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>

                {report && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Affiliates</p>
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
                              <p className="text-xs text-muted-foreground">Referrals</p>
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
                              <p className="text-xs text-muted-foreground">Revenue</p>
                              <p className="text-lg font-bold">{formatCurrency(report.summary.total_revenue)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Overall Conversion Rate</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatConversionRate(report.summary.overall_conversion_rate)}
                        </p>
                      </CardContent>
                    </Card>

                    {report.affiliates.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Affiliates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {report.affiliates.slice(0, 10).map((affiliate: any, index: number) => (
                              <div
                                key={affiliate.affiliate_code}
                                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold">{affiliate.affiliate_code}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {affiliate.total_referrals} ref. → {affiliate.total_conversions} conv.
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-bold">{formatCurrency(affiliate.total_revenue)}</p>
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

export default AffiliateAdmin;
