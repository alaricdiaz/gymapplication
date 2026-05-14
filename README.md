# Forge — Workout App

Full-featured workout tracker built with **Expo (React Native) + TypeScript + Supabase**.

## Features

- **Auth** — email + password via Supabase Auth, persisted with AsyncStorage.
- **Exercise library** — 50+ pre-seeded exercises with primary/secondary muscles, equipment, and instructions. Search + muscle filter.
- **Routine builder** — drag-free reorder, per-exercise target sets / rep range / rest, color-coded routines.
- **Workout logger** — tap-to-complete sets, auto-start rest timer with haptic feedback, add or remove exercises mid-workout, resume after closing the app.
- **HIIT / Interval timer** — presets for rest, HIIT 30/30, Tabata, EMOM, AMRAP. Visual ring + haptic transitions.
- **Progress** — 90-day volume chart, top muscle distribution, personal records, body measurements form (weight, BF%, chest/waist/hip/arm/thigh), progress photos uploaded to Supabase Storage, full workout history.
- **AI Coach** — chat surface backed by an OpenAI-compatible Chat Completions API. Falls back to a scripted coach if no API key is set, so the screen always works.
- **Settings** — unit system (metric/imperial), theme (system/light/dark), default rest, sign out.

## Stack

| Layer        | Choice                                                                 |
|--------------|------------------------------------------------------------------------|
| Framework    | Expo SDK 54, React Native 0.81, React 19                               |
| Navigation   | `expo-router` (file-based, typed routes)                               |
| State        | Zustand + TanStack Query                                               |
| Backend      | Supabase (Postgres + Auth + Storage), row-level security per user      |
| UI           | Hand-rolled themed components on `StyleSheet` — no extra UI dep        |
| Charts       | Custom SVG line chart (`react-native-svg`)                             |
| Camera/photo | `expo-image-picker` + `expo-image`                                     |

## Setup

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required while expo-router pulls in `react-dom@19.2.6` which prefers `react@19.2.x`; Expo SDK 54 ships with `react@19.1.0`, so we tell npm to ignore that peer constraint. Everything works at runtime.

### 2. Configure Supabase

1. Create a new Supabase project at https://supabase.com.
2. In **SQL editor**, paste and run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
3. In **Storage**, create a private bucket called `progress-photos`.
4. Add a storage policy on `progress-photos` so each user can only read/write their own folder:

   ```sql
   create policy "users access own photos"
   on storage.objects for all to authenticated
   using (
     bucket_id = 'progress-photos'
     and (storage.foldername(name))[1] = auth.uid()::text
   )
   with check (
     bucket_id = 'progress-photos'
     and (storage.foldername(name))[1] = auth.uid()::text
   );
   ```
5. (Optional) Disable email confirmation in **Authentication → Providers → Email** while developing.
6. Grab the project URL and `anon` key from **Project Settings → API**.

### 3. Environment variables

```bash
cp .env.example .env
```

Fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_OPENAI_API_KEY=<optional, enables live AI coach>
```

### 4. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** (iOS / Android) or press `i` / `a` to launch a simulator. Web works too (`w`), with the caveats that picker and haptics behave differently.

## Project layout

```
app/                      # expo-router file-based routes
  _layout.tsx             # providers + Stack
  index.tsx               # session-based redirect
  (auth)/                 # sign-in, sign-up
  (tabs)/                 # Home, Routines, Library, Progress, Coach
  routines/new.tsx        # routine builder (modal)
  routines/[id].tsx       # routine detail
  workout/active.tsx      # workout logger
  timer.tsx               # HIIT/EMOM/AMRAP timer (modal)
  exercise/[id].tsx       # exercise detail + PR history
  settings.tsx            # preferences (modal)

src/
  components/             # Button, Card, Input, Pill, Chart, ThemeProvider, …
  lib/                    # supabase client, theme, format helpers, coach
  stores/                 # zustand stores: auth, settings, workout

supabase/
  migrations/0001_init.sql
  seed.sql
```

## Scripts

```bash
npm start            # expo start
npm run android      # expo start --android
npm run ios          # expo start --ios
npm run web          # expo start --web
npm run typecheck    # tsc --noEmit
```

## Roadmap

This is the MVP. Planned next iterations:

- Drag-and-drop reorder inside routines and active workouts.
- Apple Health / Google Fit sync.
- Push notification when rest timer ends (`expo-notifications`).
- Social: shared routines, friend feed, weekly leaderboard.
- AI Coach: persist conversations, attach to your workout history.
- Offline-first sync: keep working without connection, reconcile on reconnect.

## License

MIT
