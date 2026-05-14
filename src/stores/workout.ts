import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { ExerciseRow, RoutineExerciseRow } from '@/lib/database.types';

export interface LastCompletedSet {
  weight: number;
  reps: number;
  savedAt: string;
}

type LastSetMap = Record<string, LastCompletedSet>;

export interface ActiveSet {
  id: string;
  reps: number;
  weight: number;
  rpe: number | null;
  isWarmup: boolean;
  completed: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  name: string;
  primaryMuscle: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRestSeconds: number;
  notes: string | null;
  sets: ActiveSet[];
}

export interface ActiveWorkout {
  id: string;
  routineId: string | null;
  name: string;
  startedAt: string;
  exercises: ActiveExercise[];
}

interface WorkoutState {
  active: ActiveWorkout | null;
  restRemaining: number;
  restTotal: number;
  lastSets: LastSetMap;
  hydrate: () => Promise<void>;
  startEmpty: (name?: string) => void;
  startFromRoutine: (params: {
    routineId: string;
    routineName: string;
    items: Array<RoutineExerciseRow & { exercise: ExerciseRow }>;
  }) => void;
  addExercise: (ex: ExerciseRow) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  addWarmupSets: (
    exerciseId: string,
    warmups: Array<{ weight: number; reps: number }>,
  ) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, patch: Partial<ActiveSet>) => void;
  toggleSet: (exerciseId: string, setId: string) => void;
  setRest: (seconds: number) => void;
  bumpRest: (deltaSeconds: number) => void;
  tickRest: () => void;
  cancel: () => void;
  finish: () => Promise<{ error: string | null; workoutId?: string }>;
}

const STORAGE_KEY = '@forge/active-workout/v1';
const LAST_SETS_KEY = '@forge/last-sets/v1';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function persist(active: ActiveWorkout | null) {
  if (!active) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(active));
}

