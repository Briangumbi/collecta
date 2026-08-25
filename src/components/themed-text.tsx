import { Platform, Text, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import type { ThemeColorKey } from '@/theme/tokens';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'hero' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'code' | 'label';
  themeColor?: ThemeColorKey;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const { fonts, fontSize } = useThemeTokens();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && { fontSize: fontSize.default, lineHeight: fontSize.default * 1.5, fontFamily: fonts.sans },
        // The visual anchor of a screen — key stat/amount figures. Meant to read
        // as the thing your eye lands on first; pair with `label` (uppercase,
        // small, muted) for the caption underneath, never a same-weight subtitle.
        type === 'hero' && { fontSize: fontSize.hero, lineHeight: fontSize.hero * 1.07, fontFamily: fonts.display, letterSpacing: -1.5 },
        type === 'title' && { fontSize: fontSize.title, lineHeight: fontSize.title * 1.1, fontFamily: fonts.display, letterSpacing: -0.5 },
        type === 'small' && { fontSize: fontSize.small, lineHeight: fontSize.small * 1.43, fontFamily: fonts.sans },
        type === 'smallBold' && { fontSize: fontSize.small, lineHeight: fontSize.small * 1.43, fontFamily: fonts.semibold },
        type === 'subtitle' && { fontSize: fontSize.subtitle, lineHeight: fontSize.subtitle * 1.21, fontFamily: fonts.display, letterSpacing: -0.3 },
        type === 'link' && { fontSize: fontSize.small, lineHeight: 30, fontFamily: fonts.sans },
        type === 'code' && { fontSize: fontSize.code, fontFamily: fonts.mono, fontWeight: Platform.select({ android: 700 }) ?? 500 },
        // Small caption/eyebrow label — pairs with `hero`/`title` numbers.
        type === 'label' && { fontSize: fontSize.code, lineHeight: fontSize.code * 1.33, fontFamily: fonts.semibold, letterSpacing: 0.6, textTransform: 'uppercase' },
        style,
      ]}
      {...rest}
    />
  );
}
