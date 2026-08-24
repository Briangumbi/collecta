import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PrimaryButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({ label, loading, variant = 'primary', disabled, ...rest }: PrimaryButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? theme.primary : theme.backgroundSelected,
          borderWidth: isPrimary ? 0 : StyleSheet.hairlineWidth,
          borderColor: theme.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
      {...rest}
    >
      {/* Subtle top-edge highlight for a glassy, tactile quality — primary only. */}
      {isPrimary ? (
        <LinearGradient
          colors={['#FFFFFF40', '#FFFFFF00']}
          style={styles.highlight}
          pointerEvents="none"
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.primaryText : theme.text} />
      ) : (
        <ThemedText type="smallBold" themeColor={isPrimary ? 'primaryText' : 'text'}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Radius.pill,
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
