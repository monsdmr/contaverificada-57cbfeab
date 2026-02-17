import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import FunnelWithdrawNotification from "@/components/funnel/FunnelWithdrawNotification";
import FunnelPageTransition from "@/components/funnel/FunnelPageTransition";
import { usePrefetchFunnelPages } from "@/hooks/usePrefetchFunnelPages";

const FunnelLayout = () => {
  const location = useLocation();
  usePrefetchFunnelPages(location.pathname);

  return (
    <>
      <AnimatePresence mode="wait">
        <FunnelPageTransition key={location.pathname}>
          <Outlet />
        </FunnelPageTransition>
      </AnimatePresence>
      <FunnelWithdrawNotification />
    </>
  );
};

export default FunnelLayout;
