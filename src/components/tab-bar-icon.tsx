import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Active tab reads as lit up — a solid lime circle with a dark icon, not a
 * recolored icon on a translucent background. Ignores the tint color the
 * navigator would otherwise pass in, since both states need a fixed,
 * theme-driven color regardless of that.
 */
export function TabBarIcon({ name, focused, size }: { name: IconName; focused: boolean; size: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        focused && {
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 10,
        },
      ]}
    >
      <Ionicons name={name} size={size} color={focused ? theme.primaryText : theme.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
