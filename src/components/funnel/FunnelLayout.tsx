import { Outlet } from "react-router-dom";
import FunnelWithdrawNotification from "@/components/funnel/FunnelWithdrawNotification";

const FunnelLayout = () => {
  return (
    <>
      <Outlet />
      <FunnelWithdrawNotification />
    </>
  );
};

export default FunnelLayout;
