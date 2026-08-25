import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Flat pill toggle (not the native OS switch) — matches the design reference's custom control. */
export function ToggleSwitch({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      style={[
        styles.track,
        {
          backgroundColor: value ? theme.primary : theme.neutralBg,
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: value ? 0.4 : 0,
          shadowRadius: 10,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <View style={[styles.knob, { left: value ? 21 : 3, backgroundColor: value ? theme.primaryText : theme.textSecondary }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
  },
  knob: {
    position: 'absolute',
    top: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
