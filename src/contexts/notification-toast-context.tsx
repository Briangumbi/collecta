import * as Notifications from 'expo-notifications';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';

interface ToastData {
  id: number;
  title: string;
  body: string;
}

const NotificationToastContext = createContext(null);

export function NotificationToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const theme = useTheme();
  const { shadows } = useThemeTokens();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      setToast({ id: Date.now(), title: title ?? 'Collecta', body: body ?? '' });

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToast(null), 4000);
    });

    return () => subscription.remove();
  }, []);

  return (
    <NotificationToastContext.Provider value={null}>
      {children}
      {toast ? (
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          <Animated.View
            entering={FadeInUp.duration(320)}
            exiting={FadeOutUp.duration(220)}
            style={[
              styles.toast,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
                shadowColor: shadows.toast.color,
                shadowOpacity: shadows.toast.opacity,
                shadowRadius: shadows.toast.radius,
                shadowOffset: shadows.toast.offset,
                elevation: shadows.toast.elevation,
              },
            ]}
          >
            <Pressable onPress={() => setToast(null)}>
              <ThemedText type="smallBold">{toast.title}</ThemedText>
              {toast.body ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {toast.body}
                </ThemedText>
              ) : null}
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      ) : null}
    </NotificationToastContext.Provider>
  );
}

export function useNotificationToast() {
  return useContext(NotificationToastContext);
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
  },
  toast: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
