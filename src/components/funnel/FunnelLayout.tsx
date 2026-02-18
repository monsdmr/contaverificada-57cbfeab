import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import FunnelWithdrawNotification from "@/components/funnel/FunnelWithdrawNotification";
import FunnelPageTransition from "@/components/funnel/FunnelPageTransition";
import FunnelErrorBoundary from "@/components/funnel/FunnelErrorBoundary";
import FunnelExitIntent from "@/components/funnel/FunnelExitIntent";
import { usePrefetchFunnelPages } from "@/hooks/usePrefetchFunnelPages";
import { usePreloadFunnelImages } from "@/hooks/usePreloadFunnelImages";
import { useEffect } from "react";
import { trackFunnelView } from "@/lib/funnelAnalytics";

const FunnelLayout = () => {
  const location = useLocation();
  usePrefetchFunnelPages(location.pathname);
  usePreloadFunnelImages();

  // Track funnel step views
  useEffect(() => {
    const step = location.pathname.split("/").pop() || "unknown";
    trackFunnelView(step);
  }, [location.pathname]);

  return (
    <FunnelErrorBoundary>
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
