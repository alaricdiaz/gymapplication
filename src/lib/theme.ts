import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  bgAlt: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textDim: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  primaryFg: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  overlay: string;
  shadow: string;
}

export interface ThemeGradients {
  hero: readonly [string, string, string];
  primary: readonly [string, string];
  accent: readonly [string, string];
  danger: readonly [string, string];
  success: readonly [string, string];
  card: readonly [string, string];
  surface: readonly [string, string];
}

const palette = {
  light: {
    bg: '#FAFAF7',
    bgAlt: '#F2F1EC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F4F4EF',
    border: '#E8E6DF',
    borderStrong: '#D5D2C9',
    text: '#0E1216',
    textMuted: '#4B5563',
    textDim: '#9CA3AF',
    primary: '#F25A1F',
    primaryHover: '#D9491A',
    primarySoft: '#FFE3D5',
    primaryFg: '#FFFFFF',
    accent: '#0EA5E9',
    accentSoft: '#E0F2FE',
    success: '#10B981',
    successSoft: '#D1FAE5',
    danger: '#EF4444',
    dangerSoft: '#FEE2E2',
    warning: '#F59E0B',
    warningSoft: '#FEF3C7',
    overlay: 'rgba(11, 15, 20, 0.55)',
    shadow: 'rgba(15, 23, 42, 0.08)',
  } satisfies ThemeColors,
  dark: {
    bg: '#0A0E13',
    bgAlt: '#0F141B',
    surface: '#141B25',
    surfaceElevated: '#1A2230',
    surfaceMuted: '#10161F',
    border: '#1F2A38',
    borderStrong: '#2A3749',
    text: '#F5F7FA',
    textMuted: '#9CA8B8',
    textDim: '#5B6776',
    primary: '#FF6B2C',
    primaryHover: '#FF8951',
    primarySoft: '#3D1F12',
    primaryFg: '#0A0E13',
    accent: '#38BDF8',
    accentSoft: '#0D2A3F',
    success: '#34D399',
    successSoft: '#0F2E25',
    danger: '#F87171',
    dangerSoft: '#3B1818',
    warning: '#FBBF24',
    warningSoft: '#3B2A0E',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.4)',
  } satisfies ThemeColors,
};

const gradients = {
  light: {
    hero: ['#FFB088', '#F25A1F', '#C9381F'] as const,
    primary: ['#FF8951', '#F25A1F'] as const,
    accent: ['#38BDF8', '#0EA5E9'] as const,
    danger: ['#F87171', '#EF4444'] as const,
    success: ['#34D399', '#10B981'] as const,
    card: ['#FFFFFF', '#F8F8F4'] as const,
    surface: ['#FFFFFF', '#F4F4EF'] as const,
  } satisfies ThemeGradients,
  dark: {
    hero: ['#FF8951', '#F25A1F', '#A53513'] as const,
    primary: ['#FF8951', '#F25A1F'] as const,
    accent: ['#38BDF8', '#0284C7'] as const,
    danger: ['#F87171', '#DC2626'] as const,
    success: ['#34D399', '#059669'] as const,
    card: ['#1A2230', '#141B25'] as const,
    surface: ['#1F2937', '#141B25'] as const,
  } satisfies ThemeGradients,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 32,
  full: 999,
};

export const typography = {
  hero: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1 },
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.6 },
  h1: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '700' as const },
  bodyLg: { fontSize: 17, fontWeight: '500' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  bodySm: { fontSize: 13, fontWeight: '500' as const },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8 },
  mono: { fontSize: 14, fontWeight: '600' as const, fontVariant: ['tabular-nums'] as const },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  gradients: ThemeGradients;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
}

export function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: palette[mode],
    gradients: gradients[mode],
    spacing,
    radius,
    typography,
    shadows,
  };
}

export function useDeviceTheme(): Theme {
  const scheme = useColorScheme();
  return buildTheme(scheme === 'light' ? 'light' : 'dark');
}
