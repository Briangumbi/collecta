import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Profile } from '@/types/database';

export function ClientPicker({
  clients,
  selectedId,
  onSelect,
}: {
  clients: Profile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {clients.map((client) => {
        const selected = client.id === selectedId;
        return (
          <Pressable
            key={client.id}
            onPress={() => onSelect(client.id)}
            style={[
              styles.chip,
              { borderColor: selected ? theme.primary : theme.border, backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement },
            ]}
          >
            <Avatar name={client.name} url={client.avatar_url} size={24} />
            <ThemedText type="small" themeColor={selected ? 'primary' : 'text'} style={styles.chipLabel}>
              {client.name}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  chipLabel: {
    marginRight: 2,
  },
});
