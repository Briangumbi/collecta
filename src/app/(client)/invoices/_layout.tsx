import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function ClientInvoicesStackLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Invoices' }} />
      <Stack.Screen name="[id]/index" options={{ title: '' }} />
      <Stack.Screen name="[id]/pay" options={{ title: 'Pay Invoice', presentation: 'modal' }} />
    </Stack>
  );
}
