import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function ClientsStackLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Clients' }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
