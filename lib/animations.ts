import type { TargetAndTransition, Variants } from 'motion/react';

const standardEase = [0.22, 1, 0.36, 1] as const;
const softSpring = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 } as const;

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.32, ease: standardEase } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: standardEase } },
};

export const modalPanelVariants = (reducedMotion: boolean): Variants => ({
  hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 },
  visible: reducedMotion
    ? { opacity: 1, transition: { duration: 0.01 } }
    : { opacity: 1, y: 0, scale: 1, transition: softSpring },
  exit: reducedMotion
    ? { opacity: 0, transition: { duration: 0.01 } }
    : { opacity: 0, y: 10, scale: 0.985, transition: { duration: 0.18, ease: standardEase } },
});

export const fadeInUpVariants = (reducedMotion: boolean): Variants => ({
  hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
  visible: reducedMotion
    ? { opacity: 1, transition: { duration: 0.01 } }
    : { opacity: 1, y: 0, transition: { duration: 0.34, ease: standardEase } },
  exit: reducedMotion
    ? { opacity: 0, transition: { duration: 0.01 } }
    : { opacity: 0, y: -8, transition: { duration: 0.18, ease: standardEase } },
});

export const taskItemVariants = (reducedMotion: boolean): Variants => ({
  hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 },
  visible: reducedMotion
    ? { opacity: 1, transition: { duration: 0.01 } }
    : { opacity: 1, y: 0, scale: 1, transition: softSpring },
  exit: reducedMotion
    ? { opacity: 0, transition: { duration: 0.01 } }
    : { opacity: 0, x: 16, scale: 0.98, transition: { duration: 0.18, ease: standardEase } },
});

export const menuVariants = (reducedMotion: boolean): Variants => ({
  hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 },
  visible: reducedMotion
    ? { opacity: 1, transition: { duration: 0.01 } }
    : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: standardEase } },
  exit: reducedMotion
    ? { opacity: 0, transition: { duration: 0.01 } }
    : { opacity: 0, y: 4, scale: 0.98, transition: { duration: 0.14, ease: standardEase } },
});

export const subtleCardHover = (reducedMotion: boolean): TargetAndTransition | undefined =>
  reducedMotion ? undefined : { y: -2, transition: { duration: 0.18, ease: standardEase } };

export const subtleButtonTap = (reducedMotion: boolean): TargetAndTransition | undefined =>
  reducedMotion ? undefined : { scale: 0.98 };

export const subtleButtonHover = (reducedMotion: boolean): TargetAndTransition | undefined =>
  reducedMotion ? undefined : { y: -1, transition: { duration: 0.16, ease: standardEase } };
