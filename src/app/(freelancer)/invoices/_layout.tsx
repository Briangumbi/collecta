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
      <Stack.Screen name="index" options={{ title: 'Invoices' }} />
      <Stack.Screen name="new" options={{ title: 'New Invoice', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: '' }} />
    </Stack>
  );
}
