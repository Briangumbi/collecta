import { View, type ViewProps } from 'react-native';

import { NoiseOverlay } from '@/components/noise-overlay';
import { useTheme } from '@/hooks/use-theme';
import type { ThemeColorKey } from '@/theme/tokens';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColorKey;
};

export function ThemedView({ style, type, children, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  const isScreenBackground = type === undefined || type === 'background';

  return (
    <View style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps}>
      {isScreenBackground ? <NoiseOverlay /> : null}
      {children}
    </View>
  );
}
