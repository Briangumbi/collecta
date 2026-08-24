/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function resolveScheme(scheme: ReturnType<typeof useColorScheme>) {
  return scheme === 'unspecified' ? 'light' : scheme;
}

export function useTheme() {
  return Colors[resolveScheme(useColorScheme())];
}

/** Resolved 'light' | 'dark' — for tokens (e.g. Glow) that live outside the Colors table. */
export function useThemeScheme() {
  return resolveScheme(useColorScheme());
}
