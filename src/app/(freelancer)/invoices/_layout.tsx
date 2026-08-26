import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function InvoicesStackLayout() {
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
      <Stack.Screen name="new" options={{ title: 'New Invoice', presentation: 'modal' }} />
      <Stack.Screen name="recurring" options={{ title: 'Recurring Invoices' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
