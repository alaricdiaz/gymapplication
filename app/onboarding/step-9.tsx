import { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingShell } from '@/components/OnboardingShell';
import { ProgressBar } from '@/components/ProgressBar';
import { Icon } from '@/components/Icon';
import { useProfile } from '@/stores/profile';
import { useTheme } from '@/components/ThemeProvider';

const STEPS = [
  'Analisis data lo...',
  'Pilih template terbaik...',
  'Sesuaikan untuk cedera...',
  'Hitung berat awal...',
  'Susun jadwal 12 minggu...',
  'Plan lo siap!',
];

export default function Step9Generating() {
  const theme = useTheme();
  const update = useProfile((s) => s.update);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setProgress((p) => Math.min(100, p + 5));
    }, 100);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const idx = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));
    setStepIdx(idx);
  }, [progress]);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(async () => {
        await update({ onboardingStep: 9 });
        router.replace('/onboarding/preview');
      }, 600);
      return () => clearTimeout(t);
    }
  }, [progress, update]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <LinearGradient
        colors={['rgba(242, 90, 31, 0.15)', 'transparent']}
        style={[StyleSheet.absoluteFillObject]}
      />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 32 }}>
        <View style={[styles.flameBox, { backgroundColor: theme.colors.primary }]}>
          <Text style={{ fontSize: 48 }}>🔥</Text>
        </View>

        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Forge lagi bikin plan</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Sebentar ya, 3 detik aja
          </Text>
        </View>

        <View style={{ width: '100%', gap: 12 }}>
          <ProgressBar value={progress} total={100} size="lg" />
          <Text style={[styles.pct, { color: theme.colors.text }]}>{progress}%</Text>
        </View>

        <View style={{ width: '100%', gap: 10 }}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor:
                      i < stepIdx ? theme.colors.success : i === stepIdx ? theme.colors.primary : theme.colors.surfaceMuted,
                  },
                ]}
              >
                {i < stepIdx ? (
                  <Icon name="check" size={12} color="#fff" strokeWidth={3} />
                ) : i === stepIdx ? (
                  <View style={[styles.pulseDot, { backgroundColor: '#fff' }]} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.stepText,
                  {
                    color:
                      i <= stepIdx ? theme.colors.text : theme.colors.textDim,
                    fontWeight: i === stepIdx ? '700' : '500',
                  },
                ]}
              >
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flameBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14 },
  pct: { fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  stepText: { fontSize: 14 },
});
