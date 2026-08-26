import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PrivacyPolicyScreen() {
  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.draftNotice}>
          Draft — last updated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
          This describes what Ledger actually does today; it hasn’t been reviewed by a lawyer, so have one look it
          over — and update the contact details below — before relying on it for a real launch.
        </ThemedText>

        <Section title="What Ledger is">
          Ledger is a client-portal app for freelancers: manage clients, projects, invoices, and messages in one
          place. Two roles share the same app — freelancers (full management) and clients (a scoped view of their
          own projects and invoices).
        </Section>

        <Section title="What we collect">
          <Bullet>Account info: name, email, and password (handled entirely by our authentication provider,
            Supabase — we never see or store your raw password).</Bullet>
          <Bullet>Business data you or your counterparty enter: clients, projects, milestones, invoices, messages,
            and file attachments you upload.</Bullet>
          <Bullet>A push notification token, only if you grant notification permission on a physical device — used
            solely to deliver alerts like a paid invoice or a new message.</Bullet>
          <Bullet>App preferences: your selected theme and notification toggle settings.</Bullet>
          <Bullet>Biometric unlock (Face ID / Touch ID), if you enable it, is verified entirely on your own device
            by the operating system — we never receive or store any biometric data ourselves.</Bullet>
        </Section>

        <Section title="What we don’t collect">
          <Bullet>Real payment or card details. Invoice payments in this app are simulated end-to-end for
            demonstration purposes — no card number is ever transmitted anywhere, and no real money moves.</Bullet>
          <Bullet>Location data, contacts, or anything from your device beyond what’s listed above.</Bullet>
        </Section>

        <Section title="Who can see your data">
          Every table in our database is protected by row-level security: a freelancer can only read their own
          clients, projects, and invoices, and a client can only read what a freelancer has shared with them
          directly. No other user of the app — freelancer or client — can query data that isn’t theirs, and we
          don’t sell or share your data with advertisers.
        </Section>

        <Section title="Who processes it on our behalf">
          <Bullet>Supabase — our database, authentication, file storage, and realtime infrastructure provider.</Bullet>
          <Bullet>Expo — delivers push notifications to your device, if enabled.</Bullet>
          <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
            These providers process data only to operate the app; we don’t use any advertising or analytics third
            parties.
          </ThemedText>
        </Section>

        <Section title="How long we keep it">
          For as long as your account is active. You can delete your account at any time from Settings — this
          permanently removes your profile and everything tied to it (see Terms of Service for exactly what
          cascades for each role).
        </Section>

        <Section title="Your rights">
          <Bullet>Access — view your data any time in the app.</Bullet>
          <Bullet>Correction — edit your profile directly in Settings.</Bullet>
          <Bullet>Deletion — permanently delete your account and data from Settings → Privacy & Data.</Bullet>
          <Bullet>Portability — contact us (below) and we’ll help you export your data.</Bullet>
        </Section>

        <Section title="Children">
          Ledger is a business tool and isn’t directed at children; we don’t knowingly collect data from anyone
          under 16.
        </Section>

        <Section title="Changes to this policy">
          If this policy changes, we’ll update the date at the top of this page.
        </Section>

        <Section title="Contact">
          Questions about this policy or your data — [add your support email here].
        </Section>
      </ScrollView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {typeof children === 'string' ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
          {children}
        </ThemedText>
      ) : (
        <View style={styles.bulletList}>{children}</View>
      )}
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <ThemedText type="small" themeColor="textSecondary">
        •
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.bulletText}>
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  draftNotice: {
    marginBottom: 24,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  body: {
    lineHeight: 20,
  },
  bulletList: {
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },
});
