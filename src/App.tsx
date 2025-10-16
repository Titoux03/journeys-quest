import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PremiumProvider } from "./hooks/usePremium";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import AffiliateAdmin from "./pages/AffiliateAdmin";
import NotFound from "./pages/NotFound";
import { useAffiliation } from "./hooks/useAffiliation";

const queryClient = new QueryClient();

const AppContent = () => {
  // Initialiser le système d'affiliation
  useAffiliation();
  // Attendre que l'auth soit prête pour éviter tout écran vide/bleu
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-secondary">
        <div className="w-8 h-8 animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/affiliate-admin" element={<AffiliateAdmin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PremiumProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </PremiumProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
