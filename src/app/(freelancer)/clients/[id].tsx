import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { InvoiceStatusBadge, ProjectStatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/lib/format';
import { getClientDetail } from '@/lib/queries';
import type { Invoice, Profile, Project } from '@/types/database';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getClientDetail(id).then((result) => {
      setProfile(result.profile);
      setProjects(result.projects);
      setInvoices(result.invoices);
      setLoading(false);
    });
  }, [id]);

  if (loading || !profile) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar name={profile.name} size={64} />
          <ThemedText type="title" style={styles.name}>
            {profile.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {profile.email}
          </ThemedText>
        </View>

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Projects
        </ThemedText>
        {projects.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No projects yet.
          </ThemedText>
        ) : (
          projects.map((project) => (
            <Pressable key={project.id} onPress={() => router.push(`/(freelancer)/projects/${project.id}`)}>
              <Card style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <ThemedText type="smallBold">{project.title}</ThemedText>
                  <ProjectStatusBadge status={project.status} />
                </View>
              </Card>
            </Pressable>
          ))
        )}

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Invoice history
        </ThemedText>
        {invoices.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No invoices yet.
          </ThemedText>
        ) : (
          invoices.map((invoice) => (
            <Pressable key={invoice.id} onPress={() => router.push(`/(freelancer)/invoices/${invoice.id}`)}>
              <Card style={styles.listCard}>
                <View style={styles.listCardHeader}>
                  <ThemedText type="smallBold">{formatCurrency(Number(invoice.amount), invoice.currency)}</ThemedText>
                  <InvoiceStatusBadge status={invoice.status} />
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Due {formatDate(invoice.due_date)}
                </ThemedText>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  name: {
    fontSize: 24,
    lineHeight: 30,
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 10,
    marginTop: 8,
  },
  listCard: {
    marginBottom: 10,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
