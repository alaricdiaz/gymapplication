import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Icon } from '@/components/Icon';
import { useProfile, GOAL_LABELS, EXPERIENCE_LABELS } from '@/stores/profile';
import { useTheme } from '@/components/ThemeProvider';

const SAMPLE_WORKOUT = [
  { name: 'Squat (low bar)', sets: '3 × 5', weight: '40 kg' },
  { name: 'Bench Press', sets: '3 × 5', weight: '27.5 kg' },
  { name: 'Barbell Row', sets: '3 × 5', weight: '30 kg' },
  { name: 'Plank', sets: '3 × 30s', weight: 'bodyweight' },
];

export default function Preview() {
  const theme = useTheme();
  const profile = useProfile((s) => s.data);
  const complete = useProfile((s) => s.completeOnboarding);

  const startWorkout = async () => {
    await complete();
    router.replace('/(auth)/sign-up');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient
          colors={theme.gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>🎉</Text>
          <Text style={styles.heroTitle}>Plan lo siap{profile.nickname ? `, ${profile.nickname}` : ''}!</Text>
          <Text style={styles.heroSub}>
            12 minggu program, fully customized. Tinggal jalan.
          </Text>
        </LinearGradient>

        {/* Plan Summary */}
        <Card padding={18} style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 28 }}>🏋️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.programName, { color: theme.colors.text }]}>Greyskull LP</Text>
              <Text style={[styles.programSub, { color: theme.colors.textMuted }]}>
                {profile.goal ? GOAL_LABELS[profile.goal] : 'Bulking'} · {profile.experience ? EXPERIENCE_LABELS[profile.experience] : 'Pemula'}
              </Text>
            </View>
            <Badge label="Custom" variant="primary" />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{profile.daysPerWeek ?? 3}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>hari/minggu</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{profile.sessionDurationMin ?? 60}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>menit/sesi</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>minggu</Text>
            </View>
          </View>

          {profile.injuries.length > 0 ? (
            <View
              style={[
                styles.adjBox,
                { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warning },
              ]}
            >
              <Text style={{ fontSize: 18 }}>🩹</Text>
              <Text style={[styles.adjText, { color: theme.colors.text }]}>
                Disesuaikan untuk cedera lo — back squat diganti front squat
              </Text>
            </View>
          ) : null}
        </Card>

        {/* First Workout Preview */}
        <Card padding={18} style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Workout pertama lo</Text>
            <Badge label="Hari 1" variant="accent" />
          </View>

          {SAMPLE_WORKOUT.map((ex, i) => (
            <View key={i} style={styles.exerciseRow}>
              <View
                style={[
                  styles.exerciseNum,
                  { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
                ]}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{ex.name}</Text>
                <Text style={[styles.exerciseDetail, { color: theme.colors.textMuted }]}>
                  {ex.sets} · {ex.weight}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.totalBox, { borderColor: theme.colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.textMuted }]}>ESTIMASI WAKTU</Text>
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>~45 menit</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.colors.textMuted }]}>FOCUS HARI INI</Text>
              <Text style={[styles.totalValue, { color: theme.colors.text }]}>Full Body</Text>
            </View>
          </View>
        </Card>

        {/* Why this plan */}
        <Card variant="muted" padding={18} style={{ gap: 12 }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kenapa plan ini?</Text>
          <BulletRow text={`Cocok buat ${profile.experience === 'never' ? 'newbie' : profile.experience ?? 'pemula'} yang baru mulai`} />
          <BulletRow text="Progressive overload: berat naik tiap minggu" />
          <BulletRow text={`Sesuaikan ${profile.daysPerWeek ?? 3}-hari jadwal lo`} />
          <BulletRow text="Includes deload week (minggu 4 & 8) buat recovery" />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Mulai Sekarang"
          onPress={startWorkout}
          fullWidth
          size="lg"
          variant="gradient"
          trailing={<Icon name="arrowRight" size={18} color="#fff" />}
        />
      </View>
    </SafeAreaView>
  );
}

function BulletRow({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      <View style={[styles.bulletDot, { backgroundColor: theme.colors.primary }]} />
      <Text style={{ color: theme.colors.text, fontSize: 13, flex: 1, lineHeight: 18 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16, paddingBottom: 24 },
  hero: { padding: 24, borderRadius: 20, alignItems: 'center', gap: 8 },
  heroEmoji: { fontSize: 44 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, textAlign: 'center' },
  programName: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  programSub: { fontSize: 13, marginTop: 2 },
  statsGrid: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '600' },
  statDivider: { width: 1, height: 30, marginHorizontal: 4 },
  adjBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  adjText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  exerciseName: { fontSize: 14, fontWeight: '700' },
  exerciseDetail: { fontSize: 12, marginTop: 2 },
  totalBox: { padding: 12, borderRadius: 12, borderWidth: 1, gap: 8, marginTop: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  totalValue: { fontSize: 13, fontWeight: '700' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  footer: { padding: 20 },
});
