"use client";

import { motion } from "framer-motion";

/** Smooth fade/slide for whole-screen transitions. */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
