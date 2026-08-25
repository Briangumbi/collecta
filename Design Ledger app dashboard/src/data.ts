export interface Client {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  activeProjects: number;
  outstanding: string;
  outstandingRaw: number;
  totalBilled: string;
  lastActivity: string;
  status: "active" | "inactive";
}

export interface Invoice {
  id: string;
  client: string;
  clientId: string;
  initials: string;
  avatarColor: string;
  amount: string;
  amountRaw: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  sentDate: string;
  description: string;
  lineItems: { label: string; qty: number; rate: string; total: string }[];
  paymentHistory: { date: string; event: string; note?: string }[];
}

export interface Milestone {
  id: string;
  label: string;
  done: boolean;
}

export interface Message {
  id: string;
  author: string;
  initials: string;
  avatarColor: string;
  text: string;
  time: string;
  self: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "fig" | "zip" | "img";
}

export interface Project {
  id: string;
  name: string;
  client: string;
  clientId: string;
  initials: string;
  avatarColor: string;
  status: "active" | "on-hold" | "completed";
  deadline: string;
  progress: number;
  milestoneCount: number;
  milestonesDone: number;
  milestones: Milestone[];
  attachments: Attachment[];
  messages: Message[];
}

export const CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Meridian Studio",
    initials: "MS",
    avatarColor: "#f59e0b",
    email: "hello@meridian.studio",
    activeProjects: 2,
    outstanding: "$3,200",
    outstandingRaw: 3200,
    totalBilled: "$24,800",
    lastActivity: "2d ago",
    status: "active",
  },
  {
    id: "c2",
    name: "Nova Agency",
    initials: "NA",
    avatarColor: "#7c9ef5",
    email: "projects@novagency.co",
    activeProjects: 3,
    outstanding: "$4,750",
    outstandingRaw: 4750,
    totalBilled: "$31,200",
    lastActivity: "Today",
    status: "active",
  },
  {
    id: "c3",
    name: "Archform Co.",
    initials: "AC",
    avatarColor: "#5cb88a",
    email: "studio@archform.co",
    activeProjects: 1,
    outstanding: "$2,950",
    outstandingRaw: 2950,
    totalBilled: "$18,500",
    lastActivity: "5d ago",
    status: "active",
  },
  {
    id: "c4",
    name: "Bluewave Digital",
    initials: "BD",
    avatarColor: "#a78bfa",
    email: "info@bluewave.io",
    activeProjects: 0,
    outstanding: "$0",
    outstandingRaw: 0,
    totalBilled: "$12,400",
    lastActivity: "3w ago",
    status: "inactive",
  },
  {
    id: "c5",
    name: "Solis Creative",
    initials: "SC",
    avatarColor: "#f97316",
    email: "work@soliscreative.com",
    activeProjects: 1,
    outstanding: "$0",
    outstandingRaw: 0,
    totalBilled: "$8,900",
    lastActivity: "1w ago",
    status: "active",
  },
];

