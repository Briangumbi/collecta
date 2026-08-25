/**
 * Re-exported from the multi-theme system so every existing `useTheme()` /
 * `useThemeScheme()` call site (flat `theme.primary`-style colors) keeps
 * working unchanged, now backed by the active selected theme instead of a
 * static palette. New code that needs fonts/radius/shadows/glow should use
 * `useThemeTokens()` from '@/theme/ThemeProvider' instead.
 */
export { useTheme, useThemeScheme } from '@/theme/ThemeProvider';
