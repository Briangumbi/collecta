import { limeNoir } from '@/theme/themes/lime-noir';
import type { ThemeDefinition } from '@/theme/tokens';

/** Single place a future Style 2 gets registered. */
export const themes: ThemeDefinition[] = [limeNoir];

export const themesById: Record<string, ThemeDefinition> = Object.fromEntries(themes.map((t) => [t.id, t]));

export const DEFAULT_THEME_ID = limeNoir.id;
