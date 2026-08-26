import { supabase } from '@/lib/supabase';
import type {
  ActivityEvent,
  Attachment,
  Invoice,
  InvoiceTemplate,
  Message,
  Milestone,
  Profile,
  Project,
  RecurringInterval,
  Subscription,
} from '@/types/database';

// ---------------------------------------------------------------------------
// Freelancer — dashboard
// ---------------------------------------------------------------------------

export interface DashboardSummary {
  outstandingTotal: number;
  outstandingInvoiceCount: number;
  outstandingClientCount: number;
  overdueInvoiceCount: number;
  activeProjectCount: number;
  paidThisMonth: number;
  revenueByMonth: { month: string; total: number }[];
}

export async function getDashboardSummary(freelancerId: string): Promise<DashboardSummary> {
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('amount, status, paid_at, client_id')
    .eq('freelancer_id', freelancerId);
  if (invoicesError) throw invoicesError;

  const { count: activeProjectCount, error: projectsError } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('freelancer_id', freelancerId)
    .eq('status', 'active');
  if (projectsError) throw projectsError;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let outstandingTotal = 0;
  let outstandingInvoiceCount = 0;
  let overdueInvoiceCount = 0;
  const outstandingClientIds = new Set<string>();
  let paidThisMonth = 0;
  const monthTotals = new Map<string, number>();

  for (const inv of invoices ?? []) {
    if (inv.status === 'sent' || inv.status === 'overdue') {
      outstandingTotal += Number(inv.amount);
      outstandingInvoiceCount += 1;
      outstandingClientIds.add(inv.client_id);
      if (inv.status === 'overdue') overdueInvoiceCount += 1;
    }
    if (inv.status === 'paid' && inv.paid_at) {
      const paidDate = new Date(inv.paid_at);
      if (paidDate >= startOfMonth) paidThisMonth += Number(inv.amount);

      const key = `${paidDate.getFullYear()}-${paidDate.getMonth()}`;
      monthTotals.set(key, (monthTotals.get(key) ?? 0) + Number(inv.amount));
    }
  }

  const revenueByMonth = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    return { month: d.toLocaleDateString('en-US', { month: 'short' }), total: monthTotals.get(key) ?? 0 };
  });

  return {
    outstandingTotal,
    outstandingInvoiceCount,
    outstandingClientCount: outstandingClientIds.size,
    overdueInvoiceCount,
    activeProjectCount: activeProjectCount ?? 0,
    paidThisMonth,
    revenueByMonth,
  };
}

