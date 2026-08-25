import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function currentWeek() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  return DAY_LABELS.map((label, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return { label, date: d.getDate(), isToday: d.toDateString() === today.toDateString() };
  });
}

/**
 * Purely a glanceable/interactive week strip — matches the reference, which
 * also doesn't wire the selected day to filter anything downstream.
 */
export function WeekDayStrip() {
  const theme = useTheme();
  const { radius, fonts, fontSize } = useThemeTokens();
  const week = useMemo(() => currentWeek(), []);
  const [activeDate, setActiveDate] = useState(() => week.find((d) => d.isToday)?.date ?? week[0].date);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {week.map(({ label, date }) => {
        const isActive = date === activeDate;
        return (
          <Pressable
            key={date}
            onPress={() => setActiveDate(date)}
            style={[
              styles.pill,
              {
                borderRadius: radius.pill,
                backgroundColor: isActive ? theme.primary : 'transparent',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isActive ? 0.4 : 0,
                shadowRadius: 20,
                elevation: isActive ? 6 : 0,
              },
            ]}
          >
            <ThemedText type="label" themeColor={isActive ? 'primaryText' : 'textSecondary'} style={styles.dayLabel}>
              {label}
            </ThemedText>
            <ThemedText
              style={{ fontFamily: fonts.display, fontSize: fontSize.default, color: isActive ? theme.primaryText : theme.textSecondary }}
            >
              {date}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
    paddingHorizontal: 20,
  },
  pill: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  dayLabel: {
    marginBottom: 0,
  },
});
