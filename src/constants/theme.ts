/**
 * Design tokens. Dark is the primary, designed-for palette — neutral true
 * near-black (not warm-tinted; a cooler neutral reads cleaner against the
 * electric-lime accent than a warm brown-black would) with a bold lime
 * accent, layered card depth, and bold display type; light is a
 * complementary counterpart so the app stays coherent under system light
 * mode, not an afterthought default.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#141414',
    background: '#F7F7F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF3DC',
    textSecondary: '#6B6B70',
    border: '#E4E4E2',
    primary: '#7CB518',
    primaryText: '#FFFFFF',
    success: '#5B7052',
    successBg: '#E8EDE3',
    warning: '#A85E1E',
    warningBg: '#F5E7D4',
    danger: '#B84632',
    dangerBg: '#F6E2DC',
    neutralBg: '#EFEFEC',
  },
  dark: {
    text: '#F5F5F3',
    background: '#0A0A0B',
    backgroundElement: '#18181B',
    backgroundSelected: '#242428',
    textSecondary: '#8E8E93',
    border: '#FFFFFF14',
    primary: '#D4FF3D',
    primaryText: '#14170A',
    success: '#8FA382',
    successBg: '#1E2419',
    warning: '#E3A83B',
    warningBg: '#2E230C',
    danger: '#E2634A',
    dangerBg: '#2B1712',
    neutralBg: '#1E1E22',
  },
} as const;

export const InvoiceStatusColor = {
  draft: { fg: 'textSecondary', bg: 'neutralBg' },
  sent: { fg: 'primary', bg: 'backgroundSelected' },
  paid: { fg: 'success', bg: 'successBg' },
  overdue: { fg: 'danger', bg: 'dangerBg' },
} as const;

export const ProjectStatusColor = {
  active: { fg: 'success', bg: 'successBg' },
  on_hold: { fg: 'warning', bg: 'warningBg' },
  completed: { fg: 'textSecondary', bg: 'neutralBg' },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// The radial glow's color + peak opacity aren't theme-color-table entries
// (SVG gradient stops need a plain hex + a separate numeric opacity, not a
// solid fill color), so they live alongside Colors rather than in it.
export const Glow = {
  light: { color: '#7CB518', opacity: 0.14 },
  dark: { color: '#D4FF3D', opacity: 0.22 },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'Manrope_500Medium',
    display: 'Manrope_800ExtraBold',
    semibold: 'Manrope_600SemiBold',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Manrope_500Medium',
    display: 'Manrope_800ExtraBold',
    semibold: 'Manrope_600SemiBold',
    mono: 'monospace',
  },
  web: {
    sans: 'Manrope_500Medium, sans-serif',
    display: 'Manrope_800ExtraBold, sans-serif',
    semibold: 'Manrope_600SemiBold, sans-serif',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  card: 20,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
