import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Treat .env.example placeholder values as "not configured" so that copying
// the example file without editing it still triggers the friendly Demo path
// instead of letting the placeholder URL fire and crash with "Network
// request failed".
const PLACEHOLDER_FRAGMENTS = [
  'your-project',
  'your-anon-key',
  'example.supabase',
  'placeholder',
];

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const v = value.trim().toLowerCase();
  if (v.length < 12) return true;
  return PLACEHOLDER_FRAGMENTS.some((frag) => v.includes(frag));
}

export const isSupabaseConfigured =
  Boolean(url && anonKey) && !looksLikePlaceholder(url) && !looksLikePlaceholder(anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[Forge] Supabase env belum di-set (atau masih placeholder). Isi EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY di .env, atau tap "Mode Demo" buat preview tanpa backend.',
  );
}

// Untyped client so insert/update payloads remain ergonomic — row shapes
// are enforced at the call site via explicit return type annotations.
export const supabase: SupabaseClient = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
