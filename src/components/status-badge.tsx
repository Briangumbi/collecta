import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { InvoiceStatusColor, ProjectStatusColor } from '@/constants/status-colors';
import { useTheme } from '@/hooks/use-theme';
import type { ThemeColorKey } from '@/theme/tokens';
import type { InvoiceStatus, ProjectStatus } from '@/types/database';

const LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
  pending: 'Pending',
  complete: 'Complete',
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { fg, bg } = InvoiceStatusColor[status];
  return <Badge label={LABELS[status]} fg={fg} bg={bg} />;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { fg, bg } = ProjectStatusColor[status];
  return <Badge label={LABELS[status]} fg={fg} bg={bg} />;
}

function Badge({ label, fg, bg }: { label: string; fg: ThemeColorKey; bg: ThemeColorKey }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme[bg] }]}>
      <ThemedText type="smallBold" themeColor={fg} style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
});
