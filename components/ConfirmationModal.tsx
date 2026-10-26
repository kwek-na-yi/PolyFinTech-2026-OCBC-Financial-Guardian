"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ConfirmationModal({ open, onClose }: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-[380px] rounded-3xl bg-white p-6 text-center shadow-float"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ocbc-green">
                <Check size={28} strokeWidth={3} className="text-white" />
              </span>
            </motion.div>

            <h2 className="mt-4 text-[19px] font-bold text-ocbc-ink">
              Recommendations approved successfully
            </h2>
            <p className="mt-1.5 text-[14px] leading-snug text-ocbc-slate">
              Your financial plan has been updated. Guardian will keep monitoring and notify you
              before any new risk appears.
            </p>

            <button
              onClick={onClose}
              className="ocbc-gradient mt-6 w-full rounded-full py-3.5 text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(236,0,0,0.28)]"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
