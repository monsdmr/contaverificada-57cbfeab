import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import FunnelWithdrawNotification from "@/components/funnel/FunnelWithdrawNotification";
import FunnelPageTransition from "@/components/funnel/FunnelPageTransition";
import FunnelErrorBoundary from "@/components/funnel/FunnelErrorBoundary";
import FunnelExitIntent from "@/components/funnel/FunnelExitIntent";
import FunnelCountdownTimer from "@/components/funnel/FunnelCountdownTimer";
import { usePrefetchFunnelPages } from "@/hooks/usePrefetchFunnelPages";
import { usePreloadFunnelImages } from "@/hooks/usePreloadFunnelImages";
import { useEffect, useMemo } from "react";
import { trackFunnelView } from "@/lib/funnelAnalytics";

const HIDDEN_TIMER_PAGES = ["sucesso", "processando-saque"];

const FunnelLayout = () => {
  const location = useLocation();
  usePrefetchFunnelPages(location.pathname);
  usePreloadFunnelImages();

  const currentStep = location.pathname.split("/").pop() || "unknown";
  const showTimer = useMemo(() => !HIDDEN_TIMER_PAGES.includes(currentStep), [currentStep]);

  useEffect(() => {
    trackFunnelView(currentStep);
  }, [currentStep]);

  return (
    <FunnelErrorBoundary>
      {showTimer && <FunnelCountdownTimer />}
      <AnimatePresence mode="wait">
        <FunnelPageTransition key={location.pathname}>
          <Outlet />
        </FunnelPageTransition>
      </AnimatePresence>
      <FunnelWithdrawNotification />
      <FunnelExitIntent />
    </FunnelErrorBoundary>
  );
};

export default FunnelLayout;