export const INVOICES: Invoice[] = [
  {
    id: "INV-0041",
    client: "Meridian Studio",
    clientId: "c1",
    initials: "MS",
    avatarColor: "#f59e0b",
    amount: "$3,200",
    amountRaw: 3200,
    status: "overdue",
    dueDate: "Aug 11, 2026",
    sentDate: "Jul 28, 2026",
    description: "Brand Identity System",
    lineItems: [
      { label: "Brand Strategy & Research", qty: 1, rate: "$800", total: "$800" },
      { label: "Logo Design (3 concepts)", qty: 1, rate: "$1,200", total: "$1,200" },
      { label: "Brand Guidelines Doc", qty: 1, rate: "$700", total: "$700" },
      { label: "Asset Export Pack", qty: 1, rate: "$500", total: "$500" },
    ],
    paymentHistory: [
      { date: "Jul 28", event: "Invoice sent", note: "Sent via email to hello@meridian.studio" },
      { date: "Aug 4", event: "Viewed by client" },
      { date: "Aug 11", event: "Payment due — unpaid", note: "Overdue by 14 days" },
      { date: "Aug 18", event: "Reminder sent" },
    ],
  },
  {
    id: "INV-0040",
    client: "Nova Agency",
    clientId: "c2",
    initials: "NA",
    avatarColor: "#7c9ef5",
    amount: "$4,750",
    amountRaw: 4750,
    status: "sent",
    dueDate: "Aug 29, 2026",
    sentDate: "Aug 8, 2026",
    description: "Web Development – Phase 2",
    lineItems: [
      { label: "Frontend Development", qty: 20, rate: "$150/hr", total: "$3,000" },
      { label: "API Integration", qty: 8, rate: "$150/hr", total: "$1,200" },
      { label: "QA & Testing", qty: 3.67, rate: "$150/hr", total: "$550" },
    ],
    paymentHistory: [
      { date: "Aug 8", event: "Invoice sent" },
      { date: "Aug 10", event: "Viewed by client" },
    ],
  },
  {
    id: "INV-0039",
    client: "Solis Creative",
    clientId: "c5",
    initials: "SC",
    avatarColor: "#f97316",
    amount: "$1,800",
    amountRaw: 1800,
    status: "paid",
    dueDate: "Aug 15, 2026",
    sentDate: "Aug 1, 2026",
    description: "Logo Redesign",
    lineItems: [
      { label: "Discovery & Research", qty: 1, rate: "$300", total: "$300" },
      { label: "Logo Design (2 concepts)", qty: 1, rate: "$900", total: "$900" },
      { label: "Revisions (2 rounds)", qty: 1, rate: "$400", total: "$400" },
      { label: "Final File Delivery", qty: 1, rate: "$200", total: "$200" },
    ],
    paymentHistory: [
      { date: "Aug 1", event: "Invoice sent" },
      { date: "Aug 3", event: "Viewed by client" },
      { date: "Aug 12", event: "Payment received", note: "$1,800 via bank transfer" },
    ],
  },
  {
    id: "INV-0038",
    client: "Archform Co.",
    clientId: "c3",
    initials: "AC",
    avatarColor: "#5cb88a",
    amount: "$2,950",
    amountRaw: 2950,
    status: "sent",
    dueDate: "Sep 3, 2026",
    sentDate: "Aug 20, 2026",
    description: "UI/UX Design Sprint",
    lineItems: [
      { label: "UX Research & Audit", qty: 1, rate: "$750", total: "$750" },
      { label: "Wireframes (12 screens)", qty: 1, rate: "$900", total: "$900" },
      { label: "High-fidelity Mockups", qty: 1, rate: "$1,100", total: "$1,100" },
      { label: "Handoff & Documentation", qty: 1, rate: "$200", total: "$200" },
    ],
    paymentHistory: [
      { date: "Aug 20", event: "Invoice sent" },
      { date: "Aug 22", event: "Viewed by client" },
    ],
  },
  {
    id: "INV-0037",
    client: "Nova Agency",
    clientId: "c2",
    initials: "NA",
    avatarColor: "#7c9ef5",
    amount: "$3,100",
    amountRaw: 3100,
    status: "paid",
    dueDate: "Jul 30, 2026",
    sentDate: "Jul 14, 2026",
    description: "Content Strategy",
    lineItems: [
      { label: "Content Audit", qty: 1, rate: "$800", total: "$800" },
      { label: "Strategy Document", qty: 1, rate: "$1,200", total: "$1,200" },
      { label: "Editorial Calendar", qty: 1, rate: "$700", total: "$700" },
      { label: "Workshop (2h)", qty: 2, rate: "$200/hr", total: "$400" },
    ],
    paymentHistory: [
      { date: "Jul 14", event: "Invoice sent" },
      { date: "Jul 16", event: "Viewed by client" },
      { date: "Jul 28", event: "Payment received", note: "$3,100 via Stripe" },
    ],
  },
  {
    id: "INV-0036",
    client: "Bluewave Digital",
    clientId: "c4",
    initials: "BD",
    avatarColor: "#a78bfa",
    amount: "$2,200",
    amountRaw: 2200,
    status: "draft",
    dueDate: "Sep 10, 2026",
    sentDate: "—",
    description: "SEO Audit & Report",
    lineItems: [
      { label: "Technical SEO Audit", qty: 1, rate: "$900", total: "$900" },
      { label: "Competitor Analysis", qty: 1, rate: "$600", total: "$600" },
      { label: "Recommendations Report", qty: 1, rate: "$500", total: "$500" },
      { label: "Priority Action Plan", qty: 1, rate: "$200", total: "$200" },
    ],
    paymentHistory: [],
  },
];

