import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import FunnelWithdrawNotification from "@/components/funnel/FunnelWithdrawNotification";
import FunnelPageTransition from "@/components/funnel/FunnelPageTransition";
import FunnelErrorBoundary from "@/components/funnel/FunnelErrorBoundary";
import { usePrefetchFunnelPages } from "@/hooks/usePrefetchFunnelPages";
import { usePreloadFunnelImages } from "@/hooks/usePreloadFunnelImages";

const FunnelLayout = () => {
  const location = useLocation();
  usePrefetchFunnelPages(location.pathname);
  usePreloadFunnelImages();

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
