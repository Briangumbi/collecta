import { View, type ViewProps } from 'react-native';

import { NoiseOverlay } from '@/components/noise-overlay';
import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
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
