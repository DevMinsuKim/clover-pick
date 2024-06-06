"use client";

import { motion } from "framer-motion";

const UpDownTransition = {
  duration: 1.5,
  ease: "easeOut",
  repeat: Infinity,
};

export default function UpDown({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{
        y: [-1, -10, -1],
      }}
      transition={UpDownTransition}
    >
      {children}
    </motion.div>
  );
}
