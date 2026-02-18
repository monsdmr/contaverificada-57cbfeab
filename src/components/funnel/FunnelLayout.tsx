import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import FunnelWithdrawNotification from "@/components/funnel/FunnelWithdrawNotification";
import FunnelPageTransition from "@/components/funnel/FunnelPageTransition";
import FunnelErrorBoundary from "@/components/funnel/FunnelErrorBoundary";
import FunnelActiveUsersCounter from "@/components/funnel/FunnelActiveUsersCounter";
import FunnelSecurityBadge from "@/components/funnel/FunnelSecurityBadge";
import { usePrefetchFunnelPages } from "@/hooks/usePrefetchFunnelPages";
import { usePreloadFunnelImages } from "@/hooks/usePreloadFunnelImages";

const FunnelLayout = () => {
  const location = useLocation();
  usePrefetchFunnelPages(location.pathname);
  usePreloadFunnelImages();

  // #3 scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <FunnelErrorBoundary>
      <AnimatePresence mode="wait">
        <FunnelPageTransition key={location.pathname}>
          <Outlet />
        </FunnelPageTransition>
      </AnimatePresence>
      <FunnelWithdrawNotification />
    </FunnelErrorBoundary>
  );
};

export default FunnelLayout;
