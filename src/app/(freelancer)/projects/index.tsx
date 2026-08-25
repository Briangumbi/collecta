import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { GlowBackground } from '@/components/glow-background';
import { IcoChevronRight } from '@/components/icons';
import { OfflineBanner } from '@/components/offline-banner';
import { PillActionButton } from '@/components/pill-action-button';
import { ProgressRing } from '@/components/progress-ring';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { useTheme } from '@/hooks/use-theme';
import { useThemeTokens } from '@/theme/ThemeProvider';
import { avatarColorFor } from '@/lib/avatar-colors';
import { formatDate } from '@/lib/format';
import { getProjects, type ProjectWithClient } from '@/lib/queries';
import type { ProjectStatus } from '@/types/database';

const GROUPS: { label: string; status: ProjectStatus }[] = [
  { label: 'Active', status: 'active' },
  { label: 'On Hold', status: 'on_hold' },
  { label: 'Completed', status: 'completed' },
];

/** on-hold is a fixed orange regardless of theme (matches the design reference), not tied to any theme token. */
function projectStatusColor(status: ProjectStatus, theme: { primary: string; success: string }) {
  if (status === 'completed') return theme.success;
  if (status === 'on_hold') return '#f97316';
  return theme.primary;
}

export default function ProjectsScreen() {
  const { profile } = useAuth();
  const theme = useTheme();
  const { radius, cardShadow } = useThemeTokens();
  const freelancerId = profile?.id ?? '';

  const { data, isLoading, isOffline, refetch } = useCachedQuery(`projects:${freelancerId}`, () => getProjects(freelancerId));

  const grouped = useMemo(() => {
    const projects = data ?? [];
    return GROUPS.map((g) => ({ ...g, items: projects.filter((p) => p.status === g.status) }));
  }, [data]);

  return (
    <ThemedView style={styles.flex}>
      <GlowBackground height={280} cy="-4%" r="70%" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <ScreenHeader title="Projects" action={<PillActionButton label="New" onPress={() => router.push('/(freelancer)/projects/new')} />} />

        <OfflineBanner visible={isOffline} />

        <View style={styles.summaryRow}>
          {grouped.map((g) => {
            const color = projectStatusColor(g.status, theme);
            return (
              <View
                key={g.status}
                style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderRadius: radius.card - 6 }, cardShadowStyle(cardShadow.color, cardShadow.opacity)]}
              >
                <View style={[styles.summaryDot, { backgroundColor: color }]} />
                <ThemedText type="title" style={styles.summaryValue}>
                  {g.items.length}
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  {g.label}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {grouped.map((group) =>
          group.items.length === 0 ? null : (
            <View key={group.status} style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={[styles.summaryDot, { backgroundColor: projectStatusColor(group.status, theme) }]} />
                <ThemedText type="label" themeColor="textSecondary" style={styles.groupTitle}>
                  {group.label} · {group.items.length}
                </ThemedText>
              </View>
              <View style={styles.list}>
                {group.items.map((project) => (
                  <ProjectCard key={project.id} project={project} color={projectStatusColor(project.status, theme)} />
                ))}
              </View>
            </View>
          )
        )}

        {!isLoading && (data?.length ?? 0) === 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
            No projects yet.
          </ThemedText>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

function ProjectCard({ project, color }: { project: ProjectWithClient; color: string }) {
  const theme = useTheme();
  const { radius, fonts, cardShadow } = useThemeTokens();
  const clientAccent = project.client ? avatarColorFor(project.client.id) : theme.textSecondary;
  const clientInitials = (project.client?.name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const statusLabel = project.status === 'on_hold' ? 'On Hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1);

  return (
    <Pressable onPress={() => router.push(`/(freelancer)/projects/${project.id}`)}>
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderRadius: radius.card, opacity: pressed ? 0.9 : 1 },
            cardShadowStyle(cardShadow.color, cardShadow.opacity),
          ]}
        >
          <View style={styles.ringWrap}>
            <ProgressRing pct={project.progress} color={color} size={52} />
            <View style={styles.ringLabel}>
              <ThemedText style={{ fontFamily: fonts.display, fontSize: 11, color }}>{project.progress}%</ThemedText>
            </View>
          </View>

          <View style={styles.info}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {project.title}
            </ThemedText>
            <View style={styles.metaRow}>
              <View style={[styles.clientChip, { backgroundColor: `${clientAccent}20` }]}>
                <ThemedText style={{ fontFamily: fonts.display, fontSize: 7, color: clientAccent }}>{clientInitials}</ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {project.client?.name ?? 'Unknown client'}
              </ThemedText>
              {project.deadline ? (
                <>
                  <View style={[styles.dot, { backgroundColor: theme.textSecondary }]} />
                  <ThemedText type="code" themeColor="textSecondary">
                    Due {formatDate(project.deadline)}
                  </ThemedText>
                </>
              ) : null}
            </View>

            <View style={[styles.progressTrack, { backgroundColor: theme.neutralBg }]}>
              <View style={[styles.progressFill, { width: `${project.progress}%`, backgroundColor: color }]} />
            </View>

            <View style={styles.footerRow}>
              <ThemedText type="code" themeColor="textSecondary">
                {project.milestonesDone}/{project.milestoneCount} milestones
              </ThemedText>
              <View style={[styles.statusPill, { backgroundColor: `${color}22`, borderRadius: 999 }]}>
                <ThemedText type="code" style={{ color }}>
                  {statusLabel}
                </ThemedText>
              </View>
            </View>
          </View>

          <IcoChevronRight color={theme.border} size={14} />
        </View>
      )}
    </Pressable>
  );
}

function cardShadowStyle(color: string, opacity: number) {
  return { shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: opacity, shadowRadius: 16, elevation: 3 };
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingBottom: 160,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    lineHeight: 30,
    marginBottom: 2,
  },
  group: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  groupTitle: {
    marginBottom: 0,
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    padding: 16,
  },
  ringWrap: {
    width: 52,
    height: 52,
  },
  ringLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  clientChip: {
    width: 16,
    height: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  progressTrack: {
    height: 3,
    borderRadius: 999,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});
