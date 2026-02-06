import { type Variants } from "framer-motion";

// =============================================================================
// STEP TRANSITIONS
// =============================================================================

export const stepTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

export const stepTransitionConfig = {
  duration: 0.3,
  ease: "easeInOut" as const,
};

// =============================================================================
// FADE ANIMATIONS
// =============================================================================

export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

export const fadeInUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

export const fadeInDownVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

// =============================================================================
// SCALE ANIMATIONS
// =============================================================================

export const scaleInVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
};

// =============================================================================
// SLIDE ANIMATIONS
// =============================================================================

export const slideInFromRightVariants: Variants = {
  initial: {
    opacity: 0,
    x: "100%",
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: "-100%",
  },
};

export const slideInFromLeftVariants: Variants = {
  initial: {
    opacity: 0,
    x: "-100%",
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: "100%",
  },
};

// =============================================================================
// MAP PANEL ANIMATION
// =============================================================================

export const mapPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    width: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
  visible: {
    opacity: 1,
    width: "50%",
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

// =============================================================================
// STAGGER CHILDREN
// =============================================================================

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

// =============================================================================
// BUTTON/INTERACTIVE ANIMATIONS
// =============================================================================

export const buttonHoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const buttonTapScale = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// =============================================================================
// PROGRESS BAR ANIMATION
// =============================================================================

export const progressBarVariants: Variants = {
  initial: {
    width: "0%",
  },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

// =============================================================================
// SUCCESS ANIMATIONS
// =============================================================================

export const checkmarkVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.2 },
    },
  },
};

export const successCircleVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};
