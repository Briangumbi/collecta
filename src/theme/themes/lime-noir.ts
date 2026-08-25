import { Platform } from 'react-native';

import type { ThemeDefinition } from '@/theme/tokens';

/**
 * Style 1 — the app's current, only theme: neutral true near-black (not
 * warm-tinted; a cooler neutral reads cleaner against the electric-lime
 * accent than a warm brown-black would) with layered card depth and bold
 * display type. Light is a complementary counterpart, not an afterthought.
 * These are the exact values the app already shipped with — this file just
 * re-keys them into the multi-theme token shape.
 */
export const limeNoir: ThemeDefinition = {
  id: 'lime-noir',
  name: 'Lime Noir',
  swatch: {
    background: '#0A0A0B',
    surface: '#18181B',
    accent: '#D4FF3D',
  },
  fonts: Platform.select({
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
  })!,
  fontSize: {
    hero: 56,
    title: 40,
    subtitle: 28,
    default: 16,
    small: 14,
    code: 12,
  },
  radius: {
    card: 20,
    pill: 999,
  },
  shadows: {
    deck: {
      color: '#000000',
      offset: { width: 0, height: 8 },
      opacity: 0.22,
      radius: 16,
      elevation: 4,
    },
    tabBar: {
      color: '#000000',
      offset: { width: 0, height: 10 },
      opacity: 0.3,
      radius: 20,
      elevation: 10,
    },
    toast: {
      color: '#000000',
      offset: { width: 0, height: 4 },
      opacity: 0.2,
      radius: 10,
      elevation: 6,
    },
    virtualCard: {
      color: '#000000',
      offset: { width: 0, height: 14 },
      opacity: 0.3,
      radius: 24,
      elevation: 8,
    },
  },
  buttonHighlight: ['#FFFFFF40', '#FFFFFF00'],
  modes: {
    light: {
      colors: {
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
      glow: { color: '#7CB518', opacity: 0.14 },
      cardShadow: {
        color: '#3A3A3C',
        offset: { width: 0, height: 10 },
        opacity: 0.16,
        radius: 20,
        elevation: 5,
      },
      cardHighlight: ['#FFFFFFB0', '#FFFFFF00'],
    },
    dark: {
      colors: {
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
      glow: { color: '#D4FF3D', opacity: 0.22 },
      cardShadow: {
        color: '#000000',
        offset: { width: 0, height: 10 },
        opacity: 0.16,
        radius: 20,
        elevation: 5,
      },
      cardHighlight: ['#FFFFFF12', '#FFFFFF00'],
    },
  },
};
