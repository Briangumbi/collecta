import { Easing } from 'react-native-reanimated';

/**
 * Shared easing/duration tokens. Cinematic, unhurried: slow heavy eases,
 * no bounce/spring overshoot anywhere except the payment-success checkmark.
 */
export const easing = {
  standard: Easing.out(Easing.cubic),
  emphasized: Easing.bezier(0.16, 1, 0.3, 1),
  linear: Easing.linear,
};

export const duration = {
  fast: 220,
  base: 420,
  slow: 700,
  reveal: 900,
};

export const springs = {
  // The one deliberate exception: payment-success checkmark pop.
  successPop: {
    damping: 12,
    stiffness: 180,
    mass: 0.6,
  },
};
