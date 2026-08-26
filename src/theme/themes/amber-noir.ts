import type { ThemeDefinition } from '@/theme/tokens';

/**
 * Style 1 — warm fintech aesthetic: near-black background, a vivid
 * orange-red accent (the "ember" gradient card look), bold geometric sans
 * numbers, DM Mono for small eyebrow labels/refs.
 *
 * Dark-only by design — the source has no light variant, so both modes
 * resolve to the same warm-dark palette rather than inventing one.
 */
export const amberNoir: ThemeDefinition = {
  id: 'amber-noir',
  name: 'Amber Noir',
  swatch: {
    background: '#120e09',
    surface: '#1f1811',
    accent: '#ff7a29',
  },
  fonts: {
    sans: 'Outfit_400Regular',
    semibold: 'Outfit_600SemiBold',
    display: 'Outfit_700Bold',
    displayHeavy: 'Outfit_900Black',
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
        text: '#f7f0e4',
        background: '#120e09',
        backgroundElement: '#1f1811',
        backgroundSelected: '#282016',
        textSecondary: '#8a7d6c',
        border: 'rgba(255,122,41,0.14)',
        primary: '#ff7a29',
        primaryText: '#120e09',
        success: '#5cb88a',
        successBg: 'rgba(92,184,138,0.1)',
        warning: '#ff7a29',
        warningBg: 'rgba(255,122,41,0.1)',
        danger: '#ef4444',
        dangerBg: 'rgba(239,68,68,0.12)',
        neutralBg: 'rgba(138,125,108,0.15)',
      },
      glow: { color: '#ff7a29', opacity: 0.24 },
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
        text: '#f7f0e4',
        background: '#120e09',
        backgroundElement: '#1f1811',
        backgroundSelected: '#282016',
        textSecondary: '#8a7d6c',
        border: 'rgba(255,122,41,0.14)',
        primary: '#ff7a29',
        primaryText: '#120e09',
        success: '#5cb88a',
        successBg: 'rgba(92,184,138,0.1)',
        warning: '#ff7a29',
        warningBg: 'rgba(255,122,41,0.1)',
        danger: '#ef4444',
        dangerBg: 'rgba(239,68,68,0.12)',
        neutralBg: 'rgba(138,125,108,0.15)',
      },
      glow: { color: '#ff7a29', opacity: 0.24 },
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
