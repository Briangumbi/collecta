/**
 * Shape every theme must implement. A theme is a full visual style — colors,
 * type, radius, shadows, glow — not just a color palette, so that adding a
 * future Style 2 never requires component changes, only a new object here.
 */

export interface ColorTokens {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryText: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  neutralBg: string;
}

export type ThemeColorKey = keyof ColorTokens;

export interface GlowTokens {
  /** Base hex color the radial gradient fades from. */
  color: string;
  /** Peak opacity at the gradient's center. */
  opacity: number;
}

export interface ShadowPreset {
  color: string;
  offset: { width: number; height: number };
  opacity: number;
  radius: number;
  elevation: number;
}

export interface ThemeModeTokens {
  colors: ColorTokens;
  glow: GlowTokens;
  /** Card's outer drop shadow — color shifts per mode (near-black reads as nothing on a near-black bg). */
  cardShadow: ShadowPreset;
  /** Card's top-edge glassy sheen, light → transparent. */
  cardHighlight: readonly [string, string];
}

export interface ThemeFontFamilies {
  sans: string;
  display: string;
  semibold: string;
  mono: string;
}

/** The app's full type scale, keyed by role rather than raw size — see ThemedText's variants. */
export interface ThemeFontSizes {
  hero: number;
  title: number;
  subtitle: number;
  default: number;
  small: number;
  code: number;
}

export interface ThemeRadii {
  card: number;
  pill: number;
}

export interface ThemeSwatch {
  background: string;
  surface: string;
  accent: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  /** Small palette preview used by the theme picker. */
  swatch: ThemeSwatch;
  fonts: ThemeFontFamilies;
  fontSize: ThemeFontSizes;
  radius: ThemeRadii;
  /** Elevation presets that aren't mode-dependent (a floating drop shadow reads the same on light or dark). */
  shadows: {
    deck: ShadowPreset;
    tabBar: ShadowPreset;
    toast: ShadowPreset;
    virtualCard: ShadowPreset;
  };
  /** PrimaryButton's top-edge glassy sheen — fixed across modes. */
  buttonHighlight: readonly [string, string];
  modes: {
    light: ThemeModeTokens;
    dark: ThemeModeTokens;
  };
}
