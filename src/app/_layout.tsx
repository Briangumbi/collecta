import '@/global.css';

import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack, ThemeProvider as NavigationThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LockScreen } from '@/components/lock-screen';
import { AppLockProvider } from '@/contexts/app-lock-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { NotificationToastProvider } from '@/contexts/notification-toast-context';
import { useTheme, useThemeScheme } from '@/hooks/use-theme';
import { registerForPushNotifications } from '@/lib/notifications';
import { AppThemeProvider } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppThemeProvider>
          <NavThemeBridge>
            <AppLockProvider>
              <RootNavigator />
            </AppLockProvider>
          </NavThemeBridge>
        </AppThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

/** Resolves the active selected theme + mode into the nav library's Theme shape. */
function NavThemeBridge({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const scheme = useThemeScheme();

  const navTheme = useMemo<Theme>(
    () => ({
      dark: scheme === 'dark',
      colors: {
        primary: theme.primary,
        background: theme.background,
        card: theme.backgroundElement,
        text: theme.text,
        border: theme.border,
        notification: theme.danger,
      },
      fonts: {
        regular: { fontFamily: 'Manrope_500Medium', fontWeight: '500' },
        medium: { fontFamily: 'Manrope_600SemiBold', fontWeight: '600' },
        bold: { fontFamily: 'Manrope_700Bold', fontWeight: '700' },
        heavy: { fontFamily: 'Manrope_800ExtraBold', fontWeight: '800' },
      },
    }),
    [theme, scheme]
  );

  return <NavigationThemeProvider value={navTheme}>{children}</NavigationThemeProvider>;
}

function RootNavigator() {
  const { isLoading, session } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  useEffect(() => {
    if (session?.user.id) registerForPushNotifications(session.user.id);
  }, [session?.user.id]);

  if (isLoading) return null;

  return (
    <NotificationToastProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="upgrade"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Upgrade to Pro',
              headerStyle: { backgroundColor: theme.background },
              headerTintColor: theme.text,
              headerShadowVisible: false,
            }}
          />
        </Stack>
        <LockScreen />
      </View>
    </NotificationToastProvider>
  );
}
