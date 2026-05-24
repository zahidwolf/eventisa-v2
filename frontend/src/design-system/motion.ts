export const motionTokens = {
  duration: {
    fast: 0.2,
    normal: 0.35,
    slow: 0.55,
    hero: 0.8,
  },
  ease: {
    premium: [0.22, 1, 0.36, 1] as const,
    smooth: [0.4, 0, 0.2, 1] as const,
  },
  stagger: 0.06,
  hover: {
    lift: -6,
    scale: 1.03,
  },
} as const;

export const framerTransition = {
  premium: { duration: motionTokens.duration.normal, ease: motionTokens.ease.premium },
  slow: { duration: motionTokens.duration.slow, ease: motionTokens.ease.premium },
};
