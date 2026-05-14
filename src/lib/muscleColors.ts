import type { MuscleGroup } from '@/lib/database.types';

// Shared muscle group color + label map used across library, exercise picker,
// exercise detail, etc. Keeps visual identity consistent.
export const MUSCLE_COLOR: Record<string, string> = {
  chest: '#EF4444',
  back: '#0EA5E9',
  shoulders: '#F59E0B',
  biceps: '#A855F7',
  triceps: '#EC4899',
  forearms: '#A855F7',
  core: '#10B981',
  quads: '#F97316',
  hamstrings: '#F97316',
  glutes: '#FB7185',
  calves: '#06B6D4',
  cardio: '#EF4444',
  full_body: '#F25A1F',
};

export interface MuscleFilter {
  key: MuscleGroup | 'all';
  label: string;
  emoji?: string;
}

export const MUSCLE_FILTERS: MuscleFilter[] = [
  { key: 'all', label: 'Semua', emoji: '✨' },
  { key: 'chest', label: 'Dada', emoji: '💪' },
  { key: 'back', label: 'Punggung', emoji: '🔙' },
  { key: 'shoulders', label: 'Bahu', emoji: '🏋️' },
  { key: 'biceps', label: 'Bisep', emoji: '💪' },
  { key: 'triceps', label: 'Trisep', emoji: '💪' },
  { key: 'core', label: 'Core', emoji: '🎯' },
  { key: 'quads', label: 'Paha Depan', emoji: '🦵' },
  { key: 'hamstrings', label: 'Hamstring', emoji: '🦵' },
  { key: 'glutes', label: 'Bokong', emoji: '🍑' },
  { key: 'calves', label: 'Betis', emoji: '🦵' },
  { key: 'cardio', label: 'Cardio', emoji: '❤️' },
];

export function muscleColor(muscle: string, fallback = '#F25A1F'): string {
  return MUSCLE_COLOR[muscle] ?? fallback;
}
