import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LockScreen } from '@/components/lock-screen';
import { AppLockProvider } from '@/contexts/app-lock-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { NotificationToastProvider } from '@/contexts/notification-toast-context';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { registerForPushNotifications } from '@/lib/notifications';

SplashScreen.preventAutoHideAsync();

const navDarkTheme: Theme = {
  dark: true,
  colors: {
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.backgroundElement,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.danger,
  },
  fonts: {
    regular: { fontFamily: 'Manrope_500Medium', fontWeight: '500' },
    medium: { fontFamily: 'Manrope_600SemiBold', fontWeight: '600' },
    bold: { fontFamily: 'Manrope_700Bold', fontWeight: '700' },
    heavy: { fontFamily: 'Manrope_800ExtraBold', fontWeight: '800' },
  },
};

const navLightTheme: Theme = {
  dark: false,
  colors: {
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.backgroundElement,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.danger,
  },
  fonts: navDarkTheme.fonts,
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? navDarkTheme : navLightTheme}>
        <AuthProvider>
          <AppLockProvider>
            <RootNavigator />
          </AppLockProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
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
