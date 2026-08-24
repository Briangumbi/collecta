import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { springs } from '@/animations/easing';
import { useTheme } from '@/hooks/use-theme';

export function PaymentSuccessOverlay({ amountLabel, onDone }: { amountLabel: string; onDone: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSpring(1, springs.successPop);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [opacity, scale]);

  const circleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.circle, { backgroundColor: theme.successBg }, circleStyle]}>
        <Ionicons name="checkmark" size={56} color={theme.success} />
      </Animated.View>
      <ThemedText type="title" style={styles.title}>
        Payment successful
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
        {amountLabel} sent
      </ThemedText>
      <View style={styles.buttonWrap}>
        <PrimaryButton label="Done" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 1500,
  },
  circle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 36,
  },
  buttonWrap: {
    width: '100%',
  },
});
