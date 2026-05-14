import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SignInScreen() {
  const theme = useTheme();
  const signIn = useAuth((s) => s.signIn);
  const signInDemo = useAuth((s) => s.signInDemo);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Hero brand */}
          <View style={styles.brandWrap}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.brand}
            >
              <Text style={{ fontSize: 36 }}>🔥</Text>
            </LinearGradient>
            <Text style={[styles.kicker, { color: theme.colors.primary }]}>FORGE</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Selamat datang lagi</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Lo bisa lanjut dari posisi terakhir. Streak masih jalan!
            </Text>
          </View>

          {!isSupabaseConfigured ? (
            <View
              style={[
                styles.banner,
                { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warning },
              ]}
            >
              <Text style={[styles.bannerText, { color: theme.colors.text }]}>
                Supabase belum di-set. Copy <Text style={styles.code}>.env.example</Text> ke{' '}
                <Text style={styles.code}>.env</Text>, terus restart Expo.
              </Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              label="Email"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="lo@email.com"
            />
            <Input
              label="Password"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
            />
            {error ? (
              <View
                style={[
                  styles.errBox,
                  { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.danger },
                ]}
              >
                <Text style={{ color: theme.colors.danger, fontSize: 13 }}>{error}</Text>
              </View>
            ) : null}
            <Button
              label="Masuk"
              onPress={onSubmit}
              loading={loading}
              fullWidth
              size="lg"
              variant="gradient"
              trailing={<Icon name="arrowRight" size={18} color="#fff" />}
            />
          </View>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textDim }]}>atau</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <Pressable onPress={() => router.push('/(auth)/sign-up')}>
            <View
              style={[
                styles.altCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.altTitle, { color: theme.colors.text }]}>Belum punya akun?</Text>
              <Text style={[styles.altSub, { color: theme.colors.textMuted }]}>
                Bikin akun baru, set up plan dalam 3 menit
              </Text>
              <Icon name="arrowRight" size={18} color={theme.colors.primary} />
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              signInDemo();
              router.replace('/(tabs)');
            }}
          >
            <View
              style={[
                styles.demoCard,
                { borderColor: theme.colors.primary + '55', backgroundColor: theme.colors.primarySoft },
              ]}
            >
              <Text style={{ fontSize: 22 }}>👀</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 14 }}>
                  Mode Demo (lihat-lihat dulu)
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  Skip login, jalanin semua screen tanpa setup Supabase.
                </Text>
              </View>
              <Icon name="arrowRight" size={18} color={theme.colors.primary} />
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingVertical: 24, gap: 18 },
  brandWrap: { alignItems: 'center', gap: 8, paddingTop: 24, paddingBottom: 12 },
  brand: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 4 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, maxWidth: 320, textAlign: 'center' },
  form: { gap: 12 },
  banner: { borderWidth: 1, borderRadius: 12, padding: 12 },
  bannerText: { fontSize: 13, lineHeight: 18 },
  code: { fontWeight: '700' },
  errBox: { borderWidth: 1, borderRadius: 12, padding: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  altCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  altTitle: { fontSize: 15, fontWeight: '700' },
  altSub: { fontSize: 12, flex: 1, marginLeft: -100 },
  demoCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
