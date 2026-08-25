import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { GlowBackground } from '@/components/glow-background';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { springs } from '@/animations/easing';
import { useTheme } from '@/hooks/use-theme';

interface PaymentSuccessOverlayProps {
  title?: string;
  message: string;
  onDone: () => void;
}

export function PaymentSuccessOverlay({ title = 'Payment successful', message, onDone }: PaymentSuccessOverlayProps) {
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
      <GlowBackground width={480} height={480} cy="42%" r="55%" />
      <Animated.View
        style={[
          styles.glowRing,
          { shadowColor: theme.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 24 },
          circleStyle,
        ]}
      >
        <View style={[styles.circle, { backgroundColor: theme.successBg, borderColor: theme.border }]}>
          <Ionicons name="checkmark" size={56} color={theme.success} />
        </View>
      </Animated.View>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
        {message}
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
  glowRing: {
    marginBottom: 24,
  },
  circle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
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
