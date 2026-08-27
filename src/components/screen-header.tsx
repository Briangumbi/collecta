import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeTokens } from '@/theme/ThemeProvider';

/** "COLLECTA" eyebrow + large serif title, optionally with a trailing action (e.g. an Add/New pill). */
export function ScreenHeader({ title, action }: { title: string; action?: ReactNode }) {
  const { fonts } = useThemeTokens();
  return (
    <View style={styles.row}>
      <View>
        <ThemedText type="label" themeColor="textSecondary" style={styles.eyebrow}>
          Collecta
        </ThemedText>
        <ThemedText style={{ fontFamily: fonts.displayHeavy, fontSize: 30, lineHeight: 33 }}>{title}</ThemedText>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  eyebrow: {
    marginBottom: 4,
  },
});