export const PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Brand Identity System",
    client: "Meridian Studio",
    clientId: "c1",
    initials: "MS",
    avatarColor: "#f59e0b",
    status: "active",
    deadline: "Sep 15, 2026",
    progress: 72,
    milestoneCount: 6,
    milestonesDone: 4,
    milestones: [
      { id: "m1", label: "Brand discovery workshop", done: true },
      { id: "m2", label: "Competitor analysis complete", done: true },
      { id: "m3", label: "Moodboard & direction approved", done: true },
      { id: "m4", label: "Logo concepts (3 options) delivered", done: true },
      { id: "m5", label: "Final logo selected & refined", done: false },
      { id: "m6", label: "Brand guidelines document", done: false },
    ],
    attachments: [
      { id: "a1", name: "Brand_Brief_v2.pdf", size: "2.4 MB", type: "pdf" },
      { id: "a2", name: "Moodboard_Final.fig", size: "18.7 MB", type: "fig" },
      { id: "a3", name: "Logo_Concepts_R1.zip", size: "34.1 MB", type: "zip" },
    ],
    messages: [
      { id: "msg1", author: "Meridian Studio", initials: "MS", avatarColor: "#f59e0b", text: "Loving the direction on concept B — can we push the wordmark a bit wider?", time: "2d ago", self: false },
      { id: "msg2", author: "You", initials: "J", avatarColor: "#f59e0b", text: "Absolutely, I'll send a revision with wider tracking and a tighter leading by EOD.", time: "2d ago", self: true },
      { id: "msg3", author: "Meridian Studio", initials: "MS", avatarColor: "#f59e0b", text: "Perfect, thank you! Also — can we schedule a call this week to review the colour palette?", time: "Yesterday", self: false },
    ],
  },
  {
    id: "p2",
    name: "Web Development – Phase 2",
    client: "Nova Agency",
    clientId: "c2",
    initials: "NA",
    avatarColor: "#7c9ef5",
    status: "active",
    deadline: "Sep 1, 2026",
    progress: 55,
    milestoneCount: 5,
    milestonesDone: 3,
    milestones: [
      { id: "m1", label: "Technical architecture sign-off", done: true },
      { id: "m2", label: "Component library built", done: true },
      { id: "m3", label: "Homepage & product pages", done: true },
      { id: "m4", label: "API integration & data layer", done: false },
      { id: "m5", label: "QA, testing & deployment", done: false },
    ],
    attachments: [
      { id: "a1", name: "Tech_Spec_v1.pdf", size: "1.1 MB", type: "pdf" },
      { id: "a2", name: "Designs_Handoff.fig", size: "44.2 MB", type: "fig" },
    ],
    messages: [
      { id: "msg1", author: "Nova Agency", initials: "NA", avatarColor: "#7c9ef5", text: "Can the API support filtering by date range? We need this for the analytics dashboard.", time: "Today", self: false },
      { id: "msg2", author: "You", initials: "J", avatarColor: "#f59e0b", text: "Yes, I'll add date range params to the /events endpoint — will be in the next push.", time: "Today", self: true },
    ],
  },
  {
    id: "p3",
    name: "UI/UX Design Sprint",
    client: "Archform Co.",
    clientId: "c3",
    initials: "AC",
    avatarColor: "#5cb88a",
    status: "active",
    deadline: "Aug 30, 2026",
    progress: 30,
    milestoneCount: 4,
    milestonesDone: 1,
    milestones: [
      { id: "m1", label: "UX audit & heuristic review", done: true },
      { id: "m2", label: "Wireframes (12 screens)", done: false },
      { id: "m3", label: "High-fidelity mockups", done: false },
      { id: "m4", label: "Prototype & handoff", done: false },
    ],
    attachments: [
      { id: "a1", name: "UX_Audit_Notes.pdf", size: "890 KB", type: "pdf" },
    ],
    messages: [
      { id: "msg1", author: "Archform Co.", initials: "AC", avatarColor: "#5cb88a", text: "Looking forward to seeing the wireframes — please prioritise the onboarding flow first.", time: "5d ago", self: false },
    ],
  },
  {
    id: "p4",
    name: "Content Strategy",
    client: "Nova Agency",
    clientId: "c2",
    initials: "NA",
    avatarColor: "#7c9ef5",
    status: "on-hold",
    deadline: "Oct 1, 2026",
    progress: 40,
    milestoneCount: 3,
    milestonesDone: 1,
    milestones: [
      { id: "m1", label: "Content audit complete", done: true },
      { id: "m2", label: "Editorial calendar draft", done: false },
      { id: "m3", label: "Final strategy presentation", done: false },
    ],
    attachments: [
      { id: "a1", name: "Content_Audit.pdf", size: "3.2 MB", type: "pdf" },
    ],
    messages: [
      { id: "msg1", author: "Nova Agency", initials: "NA", avatarColor: "#7c9ef5", text: "We're pausing this until Q4 — keeping it on hold for now.", time: "1w ago", self: false },
    ],
  },
  {
    id: "p5",
    name: "Logo Redesign",
    client: "Solis Creative",
    clientId: "c5",
    initials: "SC",
    avatarColor: "#f97316",
    status: "completed",
    deadline: "Aug 15, 2026",
    progress: 100,
    milestoneCount: 4,
    milestonesDone: 4,
    milestones: [
      { id: "m1", label: "Discovery & brief", done: true },
      { id: "m2", label: "Concepts delivered", done: true },
      { id: "m3", label: "Final logo approved", done: true },
      { id: "m4", label: "Files delivered", done: true },
    ],
    attachments: [
      { id: "a1", name: "Solis_Logo_Final.zip", size: "12.4 MB", type: "zip" },
    ],
    messages: [],
  },
  {
    id: "p6",
    name: "SEO Audit",
    client: "Bluewave Digital",
    clientId: "c4",
    initials: "BD",
    avatarColor: "#a78bfa",
    status: "completed",
    deadline: "Aug 5, 2026",
    progress: 100,
    milestoneCount: 3,
    milestonesDone: 3,
    milestones: [
      { id: "m1", label: "Technical audit", done: true },
      { id: "m2", label: "Competitor analysis", done: true },
      { id: "m3", label: "Report delivered", done: true },
    ],
    attachments: [
      { id: "a1", name: "SEO_Report_BD.pdf", size: "5.8 MB", type: "pdf" },
    ],
    messages: [],
  },
];
