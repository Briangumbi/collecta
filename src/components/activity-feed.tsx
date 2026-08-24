import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { getActivityFeed } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-theme';
import type { ActivityEvent } from '@/types/database';

const ICONS: Record<ActivityEvent['type'], string> = {
  invoice_paid: '💰',
  invoice_sent: '📤',
  new_message: '💬',
  project_created: '📁',
  milestone_complete: '✅',
};

export function ActivityFeed({ freelancerId }: { freelancerId: string }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const theme = useTheme();

  useEffect(() => {
    let mounted = true;
    getActivityFeed(freelancerId).then((data) => {
      if (mounted) setEvents(data);
    });

    const channel = supabase
      .channel(`activity:${freelancerId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_events', filter: `freelancer_id=eq.${freelancerId}` },
        (payload) => {
          setEvents((prev) => [payload.new as ActivityEvent, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [freelancerId]);

  if (events.length === 0) {
    return (
      <Card>
        <ThemedText type="small" themeColor="textSecondary">
          No activity yet.
        </ThemedText>
      </Card>
    );
  }

  return (
    <View>
      {events.map((event) => (
        <Animated.View key={event.id} entering={FadeInDown.duration(360)} exiting={FadeOutUp.duration(220)} style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText>{ICONS[event.type] ?? '•'}</ThemedText>
          </View>
          <View style={styles.textWrap}>
            <ThemedText type="smallBold">{event.title}</ThemedText>
            {event.subtitle ? (
              <ThemedText type="small" themeColor="textSecondary">
                {event.subtitle}
              </ThemedText>
            ) : null}
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
});