async function persistLastSets(map: LastSetMap) {
  try {
    await AsyncStorage.setItem(LAST_SETS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export const useWorkout = create<WorkoutState>((set, get) => ({
  active: null,
  restRemaining: 0,
  restTotal: 0,
  lastSets: {},
  async hydrate() {
    try {
      const [activeRaw, lastRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(LAST_SETS_KEY),
      ]);
      const patch: { active?: ActiveWorkout; lastSets?: LastSetMap } = {};
      if (activeRaw) {
        patch.active = JSON.parse(activeRaw) as ActiveWorkout;
      }
      if (lastRaw) {
        patch.lastSets = JSON.parse(lastRaw) as LastSetMap;
      }
      if (Object.keys(patch).length > 0) {
        set(patch);
      }
    } catch {
      // ignore
    }
  },
  startEmpty(name = 'Quick workout') {
    const active: ActiveWorkout = {
      id: uid(),
      routineId: null,
      name,
      startedAt: new Date().toISOString(),
      exercises: [],
    };
    set({ active });
    void persist(active);
  },
  startFromRoutine({ routineId, routineName, items }) {
    const exercises: ActiveExercise[] = items.map((item) => ({
      exerciseId: item.exercise_id,
      name: item.exercise.name,
      primaryMuscle: item.exercise.primary_muscle,
      targetSets: item.target_sets,
      targetRepsMin: item.target_reps_min,
      targetRepsMax: item.target_reps_max,
      targetRestSeconds: item.target_rest_seconds,
      notes: item.notes,
      sets: Array.from({ length: item.target_sets }).map(() => ({
        id: uid(),
        reps: item.target_reps_min,
        weight: 0,
        rpe: null,
        isWarmup: false,
        completed: false,
      })),
    }));
    const active: ActiveWorkout = {
      id: uid(),
      routineId,
      name: routineName,
      startedAt: new Date().toISOString(),
      exercises,
    };
    set({ active });
    void persist(active);
  },
  addExercise(ex) {
    const active = get().active;
    if (!active) return;
    const next: ActiveWorkout = {
      ...active,
      exercises: [
        ...active.exercises,
        {
          exerciseId: ex.id,
          name: ex.name,
          primaryMuscle: ex.primary_muscle,
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
          targetRestSeconds: 90,
          notes: null,
          sets: Array.from({ length: 3 }).map(() => ({
            id: uid(),
            reps: 8,
            weight: 0,
            rpe: null,
            isWarmup: false,
            completed: false,
          })),
        },
      ],
    };
    set({ active: next });
    void persist(next);
  },
  removeExercise(exerciseId) {
    const active = get().active;
    if (!active) return;
    const next: ActiveWorkout = {
      ...active,
      exercises: active.exercises.filter((e) => e.exerciseId !== exerciseId),
    };
    set({ active: next });
    void persist(next);
  },
  addSet(exerciseId) {
    const active = get().active;
    if (!active) return;
    const next: ActiveWorkout = {
      ...active,
      exercises: active.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const lastWorking = [...e.sets].reverse().find((s) => !s.isWarmup);
        const last = lastWorking ?? e.sets[e.sets.length - 1];
        return {
          ...e,
          sets: [
            ...e.sets,
            {
              id: uid(),
              reps: last?.reps ?? e.targetRepsMin,
              weight: last?.weight ?? 0,
              rpe: null,
              isWarmup: false,
              completed: false,
            },
          ],
        };
      }),
    };
    set({ active: next });
    void persist(next);
  },
  addWarmupSets(exerciseId, warmups) {
    const active = get().active;
    if (!active) return;
    if (!warmups.length) return;
    const next: ActiveWorkout = {
      ...active,
      exercises: active.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        const existingWarmups = e.sets.filter((s) => s.isWarmup);
        const workingSets = e.sets.filter((s) => !s.isWarmup);
        if (existingWarmups.length > 0) {
          return e;
        }
        const warmupSets: ActiveSet[] = warmups.map((w) => ({
          id: uid(),
          reps: w.reps,
          weight: w.weight,
          rpe: null,
          isWarmup: true,
          completed: false,
        }));
        return { ...e, sets: [...warmupSets, ...workingSets] };
      }),
    };
    set({ active: next });
    void persist(next);
  },
  removeSet(exerciseId, setId) {
    const active = get().active;
    if (!active) return;
    const next: ActiveWorkout = {
      ...active,
      exercises: active.exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e,
      ),
    };
    set({ active: next });
    void persist(next);
  },
  updateSet(exerciseId, setId, patch) {
    const active = get().active;
    if (!active) return;
    const next: ActiveWorkout = {
      ...active,
      exercises: active.exercises.map((e) =>
        e.exerciseId === exerciseId
          ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
          : e,
      ),
    };
    set({ active: next });
    void persist(next);
  },
  toggleSet(exerciseId, setId) {
    const active = get().active;
    if (!active) return;
    const exercise = active.exercises.find((e) => e.exerciseId === exerciseId);
    const targetSet = exercise?.sets.find((s) => s.id === setId);
    if (!exercise || !targetSet) return;
    const willComplete = !targetSet.completed;
    const next: ActiveWorkout = {
      ...active,
      exercises: active.exercises.map((e) => {
        if (e.exerciseId !== exerciseId) return e;
        return {
          ...e,
          sets: e.sets.map((s) => (s.id === setId ? { ...s, completed: willComplete } : s)),
        };
      }),
    };
    set({ active: next });
    void persist(next);
    if (willComplete) {
      set({ restRemaining: exercise.targetRestSeconds, restTotal: exercise.targetRestSeconds });
      if (!targetSet.isWarmup && targetSet.weight > 0) {
        const nextLast: LastSetMap = {
          ...get().lastSets,
          [exerciseId]: {
            weight: targetSet.weight,
            reps: targetSet.reps,
            savedAt: new Date().toISOString(),
          },
        };
        set({ lastSets: nextLast });
        void persistLastSets(nextLast);
      }
    }
  },
  setRest(seconds) {
    set({ restRemaining: seconds, restTotal: seconds });
  },
  bumpRest(deltaSeconds) {
    const { restRemaining, restTotal } = get();
    if (restRemaining <= 0) return;
    const nextRemaining = Math.max(0, restRemaining + deltaSeconds);
    const nextTotal = Math.max(nextRemaining, restTotal);
    set({ restRemaining: nextRemaining, restTotal: nextTotal });
  },
  tickRest() {
    const { restRemaining } = get();
    if (restRemaining <= 0) return;
    set({ restRemaining: Math.max(0, restRemaining - 1) });
  },
  cancel() {
    set({ active: null, restRemaining: 0, restTotal: 0 });
    void persist(null);
  },
  async finish() {
    const active = get().active;
    if (!active) return { error: 'No active workout' };
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return { error: 'Not signed in' };

    const startedAt = new Date(active.startedAt);
    const finishedAt = new Date();
    const durationSeconds = Math.max(1, Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000));

    const { data: workoutRow, error: insertErr } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        routine_id: active.routineId,
        name: active.name,
        started_at: active.startedAt,
        finished_at: finishedAt.toISOString(),
        duration_seconds: durationSeconds,
      })
      .select('id')
      .single();
    if (insertErr || !workoutRow) {
      return { error: insertErr?.message ?? 'Failed to save workout' };
    }

    const setsPayload = active.exercises.flatMap((ex) =>
      ex.sets
        .filter((s) => s.completed)
        .map((s, idx) => ({
          workout_id: workoutRow.id,
          exercise_id: ex.exerciseId,
          set_index: idx + 1,
          reps: s.reps,
          weight: s.weight,
          rpe: s.rpe,
          is_warmup: s.isWarmup,
          completed: true,
        })),
    );
    if (setsPayload.length > 0) {
      const { error: setsErr } = await supabase.from('workout_sets').insert(setsPayload);
      if (setsErr) return { error: setsErr.message };
    }

    set({ active: null, restRemaining: 0, restTotal: 0 });
    void persist(null);
    return { error: null, workoutId: workoutRow.id };
  },
}));
