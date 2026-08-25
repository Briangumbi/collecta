import { amberNoir } from '@/theme/themes/amber-noir';
import { darkCool } from '@/theme/themes/dark-cool';
import { light } from '@/theme/themes/light';
import type { ThemeDefinition } from '@/theme/tokens';

/** Single place a future Style 4 gets registered. */
export const themes: ThemeDefinition[] = [amberNoir, darkCool, light];

export const themesById: Record<string, ThemeDefinition> = Object.fromEntries(themes.map((t) => [t.id, t]));

export const DEFAULT_THEME_ID = amberNoir.id;
