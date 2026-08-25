import { Pressable, StyleSheet } from 'react-native';

import { IcoPlus } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';

/** Small amber "+ Add"/"+ New" pill used in list-screen headers. */
export function PillActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  const { radius } = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderRadius: radius.pill, backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <IcoPlus color={theme.primaryText} size={14} />
      <ThemedText type="smallBold" themeColor="primaryText">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
});
