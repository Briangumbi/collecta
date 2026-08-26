import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function SettingsStackLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="email-password" options={{ title: 'Email & Password' }} />
      <Stack.Screen name="privacy-data" options={{ title: 'Privacy & Data' }} />
      <Stack.Screen name="currency" options={{ title: 'Default Currency' }} />
    </Stack>
  );
}
