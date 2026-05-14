export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'cardio'
  | 'full_body';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'other';

export interface ExerciseRow {
  id: string;
  name: string;
  primary_muscle: MuscleGroup;
  secondary_muscles: MuscleGroup[];
  equipment: Equipment;
  instructions: string | null;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
}

export interface RoutineRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
}

export interface RoutineExerciseRow {
  id: string;
  routine_id: string;
  exercise_id: string;
  position: number;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  target_rest_seconds: number;
  notes: string | null;
}

export interface WorkoutRow {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
}

export interface WorkoutSetRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_index: number;
  reps: number;
  weight: number;
  rpe: number | null;
  is_warmup: boolean;
  completed: boolean;
  created_at: string;
}

export interface MeasurementRow {
  id: string;
  user_id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  notes: string | null;
}

export interface ProgressPhotoRow {
  id: string;
  user_id: string;
  storage_path: string;
  taken_at: string;
  notes: string | null;
}

export interface ProfileRow {
  id: string;
  display_name: string | null;
  units: 'metric' | 'imperial';
  goal: string | null;
  experience: 'beginner' | 'intermediate' | 'advanced' | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow> & { id: string }; Update: Partial<ProfileRow> };
      exercises: { Row: ExerciseRow; Insert: Partial<ExerciseRow> & { name: string; primary_muscle: MuscleGroup; equipment: Equipment }; Update: Partial<ExerciseRow> };
      routines: { Row: RoutineRow; Insert: Partial<RoutineRow> & { user_id: string; name: string }; Update: Partial<RoutineRow> };
      routine_exercises: { Row: RoutineExerciseRow; Insert: Partial<RoutineExerciseRow> & { routine_id: string; exercise_id: string; position: number }; Update: Partial<RoutineExerciseRow> };
      workouts: { Row: WorkoutRow; Insert: Partial<WorkoutRow> & { user_id: string; name: string; started_at: string }; Update: Partial<WorkoutRow> };
      workout_sets: { Row: WorkoutSetRow; Insert: Partial<WorkoutSetRow> & { workout_id: string; exercise_id: string; set_index: number; reps: number; weight: number }; Update: Partial<WorkoutSetRow> };
      measurements: { Row: MeasurementRow; Insert: Partial<MeasurementRow> & { user_id: string; measured_at: string }; Update: Partial<MeasurementRow> };
      progress_photos: { Row: ProgressPhotoRow; Insert: Partial<ProgressPhotoRow> & { user_id: string; storage_path: string; taken_at: string }; Update: Partial<ProgressPhotoRow> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
