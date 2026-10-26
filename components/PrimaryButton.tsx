"use client";

import { motion } from "framer-motion";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline";
  className?: string;
}

export default function PrimaryButton({
  children,
  onClick,
  variant = "primary",
  className = "",
}: PrimaryButtonProps) {
  const base =
    "w-full rounded-full py-3.5 text-[15px] font-bold tracking-wide transition-colors";
  const styles =
    variant === "primary"
      ? "ocbc-gradient text-white shadow-[0_6px_16px_rgba(236,0,0,0.28)]"
      : "border-[1.5px] border-ocbc-red bg-white text-ocbc-red";

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </motion.button>
  );
}
