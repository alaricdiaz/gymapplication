import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/stores/auth';
import { useProfile } from '@/stores/profile';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SignUpScreen() {
  const theme = useTheme();
  const signUp = useAuth((s) => s.signUp);
  const signInDemo = useAuth((s) => s.signInDemo);
  const profileData = useProfile((s) => s.data);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setInfo(null);
    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Password gak sama.');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp(email.trim().toLowerCase(), password);
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    setInfo('Akun lo udah jadi! Cek email lo buat konfirmasi (kalo aktif), terus login.');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/(auth)/sign-in');
            }}
            style={styles.backRow}
          >
            <View
              style={[
                styles.backBtn,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <Icon name="chevronLeft" size={18} color={theme.colors.text} />
            </View>
          </Pressable>

          <View style={{ paddingTop: 8, gap: 6 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Tinggal selangkah lagi{profileData.nickname ? `, ${profileData.nickname}` : ''} 🔥
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Plan lo udah siap. Bikin akun buat save progress lo.
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
                Supabase belum di-set. Buat preview, tap “Mode Demo” di bawah.
              </Text>
            </View>
          ) : null}

          {/* Plan summary card */}
          {profileData.nickname ? (
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planCard}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 28 }}>🏋️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planTitle}>Plan lo siap di-save</Text>
                  <Text style={styles.planSub}>
                    Greyskull LP · {profileData.daysPerWeek ?? 3} hari/minggu · 12 minggu
                  </Text>
                </View>
                <Icon name="check" size={20} color="#fff" strokeWidth={3} />
              </View>
            </LinearGradient>
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
              placeholder="Min. 6 karakter"
            />
            <Input
              label="Ulang Password"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Ulang password lo"
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
            {info ? (
              <View
                style={[
                  styles.errBox,
                  { backgroundColor: theme.colors.successSoft, borderColor: theme.colors.success },
                ]}
              >
                <Text style={{ color: theme.colors.success, fontSize: 13 }}>{info}</Text>
              </View>
            ) : null}
            <Button
              label="Bikin Akun"
              onPress={onSubmit}
              loading={loading}
              fullWidth
              size="lg"
              variant="gradient"
              trailing={<Icon name="arrowRight" size={18} color="#fff" />}
            />
          </View>

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
                  Skip login, langsung masuk ke app tanpa setup Supabase.
                </Text>
              </View>
              <Icon name="arrowRight" size={18} color={theme.colors.primary} />
            </View>
          </Pressable>

          <Text style={[styles.legal, { color: theme.colors.textDim }]}>
            Dengan bikin akun, lo setuju sama Syarat & Ketentuan dan Kebijakan Privasi Forge.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingVertical: 16, gap: 18 },
  backRow: { paddingVertical: 4 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  planCard: { borderRadius: 16, padding: 14 },
  planTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  planSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  form: { gap: 12 },
  errBox: { borderWidth: 1, borderRadius: 12, padding: 12 },
  legal: { fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 8 },
  banner: { borderWidth: 1, borderRadius: 12, padding: 12 },
  bannerText: { fontSize: 13, lineHeight: 18 },
  demoCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
