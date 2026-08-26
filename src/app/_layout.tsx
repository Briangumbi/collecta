import '@/global.css';

import { DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, Outfit_900Black, useFonts } from '@expo-google-fonts/outfit';
import { Stack, ThemeProvider as NavigationThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LockScreen } from '@/components/lock-screen';
import { AppLockProvider } from '@/contexts/app-lock-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { NotificationToastProvider } from '@/contexts/notification-toast-context';
import { useTheme, useThemeScheme } from '@/hooks/use-theme';
import { registerForPushNotifications } from '@/lib/notifications';
import { AppThemeProvider } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

// On web, a phone-shaped app stretched full-bleed across a wide browser
// window reads as a website, not a mobile app — so on web (only; native is
// already phone-width) the whole app is framed to a fixed phone-sized
// column, centered, matching the design reference exactly.
const WEB_FRAME_MAX_WIDTH = 430;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_900Black,
    DMMono_500Medium,
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
        regular: { fontFamily: 'Outfit_400Regular', fontWeight: '400' },
        medium: { fontFamily: 'Outfit_600SemiBold', fontWeight: '600' },
        bold: { fontFamily: 'Outfit_700Bold', fontWeight: '700' },
        heavy: { fontFamily: 'Outfit_900Black', fontWeight: '900' },
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
    <View style={[styles.webFrameOuter, Platform.OS === 'web' && { backgroundColor: theme.background }]}>
      <View style={styles.webFrameInner}>
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
              <Stack.Screen
                name="privacy-policy"
                options={{
                  headerShown: true,
                  title: 'Privacy Policy',
                  headerStyle: { backgroundColor: theme.background },
                  headerTintColor: theme.text,
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="terms"
                options={{
                  headerShown: true,
                  title: 'Terms of Service',
                  headerStyle: { backgroundColor: theme.background },
                  headerTintColor: theme.text,
                  headerShadowVisible: false,
                }}
              />
            </Stack>
            <LockScreen />
          </View>
        </NotificationToastProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webFrameOuter: Platform.OS === 'web' ? { flex: 1, alignItems: 'center' } : { flex: 1 },
  webFrameInner: Platform.OS === 'web' ? { flex: 1, width: '100%', maxWidth: WEB_FRAME_MAX_WIDTH } : { flex: 1 },
});
