import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function TermsScreen() {
  return (
    <ThemedView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.draftNotice}>
          Draft — last updated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
          Have a lawyer review this before relying on it for a real launch.
        </ThemedText>

        <Section title="Using Collecta">
          By creating an account you agree to these terms. You’re responsible for the accuracy of what you enter —
          client details, invoice amounts, project information — and for keeping your login credentials secure.
        </Section>

        <Section title="Two roles, two scopes">
          <Bullet>Freelancers can create and manage their own clients, projects, invoices, and messages.</Bullet>
          <Bullet>Clients get a read-only view of the projects and invoices a freelancer has shared with them,
            plus the ability to send messages and pay invoices.</Bullet>
          <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
            A freelancer account must not misrepresent who a client is, and shouldn’t add someone as a client
            without their knowledge.
          </ThemedText>
        </Section>

        <Section title="Payments are simulated">
          Invoice “payments” in this app are simulated end-to-end for demonstration purposes. No real payment
          processor is connected, no card data is ever transmitted, and no real money changes hands. Don’t rely on
          this app to actually collect real payment from a real client.
        </Section>

        <Section title="Acceptable use">
          <Bullet>Don’t use Collecta to store or transmit anything illegal, or to harass or impersonate someone.</Bullet>
          <Bullet>Don’t attempt to access another user’s data or bypass the app’s security controls.</Bullet>
          <Bullet>Don’t use the service in a way that could disrupt it for other users.</Bullet>
        </Section>

        <Section title="Your data, your account">
          <ThemedText type="small" themeColor="textSecondary" style={styles.body}>
            You can edit your profile at any time, and delete your account permanently from Settings → Privacy &
            Data. Deleting your account is irreversible:
          </ThemedText>
          <Bullet>If you’re a freelancer, this removes your profile and everything you own — your client links,
            projects, invoices, milestones, messages, and attachments. Your clients’ own accounts aren’t affected.
          </Bullet>
          <Bullet>If you’re a client, this removes your profile, and also removes the projects and invoices your
            freelancer created specifically for you (they’re keyed to your account) — your freelancer keeps
            everything else.
          </Bullet>
        </Section>

        <Section title="No warranty">
          Collecta is provided “as is.” We don’t guarantee it will be uninterrupted, error-free, or fit for any
          particular purpose — this is a portfolio/demonstration project, not a production financial service.
        </Section>

        <Section title="Changes">
          We may update these terms as the app changes; the date at the top will reflect the latest revision.
        </Section>

        <Section title="Contact">
          Questions about these terms — [add your support email here].
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
        <View style={styles.mixedBody}>{children}</View>
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
  mixedBody: {
    gap: 8,
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
