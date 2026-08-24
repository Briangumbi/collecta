import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Glow } from '@/constants/theme';
import { useThemeScheme } from '@/hooks/use-theme';

/**
 * Soft amber radial glow, positioned behind a header/greeting or a hero
 * amount. The single highest-impact move for killing the "flat" feeling —
 * meant to sit absolutely behind content, never to carry its own layout.
 */
export function GlowBackground({
  width = 420,
  height = 280,
  cx = '50%',
  cy = '20%',
  r = '65%',
}: {
  width?: number;
  height?: number;
  cx?: string;
  cy?: string;
  r?: string;
}) {
  const scheme = useThemeScheme();
  const glow = Glow[scheme];

  return (
    <Svg width={width} height={height} style={styles.absolute} pointerEvents="none">
      <Defs>
        <RadialGradient id="glow" cx={cx} cy={cy} r={r}>
          <Stop offset="0%" stopColor={glow.color} stopOpacity={glow.opacity} />
          <Stop offset="60%" stopColor={glow.color} stopOpacity={glow.opacity * 0.35} />
          <Stop offset="100%" stopColor={glow.color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#glow)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
