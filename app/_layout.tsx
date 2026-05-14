import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { useSettings } from '@/stores/settings';
import { useWorkout } from '@/stores/workout';
import { useProfile } from '@/stores/profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function RootLayout() {
  const hydrateAuth = useAuth((s) => s.hydrate);
  const hydrateSettings = useSettings((s) => s.hydrate);
  const hydrateWorkout = useWorkout((s) => s.hydrate);
  const hydrateProfile = useProfile((s) => s.hydrate);

  useEffect(() => {
    void hydrateSettings();
    void hydrateWorkout();
    void hydrateAuth();
    void hydrateProfile();
  }, [hydrateAuth, hydrateSettings, hydrateWorkout, hydrateProfile]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="profile/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="routines/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="routines/[id]" />
              <Stack.Screen name="workout/active" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="timer" options={{ presentation: 'modal' }} />
              <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
              <Stack.Screen name="exercise/[id]" />
            </Stack>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
