import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { DEFAULT_THEME_ID, themes, themesById } from '@/theme/themes';
import type { ColorTokens, ThemeDefinition } from '@/theme/tokens';

type Mode = 'light' | 'dark';

function resolveScheme(scheme: ReturnType<typeof useColorScheme>): Mode {
  return scheme === 'dark' ? 'dark' : 'light';
}

interface ThemeContextValue {
  themeId: string;
  theme: ThemeDefinition;
  mode: Mode;
  availableThemes: ThemeDefinition[];
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Holds the freelancer's selected visual style + resolves it against the
 * system light/dark scheme. Lives inside AuthProvider so it can read the
 * signed-in profile's saved `theme` and persist changes back to it — a
 * device-local-only preference wouldn't follow the user across devices.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { profile, refreshProfile } = useAuth();
  const mode = resolveScheme(useColorScheme());
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME_ID);

  useEffect(() => {
    if (profile?.theme && themesById[profile.theme] && profile.theme !== themeId) {
      setThemeIdState(profile.theme);
    }
    // Only re-sync when the profile's saved theme changes — not on every local setThemeId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.theme]);

  const setThemeId = useCallback(
    (id: string) => {
      if (!themesById[id] || id === themeId) return;
      setThemeIdState(id);
      if (profile) {
        supabase
          .from('profiles')
          .update({ theme: id })
          .eq('id', profile.id)
          .then(() => refreshProfile());
      }
    },
    [profile, refreshProfile, themeId]
  );

  const theme = themesById[themeId] ?? themes[0];

  const value = useMemo<ThemeContextValue>(
    () => ({ themeId, theme, mode, availableThemes: themes, setThemeId }),
    [themeId, theme, mode, setThemeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within an AppThemeProvider');
  return ctx;
}

/** Flat resolved color object for the active theme + mode — same shape every screen already reads. */
export function useTheme(): ColorTokens {
  const { theme, mode } = useThemeContext();
  return theme.modes[mode].colors;
}

/** Resolved 'light' | 'dark' — for tokens (glow, shadows) that vary by mode outside the color table. */
export function useThemeScheme(): Mode {
  return useThemeContext().mode;
}

/** Full active theme (fonts, radius, shadows, glow) for components that need more than flat colors. */
export function useThemeTokens() {
  const { theme, mode } = useThemeContext();
  const modeTokens = theme.modes[mode];
  return {
    colors: modeTokens.colors,
    glow: modeTokens.glow,
    cardShadow: modeTokens.cardShadow,
    cardHighlight: modeTokens.cardHighlight,
    fonts: theme.fonts,
    fontSize: theme.fontSize,
    radius: theme.radius,
    shadows: theme.shadows,
    buttonHighlight: theme.buttonHighlight,
  };
}

/** Available styles + the active selection, for the Settings theme picker. */
export function useThemePicker() {
  const { themeId, availableThemes, setThemeId } = useThemeContext();
  return { themeId, availableThemes, setThemeId };
}
