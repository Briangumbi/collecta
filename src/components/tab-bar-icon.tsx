import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Active tab reads as lit up — a solid near-white circle with a dark icon,
 * not a recolored icon on a translucent background. Deliberately neutral
 * rather than accent-colored: the accent is reserved for a handful of hero
 * moments, not chrome that's on screen at all times. Ignores the tint color
 * the navigator would otherwise pass in, since both states need a fixed,
 * theme-driven color regardless of that.
 */
export function TabBarIcon({ name, focused, size }: { name: IconName; focused: boolean; size: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        focused && {
          backgroundColor: theme.text,
          shadowColor: theme.text,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
      ]}
    >
      <Ionicons name={name} size={size} color={focused ? theme.background : theme.textSecondary} />
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
