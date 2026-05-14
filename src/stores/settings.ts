import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Units = 'metric' | 'imperial';
export type ThemePref = 'system' | 'light' | 'dark';

interface SettingsState {
  units: Units;
  theme: ThemePref;
  defaultRestSeconds: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setUnits: (u: Units) => Promise<void>;
  setTheme: (t: ThemePref) => Promise<void>;
  setDefaultRest: (s: number) => Promise<void>;
}

const KEY = '@forge/settings/v1';

interface PersistShape {
  units: Units;
  theme: ThemePref;
  defaultRestSeconds: number;
}

async function persist(shape: PersistShape) {
  await AsyncStorage.setItem(KEY, JSON.stringify(shape));
}

export const useSettings = create<SettingsState>((set, get) => ({
  units: 'metric',
  theme: 'system',
  defaultRestSeconds: 90,
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
    const { theme, defaultRestSeconds } = get();
    await persist({ units, theme, defaultRestSeconds });
  },
  async setTheme(theme) {
    set({ theme });
    const { units, defaultRestSeconds } = get();
    await persist({ units, theme, defaultRestSeconds });
  },
  async setDefaultRest(defaultRestSeconds) {
    set({ defaultRestSeconds });
    const { units, theme } = get();
    await persist({ units, theme, defaultRestSeconds });
  },
}));
