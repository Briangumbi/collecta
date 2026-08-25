import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemePicker, useThemeTokens } from '@/theme/ThemeProvider';

/**
 * Row of style cards, each a small live-palette preview + name, active one
 * checked. A row (not a vertical list) so it reads as a quick visual compare
 * — matches the design reference's theme switcher exactly.
 */
export function ThemePicker() {
  const theme = useTheme();
  const { radius } = useThemeTokens();
  const { themeId, availableThemes, setThemeId } = useThemePicker();

  return (
    <View style={styles.row}>
      {availableThemes.map((style) => {
        const active = style.id === themeId;
        const previewColors = style.modes.dark.colors;
        return (
          <Pressable
            key={style.id}
            onPress={() => setThemeId(style.id)}
            style={[
              styles.card,
              {
                borderRadius: radius.card - 4,
                borderColor: active ? theme.primary : theme.border,
                backgroundColor: active ? theme.warningBg : theme.backgroundElement,
              },
            ]}
          >
            <View style={[styles.preview, { backgroundColor: style.swatch.background, borderColor: theme.border }]}>
              <View style={[styles.previewBar, { backgroundColor: previewColors.text, opacity: 0.7 }]} />
              <View style={[styles.previewAccent, { backgroundColor: style.swatch.accent }]} />
            </View>
            <ThemedText type="small" style={{ color: active ? theme.primary : theme.text, fontWeight: active ? '600' : '400' }} numberOfLines={1}>
              {style.name}
            </ThemedText>
            {active ? (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Ionicons name="checkmark" size={10} color={theme.primaryText} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    borderWidth: 1.5,
    padding: 10,
  },
  preview: {
    height: 36,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
    overflow: 'hidden',
  },
  previewBar: {
    position: 'absolute',
    top: 8,
    left: 6,
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  previewAccent: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    height: 4,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
