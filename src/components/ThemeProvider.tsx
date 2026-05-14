import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { buildTheme, type Theme } from '@/lib/theme';
import { useSettings } from '@/stores/settings';

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const themePref = useSettings((s) => s.theme);
  const theme = useMemo(() => {
    const mode = themePref === 'system' ? (scheme ?? 'dark') : themePref;
    return buildTheme(mode === 'light' ? 'light' : 'dark');
  }, [scheme, themePref]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const value = useContext(ThemeContext);
  if (!value) {
    return buildTheme('dark');
  }
  return value;
}
