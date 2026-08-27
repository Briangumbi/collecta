import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

// The brand's ember gradient — same stops as the dashboard's balance card
// and the app's promo graphic. Fixed regardless of the active UI theme
// (Dark Cool's blue, Light's amber, etc.): a logo should read as one
// consistent brand identity, not shift with a user's theme preference the
// way an in-app accent chip reasonably would.
const GRADIENT_START = '#ff7a29';
const GRADIENT_DEEP = '#4a1c0f';
const GLYPH_COLOR = '#f7f0e4';

/**
 * The Ledger mark — a rounded "L" glyph in two overlapping bars (so the
 * inner corner is a clean solid-fill union, not a hand-drawn bezier), on the
 * brand's orange-to-ember gradient.
 */
export function LogoMark({ size = 56 }: { size?: number }) {
  const glyphSize = size * 0.64;

  return (
    <LinearGradient
      colors={[GRADIENT_START, GRADIENT_DEEP]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, { width: size, height: size, borderRadius: size * 0.29 }]}
    >
      <Svg width={glyphSize} height={glyphSize} viewBox="0 0 100 100">
        <Rect x={34} y={18} width={18} height={50} rx={9} fill={GLYPH_COLOR} />
        <Rect x={34} y={50} width={34} height={18} rx={9} fill={GLYPH_COLOR} />
      </Svg>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
