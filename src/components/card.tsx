import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';

/**
 * Real elevation, not a flat bordered box: a neutral drop shadow on the
 * outer wrapper (visible mainly in light mode — on near-black dark
 * backgrounds a shadow reads as nothing, so depth there comes from the
 * lighter surface color instead) plus a faint top highlight for a glassy
 * edge. Two nested views because the shadow must NOT be clipped while the
 * highlight gradient must be clipped to the rounded corners — one view can't
 * do both.
 */
export function Card({ style, children, ...rest }: ViewProps) {
  const theme = useTheme();
  const { radius, cardShadow, cardHighlight } = useThemeTokens();

  return (
    // All four shadow* props must live in one style object — react-native-web
    // only synthesizes `box-shadow` from a single flattened object, so
    // splitting shadowColor into a separate array entry (to override it with
    // a theme-dependent value) silently produces a zero shadow on web.
    <View
      style={[
        styles.shadowWrap,
        {
          borderRadius: radius.card,
          shadowColor: cardShadow.color,
          shadowOffset: cardShadow.offset,
          shadowOpacity: cardShadow.opacity,
          shadowRadius: cardShadow.radius,
          elevation: cardShadow.elevation,
        },
        style,
      ]}
      {...rest}
    >
      <View style={[styles.card, { borderRadius: radius.card, backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <LinearGradient colors={cardHighlight} style={styles.highlight} pointerEvents="none" />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {},
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
  },
});
