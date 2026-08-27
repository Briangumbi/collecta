import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// The brief (ledger-logo-prompt.md) called for a "paper-and-ink" mark on a
// warm near-black ground, not a gradient — matches the app's real
// background/text tokens rather than the hero card's amber accent, since
// this reads as a badge/stamp, not a UI surface. Fixed regardless of the
// active theme, same as the avatar gradient / virtual card mockup: a logo
// shouldn't shift with a user's theme preference.
const BACKGROUND = '#120e09';
const GLYPH_COLOR = '#f7f0e4';

/**
 * The Ledger mark — two flowing ink-stroke slashes, each curving into a
 * horizontal root at its base (left root sweeps left, right root sweeps
 * right), evoking a pen stroke rather than a letterform or a fintech-cliché
 * checkmark/dollar sign.
 */
export function LogoMark({ size = 56 }: { size?: number }) {
  const glyphSize = size * 0.66;

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size * 0.29, backgroundColor: BACKGROUND }]}>
      <Svg width={glyphSize} height={glyphSize} viewBox="0 0 100 100" fill="none">
        <Path d="M12 64 C 26 66 36 46 48 24" stroke={GLYPH_COLOR} strokeWidth={10} strokeLinecap="round" />
        <Path d="M90 74 C 78 76 70 58 64 50" stroke={GLYPH_COLOR} strokeWidth={10} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
