import type { ThemeDefinition } from '@/theme/tokens';

/**
 * Style 2 — blue-on-charcoal counterpart to Amber Noir. The design reference
 * only specifies two seed values (background #0f1117, accent #6d8ef5); the
 * rest of the palette mirrors Amber Noir's exact structural relationships
 * (card/border/muted/shadow deltas) recolored to the same cool hue family,
 * rather than inventing an unrelated palette.
 */
export const darkCool: ThemeDefinition = {
  id: 'dark-cool',
  name: 'Dark Cool',
  swatch: {
    background: '#0f1117',
    surface: '#171b24',
    accent: '#6d8ef5',
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
    deck: { color: '#000000', offset: { width: 0, height: 8 }, opacity: 0.22, radius: 16, elevation: 4 },
    tabBar: { color: '#000000', offset: { width: 0, height: 10 }, opacity: 0.3, radius: 20, elevation: 10 },
    toast: { color: '#000000', offset: { width: 0, height: 4 }, opacity: 0.2, radius: 10, elevation: 6 },
    virtualCard: { color: '#000000', offset: { width: 0, height: 14 }, opacity: 0.3, radius: 24, elevation: 8 },
  },
  buttonHighlight: ['#FFFFFF40', '#FFFFFF00'],
  modes: {
    dark: {
      colors: {
        text: '#e8ecf7',
        background: '#0f1117',
        backgroundElement: '#171b24',
        backgroundSelected: '#1d2230',
        textSecondary: '#5a6478',
        border: 'rgba(109,142,245,0.12)',
        primary: '#6d8ef5',
        primaryText: '#0f1117',
        success: '#5cb88a',
        successBg: 'rgba(92,184,138,0.1)',
        warning: '#6d8ef5',
        warningBg: 'rgba(109,142,245,0.1)',
        danger: '#ef4444',
        dangerBg: 'rgba(239,68,68,0.12)',
        neutralBg: 'rgba(90,100,120,0.15)',
      },
      glow: { color: '#6d8ef5', opacity: 0.22 },
      cardShadow: { color: '#000000', offset: { width: 0, height: 4 }, opacity: 0.4, radius: 20, elevation: 4 },
      cardHighlight: ['#FFFFFF08', '#FFFFFF00'],
    },
    // Dark-only by design, same as Amber Noir — see that file's comment.
    light: {
      colors: {
        text: '#e8ecf7',
        background: '#0f1117',
        backgroundElement: '#171b24',
        backgroundSelected: '#1d2230',
        textSecondary: '#5a6478',
        border: 'rgba(109,142,245,0.12)',
        primary: '#6d8ef5',
        primaryText: '#0f1117',
        success: '#5cb88a',
        successBg: 'rgba(92,184,138,0.1)',
        warning: '#6d8ef5',
        warningBg: 'rgba(109,142,245,0.1)',
        danger: '#ef4444',
        dangerBg: 'rgba(239,68,68,0.12)',
        neutralBg: 'rgba(90,100,120,0.15)',
      },
      glow: { color: '#6d8ef5', opacity: 0.22 },
      cardShadow: { color: '#000000', offset: { width: 0, height: 4 }, opacity: 0.4, radius: 20, elevation: 4 },
      cardHighlight: ['#FFFFFF08', '#FFFFFF00'],
    },
  },
};
