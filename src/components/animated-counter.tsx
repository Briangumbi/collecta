import { useEffect, useRef, useState } from 'react';
import { Easing } from 'react-native-reanimated';

import { ThemedText, type ThemedTextProps } from '@/components/themed-text';
import { duration } from '@/animations/easing';

interface AnimatedCounterProps extends ThemedTextProps {
  value: number;
  formatter?: (n: number) => string;
}

const countEasing = Easing.out(Easing.cubic);

export function AnimatedCounter({ value, formatter = (n) => Math.round(n).toLocaleString(), ...rest }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const start = Date.now();
    let frame: ReturnType<typeof requestAnimationFrame>;

    const tick = () => {
      const t = Math.min((Date.now() - start) / duration.slow, 1);
      setDisplay(from + (to - from) * countEasing(t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <ThemedText {...rest}>{formatter(display)}</ThemedText>;
}
