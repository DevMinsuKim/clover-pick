"use client";

import { motion, type Transition } from "motion/react";

const UpDownTransition: Transition = {
  duration: 1.5,
  ease: "easeOut",
  repeat: Infinity,
};

export default function UpDownEffect({
  children,
}: {
  children: React.ReactNode;
}) {
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
