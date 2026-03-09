import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../styles/theme';

/**
 * useThemeStyles — returns the S style object for the current theme.
 *
 * Usage:
 *   const S = useThemeStyles();
 *   // S now reacts to dark/light mode changes
 *
 * Components that import `S` directly from theme.js get the static dark theme.
 * Components that use this hook get a reactive S that updates with the theme.
 */
export function useThemeStyles() {
  const { mode } = useTheme();
  return useMemo(() => getThemeStyles(mode), [mode]);
}
