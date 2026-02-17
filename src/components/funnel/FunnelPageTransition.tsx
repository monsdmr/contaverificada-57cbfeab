import { motion } from "framer-motion";
import { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

interface FunnelPageTransitionProps {
  children: ReactNode;
  className?: string;
}

const FunnelPageTransition = ({ children, className }: FunnelPageTransitionProps) => (
  <motion.div
    initial="initial"
    animate="enter"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
    className={className}
  >
    {children}
  </motion.div>
);

export default FunnelPageTransition;
