/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#12141A',
    background: '#F7F7F9',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EDF1FB',
    textSecondary: '#666B78',
    border: '#E4E5EA',
    primary: '#1D4ED8',
    primaryText: '#FFFFFF',
    success: '#0F9D58',
    successBg: '#E7F6EC',
    warning: '#B4770E',
    warningBg: '#FBF0DC',
    danger: '#D0342C',
    dangerBg: '#FBE7E6',
    neutralBg: '#EEEFF2',
  },
  dark: {
    text: '#F4F5F7',
    background: '#0B0C0F',
    backgroundElement: '#17181C',
    backgroundSelected: '#1F2937',
    textSecondary: '#9AA0AC',
    border: '#26282E',
    primary: '#4C82F7',
    primaryText: '#0B0C0F',
    success: '#3DD68C',
    successBg: '#0F2A1D',
    warning: '#E3A83B',
    warningBg: '#2E230C',
    danger: '#F0645C',
    dangerBg: '#2E1412',
    neutralBg: '#1C1D21',
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

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
