"use client";

import { motion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Page transition: a night-coloured curtain lifts while the new page fades in.
 * (Opacity only on the wrapper — transforms would break pinned sections.)
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        data-curtain
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[80] origin-top bg-night-2"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
      />
      <motion.div data-page initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}>
        {children}
      </motion.div>
    </MotionConfig>
  );
}
