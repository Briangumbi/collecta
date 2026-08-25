import { amberNoir } from '@/theme/themes/amber-noir';
import type { ThemeDefinition } from '@/theme/tokens';

/** Single place a future Style 2 gets registered. */
export const themes: ThemeDefinition[] = [amberNoir];

export const themesById: Record<string, ThemeDefinition> = Object.fromEntries(themes.map((t) => [t.id, t]));

export const DEFAULT_THEME_ID = amberNoir.id;
