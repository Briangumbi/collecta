/**
 * Design tokens. Dark is the primary, designed-for palette (premium warm
 * fintech aesthetic — true near-black, amber accent, layered depth); light
 * is a complementary counterpart so the app stays coherent under system
 * light mode, not an afterthought default.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F1B16',
    background: '#FBF8F3',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F5EDDF',
    textSecondary: '#7A7168',
    border: '#EAE3D6',
    primary: '#C8862A',
    primaryText: '#FFFFFF',
    success: '#5B7052',
    successBg: '#E8EDE3',
    warning: '#A85E1E',
    warningBg: '#F5E7D4',
    danger: '#B84632',
    dangerBg: '#F6E2DC',
    neutralBg: '#F1ECE2',
  },
  dark: {
    text: '#F5F1EA',
    background: '#0D0B09',
    backgroundElement: '#1C1916',
    backgroundSelected: '#262019',
    textSecondary: '#9A9490',
    border: '#FFFFFF14',
    primary: '#F5B942',
    primaryText: '#241A08',
    success: '#8FA382',
    successBg: '#1E2419',
    warning: '#C9843F',
    warningBg: '#2E220F',
    danger: '#E2634A',
    dangerBg: '#2B1712',
    neutralBg: '#211D19',
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
  light: { color: '#C8862A', opacity: 0.16 },
  dark: { color: '#F5B942', opacity: 0.32 },
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
