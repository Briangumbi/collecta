import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemePicker, useThemeTokens } from '@/theme/ThemeProvider';

/**
 * Selectable list of visual styles, each rendered as a small palette swatch
 * + name with the active one checked. Built as a list from the start (not a
 * toggle) so adding a Style 2 later is just another entry in the themes
 * array — no changes here.
 */
export function ThemePicker() {
  const theme = useTheme();
  const { radius } = useThemeTokens();
  const { themeId, availableThemes, setThemeId } = useThemePicker();

  return (
    <View style={styles.list}>
      {availableThemes.map((style) => {
        const active = style.id === themeId;
        return (
          <Pressable
            key={style.id}
            onPress={() => setThemeId(style.id)}
            disabled={availableThemes.length === 1}
            style={[
              styles.row,
              {
                borderRadius: radius.card,
                borderColor: active ? theme.primary : theme.border,
                backgroundColor: active ? theme.backgroundSelected : 'transparent',
              },
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: style.swatch.background, borderColor: theme.border }]}>
              <View style={[styles.swatchSurface, { backgroundColor: style.swatch.surface }]} />
              <View style={[styles.swatchAccent, { backgroundColor: style.swatch.accent }]} />
            </View>
            <ThemedText type="default" style={styles.name}>
              {style.name}
            </ThemedText>
            {active ? <Ionicons name="checkmark-circle" size={22} color={theme.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginRight: 12,
  },
  swatchSurface: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '65%',
    height: '65%',
    borderTopLeftRadius: 10,
  },
  swatchAccent: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  name: {
    flex: 1,
  },
});
