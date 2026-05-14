import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_PLATE_INVENTORY,
  DEFAULT_WARMUP_SCHEME,
  type PlateInventory,
  type WarmupScheme,
} from '@/lib/plates';

export type Units = 'metric' | 'imperial';
export type ThemePref = 'system' | 'light' | 'dark';

interface SettingsState {
  units: Units;
  theme: ThemePref;
  defaultRestSeconds: number;
  plateInventory: PlateInventory;
  warmupScheme: WarmupScheme;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setUnits: (u: Units) => Promise<void>;
  setTheme: (t: ThemePref) => Promise<void>;
  setDefaultRest: (s: number) => Promise<void>;
  setPlateInventory: (p: PlateInventory) => Promise<void>;
  setWarmupScheme: (s: WarmupScheme) => Promise<void>;
  resetPlateInventory: () => Promise<void>;
  resetWarmupScheme: () => Promise<void>;
}

const KEY = '@forge/settings/v1';

interface PersistShape {
  units: Units;
  theme: ThemePref;
  defaultRestSeconds: number;
  plateInventory?: PlateInventory;
  warmupScheme?: WarmupScheme;
}

async function persist(shape: PersistShape) {
  await AsyncStorage.setItem(KEY, JSON.stringify(shape));
}

export const useSettings = create<SettingsState>((set, get) => ({
  units: 'metric',
  theme: 'system',
  defaultRestSeconds: 90,
  plateInventory: DEFAULT_PLATE_INVENTORY,
  warmupScheme: DEFAULT_WARMUP_SCHEME,
  hydrated: false,
  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistShape>;
        set({
          units: parsed.units ?? 'metric',
          theme: parsed.theme ?? 'system',
          defaultRestSeconds: parsed.defaultRestSeconds ?? 90,
          plateInventory: parsed.plateInventory ?? DEFAULT_PLATE_INVENTORY,
          warmupScheme: parsed.warmupScheme ?? DEFAULT_WARMUP_SCHEME,
          hydrated: true,
        });
        return;
      }
    } catch {
      // ignore corrupt settings
    }
    set({ hydrated: true });
  },
  async setUnits(units) {
    set({ units });
    const { theme, defaultRestSeconds, plateInventory, warmupScheme } = get();
    await persist({ units, theme, defaultRestSeconds, plateInventory, warmupScheme });
  },
  async setTheme(theme) {
    set({ theme });
    const { units, defaultRestSeconds, plateInventory, warmupScheme } = get();
    await persist({ units, theme, defaultRestSeconds, plateInventory, warmupScheme });
  },
  async setDefaultRest(defaultRestSeconds) {
    set({ defaultRestSeconds });
    const { units, theme, plateInventory, warmupScheme } = get();
    await persist({ units, theme, defaultRestSeconds, plateInventory, warmupScheme });
  },
  async setPlateInventory(plateInventory) {
    set({ plateInventory });
    const { units, theme, defaultRestSeconds, warmupScheme } = get();
    await persist({ units, theme, defaultRestSeconds, plateInventory, warmupScheme });
  },
  async setWarmupScheme(warmupScheme) {
    set({ warmupScheme });
    const { units, theme, defaultRestSeconds, plateInventory } = get();
    await persist({ units, theme, defaultRestSeconds, plateInventory, warmupScheme });
  },
  async resetPlateInventory() {
    await get().setPlateInventory(DEFAULT_PLATE_INVENTORY);
  },
  async resetWarmupScheme() {
    await get().setWarmupScheme(DEFAULT_WARMUP_SCHEME);
  },
}));