export async function getActivityFeed(freelancerId: string, limit = 20): Promise<ActivityEvent[]> {
  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Freelancer — clients
// ---------------------------------------------------------------------------

export interface ClientSummary extends Profile {
  activeProjectCount: number;
  outstandingBalance: number;
  totalBilled: number;
  /** Most recent invoice or project activity for this client, if any. */
  lastActivityAt: string | null;
  status: 'active' | 'inactive';
}

export async function getClients(freelancerId: string): Promise<ClientSummary[]> {
  const { data: links, error: linksError } = await supabase
    .from('freelancer_clients')
    .select('client_id')
    .eq('freelancer_id', freelancerId);
  if (linksError) throw linksError;

  const clientIds = (links ?? []).map((l) => l.client_id);
  if (clientIds.length === 0) return [];

  const [{ data: profiles, error: profilesError }, { data: projects, error: projectsError }, { data: invoices, error: invoicesError }] =
    await Promise.all([
      supabase.from('profiles').select('*').in('id', clientIds),
      supabase.from('projects').select('client_id, status, created_at').eq('freelancer_id', freelancerId),
      supabase.from('invoices').select('client_id, amount, status, created_at').eq('freelancer_id', freelancerId),
    ]);
  if (profilesError) throw profilesError;
  if (projectsError) throw projectsError;
  if (invoicesError) throw invoicesError;

  return (profiles ?? []).map((profile) => {
    const clientProjects = (projects ?? []).filter((p) => p.client_id === profile.id);
    const clientInvoices = (invoices ?? []).filter((inv) => inv.client_id === profile.id);
    const activeProjectCount = clientProjects.filter((p) => p.status === 'active').length;
    const outstandingBalance = clientInvoices
      .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalBilled = clientInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const lastActivityAt = [...clientProjects, ...clientInvoices]
      .map((r) => r.created_at)
      .sort()
      .at(-1) ?? null;
    return {
      ...profile,
      activeProjectCount,
      outstandingBalance,
      totalBilled,
      lastActivityAt,
      status: activeProjectCount > 0 ? 'active' : 'inactive',
    } as ClientSummary;
  });
}

export interface CreateClientResult {
  success: boolean;
  clientId: string;
  isNewAccount: boolean;
  tempPassword: string | null;
}

/** Provisions (or links an existing) client account — see supabase/functions/create-client. */
export async function createClientAccount(name: string, email: string): Promise<CreateClientResult> {
  const { data, error } = await supabase.functions.invoke<CreateClientResult>('create-client', {
    body: { name, email },
  });
  if (error) {
    // FunctionsHttpError carries the raw Response on `.context` — the function
    // always returns a JSON { error } body even on 4xx/5xx, so surface that
    // instead of the generic "non-2xx status code" message.
    const context = (error as { context?: Response }).context;
    if (context) {
      const body = await context.json().catch(() => null);
      if (body?.error) throw new Error(body.error);
    }
    throw error;
  }
  if (!data) throw new Error('No response from server.');
  return data;
}

export async function getClientDetail(clientId: string) {
  const [{ data: profile, error: profileError }, { data: projects, error: projectsError }, { data: invoices, error: invoicesError }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', clientId).single(),
      supabase.from('projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    ]);
  if (profileError) throw profileError;
  if (projectsError) throw projectsError;
  if (invoicesError) throw invoicesError;

  return { profile: profile as Profile, projects: (projects ?? []) as Project[], invoices: (invoices ?? []) as Invoice[] };
}

// ---------------------------------------------------------------------------
// Freelancer — invoices
// ---------------------------------------------------------------------------

export interface InvoiceWithClient extends Invoice {
  client: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null;
  project?: Pick<Project, 'id' | 'title'> | null;
}

/** Joins client + project info onto a batch of invoice rows — shared by every invoice list query below. */
async function attachClientsAndProjects(invoices: Invoice[]): Promise<InvoiceWithClient[]> {
  const clientIds = Array.from(new Set(invoices.map((i) => i.client_id)));
  const projectIds = Array.from(new Set(invoices.map((i) => i.project_id).filter((id): id is string => id !== null)));
  const [{ data: clients, error: clientsError }, { data: projects, error: projectsError }] = await Promise.all([
    clientIds.length ? supabase.from('profiles').select('id, name, avatar_url').in('id', clientIds) : Promise.resolve({ data: [], error: null }),
    projectIds.length ? supabase.from('projects').select('id, title').in('id', projectIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (clientsError) throw clientsError;
  if (projectsError) throw projectsError;

  const clientById = new Map((clients ?? []).map((c) => [c.id, c]));
  const projectById = new Map((projects ?? []).map((p) => [p.id, p]));
  return invoices.map((inv) => ({
    ...inv,
    client: clientById.get(inv.client_id) ?? null,
    project: inv.project_id ? (projectById.get(inv.project_id) ?? null) : null,
  }));
}

export async function getInvoices(freelancerId: string): Promise<InvoiceWithClient[]> {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return attachClientsAndProjects(invoices ?? []);
}

/** Top outstanding invoices, soonest due first — feeds the dashboard's client-balance carousel and invoice rows. */
export async function getUpcomingInvoices(freelancerId: string, limit = 3): Promise<InvoiceWithClient[]> {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('freelancer_id', freelancerId)
    .in('status', ['sent', 'overdue'])
    .order('due_date', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return attachClientsAndProjects(invoices ?? []);
}

/** Every overdue invoice, unpaginated — feeds "Send Payment Reminders". */
export async function getOverdueInvoices(freelancerId: string): Promise<InvoiceWithClient[]> {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('freelancer_id', freelancerId)
    .eq('status', 'overdue')
    .order('due_date', { ascending: true });
  if (error) throw error;
  return attachClientsAndProjects(invoices ?? []);
}

export async function getInvoiceDetail(id: string) {
  const { data: invoice, error } = await supabase.from('invoices').select('*').eq('id', id).single();
  if (error) throw error;

  const { data: client, error: clientError } = await supabase.from('profiles').select('*').eq('id', invoice.client_id).single();
  if (clientError) throw clientError;

  let project: Pick<Project, 'id' | 'title'> | null = null;
  if (invoice.project_id) {
    const { data, error: projectError } = await supabase.from('projects').select('id, title').eq('id', invoice.project_id).maybeSingle();
    if (projectError) throw projectError;
    project = data;
  }

  return { invoice: invoice as Invoice, client: client as Profile, project };
}

export async function createInvoice(input: {
  freelancerId: string;
  clientId: string;
  projectId: string | null;
  amount: number;
  dueDate: string | null;
  status: 'draft' | 'sent';
}) {
  const { error } = await supabase.from('invoices').insert({
    freelancer_id: input.freelancerId,
    client_id: input.clientId,
    project_id: input.projectId,
    amount: input.amount,
    due_date: input.dueDate,
    status: input.status,
  });
  if (error) throw error;
}

export async function markInvoicePaidManually(id: string) {
  const { error } = await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function markInvoiceSent(id: string) {
  const { error } = await supabase.from('invoices').update({ status: 'sent' }).eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Freelancer — recurring invoices (invoice_templates)
// ---------------------------------------------------------------------------

export interface InvoiceTemplateWithClient extends InvoiceTemplate {
  client: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null;
  project?: Pick<Project, 'id' | 'title'> | null;
}

export async function getInvoiceTemplates(freelancerId: string): Promise<InvoiceTemplateWithClient[]> {
  const { data: templates, error } = await supabase
    .from('invoice_templates')
    .select('*')
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = templates ?? [];
  const clientIds = Array.from(new Set(rows.map((t) => t.client_id)));
  const projectIds = Array.from(new Set(rows.map((t) => t.project_id).filter((id): id is string => id !== null)));
  const [{ data: clients, error: clientsError }, { data: projects, error: projectsError }] = await Promise.all([
    clientIds.length ? supabase.from('profiles').select('id, name, avatar_url').in('id', clientIds) : Promise.resolve({ data: [], error: null }),
    projectIds.length ? supabase.from('projects').select('id, title').in('id', projectIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (clientsError) throw clientsError;
  if (projectsError) throw projectsError;

  const clientById = new Map((clients ?? []).map((c) => [c.id, c]));
  const projectById = new Map((projects ?? []).map((p) => [p.id, p]));
  return rows.map((t) => ({
    ...t,
    client: clientById.get(t.client_id) ?? null,
    project: t.project_id ? (projectById.get(t.project_id) ?? null) : null,
  }));
}

export async function createInvoiceTemplate(input: {
  freelancerId: string;
  clientId: string;
  projectId: string | null;
  amount: number;
  interval: RecurringInterval;
  /** First date the recurring invoice should be generated on. */
  startDate: string;
  dueInDays?: number;
}) {
  const { error } = await supabase.from('invoice_templates').insert({
    freelancer_id: input.freelancerId,
    client_id: input.clientId,
    project_id: input.projectId,
    amount: input.amount,
    interval: input.interval,
    next_run_date: input.startDate,
    due_in_days: input.dueInDays ?? 14,
  });
  if (error) throw error;
}

export async function setInvoiceTemplateActive(id: string, active: boolean) {
  const { error } = await supabase.from('invoice_templates').update({ active }).eq('id', id);
  if (error) throw error;
}

export async function deleteInvoiceTemplate(id: string) {
  const { error } = await supabase.from('invoice_templates').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Freelancer — projects
// ---------------------------------------------------------------------------

export interface ProjectWithClient extends Project {
  client: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null;
  milestoneCount: number;
  milestonesDone: number;
  /** 0-100, from milestone completion. */
  progress: number;
  /** Latest milestone due date among this project's milestones, if any set. */
  deadline: string | null;
}

export async function getProjects(freelancerId: string): Promise<ProjectWithClient[]> {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const projectIds = (projects ?? []).map((p) => p.id);
  const clientIds = Array.from(new Set((projects ?? []).map((p) => p.client_id)));
  const [{ data: clients, error: clientsError }, { data: milestones, error: milestonesError }] = await Promise.all([
    clientIds.length ? supabase.from('profiles').select('id, name, avatar_url').in('id', clientIds) : Promise.resolve({ data: [], error: null }),
    projectIds.length ? supabase.from('milestones').select('project_id, status, due_date').in('project_id', projectIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (clientsError) throw clientsError;
  if (milestonesError) throw milestonesError;

  const clientById = new Map((clients ?? []).map((c) => [c.id, c]));
  return (projects ?? []).map((p) => {
    const projectMilestones = (milestones ?? []).filter((m) => m.project_id === p.id);
    const milestoneCount = projectMilestones.length;
    const milestonesDone = projectMilestones.filter((m) => m.status === 'complete').length;
    const dueDates = projectMilestones.map((m) => m.due_date).filter((d): d is string => d !== null).sort();
    return {
      ...p,
      client: clientById.get(p.client_id) ?? null,
      milestoneCount,
      milestonesDone,
      progress: milestoneCount > 0 ? Math.round((milestonesDone / milestoneCount) * 100) : 0,
      deadline: dueDates.at(-1) ?? null,
    };
  });
}

export async function createProject(input: { freelancerId: string; clientId: string; title: string }) {
  const { error } = await supabase
    .from('projects')
    .insert({ freelancer_id: input.freelancerId, client_id: input.clientId, title: input.title, status: 'active' });
  if (error) throw error;
}

export async function getProjectDetail(id: string) {
  const [{ data: project, error }, { data: milestones, error: milestonesError }, { data: attachments, error: attachmentsError }] =
    await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('milestones').select('*').eq('project_id', id).order('due_date', { ascending: true }),
      supabase.from('attachments').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    ]);
  if (error) throw error;
  if (milestonesError) throw milestonesError;
  if (attachmentsError) throw attachmentsError;

  const { data: client, error: clientError } = await supabase.from('profiles').select('*').eq('id', project.client_id).single();
  if (clientError) throw clientError;

  return {
    project: project as Project,
    client: client as Profile,
    milestones: (milestones ?? []) as Milestone[],
    attachments: (attachments ?? []) as Attachment[],
  };
}

export async function toggleMilestone(id: string, status: 'pending' | 'complete') {
  const { error } = await supabase.from('milestones').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function addAttachment(input: { projectId: string; uploadedBy: string; fileUrl: string; type: 'deliverable' | 'receipt' }) {
  const { error } = await supabase
    .from('attachments')
    .insert({ project_id: input.projectId, uploaded_by: input.uploadedBy, file_url: input.fileUrl, type: input.type });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Messages (shared between freelancer + client views)
// ---------------------------------------------------------------------------

export async function getMessages(projectId: string): Promise<Message[]> {
  const { data, error } = await supabase.from('messages').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(input: { projectId: string; senderId: string; body: string }) {
  const { error } = await supabase.from('messages').insert({ project_id: input.projectId, sender_id: input.senderId, body: input.body });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export async function getSubscription(freelancerId: string): Promise<Subscription | null> {
  const { data, error } = await supabase.from('subscriptions').select('*').eq('freelancer_id', freelancerId).maybeSingle();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Client-scoped
// ---------------------------------------------------------------------------

export async function getClientProjects(clientId: string): Promise<ProjectWithClient[]> {
  const { data, error } = await supabase.from('projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p) => ({ ...p, client: null }));
}

export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  const { data, error } = await supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
