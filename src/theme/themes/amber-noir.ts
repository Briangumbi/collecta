import type { ThemeDefinition } from '@/theme/tokens';

/**
 * Style 1 — warm premium editorial aesthetic: near-black warm background,
 * amber accent, cream serif display numbers, DM Mono for small eyebrow
 * labels/refs. Ported pixel-for-pixel from the Figma-generated web
 * reference (Design Ledger app dashboard/src/tokens.ts) rather than
 * approximated.
 *
 * Dark-only by design — the source has no light variant, so both modes
 * resolve to the same warm-dark palette rather than inventing one.
 */
export const amberNoir: ThemeDefinition = {
  id: 'amber-noir',
  name: 'Amber Noir',
  swatch: {
    background: '#13100c',
    surface: '#1c1710',
    accent: '#f59e0b',
  },
  fonts: {
    sans: 'Outfit_400Regular',
    semibold: 'Outfit_600SemiBold',
    display: 'Fraunces_700Bold',
    displayHeavy: 'Fraunces_900Black',
    mono: 'DMMono_500Medium',
  },
  fontSize: {
    hero: 62,
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
    dark: {
      colors: {
        text: '#f5e6cb',
        background: '#13100c',
        backgroundElement: '#1c1710',
        backgroundSelected: '#231d14',
        textSecondary: '#6b5a42',
        border: 'rgba(245,158,11,0.12)',
        primary: '#f59e0b',
        primaryText: '#13100c',
        success: '#5cb88a',
        successBg: 'rgba(92,184,138,0.1)',
        warning: '#f59e0b',
        warningBg: 'rgba(245,158,11,0.1)',
        danger: '#ef4444',
        dangerBg: 'rgba(239,68,68,0.12)',
        neutralBg: 'rgba(107,90,66,0.15)',
      },
      glow: { color: '#f59e0b', opacity: 0.22 },
      cardShadow: {
        color: '#000000',
        offset: { width: 0, height: 4 },
        opacity: 0.4,
        radius: 20,
        elevation: 4,
      },
      cardHighlight: ['#FFFFFF08', '#FFFFFF00'],
    },
    // Same as dark — see file comment.
    light: {
      colors: {
        text: '#f5e6cb',
        background: '#13100c',
        backgroundElement: '#1c1710',
        backgroundSelected: '#231d14',
        textSecondary: '#6b5a42',
        border: 'rgba(245,158,11,0.12)',
        primary: '#f59e0b',
        primaryText: '#13100c',
        success: '#5cb88a',
        successBg: 'rgba(92,184,138,0.1)',
        warning: '#f59e0b',
        warningBg: 'rgba(245,158,11,0.1)',
        danger: '#ef4444',
        dangerBg: 'rgba(239,68,68,0.12)',
        neutralBg: 'rgba(107,90,66,0.15)',
      },
      glow: { color: '#f59e0b', opacity: 0.22 },
      cardShadow: {
        color: '#000000',
        offset: { width: 0, height: 4 },
        opacity: 0.4,
        radius: 20,
        elevation: 4,
      },
      cardHighlight: ['#FFFFFF08', '#FFFFFF00'],
    },
  },
};
