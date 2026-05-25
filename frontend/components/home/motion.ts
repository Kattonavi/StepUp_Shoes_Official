/**
 * Shared Framer Motion variants for the new home landing.
 * Kept lightweight on purpose — no infinite loops, no parallax-scroll work,
 * just entry animations and small hover micro-interactions.
 *
 * Components import these instead of redefining variants inline.
 */
import type { Variants } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const // smooth out-back-ish

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
}

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
}

export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
}

/** Floating hero cards — gentle vertical drift, used sparingly. */
export const floatY = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: EASE },
  },
})

/** Viewport defaults so entries fire once, slightly before scrolling in. */
export const VIEWPORT_ONCE = { once: true, amount: 0.2 } as const
