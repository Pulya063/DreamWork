import { Outlet } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router";

export default function AppRoot() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-[#FAF6F1] font-sans text-[#2C2C2C]"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
