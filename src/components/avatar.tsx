import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function Avatar({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) {
  const theme = useTheme();
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.backgroundSelected },
      ]}
    >
      <ThemedText type="smallBold" themeColor="primary" style={{ fontSize: size * 0.36 }}>
        {initials}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#00000010',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
