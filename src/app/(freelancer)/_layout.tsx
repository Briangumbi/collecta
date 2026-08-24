import { Redirect, Tabs } from 'expo-router';

import { TabBarIcon } from '@/components/tab-bar-icon';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function FreelancerLayout() {
  const { session, profile } = useAuth();
  const theme = useTheme();

  if (!session) return <Redirect href="/(auth)/login" />;
  if (profile && profile.role !== 'freelancer') return <Redirect href="/(client)/home" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.backgroundElement, borderTopColor: theme.border },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => <TabBarIcon name="home" size={size} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, size, focused }) => <TabBarIcon name="people" size={size} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ color, size, focused }) => <TabBarIcon name="receipt" size={size} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size, focused }) => <TabBarIcon name="briefcase" size={size} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon name="settings-sharp" size={size} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
