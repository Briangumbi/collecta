import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

/** Active tab reads as lit up — a soft amber halo behind the icon, not just a recolor. */
export function TabBarIcon({
  name,
  focused,
  color,
  size,
}: {
  name: IconName;
  focused: boolean;
  color: ColorValue;
  size: number;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        focused && {
          backgroundColor: theme.backgroundSelected,
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
        },
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
