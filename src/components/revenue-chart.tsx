import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { duration, easing } from '@/animations/easing';
import { useTheme } from '@/hooks/use-theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CHART_HEIGHT = 120;
const BAR_WIDTH = 28;
const GAP = 18;

export function RevenueChart({ data }: { data: { month: string; total: number }[] }) {
  const theme = useTheme();
  const max = Math.max(...data.map((d) => d.total), 1);
  const width = data.length * (BAR_WIDTH + GAP);

  return (
    <View>
      <Svg width={width} height={CHART_HEIGHT}>
        {data.map((d, i) => (
          <Bar key={`${d.month}-${i}`} index={i} value={d.total} max={max} color={theme.primary} />
        ))}
      </Svg>
      <View style={[styles.labels, { width }]}>
        {data.map((d, i) => (
          <ThemedText key={`${d.month}-${i}`} type="small" themeColor="textSecondary" style={styles.label}>
            {d.month}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

function Bar({ index, value, max, color }: { index: number; value: number; max: number; color: string }) {
  const heightPct = useSharedValue(0);

  useEffect(() => {
    heightPct.value = withDelay(index * 60, withTiming(value / max, { duration: duration.slow, easing: easing.standard }));
  }, [value, max, index, heightPct]);

  const animatedProps = useAnimatedProps(() => {
    const h = Math.max(heightPct.value * (CHART_HEIGHT - 8), 2);
    return {
      height: h,
      y: CHART_HEIGHT - h,
    };
  });

  const x = index * (BAR_WIDTH + GAP);

  return <AnimatedRect x={x} width={BAR_WIDTH} rx={6} fill={color} animatedProps={animatedProps} />;
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    marginTop: 8,
  },
  label: {
    width: BAR_WIDTH + GAP,
    textAlign: 'center',
  },
});
