import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { GlowBackground } from '@/components/glow-background';
import { LogoMark } from '@/components/logo-mark';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { duration, easing } from '@/animations/easing';
import { useAppLock } from '@/contexts/app-lock-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

type Phase = 'hidden' | 'locked' | 'revealing';

export function LockScreen() {
  const { session } = useAuth();
  const { isBiometricEnabled, isLocked, unlock, isReady } = useAppLock();
  const theme = useTheme();

  const active = isReady && !!session && isBiometricEnabled;
  const [phase, setPhase] = useState<Phase>(active && isLocked ? 'locked' : 'hidden');
  const [lastError, setLastError] = useState<string | null>(null);

  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const attemptUnlock = useCallback(async () => {
    setLastError(null);
    const result = await unlock();
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (result.error) {
      setLastError('Unlock failed — try again.');
    }
  }, [unlock]);

  useEffect(() => {
    if (!active) return;
    if (isLocked) {
      opacity.value = 1;
      scale.value = 1;
      setLastError(null);
      setPhase('locked');
    } else {
      setPhase((prev) => (prev === 'locked' ? 'revealing' : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isLocked]);

  useEffect(() => {
    if (phase !== 'revealing') return;
    opacity.value = withTiming(0, { duration: duration.reveal, easing: easing.standard }, (finished) => {
      'worklet';
      if (finished) scheduleOnRN(setPhase, 'hidden');
    });
    scale.value = withTiming(1.04, { duration: duration.reveal, easing: easing.standard });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === 'locked') {
      attemptUnlock();
    }
  }, [phase, attemptUnlock]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!active || phase === 'hidden') return null;

  return (
    <Animated.View
      style={[styles.overlay, { backgroundColor: theme.background }, animatedStyle]}
      pointerEvents={phase === 'locked' ? 'auto' : 'none'}
    >
      <GlowBackground width={420} height={420} cy="38%" r="55%" />
      <View style={styles.center}>
        <View style={styles.markWrap}>
          <LogoMark size={72} />
        </View>
        <ThemedText type="subtitle" style={styles.title}>
          Collecta
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
          Unlock to view your dashboard
        </ThemedText>
        {lastError ? (
          <ThemedText type="small" themeColor="danger" style={styles.error}>
            {lastError}
          </ThemedText>
        ) : null}
        <View style={styles.buttonWrap}>
          <PrimaryButton label="Unlock with Face ID" onPress={attemptUnlock} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  markWrap: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {
    marginBottom: 28,
    textAlign: 'center',
  },
  error: {
    marginBottom: 16,
  },
  buttonWrap: {
    width: '100%',
  },
});
