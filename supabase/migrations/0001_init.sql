-- Forge workout app: initial schema
-- Run in the Supabase SQL editor (or via the Supabase CLI).

create extension if not exists "pgcrypto";

-- Enums --------------------------------------------------------------------

do $$ begin
  create type muscle_group as enum (
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'core', 'quads', 'hamstrings', 'glutes', 'calves', 'cardio', 'full_body'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type equipment_type as enum (
    'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'band', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type unit_system as enum ('metric', 'imperial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type experience_level as enum ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;

-- Tables -------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  units unit_system not null default 'metric',
  goal text,
  experience experience_level,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  primary_muscle muscle_group not null,
  secondary_muscles muscle_group[] not null default '{}',
  equipment equipment_type not null,
  instructions text,
  is_custom boolean not null default false,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists exercises_name_global_uniq
  on public.exercises (lower(name)) where created_by is null;

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  description text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines on delete cascade,
  exercise_id uuid not null references public.exercises on delete restrict,
  position integer not null,
  target_sets integer not null default 3,
  target_reps_min integer not null default 8,
  target_reps_max integer not null default 12,
  target_rest_seconds integer not null default 90,
  notes text
);

create index if not exists routine_exercises_routine_idx
  on public.routine_exercises (routine_id, position);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  routine_id uuid references public.routines on delete set null,
  name text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  duration_seconds integer,
  notes text
);

create index if not exists workouts_user_started_idx
  on public.workouts (user_id, started_at desc);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts on delete cascade,
  exercise_id uuid not null references public.exercises on delete restrict,
  set_index integer not null,
  reps integer not null,
  weight numeric(8, 2) not null,
  rpe numeric(3, 1),
  is_warmup boolean not null default false,
  completed boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists workout_sets_workout_idx
  on public.workout_sets (workout_id);
create index if not exists workout_sets_exercise_idx
  on public.workout_sets (exercise_id, created_at desc);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric(6, 2),
  body_fat_pct numeric(5, 2),
  chest_cm numeric(6, 2),
  waist_cm numeric(6, 2),
  hip_cm numeric(6, 2),
  arm_cm numeric(6, 2),
  thigh_cm numeric(6, 2),
  notes text
);

create index if not exists measurements_user_date_idx
  on public.measurements (user_id, measured_at desc);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  storage_path text not null,
  taken_at timestamptz not null default now(),
  notes text
);

create index if not exists progress_photos_user_idx
  on public.progress_photos (user_id, taken_at desc);

-- Row-level security -------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.measurements enable row level security;
alter table public.progress_photos enable row level security;

-- Profiles
drop policy if exists "profiles select self" on public.profiles;
create policy "profiles select self" on public.profiles for select
  using (auth.uid() = id);
drop policy if exists "profiles upsert self" on public.profiles;
create policy "profiles upsert self" on public.profiles for insert
  with check (auth.uid() = id);
drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles for update
  using (auth.uid() = id);

-- Exercises: global library readable by all signed-in users, custom rows owned by the creator.
drop policy if exists "exercises select" on public.exercises;
create policy "exercises select" on public.exercises for select
  using (auth.role() = 'authenticated' and (created_by is null or created_by = auth.uid()));
drop policy if exists "exercises insert own" on public.exercises;
create policy "exercises insert own" on public.exercises for insert
  with check (created_by = auth.uid() and is_custom = true);
drop policy if exists "exercises update own" on public.exercises;
create policy "exercises update own" on public.exercises for update
  using (created_by = auth.uid());
drop policy if exists "exercises delete own" on public.exercises;
create policy "exercises delete own" on public.exercises for delete
  using (created_by = auth.uid());

-- Routines
drop policy if exists "routines crud self" on public.routines;
create policy "routines crud self" on public.routines for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Routine exercises (child of routines)
drop policy if exists "routine_exercises crud self" on public.routine_exercises;
create policy "routine_exercises crud self" on public.routine_exercises for all
  using (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));

-- Workouts
drop policy if exists "workouts crud self" on public.workouts;
create policy "workouts crud self" on public.workouts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "workout_sets crud self" on public.workout_sets;
create policy "workout_sets crud self" on public.workout_sets for all
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

-- Measurements
drop policy if exists "measurements crud self" on public.measurements;
create policy "measurements crud self" on public.measurements for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Progress photos
drop policy if exists "progress_photos crud self" on public.progress_photos;
create policy "progress_photos crud self" on public.progress_photos for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Profile auto-create trigger ---------------------------------------------

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
