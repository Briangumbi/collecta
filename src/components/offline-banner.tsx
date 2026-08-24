import Animated, { Easing, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function OfflineBanner({ visible }: { visible: boolean }) {
  const theme = useTheme();
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(320).easing(Easing.out(Easing.cubic))}
      exiting={FadeOutUp.duration(220)}
      style={[styles.banner, { backgroundColor: theme.warningBg, borderColor: theme.border }]}
    >
      <ThemedText type="small" themeColor="warning">
        Offline — showing cached data
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
});
