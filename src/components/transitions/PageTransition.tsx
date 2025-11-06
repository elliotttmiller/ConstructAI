'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Ultra-fast transitions for instant page swaps
const pageVariants = {
  initial: {
    opacity: 0.98, // Nearly invisible transition
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.05, // Extremely fast - almost instant
    },
  },
  exit: {
    opacity: 1, // Don't fade out, just swap
    transition: {
      duration: 0,
    },
  },
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
