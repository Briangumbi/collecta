import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';

interface PrimaryButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({ label, loading, variant = 'primary', disabled, ...rest }: PrimaryButtonProps) {
  const theme = useTheme();
  const { radius, buttonHighlight } = useThemeTokens();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          borderRadius: radius.pill,
          // Primary reads as a neutral, near-white "elevated chip" rather than
          // a solid wash of the accent color — the accent is reserved for a
          // handful of hero moments (the balance card, the chart line), not
          // every button on screen.
          backgroundColor: isPrimary ? theme.text : theme.backgroundSelected,
          borderWidth: isPrimary ? 0 : StyleSheet.hairlineWidth,
          borderColor: theme.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
      {...rest}
    >
      {/* Subtle top-edge highlight for a glassy, tactile quality — primary only. */}
      {isPrimary ? <LinearGradient colors={buttonHighlight} style={styles.highlight} pointerEvents="none" /> : null}
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.background : theme.text} />
      ) : (
        <ThemedText type="smallBold" themeColor={isPrimary ? 'background' : 'text'}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 22,
  },
});
