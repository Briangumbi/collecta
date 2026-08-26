import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'] as const;

/** Formats a raw "1234.5" entry string with thousands separators on the integer part, preserving what's typed of the decimal. */
function formatDisplay(raw: string) {
  if (!raw) return '0';
  const [whole, decimal] = raw.split('.');
  const withCommas = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? `${withCommas}.${decimal}` : withCommas;
}

/**
 * Big-digit tap-to-enter amount input, in place of the OS keyboard — a raw
 * numeric string in, out (e.g. "1250.5"), same shape a plain <TextInput
 * keyboardType="decimal-pad"> would produce, so it's a drop-in swap.
 */
export function NumberPad({ value, onChange, currencySymbol }: { value: string; onChange: (next: string) => void; currencySymbol: string }) {
  const theme = useTheme();
  const { radius, fonts } = useThemeTokens();

  const press = (key: (typeof KEYS)[number]) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (value.includes('.')) return;
      onChange(value ? `${value}.` : '0.');
      return;
    }
    // Cap at 2 decimal places.
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1 && value.length - decimalIndex > 2) return;
    // Replace a bare leading "0" rather than producing "01".
    const next = value === '0' ? key : value + key;
    onChange(next);
  };

  return (
    <View>
      <View style={styles.display}>
        <ThemedText style={{ fontFamily: fonts.display, fontSize: 22, color: theme.textSecondary, marginTop: 6 }}>{currencySymbol}</ThemedText>
        <ThemedText style={{ fontFamily: fonts.displayHeavy, fontSize: 48, letterSpacing: -1, color: theme.text }} numberOfLines={1} adjustsFontSizeToFit>
          {formatDisplay(value)}
        </ThemedText>
      </View>

      <View style={styles.grid}>
        {KEYS.map((key) => (
          <Pressable
            key={key}
            onPress={() => press(key)}
            style={({ pressed }) => [
              styles.key,
              { borderRadius: radius.card - 4, backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ThemedText type="title" style={styles.keyLabel}>
              {key}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  display: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  key: {
    width: '31%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: {
    fontSize: 22,
  },
});
