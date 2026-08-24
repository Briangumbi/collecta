import { useEffect, useState } from 'react';
import { runOnJS, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText, type ThemedTextProps } from '@/components/themed-text';
import { duration, easing } from '@/animations/easing';

interface AnimatedCounterProps extends ThemedTextProps {
  value: number;
  formatter?: (n: number) => string;
}

export function AnimatedCounter({ value, formatter = (n) => Math.round(n).toLocaleString(), ...rest }: AnimatedCounterProps) {
  const progress = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    progress.value = withTiming(value, { duration: duration.slow, easing: easing.standard });
  }, [value, progress]);

  useAnimatedReaction(
    () => progress.value,
    (current) => {
      runOnJS(setDisplay)(current);
    }
  );

  return <ThemedText {...rest}>{formatter(display)}</ThemedText>;
}
