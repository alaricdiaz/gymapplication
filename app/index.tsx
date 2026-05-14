import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/stores/auth';
import { useProfile } from '@/stores/profile';
import { useTheme } from '@/components/ThemeProvider';

export default function IndexRedirect() {
  const loading = useAuth((s) => s.loading);
  const session = useAuth((s) => s.session);
  const profileHydrated = useProfile((s) => s.hydrated);
  const onboardingCompleted = useProfile((s) => s.data.onboardingCompleted);
  const theme = useTheme();

  useEffect(() => {
    if (loading || !profileHydrated) return;
    if (session) {
      router.replace('/(tabs)');
    } else if (onboardingCompleted) {
      router.replace('/(auth)/sign-in');
    } else {
      router.replace('/onboarding');
    }
  }, [loading, session, profileHydrated, onboardingCompleted]);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.bg }]}>
      <ActivityIndicator color={theme.colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
