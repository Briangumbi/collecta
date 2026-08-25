export type UserRole = 'freelancer' | 'client';

export type ProjectStatus = 'active' | 'completed' | 'on_hold';
export type MilestoneStatus = 'pending' | 'complete';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type AttachmentType = 'deliverable' | 'receipt';
export type SubscriptionPlan = 'free' | 'pro';

export interface NotificationPrefs {
  invoicePaid: boolean;
  paymentReminders: boolean;
  weeklyReport: boolean;
  projectUpdates: boolean;
  marketing: boolean;
}

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  avatar_url: string | null;
  email: string;
  push_token: string | null;
  /** Selected visual style ID (see src/theme/themes) — freelancer-only setting, defaults to 'amber-noir'. */
  theme: string;
  /** Freelancer-only setting; defaults set in db/schema.sql. */
  notification_prefs: NotificationPrefs;
  created_at: string;
}

export interface FreelancerClient {
  id: string;
  freelancer_id: string;
  client_id: string;
  created_at: string;
}

export interface Project {
  id: string;
  freelancer_id: string;
  client_id: string;
  title: string;
  status: ProjectStatus;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  status: MilestoneStatus;
  due_date: string | null;
}

export interface Invoice {
  id: string;
  freelancer_id: string;
  client_id: string;
  project_id: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  payment_ref: string | null;
  payment_transaction_id: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  project_id: string;
  uploaded_by: string;
  file_url: string;
  type: AttachmentType;
  created_at: string;
}

export interface Subscription {
  id: string;
  freelancer_id: string;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: string;
  current_period_end: string | null;
}

export interface ActivityEvent {
  id: string;
  freelancer_id: string;
  type: 'invoice_paid' | 'invoice_sent' | 'new_message' | 'project_created' | 'milestone_complete';
  title: string;
  subtitle: string | null;
  created_at: string;
}

// Not wired into the Supabase client — see the note in `@/lib/supabase` for why.
// Kept here as the source of truth for casting query results in `@/lib/queries`,
// and as a starting point if you later swap in `supabase gen types typescript`.
export interface Database {
  profiles: Profile;
  freelancer_clients: FreelancerClient;
  projects: Project;
  milestones: Milestone;
  invoices: Invoice;
  messages: Message;
  attachments: Attachment;
  subscriptions: Subscription;
  activity_events: ActivityEvent;
}
