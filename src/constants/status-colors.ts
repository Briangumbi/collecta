import type { ThemeColorKey } from '@/theme/tokens';

/**
 * Status → semantic color mapping (e.g. "paid invoices are shown in the
 * success color"). This is domain logic, not a visual-style token — it
 * references theme color *names*, so it holds for every theme without
 * needing its own entry per style.
 */
export const InvoiceStatusColor = {
  draft: { fg: 'textSecondary', bg: 'neutralBg' },
  sent: { fg: 'primary', bg: 'backgroundSelected' },
  paid: { fg: 'success', bg: 'successBg' },
  overdue: { fg: 'danger', bg: 'dangerBg' },
} satisfies Record<string, { fg: ThemeColorKey; bg: ThemeColorKey }>;

export const ProjectStatusColor = {
  active: { fg: 'success', bg: 'successBg' },
  on_hold: { fg: 'warning', bg: 'warningBg' },
  completed: { fg: 'textSecondary', bg: 'neutralBg' },
} satisfies Record<string, { fg: ThemeColorKey; bg: ThemeColorKey }>;
