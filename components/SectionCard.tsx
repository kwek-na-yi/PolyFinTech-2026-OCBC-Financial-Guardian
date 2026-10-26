"use client";

import { motion } from "framer-motion";

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** White rounded card used for each Guardian section, with a staggered reveal. */
export default function SectionCard({
  title,
  icon,
  children,
  className = "",
  delay = 0,
}: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl2 bg-white p-4 shadow-card ${className}`}
    >
      {title && (
        <div className="mb-3 flex items-center gap-2">
          {icon}
          <h2 className="text-[15px] font-bold text-ocbc-ink">{title}</h2>
        </div>
      )}
      {children}
    </motion.section>
  );
}
