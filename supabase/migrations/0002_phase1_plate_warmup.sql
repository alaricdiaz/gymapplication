-- Forge Sprint 1 (Phase 1 Foundation Logging Excellence)
-- Adds per-profile plate inventory + warm-up scheme + last-set cache hints.
--
-- NOT-YET-APPLIED: this file is checked in for future use. Apply only after
-- EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY are wired and
-- the user explicitly approves running the migration against the live DB.
--
-- Idempotent: safe to re-run.

-- 1. Plate inventory + warm-up scheme columns on profiles ------------------
alter table if exists public.profiles
  add column if not exists plate_inventory jsonb;

alter table if exists public.profiles
  add column if not exists warmup_scheme jsonb;

comment on column public.profiles.plate_inventory is
  'Per-profile plate inventory. Shape: { kg: number[], barKg: number, countsPerSide?: Record<string, number> }';

comment on column public.profiles.warmup_scheme is
  'Per-profile warm-up ladder. Shape: { steps: Array<{ percent: number, reps: number }> }';

-- 2. Set type / marker / RPE columns on workout_sets ----------------------
-- (Sprint 1 client only flags isWarmup; full marker semantics arrive in
-- Sprint 2 — schema added now so we don't need a second migration.)

do $$ begin
  create type set_marker as enum (
    'warmup', 'working', 'drop', 'failure', 'paused', 'cluster', 'rest_pause', 'amrap'
  );
exception when duplicate_object then null; end $$;

alter table if exists public.workout_sets
  add column if not exists marker set_marker not null default 'working';

alter table if exists public.workout_sets
  add column if not exists is_warmup boolean not null default false;

alter table if exists public.workout_sets
  add column if not exists rpe numeric(3, 1);

alter table if exists public.workout_sets
  add column if not exists tempo text;

-- 3. Last completed set cache (denormalized per profile/exercise) ---------
-- Used for Ghost Text auto-fill ("Sesi lalu: 60 kg × 8") without scanning
-- workout_sets every render. Updated on workout finish (trigger or app).

create table if not exists public.last_set_cache (
  user_id uuid not null references auth.users on delete cascade,
  exercise_id uuid not null references public.exercises on delete cascade,
  weight numeric(6, 2) not null,
  reps integer not null,
  rpe numeric(3, 1),
  recorded_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create index if not exists last_set_cache_user_idx on public.last_set_cache (user_id);

alter table public.last_set_cache enable row level security;

do $$ begin
  create policy last_set_cache_owner_all
    on public.last_set_cache
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- 4. Helper: upsert last-set on workout finish ----------------------------
create or replace function public.upsert_last_set(
  p_user_id uuid,
  p_exercise_id uuid,
  p_weight numeric,
  p_reps integer,
  p_rpe numeric
) returns void
language plpgsql
security definer
as $$
begin
  insert into public.last_set_cache (user_id, exercise_id, weight, reps, rpe)
  values (p_user_id, p_exercise_id, p_weight, p_reps, p_rpe)
  on conflict (user_id, exercise_id)
  do update set
    weight = excluded.weight,
    reps = excluded.reps,
    rpe = excluded.rpe,
    recorded_at = now();
end;
$$;
