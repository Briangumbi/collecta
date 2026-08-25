import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';

/**
 * Purely decorative "virtual card" mock — reflects the simulated form fields
 * live. Deliberately always dark plastic regardless of app theme/mode (like
 * a real card mockup, not UI chrome) — only the accent chip is theme-driven.
 */
export function VirtualCardPreview({ name, number, expiry }: { name: string; number: string; expiry: string }) {
  const theme = useTheme();
  const { shadows } = useThemeTokens();

  const displayNumber = (number || '•••• •••• •••• ••••').padEnd(19, '•').slice(0, 19);
  const displayName = name || 'YOUR NAME';
  const displayExpiry = expiry || 'MM/YY';

  return (
    <View
      style={[
        styles.shadowWrap,
        {
          shadowColor: shadows.virtualCard.color,
          shadowOffset: shadows.virtualCard.offset,
          shadowOpacity: shadows.virtualCard.opacity,
          shadowRadius: shadows.virtualCard.radius,
          elevation: shadows.virtualCard.elevation,
        },
      ]}
    >
      <LinearGradient colors={['#242428', '#131315']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <LinearGradient colors={['#FFFFFF1A', '#FFFFFF00']} style={styles.sheen} pointerEvents="none" />
        <View style={styles.topRow}>
          <View style={[styles.chip, { backgroundColor: `${theme.primary}55`, borderColor: `${theme.primary}88` }]} />
          <Ionicons name="wifi" size={18} color="#F5F5F399" style={styles.contactless} />
        </View>
        <ThemedText style={styles.number}>{displayNumber}</ThemedText>
        <View style={styles.bottomRow}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {displayName.toUpperCase()}
          </ThemedText>
          <ThemedText style={styles.expiry}>{displayExpiry}</ThemedText>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 20,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    height: 180,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chip: {
    width: 36,
    height: 26,
    borderRadius: 5,
    borderWidth: 1,
  },
  contactless: {
    transform: [{ rotate: '90deg' }],
  },
  number: {
    color: '#F5F5F3',
    fontSize: 20,
    letterSpacing: 2,
    fontFamily: 'Outfit_600SemiBold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  name: {
    color: '#F5F5F3CC',
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: 'Outfit_600SemiBold',
    flex: 1,
    marginRight: 12,
  },
  expiry: {
    color: '#F5F5F3CC',
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
  },
});
