import type { ThemeDefinition } from '@/theme/tokens';

/**
 * Style 3 — clean/minimal light counterpart. The design reference specifies
 * two seed values (background #f8f5f0, accent #d97706); the rest inverts
 * Amber Noir's dark-surface conventions for a light surface (darker shadow
 * text instead of a glassy highlight, deeper semantic colors for contrast
 * against white) rather than just lightening the dark palette wholesale.
 */
export const light: ThemeDefinition = {
  id: 'light',
  name: 'Light',
  swatch: {
    background: '#f8f5f0',
    surface: '#ffffff',
    accent: '#d97706',
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
    deck: { color: '#3A3A3C', offset: { width: 0, height: 6 }, opacity: 0.14, radius: 14, elevation: 3 },
    tabBar: { color: '#3A3A3C', offset: { width: 0, height: 8 }, opacity: 0.16, radius: 18, elevation: 6 },
    toast: { color: '#3A3A3C', offset: { width: 0, height: 4 }, opacity: 0.14, radius: 10, elevation: 4 },
    virtualCard: { color: '#3A3A3C', offset: { width: 0, height: 10 }, opacity: 0.18, radius: 20, elevation: 5 },
  },
  buttonHighlight: ['#FFFFFF00', '#FFFFFF00'],
  modes: {
    dark: {
      colors: {
        text: '#241c12',
        background: '#f8f5f0',
        backgroundElement: '#ffffff',
        backgroundSelected: '#fbe9d0',
        textSecondary: '#8a8578',
        border: 'rgba(36,28,18,0.1)',
        primary: '#d97706',
        primaryText: '#ffffff',
        success: '#2f8a5c',
        successBg: 'rgba(47,138,92,0.12)',
        warning: '#d97706',
        warningBg: 'rgba(217,119,6,0.12)',
        danger: '#dc2626',
        dangerBg: 'rgba(220,38,38,0.1)',
        neutralBg: 'rgba(138,133,120,0.15)',
      },
      glow: { color: '#d97706', opacity: 0.14 },
      cardShadow: { color: '#3A3A3C', offset: { width: 0, height: 4 }, opacity: 0.12, radius: 16, elevation: 3 },
      cardHighlight: ['#FFFFFF00', '#FFFFFF00'],
    },
    // Light doesn't vary by system scheme either — it's the one deliberately
    // bright style, selected explicitly rather than resolved from the OS.
    light: {
      colors: {
        text: '#241c12',
        background: '#f8f5f0',
        backgroundElement: '#ffffff',
        backgroundSelected: '#fbe9d0',
        textSecondary: '#8a8578',
        border: 'rgba(36,28,18,0.1)',
        primary: '#d97706',
        primaryText: '#ffffff',
        success: '#2f8a5c',
        successBg: 'rgba(47,138,92,0.12)',
        warning: '#d97706',
        warningBg: 'rgba(217,119,6,0.12)',
        danger: '#dc2626',
        dangerBg: 'rgba(220,38,38,0.1)',
        neutralBg: 'rgba(138,133,120,0.15)',
      },
      glow: { color: '#d97706', opacity: 0.14 },
      cardShadow: { color: '#3A3A3C', offset: { width: 0, height: 4 }, opacity: 0.12, radius: 16, elevation: 3 },
      cardHighlight: ['#FFFFFF00', '#FFFFFF00'],
    },
  },
};
