import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarIcon } from '@/components/tab-bar-icon';
import { Radius } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function ClientLayout() {
  const { session, profile } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!session) return <Redirect href="/(auth)/login" />;
  if (profile && profile.role !== 'client') return <Redirect href="/(freelancer)/dashboard" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: insets.bottom + 16,
          height: 64,
          borderRadius: Radius.pill,
          borderTopWidth: 0,
          backgroundColor: theme.backgroundElement,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarItemStyle: { height: 64, paddingTop: 0 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ size, focused }) => <TabBarIcon name="home" size={size} focused={focused} /> }}
      />
      <Tabs.Screen
        name="invoices"
        options={{ title: 'Invoices', tabBarIcon: ({ size, focused }) => <TabBarIcon name="receipt" size={size} focused={focused} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, focused }) => <TabBarIcon name="chatbubbles" size={size} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, focused }) => <TabBarIcon name="settings-sharp" size={size} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
