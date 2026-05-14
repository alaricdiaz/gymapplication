import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { BodyArea } from '@/components/BodyDiagram';

export type Gender = 'male' | 'female' | 'other';
export type Goal = 'cutting' | 'bulking' | 'strength' | 'general' | 'recomp';
export type ExperienceLevel = 'never' | 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'full_gym' | 'home_gym' | 'dumbbell' | 'bodyweight' | 'outdoor';
export type TimePreference = 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';

export interface InjuryEntry {
  area: BodyArea;
  status: 'active' | 'recovered' | 'post_surgery';
  severity: 'mild' | 'moderate' | 'severe';
}

export interface ProfileData {
  nickname?: string;
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  bodyFatPct?: number;
  goal?: Goal;
  targetWeightKg?: number;
  targetMonths?: number;
  experience?: ExperienceLevel;
  daysPerWeek?: number;
  sessionDurationMin?: number;
  timePreference?: TimePreference;
  equipment?: Equipment;
  injuries: InjuryEntry[];
  // Lifestyle
  sleepHours?: number;
  stressLevel?: number;
  outsideSports?: string[];
  dietPreference?: string;
  // Preferences
  favoriteExercises?: string[];
  hatedExercises?: string[];
  motivationWhy?: string;
  // Meta
  onboardingCompleted: boolean;
  onboardingStep: number;
}

const KEY = '@forge/profile/v1';

const defaultProfile: ProfileData = {
  injuries: [],
  onboardingCompleted: false,
  onboardingStep: 0,
};

interface ProfileStore {
  data: ProfileData;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<ProfileData>) => Promise<void>;
  toggleInjury: (area: BodyArea) => Promise<void>;
  setInjuryDetails: (area: BodyArea, details: Omit<InjuryEntry, 'area'>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  reset: () => Promise<void>;
}

async function persist(data: ProfileData) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export const useProfile = create<ProfileStore>((set, get) => ({
  data: defaultProfile,
  hydrated: false,
  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProfileData;
        set({ data: { ...defaultProfile, ...parsed }, hydrated: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ hydrated: true });
  },
  async update(patch) {
    const next = { ...get().data, ...patch };
    set({ data: next });
    await persist(next);
  },
  async toggleInjury(area) {
    const cur = get().data.injuries;
    const exists = cur.find((i) => i.area === area);
    const next = exists
      ? cur.filter((i) => i.area !== area)
      : [...cur, { area, status: 'recovered' as const, severity: 'mild' as const }];
    const updated = { ...get().data, injuries: next };
    set({ data: updated });
    await persist(updated);
  },
  async setInjuryDetails(area, details) {
    const cur = get().data.injuries;
    const idx = cur.findIndex((i) => i.area === area);
    const next = [...cur];
    if (idx >= 0) {
      next[idx] = { area, ...details };
    } else {
      next.push({ area, ...details });
    }
    const updated = { ...get().data, injuries: next };
    set({ data: updated });
    await persist(updated);
  },
  async completeOnboarding() {
    const next = { ...get().data, onboardingCompleted: true };
    set({ data: next });
    await persist(next);
  },
  async reset() {
    set({ data: defaultProfile });
    await persist(defaultProfile);
  },
}));

export const GOAL_LABELS: Record<Goal, string> = {
  cutting: 'Turun BB / Cutting',
  bulking: 'Naik Massa / Bulking',
  strength: 'Jadi Kuat / Strength',
  general: 'Sehat Aja / General',
  recomp: 'Body Recomposition',
};

export const GOAL_EMOJI: Record<Goal, string> = {
  cutting: '🔥',
  bulking: '💪',
  strength: '🏋️',
  general: '❤️',
  recomp: '⚖️',
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  never: 'Belum Pernah',
  beginner: 'Pemula',
  intermediate: 'Menengah',
  advanced: 'Lanjut',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  full_gym: 'Gym Lengkap',
  home_gym: 'Home Gym Mini',
  dumbbell: 'Dumbbell Doang',
  bodyweight: 'Bodyweight Only',
  outdoor: 'Outdoor',
};

export const EQUIPMENT_EMOJI: Record<Equipment, string> = {
  full_gym: '🏋️',
  home_gym: '🏠',
  dumbbell: '💪',
  bodyweight: '🤸',
  outdoor: '🏃',
};

export function computeCompletionPct(data: ProfileData): number {
  const fields: (keyof ProfileData)[] = [
    'nickname',
    'age',
    'gender',
    'heightCm',
    'weightKg',
    'goal',
    'experience',
    'daysPerWeek',
    'sessionDurationMin',
    'equipment',
    'sleepHours',
    'stressLevel',
    'dietPreference',
    'motivationWhy',
    'bodyFatPct',
  ];
  const filled = fields.filter((f) => {
    const v = data[f];
    return v !== undefined && v !== null && v !== '';
  }).length;
  return Math.round((filled / fields.length) * 100);
}
