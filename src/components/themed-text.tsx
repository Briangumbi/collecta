import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'hero' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'code' | 'label';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'hero' && styles.hero,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'code' && styles.code,
        type === 'label' && styles.label,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.semibold,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.sans,
  },
  // The visual anchor of a screen — key stat/amount figures. Meant to read
  // as the thing your eye lands on first; pair with `label` (uppercase,
  // small, muted) for the caption underneath, never a same-weight subtitle.
  hero: {
    fontSize: 56,
    lineHeight: 60,
    fontFamily: Fonts.display,
    letterSpacing: -1.5,
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
    fontFamily: Fonts.display,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Fonts.display,
    letterSpacing: -0.3,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
  // Small caption/eyebrow label — pairs with `hero`/`title` numbers.
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
